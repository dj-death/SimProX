"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Personnel_1 = require('../Personnel');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Worker = (function (_super) {
    __extends(Worker, _super);
    function Worker(params) {
        _super.call(this, params);
        this.departmentName = "production";
        this.insurance = null;
    }
    // helpers
    Worker.prototype._calcResignedNb = function () {
        var workersNb = this.employeesNb;
        return 0;
    };
    Worker.prototype._calcDisaffectionHoursNb = function () {
        var activeEmployeesNb = this.employeesNb - this.inactiveEmployeesNb;
        var probability, landa, vars, value;
        probability = this.params.absenteeismProba;
        landa = probability * (this.shift.maxHoursPerPeriod / this.shift.workersNeededNb) + this.params.absenteeismNormalHoursNb;
        value = Utils.getPoisson(landa * activeEmployeesNb);
        // TEST
        if (Utils.NODE_ENV() === "dev") {
            value = probability > 0 ? 172 : 0;
        }
        return value; // we need an integer value
    };
    Worker.prototype._calcSicknessHoursNb = function () {
        return 0;
    };
    Worker.prototype._calcLowMotivationHoursNb = function () {
        return 0;
    };
    Worker.prototype._calcStrikeNextPeriodWeeksNb = function () {
        var probability, weeksMax = this.shift.weeksWorkedByPeriod, value = 0;
        // random value from 0 to max 
        probability = Math.random() * weeksMax;
        value = probability * this.params.tradeUnionSensibility;
        return Math.round(value); // we need an integer value
    };
    Worker.prototype.init = function (availablesWorkersNb, labourPool, economy, strikeNotifiedWeeksNb, machinery) {
        if (strikeNotifiedWeeksNb === void 0) { strikeNotifiedWeeksNb = 0; }
        if (machinery === void 0) { machinery = null; }
        _super.prototype.init.call(this, availablesWorkersNb, labourPool, economy);
        this.strikeNotifiedWeeksNb = strikeNotifiedWeeksNb;
        this.machinery = machinery;
        if (machinery !== null && this.params.defaultRecruit === true) {
            var self = this;
            this.machinery.on("Ready", function (machinery) {
                console.silly("machine ready fired", arguments);
                var variation = machinery.operatorsNb - self.employeesNb;
                var recruitedNb = variation > 0 ? variation : 0;
                var surplusDismissedNb = variation < 0 ? Math.abs(Math.ceil(variation * self.params.surplusMaxDismissedPercent)) : 0;
                // necessary to call all actions even with param 0
                self.recruit(recruitedNb);
                self.dismiss(surplusDismissedNb);
                self.surplusDismissedNb = surplusDismissedNb;
            }, self);
        }
    };
    Object.defineProperty(Worker.prototype, "timeUnitCost", {
        get: function () {
            var cost = this.hourlyWageRate * (1 + this.shift.shiftPremium) * this.workersPerPosteNb;
            return cost;
        },
        enumerable: true,
        configurable: true
    });
    Worker.prototype.getReady = function () {
        this.onBeforeReady();
        this.sicknessHoursNb = this._calcSicknessHoursNb();
        this.disaffectionHoursNb = this._calcDisaffectionHoursNb();
        this.lowMotivationHoursNb = this._calcLowMotivationHoursNb();
        this.strikeNextPeriodWeeksNb = this._calcStrikeNextPeriodWeeksNb();
        this.ready = true;
    };
    Worker.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this._workedTotaMinutesNb = 0;
        this.surplusDismissedNb = 0;
        this.installedWorkersNb = 0;
    };
    Object.defineProperty(Worker.prototype, "workersPerPosteNb", {
        get: function () {
            return this.shift.workersNeededNb / this.shiftLevel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "postesNb", {
        get: function () {
            if (this.machinery) {
                return this.machinery.machinesNb;
            }
            return (this.employeesNb - this.inactiveEmployeesNb) / this.shift.workersNeededNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "inactiveEmployeesNb", {
        //result
        get: function () {
            var result = this.employeesNb - this.installedWorkersNb;
            if (this.machinery && this.machinery.operatorsNb < this.installedWorkersNb) {
                result += (this.installedWorkersNb - this.machinery.operatorsNb);
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "workedTotaHoursNb", {
        get: function () {
            var total = Utils.floor(this._workedTotaMinutesNb / 60);
            if (this._workedTotaMinutesNb % 60 > 45) {
                ++total;
            }
            if (this.params.isPaidUnderMaintenance && this.machinery) {
                total += this.machinery.preventiveMaintenanceHoursNb;
            }
            if (this.params.isPaidUnderRepairs && this.machinery) {
                total += this.machinery.breakdownHoursNb;
            }
            // if worked hours by external is included
            if (this.params.canBringExternalWorkers) {
                // don't do anything is already included for calcul
                if (this.params.isPaidUnderSickness) {
                }
                if (!this.params.isPaidUnderSickness) {
                    total -= this.sicknessHoursNb;
                }
            }
            return total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "absenteeismHoursNb", {
        get: function () {
            return this.sicknessHoursNb + this.disaffectionHoursNb + this.lowMotivationHoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "strikeNotifiedHoursNb", {
        get: function () {
            return this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeek * (this.employeesNb - this.inactiveEmployeesNb);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "theoreticalAvailableTotalHoursNb", {
        get: function () {
            return this.shift.maxHoursPerPeriod * this.shiftLevel * this.postesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "effectiveAvailableTotalHoursNb", {
        get: function () {
            var value;
            value = this.theoreticalAvailableTotalHoursNb - this.absenteeismHoursNb - this.strikeNotifiedHoursNb;
            // replace sick workers with externals
            if (this.params.canBringExternalWorkers) {
                value += this.sicknessHoursNb;
            }
            // check negative value and correct to 0
            value = value > 0 ? value : 0;
            return value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "weekDaysWorkedHoursNb", {
        get: function () {
            var hoursNb, effectiveMaxHoursWeekDays;
            effectiveMaxHoursWeekDays = this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays);
            effectiveMaxHoursWeekDays *= (this.postesNb * this.shiftLevel);
            hoursNb = this.workedTotaHoursNb < effectiveMaxHoursWeekDays ? this.workedTotaHoursNb : effectiveMaxHoursWeekDays;
            if (hoursNb < 0) {
                hoursNb = 0;
            }
            return hoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "overtimeWorkedHoursNb", {
        get: function () {
            var overtimeWorkedHoursNb, effectiveMaxHoursWeekDays;
            effectiveMaxHoursWeekDays = this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays);
            effectiveMaxHoursWeekDays *= (this.postesNb * this.shiftLevel);
            // how much hours exceed the max hours worked in weeks days
            overtimeWorkedHoursNb = this.workedTotaHoursNb - effectiveMaxHoursWeekDays;
            if (overtimeWorkedHoursNb < 0) {
                overtimeWorkedHoursNb = 0;
            }
            return overtimeWorkedHoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "overtimeSaturdayWorkedHoursNb", {
        get: function () {
            var hoursNb, effectiveMaxHoursOvertimeSaturday;
            effectiveMaxHoursOvertimeSaturday = this.shift.maxHoursOvertimeSaturday - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerSaturday);
            effectiveMaxHoursOvertimeSaturday *= (this.postesNb * this.shiftLevel);
            hoursNb = this.overtimeWorkedHoursNb < effectiveMaxHoursOvertimeSaturday ? this.overtimeWorkedHoursNb : effectiveMaxHoursOvertimeSaturday;
            if (hoursNb < 0) {
                hoursNb = 0;
            }
            return hoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "overtimeSundayWorkedHoursNb", {
        get: function () {
            var hoursNb, effectiveMaxHoursOvertimeSunday;
            hoursNb = this.overtimeWorkedHoursNb - this.overtimeSaturdayWorkedHoursNb;
            if (hoursNb < 0) {
                hoursNb = 0;
            }
            // we can't exceed the max
            effectiveMaxHoursOvertimeSunday = this.shift.maxHoursOvertimeSunday - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerSunday);
            effectiveMaxHoursOvertimeSunday *= (this.postesNb * this.shiftLevel);
            hoursNb = hoursNb < effectiveMaxHoursOvertimeSunday ? hoursNb : effectiveMaxHoursOvertimeSunday;
            return hoursNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "overtimeIntensity", {
        get: function () {
            var intensity;
            var totalMaxOvertimeHours;
            totalMaxOvertimeHours = (this.shift.maxHoursOvertimeSaturday + this.shift.maxHoursOvertimeSunday) * this.postesNb * this.shiftLevel;
            // TODO: calc separate intensity for saturday and sunday with coefficient of rough
            intensity = this.overtimeWorkedHoursNb / totalMaxOvertimeHours;
            return intensity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "workedWeeksNb", {
        get: function () {
            var effectiveMaxHoursWeekDays = (this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays)) * (this.postesNb * this.shiftLevel);
            var maxHoursWeekDaysPerWeek = effectiveMaxHoursWeekDays / this.shift.weeksWorkedByPeriod;
            var workedWeekDaysWeeksNb = Math.ceil(this.weekDaysWorkedHoursNb / maxHoursWeekDaysPerWeek);
            return workedWeekDaysWeeksNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "spaceUsed", {
        get: function () {
            return this.params.spaceNeeded * this.installedWorkersNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "CO2PrimaryFootprintHeat", {
        get: function () {
            return this.workedTotaHoursNb * this.params.CO2Footprint.kwh;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "CO2PrimaryFootprintWeight", {
        get: function () {
            return this.CO2PrimaryFootprintHeat * 0.00052;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "CO2PrimaryFootprintOffsettingCost", {
        get: function () {
            return Utils.round(this.CO2PrimaryFootprintWeight * this.params.costs.CO2OffsettingPerTonneRate, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "externalWorkersCost", {
        // costs
        get: function () {
            var totalCost;
            var basicRate = this.hourlyWageRate;
            var adjustedRate;
            if (basicRate < this.params.minHourlyWageRate) {
                basicRate = this.params.minHourlyWageRate;
            }
            adjustedRate = basicRate * (1 + this.params.externalWorkersPremium);
            totalCost = this.sicknessHoursNb * adjustedRate;
            return totalCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "wages", {
        get: function () {
            var wages, minSalary, weekDaysWorkedHoursNb, basicRate, weekDaysWage, saturdayWage, sundayWage, wageRaw, prime, avgSalary, inactivesSalaries;
            var minTotalPaidHours = this.params.minPaidHours * this.postesNb * this.shiftLevel;
            basicRate = this.hourlyWageRate;
            weekDaysWorkedHoursNb = this.weekDaysWorkedHoursNb;
            if (weekDaysWorkedHoursNb < minTotalPaidHours) {
                weekDaysWorkedHoursNb = minTotalPaidHours;
            }
            weekDaysWage = weekDaysWorkedHoursNb * basicRate;
            saturdayWage = this.overtimeSaturdayWorkedHoursNb * basicRate * (1 + this.params.overtimeSatPremium);
            sundayWage = this.overtimeSundayWorkedHoursNb * basicRate * (1 + this.params.overtimeSunPremium);
            wageRaw = weekDaysWage + saturdayWage + sundayWage;
            // we calculate on the hours worked by each poste so after we multiplie it by workers nb per poste
            prime = wageRaw * this.shift.shiftPremium;
            wages = (wageRaw + prime) * this.workersPerPosteNb;
            avgSalary = Math.ceil(wages / (this.employeesNb - this.inactiveEmployeesNb));
            inactivesSalaries = this.inactiveEmployeesNb * avgSalary;
            wages += inactivesSalaries;
            return Math.ceil(wages);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "avgWagePerWorkerPerWeekWorked", {
        get: function () {
            var avgWagePerWorker = this.wages / this.installedWorkersNb;
            var avgWagePerWorkerPerWeekWorked = avgWagePerWorker / this.workedWeeksNb;
            return Math.ceil(avgWagePerWorkerPerWeekWorked);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Worker.prototype, "avgEarnings", {
        get: function () {
            return this.wages / this.installedWorkersNb;
        },
        enumerable: true,
        configurable: true
    });
    // Actions
    Worker.prototype.work = function (minutesNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!this.ready) {
            console.debug('not ready');
            return false;
        }
        var success = true;
        if (!Utils.isNumericValid(minutesNb)) {
            console.warn('Worker @ Quantity not reel', arguments);
            return false;
        }
        // sorry we have limited capacity
        if (Utils.compare(this._workedTotaMinutesNb + minutesNb, ">>", this.effectiveAvailableTotalHoursNb * 60, Worker.EPSILON)) {
            console.debug('Il ne reste pas de Heures de MOD');
            return false;
        }
        this._workedTotaMinutesNb += minutesNb;
        return true;
    };
    Object.defineProperty(Worker.prototype, "adjustedWages", {
        get: function () {
            // fire this event so we can control remunerations by management
            this.onPay();
            if (this.adjustedAvgEarnings === this.avgEarnings) {
                return this.wages;
            }
            return this.adjustedAvgEarnings * this.workedWeeksNb * this.installedWorkersNb;
        },
        enumerable: true,
        configurable: true
    });
    Worker.prototype.pay = function (hourlyWageRate) {
        if (!this.isInitialised()) {
            return false;
        }
        console.debug("pay :", hourlyWageRate);
        var basicRate = hourlyWageRate * this.params.skilledRateOfPay;
        if (basicRate < this.params.minHourlyWageRate) {
            basicRate = this.params.minHourlyWageRate;
        }
        this.hourlyWageRate = Utils.correctFloat(basicRate);
    };
    Worker.prototype.setShift = function (shiftLevel) {
        if (isNaN(shiftLevel) || shiftLevel <= 0) {
            shiftLevel = 1;
        }
        if (!Number.isInteger(shiftLevel)) {
            shiftLevel = Math.round(shiftLevel);
        }
        this.shiftLevel = shiftLevel;
        this.shift = this.params.availablesShifts[shiftLevel - 1];
        this.getReady();
    };
    Worker.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.adjustedWages, this.params.payments, 'wages');
        this.CashFlow.addPayment(this.CO2PrimaryFootprintOffsettingCost, this.params.payments, 'CO2PrimaryFootprintOffsetting');
        this.resignedNb = this._calcResignedNb();
        // TODO: add Loss of machine time and assembly time are shown under breakdown time and absenteeism, respectively and are not separated from routine minor problems.
        var losses = 0;
        this.insurance && this.insurance.claims(losses);
    };
    Object.defineProperty(Worker.prototype, "state", {
        get: function () {
            return {
                "availablesAtStartNb": this.availablesAtStartNb,
                "recruitedEffectiveNb": this.recruitedEffectiveNb,
                "dismissedEffectiveNb": this.dismissedEffectiveNb,
                "resignedNb": this.resignedNb,
                "availablesNextPeriodNb": this.availablesNextPeriodNb,
                "availableTotalHoursNb": this.theoreticalAvailableTotalHoursNb,
                "absenteeismHoursNb": this.absenteeismHoursNb,
                "workedTotaHoursNb": this.workedTotaHoursNb,
                "strikeNextPeriodWeeksNb": this.strikeNextPeriodWeeksNb,
            };
        },
        enumerable: true,
        configurable: true
    });
    Worker.EPSILON = 0.02; // soit 1 minute
    return Worker;
}(Personnel_1.Employee));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Worker;
//# sourceMappingURL=Worker.js.map