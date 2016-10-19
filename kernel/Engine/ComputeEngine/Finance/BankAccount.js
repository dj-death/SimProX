"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var BankAccount = (function (_super) {
    __extends(BankAccount, _super);
    function BankAccount(params) {
        _super.call(this, params);
        this.departmentName = "finance";
    }
    BankAccount.prototype.init = function (bank, initialBalance, lastTermDeposit, lastTermLoans, lastOverdraft, currPeriodOverdraftLimit) {
        if (initialBalance === void 0) { initialBalance = 0; }
        if (lastTermDeposit === void 0) { lastTermDeposit = 0; }
        if (lastTermLoans === void 0) { lastTermLoans = 0; }
        if (lastOverdraft === void 0) { lastOverdraft = 0; }
        if (currPeriodOverdraftLimit === void 0) { currPeriodOverdraftLimit = Number.MAX_VALUE; }
        _super.prototype.init.call(this);
        this.bank = bank;
        if (isNaN(initialBalance)) {
            console.warn("initialBalance NaN");
            initialBalance = 0;
        }
        if (isNaN(lastTermDeposit)) {
            console.warn("lastTermDeposit NaN");
            lastTermDeposit = 0;
        }
        if (isNaN(lastTermLoans)) {
            console.warn("lastTermLoans NaN");
            lastTermLoans = 0;
        }
        if (isNaN(lastOverdraft)) {
            console.warn("lastOverdraft  NaN");
            lastTermLoans = 0;
        }
        if (isNaN(currPeriodOverdraftLimit)) {
            console.warn("currPeriodOverdraftLimit  NaN");
            currPeriodOverdraftLimit = 0;
        }
        this.initialBalance = initialBalance;
        this.credit = initialBalance > 0 ? initialBalance : 0;
        this.debit = initialBalance < 0 ? Math.abs(initialBalance) : 0;
        this.termDeposit = lastTermDeposit;
        this.initialTermLoans = lastTermLoans;
        this.initialOverdraft = lastOverdraft;
        this.overdraftLimit = currPeriodOverdraftLimit;
    };
    BankAccount.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.additionnelTermLoans = 0;
        this.credit = 0;
        this.debit = 0;
    };
    Object.defineProperty(BankAccount.prototype, "termLoans", {
        get: function () {
            return this.initialTermLoans + this.additionnelTermLoans;
        },
        enumerable: true,
        configurable: true
    });
    BankAccount.prototype.withdraw = function (amount) {
        // don't accept negative values
        amount = Utils.isNumericValid(amount) ? Number(amount) : 0;
        this.debit += amount;
    };
    BankAccount.prototype.payIn = function (amount) {
        // don't accept negative values
        amount = Utils.isNumericValid(amount) ? Number(amount) : 0;
        this.credit += amount;
    };
    // actions
    BankAccount.prototype.changeTermDepositAmount = function (variation) {
        if (variation > 0) {
            this.placeOnTermDeposit(variation);
        }
        if (variation < 0) {
            this.withdrawTermDeposit(Math.abs(variation));
        }
    };
    BankAccount.prototype.placeOnTermDeposit = function (amount) {
        amount = !isNaN(amount) ? Number(amount) : 0;
        this.termDeposit += amount;
    };
    BankAccount.prototype.withdrawTermDeposit = function (amount) {
        amount = !isNaN(amount) ? Number(amount) : 0;
        if (this.termDeposit < amount) {
            amount = this.termDeposit;
        }
        this.termDeposit -= amount;
    };
    BankAccount.prototype.takeTermLoans = function (amount) {
        amount = !isNaN(amount) ? Number(amount) : 0;
        if (amount < 0) {
            if (this.bank.params.canTermLoansToBeRepaidDuringGame) {
                this.repayTermLoans(Math.abs(amount));
            }
            return;
        }
        var accordedTermLoans = this.bank.demandTermLoans(amount);
        this.additionnelTermLoans += accordedTermLoans;
    };
    // repay last period loans
    BankAccount.prototype.repayTermLoans = function (amount) {
        amount = !isNaN(amount) ? Number(amount) : 0;
        if (this.initialTermLoans < amount) {
            amount = this.initialTermLoans;
        }
        this.bank.repayTermLoans(amount);
        this.initialTermLoans -= amount;
    };
    BankAccount.prototype.calcOverdraftLimit = function (company_BankFile) {
        return this.bank.calcAuthorisedOverdraftLimit(company_BankFile);
    };
    Object.defineProperty(BankAccount.prototype, "cash", {
        // result
        get: function () {
            return this.balance - this.termDeposit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "balance", {
        get: function () {
            return this.credit - this.debit - this.overdraft;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "overdraft", {
        get: function () {
            if (this.debit <= this.credit) {
                return 0;
            }
            return this.debit - this.credit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "authorisedOverdraft", {
        get: function () {
            if (this.overdraft <= this.overdraftLimit) {
                return this.overdraft;
            }
            return this.overdraftLimit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "unAuthorisedOverdraft", {
        get: function () {
            return this.overdraft - this.overdraftLimit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "interestReceived", {
        get: function () {
            var interestRate = this.bank.termDepositCreditorInterestRate;
            var base = this.termDeposit;
            var prorataTemporis = this.params.periodDaysNb / 360;
            return Utils.round(base * interestRate * prorataTemporis);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "overdraftInterestPaid", {
        get: function () {
            // The interest rate charged on an unauthorised overdraft is much higher. 
            // Furthermore, this higher rate will apply to the whole overdraft, and not just the excess over your authorised limit.
            var interestRate = this.unAuthorisedOverdraft === 0 ? this.bank.authorisedOverdraftInterestRate : this.bank.unAuthorisedOverdraftInterestRate;
            var base = (this.overdraft + this.initialOverdraft) / 2;
            var prorataTemporis = this.params.periodDaysNb / 360;
            return Utils.round(base * interestRate * prorataTemporis);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "termLoansInterestPaid", {
        get: function () {
            var interestRate = this.bank.termLoansInterestRate;
            var base = this.termLoans;
            var prorataTemporis = this.params.periodDaysNb / 360;
            return Utils.round(base * interestRate * prorataTemporis);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "interestPaid", {
        get: function () {
            return this.termLoansInterestPaid + this.overdraftInterestPaid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BankAccount.prototype, "additionalLoans", {
        // this period receipts
        get: function () {
            if (this.bank.params.termLoansAvailability === ENUMS.FUTURES.IMMEDIATE) {
                return this.additionnelTermLoans;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    BankAccount.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.interestPaid, this.params.payments, 'interest', ENUMS.ACTIVITY.FINANCING);
        this.CashFlow.addReceipt(this.interestReceived, this.params.payments, ENUMS.ACTIVITY.INVESTING);
        this.CashFlow.addReceipt(this.additionalLoans, this.params.payments, ENUMS.ACTIVITY.FINANCING);
    };
    Object.defineProperty(BankAccount.prototype, "state", {
        get: function () {
            return {
                "interestPaid": this.interestPaid,
                "interestReceived": this.interestReceived,
                "banksOverdraft": this.overdraft,
                "termDeposit": this.termDeposit,
                "termLoansValue": this.termLoans,
                "previousBalance": this.initialBalance,
                "balance": this.balance,
                "additionalLoans": this.additionalLoans
            };
        },
        enumerable: true,
        configurable: true
    });
    return BankAccount;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BankAccount;
//# sourceMappingURL=BankAccount.js.map