"use strict";
const Personnel_1 = require('../Personnel');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class Worker extends Personnel_1.Employee {
    constructor(params) {
        super(params);
        this.departmentName = "production";
        this.insurance = null;
    }
    // helpers
    _calcResignedNb() {
        let workersNb = this.employeesNb;
        return 0;
    }
    _calcDisaffectionHoursNb() {
        let activeEmployeesNb = this.employeesNb - this.inactiveEmployeesNb;
        let probability, landa, vars, value;
        probability = this.params.absenteeismProba;
        landa = probability * (this.shift.maxHoursPerPeriod / this.shift.workersNeededNb) + this.params.absenteeismNormalHoursNb;
        value = Utils.getPoisson(landa * activeEmployeesNb);
        // TEST
        if (Utils.NODE_ENV() === "dev") {
            value = probability > 0 ? 172 : 0;
        }
        return value; // we need an integer value
    }
    _calcSicknessHoursNb() {
        return 0;
    }
    _calcLowMotivationHoursNb() {
        return 0;
    }
    _calcStrikeNextPeriodWeeksNb() {
        let probability, weeksMax = this.shift.weeksWorkedByPeriod, value = 0;
        // random value from 0 to max 
        probability = Math.random() * weeksMax;
        value = probability * this.params.tradeUnionSensibility;
        return Math.round(value); // we need an integer value
    }
    init(availablesWorkersNb, labourPool, economy, strikeNotifiedWeeksNb = 0, machinery = null) {
        super.init(availablesWorkersNb, labourPool, economy);
        this.strikeNotifiedWeeksNb = strikeNotifiedWeeksNb;
        this.machinery = machinery;
        if (machinery !== null && this.params.defaultRecruit === true) {
            let self = this;
            this.machinery.on("Ready", function (machinery) {
                console.silly("machine ready fired", arguments);
                let variation = machinery.operatorsNb - self.employeesNb;
                let recruitedNb = variation > 0 ? variation : 0;
                let surplusDismissedNb = variation < 0 ? Math.abs(Math.ceil(variation * self.params.surplusMaxDismissedPercent)) : 0;
                // necessary to call all actions even with param 0
                self.recruit(recruitedNb);
                self.dismiss(surplusDismissedNb);
                self.surplusDismissedNb = surplusDismissedNb;
            }, self);
        }
    }
    get timeUnitCost() {
        let cost = this.hourlyWageRate * (1 + this.shift.shiftPremium) * this.workersPerPosteNb;
        return cost;
    }
    getReady() {
        this.onBeforeReady();
        this.sicknessHoursNb = this._calcSicknessHoursNb();
        this.disaffectionHoursNb = this._calcDisaffectionHoursNb();
        this.lowMotivationHoursNb = this._calcLowMotivationHoursNb();
        this.strikeNextPeriodWeeksNb = this._calcStrikeNextPeriodWeeksNb();
        this.ready = true;
    }
    reset() {
        super.reset();
        this._workedTotaMinutesNb = 0;
        this.surplusDismissedNb = 0;
        this.installedWorkersNb = 0;
    }
    get workersPerPosteNb() {
        return this.shift.workersNeededNb / this.shiftLevel;
    }
    get postesNb() {
        if (this.machinery) {
            return this.machinery.machinesNb;
        }
        return (this.employeesNb - this.inactiveEmployeesNb) / this.shift.workersNeededNb;
    }
    //result
    get inactiveEmployeesNb() {
        let result = this.employeesNb - this.installedWorkersNb;
        if (this.machinery && this.machinery.operatorsNb < this.installedWorkersNb) {
            result += (this.installedWorkersNb - this.machinery.operatorsNb);
        }
        return result;
    }
    get workedTotaHoursNb() {
        let total = Utils.floor(this._workedTotaMinutesNb / 60);
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
    }
    get absenteeismHoursNb() {
        return this.sicknessHoursNb + this.disaffectionHoursNb + this.lowMotivationHoursNb;
    }
    get strikeNotifiedHoursNb() {
        return this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeek * (this.employeesNb - this.inactiveEmployeesNb);
    }
    get theoreticalAvailableTotalHoursNb() {
        return this.shift.maxHoursPerPeriod * this.shiftLevel * this.postesNb;
    }
    get effectiveAvailableTotalHoursNb() {
        let value;
        value = this.theoreticalAvailableTotalHoursNb - this.absenteeismHoursNb - this.strikeNotifiedHoursNb;
        // replace sick workers with externals
        if (this.params.canBringExternalWorkers) {
            value += this.sicknessHoursNb;
        }
        // check negative value and correct to 0
        value = value > 0 ? value : 0;
        return value;
    }
    get weekDaysWorkedHoursNb() {
        let hoursNb, effectiveMaxHoursWeekDays;
        effectiveMaxHoursWeekDays = this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays);
        effectiveMaxHoursWeekDays *= (this.postesNb * this.shiftLevel);
        hoursNb = this.workedTotaHoursNb < effectiveMaxHoursWeekDays ? this.workedTotaHoursNb : effectiveMaxHoursWeekDays;
        if (hoursNb < 0) {
            hoursNb = 0;
        }
        return hoursNb;
    }
    get overtimeWorkedHoursNb() {
        let overtimeWorkedHoursNb, effectiveMaxHoursWeekDays;
        effectiveMaxHoursWeekDays = this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays);
        effectiveMaxHoursWeekDays *= (this.postesNb * this.shiftLevel);
        // how much hours exceed the max hours worked in weeks days
        overtimeWorkedHoursNb = this.workedTotaHoursNb - effectiveMaxHoursWeekDays;
        if (overtimeWorkedHoursNb < 0) {
            overtimeWorkedHoursNb = 0;
        }
        return overtimeWorkedHoursNb;
    }
    get overtimeSaturdayWorkedHoursNb() {
        let hoursNb, effectiveMaxHoursOvertimeSaturday;
        effectiveMaxHoursOvertimeSaturday = this.shift.maxHoursOvertimeSaturday - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerSaturday);
        effectiveMaxHoursOvertimeSaturday *= (this.postesNb * this.shiftLevel);
        hoursNb = this.overtimeWorkedHoursNb < effectiveMaxHoursOvertimeSaturday ? this.overtimeWorkedHoursNb : effectiveMaxHoursOvertimeSaturday;
        if (hoursNb < 0) {
            hoursNb = 0;
        }
        return hoursNb;
    }
    get overtimeSundayWorkedHoursNb() {
        let hoursNb, effectiveMaxHoursOvertimeSunday;
        hoursNb = this.overtimeWorkedHoursNb - this.overtimeSaturdayWorkedHoursNb;
        if (hoursNb < 0) {
            hoursNb = 0;
        }
        // we can't exceed the max
        effectiveMaxHoursOvertimeSunday = this.shift.maxHoursOvertimeSunday - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerSunday);
        effectiveMaxHoursOvertimeSunday *= (this.postesNb * this.shiftLevel);
        hoursNb = hoursNb < effectiveMaxHoursOvertimeSunday ? hoursNb : effectiveMaxHoursOvertimeSunday;
        return hoursNb;
    }
    get overtimeIntensity() {
        let intensity;
        let totalMaxOvertimeHours;
        totalMaxOvertimeHours = (this.shift.maxHoursOvertimeSaturday + this.shift.maxHoursOvertimeSunday) * this.postesNb * this.shiftLevel;
        // TODO: calc separate intensity for saturday and sunday with coefficient of rough
        intensity = this.overtimeWorkedHoursNb / totalMaxOvertimeHours;
        return intensity;
    }
    get workedWeeksNb() {
        let effectiveMaxHoursWeekDays = (this.shift.maxHoursWeekDays - (this.strikeNotifiedWeeksNb * this.params.strikeHoursPerWeekDays)) * (this.postesNb * this.shiftLevel);
        let maxHoursWeekDaysPerWeek = effectiveMaxHoursWeekDays / this.shift.weeksWorkedByPeriod;
        let workedWeekDaysWeeksNb = Math.ceil(this.weekDaysWorkedHoursNb / maxHoursWeekDaysPerWeek);
        return workedWeekDaysWeeksNb;
    }
    get spaceUsed() {
        return this.params.spaceNeeded * this.installedWorkersNb;
    }
    get CO2PrimaryFootprintHeat() {
        return this.workedTotaHoursNb * this.params.CO2Footprint.kwh;
    }
    get CO2PrimaryFootprintWeight() {
        return this.CO2PrimaryFootprintHeat * 0.00052;
    }
    get CO2PrimaryFootprintOffsettingCost() {
        return Utils.round(this.CO2PrimaryFootprintWeight * this.params.costs.CO2OffsettingPerTonneRate, 2);
    }
    // costs
    get externalWorkersCost() {
        let totalCost;
        let basicRate = this.hourlyWageRate;
        let adjustedRate;
        if (basicRate < this.params.minHourlyWageRate) {
            basicRate = this.params.minHourlyWageRate;
        }
        adjustedRate = basicRate * (1 + this.params.externalWorkersPremium);
        totalCost = this.sicknessHoursNb * adjustedRate;
        return totalCost;
    }
    get wages() {
        let wages, minSalary, weekDaysWorkedHoursNb, basicRate, weekDaysWage, saturdayWage, sundayWage, wageRaw, prime, avgSalary, inactivesSalaries;
        let minTotalPaidHours = this.params.minPaidHours * this.postesNb * this.shiftLevel;
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
    }
    get avgWagePerWorkerPerWeekWorked() {
        let avgWagePerWorker = this.wages / this.installedWorkersNb;
        let avgWagePerWorkerPerWeekWorked = avgWagePerWorker / this.workedWeeksNb;
        return Math.ceil(avgWagePerWorkerPerWeekWorked);
    }
    get avgEarnings() {
        return this.wages / this.installedWorkersNb;
    }
    // Actions
    work(minutesNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!this.ready) {
            console.debug('not ready');
            return false;
        }
        let success = true;
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
    }
    get adjustedWages() {
        // fire this event so we can control remunerations by management
        this.onPay();
        if (this.adjustedAvgEarnings === this.avgEarnings) {
            return this.wages;
        }
        return this.adjustedAvgEarnings * this.workedWeeksNb * this.installedWorkersNb;
    }
    pay(hourlyWageRate) {
        if (!this.isInitialised()) {
            return false;
        }
        console.debug("pay :", hourlyWageRate);
        let basicRate = hourlyWageRate * this.params.skilledRateOfPay;
        if (basicRate < this.params.minHourlyWageRate) {
            basicRate = this.params.minHourlyWageRate;
        }
        this.hourlyWageRate = Utils.correctFloat(basicRate);
    }
    setShift(shiftLevel) {
        if (isNaN(shiftLevel) || shiftLevel <= 0) {
            shiftLevel = 1;
        }
        if (!Utils.isInteger(shiftLevel)) {
            shiftLevel = Math.round(shiftLevel);
        }
        this.shiftLevel = shiftLevel;
        this.shift = this.params.availablesShifts[shiftLevel - 1];
        this.getReady();
    }
    onFinish() {
        this.CashFlow.addPayment(this.adjustedWages, this.params.payments, 'wages');
        this.CashFlow.addPayment(this.CO2PrimaryFootprintOffsettingCost, this.params.payments, 'CO2PrimaryFootprintOffsetting');
        this.resignedNb = this._calcResignedNb();
        // TODO: add Loss of machine time and assembly time are shown under breakdown time and absenteeism, respectively and are not separated from routine minor problems.
        let losses = 0;
        this.insurance && this.insurance.claims(losses);
    }
    get state() {
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
    }
}
Worker.EPSILON = 0.02; // soit 1 minute
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Worker;
//# sourceMappingURL=Worker.js.map