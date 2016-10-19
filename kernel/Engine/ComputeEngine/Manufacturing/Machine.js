"use strict";
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Machine = (function () {
    function Machine(params) {
        this.capacity = 0;
        this.operatorsNeededNb = 0;
        this.maintenancePlannedHoursNb = 0;
        this.breakdownHoursNb = 0;
        this.catastrophicFailuresHoursNb = 0;
        this.workedMinutesNb = 0;
        this.isInstalled = false;
        this.params = params;
    }
    Object.defineProperty(Machine.prototype, "isActive", {
        get: function () {
            return this.age >= 0;
        },
        enumerable: true,
        configurable: true
    });
    Machine.prototype.init = function (lastStats) {
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
    };
    Machine.prototype.install = function () {
        this.isInstalled = this.isActive ? true : false;
    };
    Machine.prototype.launch = function (shiftLevel) {
        if (!this.isInstalled) {
            return;
        }
        this.shiftLevel = shiftLevel;
        this.capacity = this.params.machineCapacityByShift[shiftLevel - 1];
        this.operatorsNeededNb = this.params.machineOperatorsNeededNb[shiftLevel - 1];
        this.simulateBreakdownHoursNb();
    };
    Machine.prototype.doMaintenance = function (MTHoursNb) {
        if (!this.isActive) {
            return;
        }
        this.maintenancePlannedHoursNb = MTHoursNb;
    };
    Machine.prototype.power = function (minutesNb) {
        if (!this.isInstalled) {
            return false;
        }
        var effectiveTime;
        effectiveTime = Utils.correctFloat(minutesNb / this.efficiency);
        // sorry we have limited capacity
        if ((this.workedMinutesNb + effectiveTime) > (this.possibleHoursNb * 60)) {
            return false;
        }
        this.workedMinutesNb += effectiveTime;
        this._runningMinutesNb += effectiveTime;
        return true;
    };
    Machine.prototype.simulateBreakdownHoursNb = function () {
        // The more preventive maintenance you are able to do, the fewer breakdowns there will be, 
        // and if a breakdown does occur the shorter the time before the machine is back in service again.
        // A further consequence of ageing is that a machine will tend to break down more often
        var landa = this.params.breakdownProba * this.capacity;
        // Array of X poisson variates with mean/variance of landa 
        this.breakdownHoursNb = Utils.getPoisson(landa);
        // Machines can suffer from catastrophic failure which takes them out of production for periods of time.
        // TODO: develop so how much from this breakdown occurs is a fatal one
        // Catastrophic machine failure can also seriously reduce production time for more than just a few days, 
        // while the machine is brought back into production.If this lost time leads to a loss of sales, incurring backlog, 
        // the value of lost sales can be recovered from your insurance company.The cost of such repairs can also be recovered.
        this.catastrophicFailuresHoursNb = 0;
        this.breakdownHoursNb += this.catastrophicFailuresHoursNb;
    };
    Object.defineProperty(Machine.prototype, "runningHoursNb", {
        get: function () {
            return Math.round(this._runningMinutesNb / 60);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "possibleHoursNb", {
        get: function () {
            var value;
            value = this.capacity - this.maintenancePlannedHoursNb - this.maintenanceOverContractedHoursNb;
            // check negative value and correct to 0
            value = value > 0 ? value : 0;
            return value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "maintenanceOverContractedHoursNb", {
        // If your allocation of hours to contract maintenance is not even sufficient to cover basic repair times, 
        // any additional hours needed to meet this primary effort will be charged at a higher rate per contract- hour.
        get: function () {
            if (this.maintenancePlannedHoursNb < this.breakdownHoursNb) {
                return this.breakdownHoursNb - this.maintenancePlannedHoursNb;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "preventiveMaintenanceHoursNb", {
        get: function () {
            // The first priority of the maintenance effort will be to repair broken down machinery,
            // any hours left over within the contract will be used on preventive maintenance outside normal working hours.
            // If breakdown time exceeded the number of maintenance hours allocated, no maintenance will have been carried out.
            if (this.maintenancePlannedHoursNb > this.breakdownHoursNb) {
                return this.maintenancePlannedHoursNb - this.breakdownHoursNb;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "loadRate", {
        get: function () {
            return this.workedMinutesNb / (this.capacity * 60);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "normalizedPreventiveMTHoursNb", {
        // MT purified from the influence of machine load and number of shifts. 
        // MT for one machine at 100% load(5 days) with 1 shift.
        get: function () {
            //  100% load (5 days)
            var normalLoadrate = this.params.maxMachineHoursforWeekDay[this.shiftLevel - 1] / this.capacity;
            var normalizedMTHours = (this.preventiveMaintenanceHoursNb / this.shiftLevel) * (normalLoadrate / this.loadRate);
            return Math.round(normalizedMTHours);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "efficiency", {
        // the theoretical minimum number of hours which should have been taken to manufacture products last period, 
        // compared with the actual time.
        get: function () {
            if (!this.isActive) {
                return 1;
            }
            var efficiency;
            var ageingFactor;
            var attritionImpact; // usure f(age, uses)
            var maintenanceImpact;
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
                default:
                    ageingFactor = 0.6711;
            }
            // As machines are used more, they become less efficient
            // TODO: Preventive maintenance slows the rate at which machines become less efficient.
            maintenanceImpact = 0;
            efficiency = ageingFactor * (1 + maintenanceImpact);
            //return efficiency;
            return 0.9310;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "remainingLifetime_atPeriodBeginning", {
        get: function () {
            var remaining = this.params.usefulLife - this.age;
            return remaining >= 0 ? remaining : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "remainingLifetime_atPeriodEnd", {
        get: function () {
            var remaining = this.params.usefulLife - this.age - 1;
            return remaining >= 0 ? remaining : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "rawValue", {
        get: function () {
            var rawValue = this.lastNetValue;
            if (rawValue === undefined) {
                if (this.age <= 0) {
                    rawValue = this.params.acquisitionPrice;
                }
                else {
                    var cumulativeDepreciationRate = Math.pow(1 - this.params.depreciationRate, this.age);
                    rawValue = this.params.acquisitionPrice * cumulativeDepreciationRate;
                }
            }
            return rawValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "depreciation", {
        get: function () {
            if (!this.isActive) {
                return 0;
            }
            var depreciation = this.rawValue * this.params.depreciationRate;
            return depreciation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "netValue", {
        get: function () {
            return this.rawValue - this.depreciation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "CO2PrimaryFootprintHeat", {
        get: function () {
            return this.params.CO2Footprint.kwh * Math.round(this.workedMinutesNb / 60);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "disposalValue", {
        get: function () {
            // if it has residual value sell it at this price not the depreciated
            if (this.params.residualValue > 0) {
                return this.params.residualValue;
            }
            // else at their depreciated (book) value last quarter.
            return this.rawValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "powerCost", {
        get: function () {
            return this.params.costs.runningHour * this.workedMinutesNb / 60;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Machine.prototype, "stats", {
        get: function () {
            return {
                type: this.type,
                age: this.age + 1,
                efficiency: this.efficiency,
                runningHoursNb: this.runningHoursNb,
                netValue: this.netValue,
                nextUse: this.nextUse - 1
            };
        },
        enumerable: true,
        configurable: true
    });
    return Machine;
}());
exports.Machine = Machine;
//# sourceMappingURL=Machine.js.map