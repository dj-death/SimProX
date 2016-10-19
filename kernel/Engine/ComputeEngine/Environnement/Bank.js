"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Bank = (function (_super) {
    __extends(Bank, _super);
    function Bank(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    Bank.prototype.init = function (centralBank) {
        _super.prototype.init.call(this);
        // Stack range exception
        //this.centralBank = centralBank;
        this._interestRate = centralBank.initialInterestBaseRate;
    };
    Object.defineProperty(Bank.prototype, "interestRate", {
        get: function () {
            return this._interestRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "authorisedOverdraftInterestRate", {
        get: function () {
            var baseRate = this.interestRate;
            return baseRate * (1 + this.params.authorisedOverdraftPremiumRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "unAuthorisedOverdraftInterestRate", {
        get: function () {
            var baseRate = this.interestRate;
            return baseRate * (1 + this.params.unAuthorisedOverdraftPremiumRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "termLoansInterestRate", {
        get: function () {
            return this.params.termloansFixedAnnualInterestRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bank.prototype, "termDepositCreditorInterestRate", {
        get: function () {
            var baseRate = this.interestRate;
            var termDepositPremiumRate = this.params.termDepositPremiumRate;
            return baseRate * (1 + termDepositPremiumRate);
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Bank.prototype.demandTermLoans = function (amount) {
        return amount;
    };
    Bank.prototype.repayTermLoans = function (amount) {
    };
    // helpers
    Bank.prototype.calcAuthorisedOverdraftLimit = function (companyFile) {
        var limit;
        var property = companyFile.property || 0;
        var inventories = companyFile.inventories || 0;
        var tradeReceivables = companyFile.tradeReceivables || 0;
        var tradePayables = companyFile.tradePayables || 0;
        var taxDue = companyFile.taxDue || 0;
        limit = property * 0.5;
        limit += inventories * 0.5;
        limit += tradeReceivables * 0.9;
        limit -= tradePayables;
        limit -= taxDue;
        return limit;
    };
    return Bank;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Bank;
//# sourceMappingURL=Bank.js.map