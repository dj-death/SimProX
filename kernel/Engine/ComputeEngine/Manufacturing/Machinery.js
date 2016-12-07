"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Machine = require('./Machine');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Collections = require('../../../utils/Collections');
// Ensemble de machines concourant à un même but. / atelier
var Machinery = (function (_super) {
    __extends(Machinery, _super);
    function Machinery(params, machinesParams) {
        _super.call(this, params);
        this.departmentName = "production";
        this.machinesParams = [];
        this.machines = new Collections.Queue();
        this.insurance = null;
        this.machinesParams = machinesParams;
    }
    Machinery.prototype.init = function (machinesStats, machineryLastNetValue, economy) {
        _super.prototype.init.call(this);
        if (isNaN(machineryLastNetValue)) {
            console.warn("machineryLastNetValue NaN");
            machineryLastNetValue = 0;
        }
        var availablesAtStartNb = 0;
        console.silly("machinesStats ", machinesStats);
        for (var i = 0, len = machinesStats.length; i < len; i++) {
            var machStats = machinesStats[i];
            var machineType = machStats.type;
            if (machStats.nextUse === 0) {
                continue;
            }
            var params = this.machinesParams[machineType];
            var machine = new Machine.Machine(params);
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
    };
    Machinery.prototype.reset = function () {
        _super.prototype.reset.call(this);
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
    };
    Object.defineProperty(Machinery.prototype, "availablesNextPeriodNb", {
        get: function () {
            return this.availablesAtStartNb + this.effectiveBoughtNb - this.effectiveSoldNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "workedHoursNb", {
        get: function () {
            var minutesNb = Utils.sums(this.machines, "workedMinutesNb");
            var hoursNb = Utils.floor(minutesNb / 60);
            if (minutesNb % 60 > 45) {
                ++hoursNb;
            }
            return hoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "maintenancePlannedTotalHoursNb", {
        get: function () {
            return Utils.sums(this.machines, "maintenancePlannedHoursNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "maintenanceOverContractedHoursNb", {
        get: function () {
            return Utils.sums(this.machines, "maintenanceOverContractedHoursNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "breakdownHoursNb", {
        get: function () {
            return Utils.sums(this.machines, "breakdownHoursNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "preventiveMaintenanceHoursNb", {
        get: function () {
            return Utils.sums(this.machines, "preventiveMaintenanceHoursNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "load", {
        get: function () {
            return this.workedHoursNb / this.theoreticalAvailableHoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "machinesEfficiencyAvg", {
        get: function () {
            var avg = Utils.sums(this.machines.toArray(), "efficiency", "isInstalled", true, null, "=", 4) / this.machinesNb;
            return Utils.round(avg, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "powerCost", {
        // cout de l'énergie concerné par l'inflation
        get: function () {
            var totalCost = Utils.sums(this.machines, "powerCost") * this.economy.producerPriceBase100Index / 100;
            return Utils.round(totalCost, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "overheadsCost", {
        // frais généraux externes
        get: function () {
            var unitCost = Utils.round(this.params.costs.overheads * this.economy.producerPriceBase100Index / 100, 2);
            return this.installedMachinesNb * unitCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "supervisionCost", {
        // internal cost not influence by inflation
        get: function () {
            var inflationImpact = this.economy.PPIOverheads;
            var supervisionPerShift = Math.round(this.params.costs.supervisionPerShift * inflationImpact);
            return this.shiftLevel * supervisionPerShift;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "runningCost", {
        get: function () {
            return this.powerCost + this.overheadsCost + this.supervisionCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "decommissioningCost", {
        /* frais de démontage et de mise hors service
        */
        get: function () {
            var inflationImpact = this.economy.PPIServices;
            var decommissioning = Math.round(this.params.costs.decommissioning * inflationImpact);
            return this.effectiveSoldNb * decommissioning;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "maintenanceCost", {
        // L’entretien des machines est effectué par du personnel extérieur
        // ça couvre la main d’œuvre, les pièces détachées, les accessoires et le contrôle
        // externe so influenced by inflation
        get: function () {
            var cost;
            var maintenanceHourlyCost = Utils.round(this.params.costs.maintenanceHourlyCost * this.economy.producerPriceBase100Index / 100, 2);
            var overContractedMaintenanceHourlyCost = Utils.round(this.params.costs.overContractedMaintenanceHourlyCost * this.economy.producerPriceBase100Index / 100, 2);
            cost = this.maintenancePlannedTotalHoursNb * maintenanceHourlyCost;
            cost += this.maintenanceOverContractedHoursNb * overContractedMaintenanceHourlyCost;
            return cost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "theoreticalAvailableHoursNb", {
        get: function () {
            return Utils.sums(this.machines, "capacity", "isInstalled", true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "effectiveAvailableHoursNb", {
        get: function () {
            var value;
            value = this.theoreticalAvailableHoursNb - this.maintenancePlannedTotalHoursNb - this.maintenanceOverContractedHoursNb;
            // check negative value and correct to 0
            value = value > 0 ? value : 0;
            return value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "CO2PrimaryFootprintHeat", {
        get: function () {
            var total = Utils.sums(this.machines, "CO2PrimaryFootprintHeat", "isInstalled", true);
            return total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "CO2PrimaryFootprintWeight", {
        get: function () {
            return this.CO2PrimaryFootprintHeat * 0.00052;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "CO2PrimaryFootprintOffsettingCost", {
        /* Votre entreprise va investir dans une ONG qui plantera des arbres dont la survie compensera l'empreinte
         * carbone que vous générez.Le coût de cet investissement (à un taux de 40€ par tonne de CO2
        */
        // comme il est un don, il n'esp concerné par l'inflation
        get: function () {
            return Utils.round(this.CO2PrimaryFootprintWeight * this.params.costs.CO2OffsettingPerTonneRate, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "stats", {
        get: function () {
            var stats = [];
            this.machines.forEach(function (machine) {
                var machStats = machine.stats;
                stats.push(machStats);
            });
            return stats;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "machineryRawValue", {
        get: function () {
            return Utils.sums(this.machines, "rawValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "depreciation", {
        get: function () {
            return Utils.sums(this.machines, "depreciation");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machinery.prototype, "machineryNetValue", {
        get: function () {
            return Utils.sums(this.machines, "netValue");
        },
        enumerable: true,
        configurable: true
    });
    // Actions
    Machinery.prototype.setShiftLevel = function (shiftLevel) {
        this.onBeforeReady(); // at this point we have machines nb sync so let install
        if (!Number.isInteger(shiftLevel)) {
            shiftLevel = Math.round(shiftLevel);
        }
        this.shiftLevel = shiftLevel;
        this.machines.forEach(function (machine) {
            machine.launch(shiftLevel);
        });
        this.operatorsNb = Utils.sums(this.machines, "operatorsNeededNb", "isInstalled", true);
        this.onReady();
    };
    Machinery.prototype.power = function (minutesNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(minutesNb)) {
            console.debug('Machine @ Quantity not reel', arguments);
            return false;
        }
        var success;
        var reliquat;
        function iterate(timeByMachine) {
            var reliquat = 0;
            this.machines.forEach(function (machine) {
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
    };
    Machinery.prototype.buy = function (boughtNb, machineType) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(boughtNb)) {
            console.warn("Not valid extension: %d", boughtNb);
            return false;
        }
        if (!Number.isInteger(boughtNb)) {
            boughtNb = Math.round(boughtNb);
        }
        var machineParams = this.machinesParams[machineType];
        if (!machineParams) {
            console.warn("Trying to buy an unknown type of machine");
            return false;
        }
        var acquisitionPrice = Utils.round(machineParams.acquisitionPrice * this.economy.producerPriceBase100Index / 100, 2);
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
        var isDeliveryImmediate = machineParams.deliveryTime === ENUMS.DELIVERY.IMMEDIATE;
        if (isDeliveryImmediate) {
            this.machinesNb += this.effectiveBoughtNb;
        }
        for (var i = 0; i < this.effectiveBoughtNb; i++) {
            var machine = new Machine.Machine(machineParams);
            machine.init({
                type: machineType,
                age: isDeliveryImmediate ? 0 : -machineParams.deliveryTime,
                nextUse: Number.POSITIVE_INFINITY,
                efficiency: 1,
                runningHoursNb: 0,
                netValue: machineParams.acquisitionPrice
            });
            this.machines.add(machine);
        }
    };
    Machinery.prototype.sell = function (soldNb, machineType) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(soldNb)) {
            console.warn("Not valid extension: %d", soldNb);
            return false;
        }
        if (!Number.isInteger(soldNb)) {
            soldNb = Math.round(soldNb);
        }
        var machineParams = this.machinesParams[machineType];
        if (!machineParams) {
            console.warn("Trying to sel an unknown type of machine");
            return false;
        }
        this.soldNb += soldNb;
        var that = this;
        var effectiveSoldNb = soldNb;
        this.machines.forEach(function (machine, idx) {
            var isAlive;
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
            var disposalValue = Utils.round(machine.disposalValue * this.economy.producerPriceBase100Index / 100, 2);
            that.disposalValue += disposalValue;
            that.machines.removeElementAtIndex(idx); // remove the first oldest one
            --effectiveSoldNb;
        });
        this.effectiveSoldNb += (soldNb - effectiveSoldNb);
        this.machinesNb -= (soldNb - effectiveSoldNb);
    };
    Machinery.prototype.doMaintenance = function (hoursByMachineNb) {
        if (!Utils.isNumericValid(hoursByMachineNb)) {
            console.warn("Not valid hoursByMachineNb: %d", hoursByMachineNb);
            return false;
        }
        if (!Number.isInteger(hoursByMachineNb)) {
            hoursByMachineNb = Math.round(hoursByMachineNb);
        }
        this.decidedMaintenanceHoursNbByUnit = hoursByMachineNb;
        this.machines.forEach(function (machine) {
            machine.doMaintenance(hoursByMachineNb);
        });
        return true;
    };
    Machinery.prototype.onFinish = function () {
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
        var losses = Utils.sums(this.machines, "catastrophicFailuresHoursNb") * 0;
        this.insurance && this.insurance.claims(losses);
    };
    Machinery.prototype.onMachinesInstall = function (installedMachinesNb) {
        if (installedMachinesNb > this.machinesNb) {
            installedMachinesNb = this.machinesNb;
            console.warn("something wrong with installed machines @ installed > available");
        }
        this.installedMachinesNb = installedMachinesNb;
        if (!installedMachinesNb) {
            return;
        }
        // begin from old as it first installed FIFO
        this.machines.forEach(function (machine) {
            machine.install();
            return --installedMachinesNb > 0;
        });
    };
    Object.defineProperty(Machinery.prototype, "state", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    return Machinery;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Machinery;
//# sourceMappingURL=Machinery.js.map