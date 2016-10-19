"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Insurance = (function (_super) {
    __extends(Insurance, _super);
    function Insurance(params) {
        _super.call(this, params);
        this.departmentName = "finance";
    }
    Insurance.prototype.init = function (premiumsBase, currPeriod, management, economy) {
        _super.prototype.init.call(this);
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
    };
    Insurance.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this._claimsForLosses = 0;
    };
    // action
    Insurance.prototype.takeoutInsurance = function (insurancePlanRef) {
        this.insurancePlanTakenout = this.params.plans[insurancePlanRef];
    };
    Insurance.prototype.claims = function (value) {
        this._claimsForLosses += value;
    };
    Insurance.prototype.cover = function () {
        var collections = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            collections[_i - 0] = arguments[_i];
        }
        var self = this;
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
    };
    Object.defineProperty(Insurance.prototype, "claimsForLosses", {
        // result
        get: function () {
            if (this.insurancePlanTakenout.primaryRiskRate === 0) {
                return 0;
            }
            if (this._claimsForLosses > 0) {
                return this._claimsForLosses;
            }
            var risks = this.forceMajeure;
            var risksAlphaFactors;
            var managementBudget = this.management.budget;
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Insurance.prototype, "primaryNonInsuredRisk", {
        get: function () {
            return Utils.round(this.premiumsBase * this.insurancePlanTakenout.primaryRiskRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Insurance.prototype, "premiumsCost", {
        get: function () {
            var inflationImpact = this.economy.PPIServices;
            var premiumRate = Utils.round(this.insurancePlanTakenout.premiumRate * inflationImpact, 4);
            var insurancePremiums = premiumRate * this.premiumsBase;
            return Utils.round(insurancePremiums);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Insurance.prototype, "receipts", {
        get: function () {
            var diff = this.claimsForLosses - this.primaryNonInsuredRisk;
            if (diff > 0) {
                return diff;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Insurance.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.premiumsCost, this.params.payments, 'premiums');
        this.CashFlow.addReceipt(this.receipts, this.params.payments);
    };
    Object.defineProperty(Insurance.prototype, "state", {
        get: function () {
            return {
                "premiumsCost": this.premiumsCost,
                "claimsForLosses": this.claimsForLosses,
                "receipts": this.receipts,
                "primaryNonInsuredRisk": this.primaryNonInsuredRisk
            };
        },
        enumerable: true,
        configurable: true
    });
    return Insurance;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Insurance;
//# sourceMappingURL=Insurance.js.map