import * as IObject from '../IObject';

import * as Machine from './Machine';

import { Economy } from '../Environnement';
import { Insurance } from '../Finance';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');

import Collections = require('../../../utils/Collections');


interface MachineryCosts {
    maintenanceHourlyCost: number;
    overContractedMaintenanceHourlyCost: number;
    decommissioning: number;
    overheads: number;
    supervisionPerShift: number;

    CO2OffsettingPerTonneRate: number;
}


interface MachineryParams extends IObject.ObjectParams {
    machineryID?: string;

    costs: MachineryCosts;

    decommissioningTime: ENUMS.DELIVERY;

    payments: {
        maintenance: ENUMS.PaymentArray;
        running: ENUMS.PaymentArray;
        decommissioning: ENUMS.PaymentArray;

        acquisitions: ENUMS.PaymentArray;
        disposals: ENUMS.PaymentArray;
    };


    atelierID: string;
}

// Ensemble de machines concourant à un même but. / atelier

export default class Machinery extends IObject.IObject {
    departmentName = "production";

    // params

    public params: MachineryParams;

    machinesParams: Machine.MachineParams[] = [];

    machines = new Collections.Queue<Machine.Machine>();

    insurance: Insurance = null;

    economy: Economy;

    constructor(params: MachineryParams, machinesParams: Machine.MachineParams[]) {
        super(params);

        this.machinesParams = machinesParams;
    }

    availablesAtStartNb: number;
    machineryLastNetValue: number;

    installedMachinesNb: number;

    init(machinesStats: Machine.MachineStats[], machineryLastNetValue: number, economy: Economy) {
        super.init();

        if (isNaN(machineryLastNetValue)) {
            console.warn("machineryLastNetValue NaN");

            machineryLastNetValue = 0;
        }


        let availablesAtStartNb = 0;

        console.silly("machinesStats ", machinesStats);

        for (let i = 0, len = machinesStats.length; i < len; i++) {
            let machStats = machinesStats[i];
            let machineType = machStats.type;

            if (machStats.nextUse === 0) {
                continue;
            }

            let params = this.machinesParams[machineType];
            let machine = new Machine.Machine(params);
            
            machine.init(machStats);

            if (machine.isActive) {
                ++availablesAtStartNb;
            }

            this.machines.add(machine);
        }

        this.availablesAtStartNb = availablesAtStartNb;
        this.machinesNb = availablesAtStartNb;

        this.machineryLastNetValue = machineryLastNetValue;

        this.economy = economy;
    }

    reset() {
        super.reset();

        // decision
        this.boughtNb = 0;
        this.soldNb = 0;

        this.effectiveBoughtNb = 0;
        this.effectiveSoldNb = 0;

        this.installedMachinesNb = 0;

        this.acquisitionCost = 0;
        this.disposalValue = 0;

        // TODO see if it delete instances for perfs issue
        this.machines.clear();
    }

    // decision
    boughtNb: number;
    soldNb: number;

    effectiveBoughtNb: number;
    effectiveSoldNb: number;

    shiftLevel: ENUMS.SHIFT_LEVEL;

    decidedMaintenanceHoursNbByUnit: number;

    // results
    machinesNb: number;


    get availablesNextPeriodNb(): number {
        return this.availablesAtStartNb + this.effectiveBoughtNb - this.effectiveSoldNb;
    }

    get workedHoursNb(): number {
        let minutesNb = Utils.sums(this.machines, "workedMinutesNb");
        let hoursNb = Utils.floor(minutesNb / 60);

        if (minutesNb % 60 > 45) {
            ++hoursNb;
        }

        return hoursNb;
    }

    
    get maintenancePlannedTotalHoursNb(): number {
        return Utils.sums(this.machines, "maintenancePlannedHoursNb");
    }

    get maintenanceOverContractedHoursNb(): number {
        return Utils.sums(this.machines, "maintenanceOverContractedHoursNb");
    }

    get breakdownHoursNb(): number {
        return Utils.sums(this.machines, "breakdownHoursNb");
    }

    get preventiveMaintenanceHoursNb(): number {
        return Utils.sums(this.machines, "preventiveMaintenanceHoursNb");
    }

    get load(): number {
        return this.workedHoursNb / this.theoreticalAvailableHoursNb;
    }

    
    get machinesEfficiencyAvg(): number {
        let avg = Utils.sums(this.machines.toArray(), "efficiency", "isInstalled", true, null, "=", 4) / this.machinesNb;

        return Utils.round(avg, 4);
    }

    operatorsNb: number;

    // costs
    acquisitionCost: number;
    disposalValue: number;

    // cout de l'énergie concerné par l'inflation
    get powerCost(): number {
        let totalCost = Utils.sums(this.machines, "powerCost") * this.economy.producerPriceBase100Index / 100;

        return Utils.round(totalCost, 2);
    }

    // frais généraux externes
    get overheadsCost(): number {
        let unitCost = Utils.round(this.params.costs.overheads * this.economy.producerPriceBase100Index / 100, 2);

        return this.installedMachinesNb * unitCost;
    }

    // internal cost not influence by inflation
    get supervisionCost(): number {
        let inflationImpact = this.economy.PPIOverheads;

        let supervisionPerShift = Math.round(this.params.costs.supervisionPerShift * inflationImpact);

        return this.shiftLevel * supervisionPerShift;
    }

    get runningCost(): number {
        return this.powerCost + this.overheadsCost + this.supervisionCost;
    }

    /* frais de démontage et de mise hors service
    */
    get decommissioningCost(): number {
        let inflationImpact = this.economy.PPIServices;

        let decommissioning = Math.round(this.params.costs.decommissioning * inflationImpact);

        return this.effectiveSoldNb * decommissioning;
    }

    // L’entretien des machines est effectué par du personnel extérieur
    // ça couvre la main d’œuvre, les pièces détachées, les accessoires et le contrôle

    // externe so influenced by inflation
    get maintenanceCost(): number {
        let cost: number;

        let maintenanceHourlyCost = Utils.round(this.params.costs.maintenanceHourlyCost * this.economy.producerPriceBase100Index / 100, 2);
        let overContractedMaintenanceHourlyCost = Utils.round(this.params.costs.overContractedMaintenanceHourlyCost * this.economy.producerPriceBase100Index / 100, 2);

        cost = this.maintenancePlannedTotalHoursNb * maintenanceHourlyCost;
        cost += this.maintenanceOverContractedHoursNb * overContractedMaintenanceHourlyCost;

        return cost;
    }

    get theoreticalAvailableHoursNb(): number {
        return Utils.sums(this.machines, "capacity", "isInstalled", true);
    }

    get effectiveAvailableHoursNb(): number {
        let value;

        value = this.theoreticalAvailableHoursNb - this.maintenancePlannedTotalHoursNb - this.maintenanceOverContractedHoursNb;

        // check negative value and correct to 0
        value = value > 0 ? value : 0;

        return value;
    }

    get CO2PrimaryFootprintHeat(): number {
        let total = Utils.sums(this.machines, "CO2PrimaryFootprintHeat", "isInstalled", true);

        return total;
    }

    get CO2PrimaryFootprintWeight(): number {
        return this.CO2PrimaryFootprintHeat * 0.00052;
    }

    /* Votre entreprise va investir dans une ONG qui plantera des arbres dont la survie compensera l'empreinte
     * carbone que vous générez.Le coût de cet investissement (à un taux de 40€ par tonne de CO2
    */

    // comme il est un don, il n'esp concerné par l'inflation
    get CO2PrimaryFootprintOffsettingCost(): number {
        return Utils.round(this.CO2PrimaryFootprintWeight * this.params.costs.CO2OffsettingPerTonneRate, 2);
    }


    get stats(): Machine.MachineStats[] {
        let stats: Machine.MachineStats[] = [];

        this.machines.forEach(function  (machine) {
            let machStats = machine.stats;

            stats.push(machStats);
        });

        return stats;
    }

    get machineryRawValue(): number {
        return Utils.sums(this.machines, "rawValue");
    }

    get depreciation(): number {
        return Utils.sums(this.machines, "depreciation");
    }

    get machineryNetValue(): number {
        return Utils.sums(this.machines, "netValue");
    }


    // Actions

    setShiftLevel(shiftLevel: ENUMS.SHIFT_LEVEL) { 
        this.onBeforeReady(); // at this point we have machines nb sync so let install

        if (!Utils.isInteger(shiftLevel)) {
            shiftLevel = Math.round(shiftLevel);
        }

        this.shiftLevel = shiftLevel;

        this.machines.forEach(function  (machine) {
            machine.launch(shiftLevel);
        });

        this.operatorsNb = Utils.sums(this.machines, "operatorsNeededNb", "isInstalled", true);

        this.onReady();
    }

    power(minutesNb: number): boolean {
        if (!this.isInitialised()) {
            return false;
        }

        if (!Utils.isNumericValid(minutesNb)) {
            console.debug('Machine @ Quantity not reel', arguments);
            return false;
        }

        let success: boolean;
        let reliquat;
        
        function  iterate (timeByMachine): number {
            let reliquat = 0;

            this.machines.forEach(function  (machine) {
                if (!machine.power(timeByMachine)) {
                    reliquat += timeByMachine;
                }

            });

            return reliquat;
        }

        reliquat = iterate.call(this, minutesNb / this.machinesNb);

        if (reliquat > 0) {
            reliquat = iterate.call(this, reliquat / this.machinesNb);
        }

        return reliquat === 0;

        /*let success;
        let idx = this.machinesNb - 1;

        // work first with new machines at the end of queue
        while (idx >= 0) {
            let machine = this.machines.elementAtIndex(idx);

            --idx;

            if (!machine) {
                continue;
            }

            success = machine.power(minutesNb);

            if (success) {
                break;
            }
            
        }

        return success;*/
    }


    buy(boughtNb: number, machineType: number) {

        if (!this.isInitialised()) {
            return false;
        }

        if (!Utils.isNumericValid(boughtNb)) {
            console.warn("Not valid extension: %d", boughtNb);
            return false;
        }

        if (!Utils.isInteger(boughtNb)) {
            boughtNb = Math.round(boughtNb);
        }


        let machineParams = this.machinesParams[machineType];

        if (!machineParams) {
            console.warn("Trying to buy an unknown type of machine");
            return false;
        }

        let acquisitionPrice = Utils.round(machineParams.acquisitionPrice * this.economy.producerPriceBase100Index / 100, 2);

        // decision
        this.boughtNb += boughtNb;

        // till now
        // TODO develop it
        // The machine supplier checks your ability to pay from your credit-worthiness, 
        // which may be reduced by the cost of any building work (see above).
        // If your credit- worthiness is at least equal to the total price of the machines you want, 
        // the supplier will accept your order, together with your payment of the purchase price.
        // If your credit- worthiness is insufficient, then the supplier will only take orders for that number of machines 
        // which your credit- worthiness covers (which may be none).
        this.effectiveBoughtNb += boughtNb;

        this.acquisitionCost += (boughtNb * acquisitionPrice);

        let isDeliveryImmediate = machineParams.deliveryTime === ENUMS.DELIVERY.IMMEDIATE;

        if (isDeliveryImmediate) {
            this.machinesNb += this.effectiveBoughtNb;
        }

        for (let i = 0; i < this.effectiveBoughtNb; i++) {

            let machine = new Machine.Machine(machineParams);

            machine.init({
                type: machineType,

                age: isDeliveryImmediate ? 0 : - machineParams.deliveryTime, // -1 next period

                nextUse: Number.POSITIVE_INFINITY,
                
                efficiency: 1,
                runningHoursNb: 0,
                netValue: machineParams.acquisitionPrice
            });

            this.machines.add(machine);
        }
    }

    sell(soldNb: number, machineType: number) {
        if (!this.isInitialised()) {
            return false;
        }

        if (!Utils.isNumericValid(soldNb)) {
            console.warn("Not valid extension: %d", soldNb);
            return false;
        }

        if (!Utils.isInteger(soldNb)) {
            soldNb = Math.round(soldNb);
        }


        let machineParams = this.machinesParams[machineType];

        if (!machineParams) {
            console.warn("Trying to sel an unknown type of machine");
            return false;
        }

        this.soldNb += soldNb;

        let that = this;

        let effectiveSoldNb = soldNb;

        this.machines.forEach(function  (machine, idx) {
            let isAlive;

            if (effectiveSoldNb === 0) {
                return false;
            }

            if (machine.type !== machineType) {
                return true;
            }

            // sold just the not so obsolete
            if (machine.remainingLifetime_atPeriodBeginning < 1) {
                return true;
            }

            let disposalValue = Utils.round(machine.disposalValue * this.economy.producerPriceBase100Index / 100, 2);

            that.disposalValue += disposalValue;

            that.machines.removeElementAtIndex(idx); // remove the first oldest one

            --effectiveSoldNb;
        });


        this.effectiveSoldNb += (soldNb - effectiveSoldNb);

        this.machinesNb -= (soldNb - effectiveSoldNb);
    }

    doMaintenance(hoursByMachineNb: number): boolean {
        if (!Utils.isNumericValid(hoursByMachineNb)) {
            console.warn("Not valid hoursByMachineNb: %d", hoursByMachineNb);
            return false;
        }

        if (!Utils.isInteger(hoursByMachineNb)) {
            hoursByMachineNb = Math.round(hoursByMachineNb);
        }

        this.decidedMaintenanceHoursNbByUnit = hoursByMachineNb;

        this.machines.forEach(function  (machine) {
            machine.doMaintenance(hoursByMachineNb);
        });

        return true;
    }

    onFinish() {
        // maintenance
        this.CashFlow.addPayment(this.maintenanceCost, this.params.payments.maintenance, 'maintenance');
        this.CashFlow.addPayment(this.runningCost, this.params.payments.running, 'running');
        this.CashFlow.addPayment(this.CO2PrimaryFootprintOffsettingCost, this.params.payments.running, 'CO2PrimaryFootprintOffsetting');

        this.CashFlow.addPayment(this.decommissioningCost, this.params.payments.decommissioning, 'decommissioning');

        this.CashFlow.addPayment(this.acquisitionCost, this.params.payments.acquisitions, 'acquisition', ENUMS.ACTIVITY.INVESTING);
        this.CashFlow.addReceipt(this.disposalValue, this.params.payments.disposals, ENUMS.ACTIVITY.INVESTING);

        // TODO: Loss of machine time and assembly time are shown under breakdown time and absenteeism, 
        // respectively and are not separated from routine minor problems.
        // claim the cost of repair 
        // The cost of this work (which may need to be done at the emergency rate) 
        // can then be added to your quarterly insurance claim provided that you have the appropriate insurance.
        // Your insurer's assessment of lost sales first considers Product 3 in the EU, then Nafta and finally the internet; then Product 2 and finally Product 1, until all lost sales specifically attributable to loss of machine capacity are covered.
        let losses = Utils.sums(this.machines, "catastrophicFailuresHoursNb") * 0;

        this.insurance && this.insurance.claims(losses);
    }

    onMachinesInstall(installedMachinesNb: number) {
        if (installedMachinesNb > this.machinesNb) {
            installedMachinesNb = this.machinesNb;

            console.warn("something wrong with installed machines @ installed > available");
        }

        this.installedMachinesNb = installedMachinesNb;

        if (!installedMachinesNb) {
            return;
        }

        // begin from old as it first installed FIFO
        this.machines.forEach(function  (machine) {
            machine.install();

            return --installedMachinesNb > 0;
        });

    }

    get state(): any {
        // finish everything for sync
        return {
            "effectiveSoldNb": this.effectiveSoldNb,
            "machinesNb": this.installedMachinesNb,
            "effectiveBoughtNb": this.effectiveBoughtNb,
            "availablesNextPeriodNb": this.availablesNextPeriodNb,

            "theoreticalAvailableHoursNb": this.theoreticalAvailableHoursNb,
            "breakdownHoursNb": this.breakdownHoursNb,
            "workedHoursNb": Math.ceil(this.workedHoursNb),
            "machinesEfficiencyAvg": this.machinesEfficiencyAvg * 100,

            "preventiveMaintenanceHoursNb": this.preventiveMaintenanceHoursNb,

            "stats": this.stats
        };

    }
}