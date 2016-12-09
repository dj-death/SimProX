"use strict";
const IObject = require('../IObject');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class Insurance extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "finance";
    }
    init(premiumsBase, currPeriod, management, economy) {
        super.init();
        if (isNaN(premiumsBase)) {
            console.warn("premiumsBase NaN");
            premiumsBase = 0;
        }
        if (isNaN(currPeriod)) {
            console.warn("currPeriod NaN");
            currPeriod = 0;
        }
        this.management = management;
        this.premiumsBase = premiumsBase;
        this.economy = economy;
        this.forceMajeure = this.params.forceMajeureSequence[currPeriod - 1] || 0;
    }
    reset() {
        super.reset();
        this._claimsForLosses = 0;
    }
    // action
    takeoutInsurance(insurancePlanRef) {
        this.insurancePlanTakenout = this.params.plans[insurancePlanRef];
    }
    claims(value) {
        this._claimsForLosses += value;
    }
    cover(...collections) {
        let self = this;
        collections.forEach(function (objects) {
            if (objects.length) {
                objects.forEach(function (obj) {
                    obj.insurance = self;
                });
            }
            else {
                objects.insurance = self;
            }
        });
    }
    // result
    get claimsForLosses() {
        if (this.insurancePlanTakenout.primaryRiskRate === 0) {
            return 0;
        }
        if (this._claimsForLosses > 0) {
            return this._claimsForLosses;
        }
        let risks = this.forceMajeure;
        let risksAlphaFactors;
        let managementBudget = this.management.budget;
        if (managementBudget >= this.params.optimalManagementBudget) {
            risksAlphaFactors = 0;
        }
        else {
            if (managementBudget === this.params.normalManagementBudget) {
                risksAlphaFactors = 1;
            }
            else {
                // TODO fix it
                risksAlphaFactors = (this.params.normalManagementBudget - managementBudget) / this.params.normalManagementBudget;
            }
        }
        return risks * risksAlphaFactors;
    }
    get primaryNonInsuredRisk() {
        return Utils.round(this.premiumsBase * this.insurancePlanTakenout.primaryRiskRate);
    }
    get premiumsCost() {
        let inflationImpact = this.economy.PPIServices;
        let premiumRate = Utils.round(this.insurancePlanTakenout.premiumRate * inflationImpact, 4);
        let insurancePremiums = premiumRate * this.premiumsBase;
        return Utils.round(insurancePremiums);
    }
    get receipts() {
        let diff = this.claimsForLosses - this.primaryNonInsuredRisk;
        if (diff > 0) {
            return diff;
        }
        else {
            return 0;
        }
    }
    onFinish() {
        this.CashFlow.addPayment(this.premiumsCost, this.params.payments, 'premiums');
        this.CashFlow.addReceipt(this.receipts, this.params.payments);
    }
    get state() {
        return {
            "premiumsCost": this.premiumsCost,
            "claimsForLosses": this.claimsForLosses,
            "receipts": this.receipts,
            "primaryNonInsuredRisk": this.primaryNonInsuredRisk
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Insurance;
//# sourceMappingURL=Insurance.js.map