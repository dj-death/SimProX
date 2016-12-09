import AbstractObject = require('./AbstractObject');

import * as IObject from '../IObject';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



export interface MachineParams extends AbstractObject, IObject.ObjectParams {
    machineID?: string;
    spaceNeeded: number;

    CO2Footprint: ENUMS.CO2Footprint;

    costs: {
        runningHour: number;
    };

    deliveryTime: ENUMS.DELIVERY;

    depreciationRate: number;
    usefulLife: number;

    residualValue: number;

    breakdownProba: number;

    acquisitionPrice: number;

    machineCapacityByShift: number[];
    machineOperatorsNeededNb: number[];
    maxMachineHoursforWeekDay: number[];
}


export interface MachineStats {
    type: number;

    age: number; // negative means not yet bringed
    runningHoursNb: number;
    efficiency: number;
    nextUse: number;
    netValue?: number;
}

export class Machine {
    params: MachineParams;

    type: number;

    get isActive(): boolean {
        return this.age >= 0;
    }

    nextUse: number;

    age: number;

    private _runningMinutesNb: number;

    lastNetValue: number;
    lastEfficiency: number;

    shiftLevel: number;

    capacity: number = 0;
    operatorsNeededNb: number = 0;

    maintenancePlannedHoursNb: number = 0;

    breakdownHoursNb: number = 0;
    catastrophicFailuresHoursNb: number = 0;

    workedMinutesNb: number = 0;

    isInstalled = false;

    constructor(params: MachineParams) {
        this.params = params;
    }


    init(lastStats: MachineStats) {

        if (lastStats.nextUse === 0) {
            console.warn("you should remove this machine");
            return;
        }

        this.type = lastStats.type;

        this.nextUse = lastStats.nextUse;
        this.age = lastStats.age; // it serve for this period so nothing incremented till the end        

        this.lastEfficiency = lastStats.efficiency;

        this._runningMinutesNb = lastStats.runningHoursNb * 60;

        this.lastNetValue = lastStats.netValue;
    }

    install() {
        this.isInstalled = this.isActive ? true : false;
    }

    launch(shiftLevel: number) {
        if (!this.isInstalled) {
            return;
        }

        this.shiftLevel = shiftLevel;
        this.capacity = this.params.machineCapacityByShift[shiftLevel - 1];

        this.operatorsNeededNb = this.params.machineOperatorsNeededNb[shiftLevel - 1];

        this.simulateBreakdownHoursNb();
    }

    doMaintenance(MTHoursNb: number) {
        if (!this.isActive) {
            return;
        }

        this.maintenancePlannedHoursNb = MTHoursNb;
    }


    power(minutesNb: number): boolean {
        if (!this.isInstalled) {
            return false;
        }

        let effectiveTime: number;


        effectiveTime = Utils.correctFloat(minutesNb / this.efficiency);

        // sorry we have limited capacity
        if ((this.workedMinutesNb + effectiveTime) > (this.possibleHoursNb * 60)) {
            return false;
        }

        this.workedMinutesNb += effectiveTime;
        this._runningMinutesNb += effectiveTime;

        return true;
    }

    simulateBreakdownHoursNb() {
        // The more preventive maintenance you are able to do, the fewer breakdowns there will be, 
        // and if a breakdown does occur the shorter the time before the machine is back in service again.

        // A further consequence of ageing is that a machine will tend to break down more often
        let landa = this.params.breakdownProba * this.capacity;

        // Array of X poisson variates with mean/variance of landa 
        this.breakdownHoursNb = Utils.getPoisson(landa);

        // Machines can suffer from catastrophic failure which takes them out of production for periods of time.
        // TODO: develop so how much from this breakdown occurs is a fatal one
        // Catastrophic machine failure can also seriously reduce production time for more than just a few days, 
        // while the machine is brought back into production.If this lost time leads to a loss of sales, incurring backlog, 
        // the value of lost sales can be recovered from your insurance company.The cost of such repairs can also be recovered.
        this.catastrophicFailuresHoursNb = 0;

        this.breakdownHoursNb += this.catastrophicFailuresHoursNb;
    }


    get runningHoursNb(): number {
        return Math.round(this._runningMinutesNb / 60);
    }

    get possibleHoursNb(): number {
        let value;

        value = this.capacity - this.maintenancePlannedHoursNb - this.maintenanceOverContractedHoursNb;

        // check negative value and correct to 0
        value = value > 0 ? value : 0;

        return value;
    }

    // If your allocation of hours to contract maintenance is not even sufficient to cover basic repair times, 
    // any additional hours needed to meet this primary effort will be charged at a higher rate per contract- hour.

    get maintenanceOverContractedHoursNb(): number {
        if (this.maintenancePlannedHoursNb < this.breakdownHoursNb) {
            return this.breakdownHoursNb - this.maintenancePlannedHoursNb;
        }

        return 0;
    }


    get preventiveMaintenanceHoursNb(): number {
        // The first priority of the maintenance effort will be to repair broken down machinery,
        // any hours left over within the contract will be used on preventive maintenance outside normal working hours.
        // If breakdown time exceeded the number of maintenance hours allocated, no maintenance will have been carried out.
        if (this.maintenancePlannedHoursNb > this.breakdownHoursNb) {
            return this.maintenancePlannedHoursNb - this.breakdownHoursNb;
        }

        return 0;
    }

    get loadRate(): number {
        return this.workedMinutesNb / (this.capacity * 60);
    }

    // MT purified from the influence of machine load and number of shifts. 
    // MT for one machine at 100% load(5 days) with 1 shift.
    get normalizedPreventiveMTHoursNb(): number {
        //  100% load (5 days)
        let normalLoadrate = this.params.maxMachineHoursforWeekDay[this.shiftLevel - 1] / this.capacity;

        let normalizedMTHours = (this.preventiveMaintenanceHoursNb / this.shiftLevel) * (normalLoadrate / this.loadRate);

        return Math.round(normalizedMTHours);
    }


    // the theoretical minimum number of hours which should have been taken to manufacture products last period, 
    // compared with the actual time.
    get efficiency(): number {
        if (!this.isActive) {
            return 1;
        }

        let efficiency: number;

        let ageingFactor;
        let attritionImpact; // usure f(age, uses)
        let maintenanceImpact;

        // As machine get older, it becomes less efficient
        switch (this.age) {
            case 0:
                ageingFactor = 1;
                break;

            case 1:
                ageingFactor = 0.9901;
                break;

            case 2:
                ageingFactor = 0.9615;
                break;

            case 3:
                ageingFactor = 0.9174;
                break;

            case 4:
                ageingFactor = 0.8621;
                break;

            case 5:
                ageingFactor = 0.8;
                break;

            case 6:
                ageingFactor = 0.7353;
                break;

            case 7:
                ageingFactor = 0.6711;
                break;

            default: // > 7
                ageingFactor = 0.6711;
        }

        // As machines are used more, they become less efficient

        // TODO: Preventive maintenance slows the rate at which machines become less efficient.
        maintenanceImpact = 0;


        efficiency = ageingFactor * (1 + maintenanceImpact);

        //return efficiency;

        return 0.9310;
    }

    get remainingLifetime_atPeriodBeginning(): number {
        let remaining = this.params.usefulLife - this.age;

        return remaining >= 0 ? remaining : 0;
    }

    get remainingLifetime_atPeriodEnd(): number {
        let remaining = this.params.usefulLife - this.age - 1;

        return remaining >= 0 ? remaining : 0;
    }


    get rawValue(): number {
        let rawValue = this.lastNetValue;

        if (rawValue === undefined) {
            if (this.age <= 0) {
                rawValue = this.params.acquisitionPrice;

            } else {
                let cumulativeDepreciationRate = Math.pow(1 - this.params.depreciationRate, this.age);

                rawValue = this.params.acquisitionPrice * cumulativeDepreciationRate;
            }
        }

        return rawValue;
    }

    get depreciation(): number {
        if (!this.isActive) {
            return 0;
        }

        let depreciation = this.rawValue * this.params.depreciationRate;

        return depreciation;
    }

    get netValue(): number {
        return this.rawValue - this.depreciation;
    }

    get CO2PrimaryFootprintHeat(): number {
        return this.params.CO2Footprint.kwh * Math.round(this.workedMinutesNb / 60);
    }

    get disposalValue(): number {
        // if it has residual value sell it at this price not the depreciated
        if (this.params.residualValue > 0) {
            return this.params.residualValue;
        }

        // else at their depreciated (book) value last quarter.
        return this.rawValue;
    }

    get powerCost(): number {
        return this.params.costs.runningHour *  this.workedMinutesNb / 60;
    }

    get stats(): MachineStats {
        return {
            type: this.type,

            age: this.age + 1, // se what
            efficiency: this.efficiency,
            runningHoursNb: this.runningHoursNb,

            netValue: this.netValue,

            nextUse: this.nextUse - 1
        };
    }
}
