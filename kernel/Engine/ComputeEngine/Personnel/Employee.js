"use strict";
const IObject = require('../IObject');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class Employee extends IObject.IObject {
    constructor(params) {
        super(params);
        this.resignedNb = 0;
        this._adjustedAvgEarnings = 0;
    }
    // helpers
    init(availablesEmployeesNb, labourPool, economy) {
        super.init();
        if (isNaN(availablesEmployeesNb)) {
            console.warn("availablesEmployeesNb NaN");
            availablesEmployeesNb = 0;
        }
        this.availablesAtStartNb = availablesEmployeesNb;
        this.employeesNb = availablesEmployeesNb;
        this.labourPool = labourPool;
        this.economy = economy;
    }
    reset() {
        super.reset();
        // Urgent: init them the case we will not affect them
        this.recruitedNb = 0;
        this.recruitedEffectiveNb = 0;
        this.trainedEffectiveNb = 0;
        this.trainedNb = 0;
        this.dismissedEffectiveNb = 0;
        this.dismissedNb = 0;
        this.salary = 0;
        this._adjustedAvgEarnings = 0;
        this.onPay = function () { };
    }
    onPay() { }
    get availablesNextPeriodNb() {
        return this.availablesAtStartNb + this.recruitedEffectiveNb + this.trainedEffectiveNb - this.dismissedEffectiveNb - this.resignedNb;
    }
    // costs
    get recruitCost() {
        let inflationImpact = this.economy.PPIOverheads;
        let recruitment = Math.round(this.params.costs.recruitment * inflationImpact);
        // even for try
        return this.recruitedNb * recruitment;
    }
    get dismissalCost() {
        let inflationImpact = this.economy.PPIOverheads;
        let dismissal = Math.round(this.params.costs.dismissal * inflationImpact);
        // just on effective 
        return this.dismissedEffectiveNb * dismissal;
    }
    get trainingCost() {
        let inflationImpact = this.economy.PPIOverheads;
        let training = Math.round(this.params.costs.training * inflationImpact);
        return this.trainedEffectiveNb * training;
    }
    get personnelCost() {
        let sums = 0;
        sums += this.recruitCost;
        sums += this.dismissalCost;
        sums += this.trainingCost;
        return sums;
    }
    get wages() {
        let wages = this.salary * this.employeesNb;
        return wages;
    }
    get adjustedWages() {
        if (this.adjustedAvgEarnings === this.avgEarnings) {
            return this.wages;
        }
        return this.adjustedAvgEarnings * this.employeesNb;
    }
    set adjustedAvgEarnings(value) {
        this._adjustedAvgEarnings = value;
    }
    get adjustedAvgEarnings() {
        return this._adjustedAvgEarnings || this.avgEarnings;
    }
    // helpers
    get maxDismissedNb() {
        return this.params.maxDismissedNb || Number.POSITIVE_INFINITY;
    }
    get minRecruitedNb() {
        return this.params.minRecruitedNb || 0;
    }
    get maxRecruitedNb() {
        return this.params.maxRecruitedNb || Number.POSITIVE_INFINITY;
    }
    get maxTrainedNb() {
        return this.params.maxTrainedNb || Number.POSITIVE_INFINITY;
    }
    get minTrainedNb() {
        return this.params.minTrainedNb || 0;
    }
    // TODO: implement
    _calcResignedNb() {
        return 0;
    }
    /*
        Recruitment serves primarily to raise the productivity of new hires. As recruitment cost rises, the productivity of new hires
        should rise also, but at a diminishing rate until it finally
        levels off. These characteristics can be captured by a
        concave exponential function moderated by three
        parameters: base productivity, recruitment asymptote, and
        recruitment reaction.
    */
    get newHiresProductivity() {
        let productivity;
        let base = 0.07;
        let asymptote = 18;
        let reaction = 0.0004;
        let salary = this.adjustedAvgEarnings;
        productivity = base * (1 + (asymptote - 1) * (1 - 1 / Math.exp(salary * reaction)));
        return productivity;
    }
    /*get productivity(): number {
        let productivity: number;

        let base = 0.07;
        let asymptote = 18;
        let reaction = 0.0004;
        let salary = this.adjustedAvgEarnings;

        productivity = base * (1 + (asymptote - 1) * (1 - 1 / Math.exp(salary * reaction))) * (1 + this.);

        return productivity;
    }*/
    /*
        Benefits serve primarily to lower attrition. As benefits cost
        rises, the rate of attrition should decrease, but at a
        diminishing rate until it finally levels off. These
        characteristics can be captured by a convex exponential
        function moderated by three parameters: attrition asymptote,
        attrition reaction, and attrition base.
    */
    attritionRate() {
        let rate;
        let minRate = 0.01;
        let reaction = -0.0006;
        let earningsPerEmp = this.adjustedAvgEarnings;
        rate = minRate + (1 - minRate) * Math.exp(earningsPerEmp * reaction);
        return rate;
    }
    // actions
    recruit(recruitedNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isInteger(recruitedNb)) {
            recruitedNb = Math.round(recruitedNb);
        }
        // decision
        this.recruitedNb = recruitedNb;
        if (recruitedNb < this.minRecruitedNb) {
            recruitedNb = this.minRecruitedNb;
        }
        if (recruitedNb > this.maxRecruitedNb) {
            recruitedNb = this.maxRecruitedNb;
        }
        this.recruitedEffectiveNb = this.labourPool.employ(recruitedNb, this.params.isUnskilled);
        if (this.params.recruitedAvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.employeesNb += this.recruitedEffectiveNb;
        }
    }
    train(trainedNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isInteger(trainedNb)) {
            trainedNb = Math.round(trainedNb);
        }
        this.trainedNb = trainedNb;
        if (trainedNb < this.minTrainedNb) {
            trainedNb = this.minTrainedNb;
        }
        if (trainedNb > this.maxTrainedNb) {
            trainedNb = this.maxTrainedNb;
        }
        // TODO implment
        this.trainedEffectiveNb = this.labourPool.train(trainedNb, !this.params.isUnskilled);
        if (this.params.trainedAvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.employeesNb += this.trainedEffectiveNb;
        }
    }
    dismiss(dismissedNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isInteger(dismissedNb)) {
            dismissedNb = Math.round(dismissedNb);
        }
        this.dismissedNb = dismissedNb;
        if (dismissedNb > this.maxDismissedNb) {
            dismissedNb = this.maxDismissedNb;
        }
        // TODO implment
        this.dismissedEffectiveNb = Math.min(dismissedNb, this.availablesAtStartNb);
        if (this.params.dismissedUnvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.employeesNb -= this.dismissedEffectiveNb;
        }
    }
    pay(salary) {
        if (!this.isInitialised()) {
            return false;
        }
        this.salary = salary;
    }
    // interface
    get avgEarnings() {
        return 0;
    }
}
exports.Employee = Employee;
//# sourceMappingURL=Employee.js.map