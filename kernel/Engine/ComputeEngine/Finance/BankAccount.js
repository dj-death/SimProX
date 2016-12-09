"use strict";
const IObject = require('../IObject');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class BankAccount extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "finance";
    }
    init(bank, initialBalance = 0, lastTermDeposit = 0, lastTermLoans = 0, lastOverdraft = 0, currPeriodOverdraftLimit = Number.MAX_VALUE) {
        super.init();
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
    }
    reset() {
        super.reset();
        this.additionnelTermLoans = 0;
        this.credit = 0;
        this.debit = 0;
    }
    get termLoans() {
        return this.initialTermLoans + this.additionnelTermLoans;
    }
    withdraw(amount) {
        // don't accept negative values
        amount = Utils.isNumericValid(amount) ? Number(amount) : 0;
        this.debit += amount;
    }
    payIn(amount) {
        // don't accept negative values
        amount = Utils.isNumericValid(amount) ? Number(amount) : 0;
        this.credit += amount;
    }
    // actions
    changeTermDepositAmount(variation) {
        if (variation > 0) {
            this.placeOnTermDeposit(variation);
        }
        if (variation < 0) {
            this.withdrawTermDeposit(Math.abs(variation));
        }
    }
    placeOnTermDeposit(amount) {
        amount = !isNaN(amount) ? Number(amount) : 0;
        this.termDeposit += amount;
    }
    withdrawTermDeposit(amount) {
        amount = !isNaN(amount) ? Number(amount) : 0;
        if (this.termDeposit < amount) {
            amount = this.termDeposit;
        }
        this.termDeposit -= amount;
    }
    takeTermLoans(amount) {
        amount = !isNaN(amount) ? Number(amount) : 0;
        if (amount < 0) {
            if (this.bank.params.canTermLoansToBeRepaidDuringGame) {
                this.repayTermLoans(Math.abs(amount));
            }
            return;
        }
        let accordedTermLoans = this.bank.demandTermLoans(amount);
        this.additionnelTermLoans += accordedTermLoans;
    }
    // repay last period loans
    repayTermLoans(amount) {
        amount = !isNaN(amount) ? Number(amount) : 0;
        if (this.initialTermLoans < amount) {
            amount = this.initialTermLoans;
        }
        this.bank.repayTermLoans(amount);
        this.initialTermLoans -= amount;
    }
    calcOverdraftLimit(company_BankFile) {
        return this.bank.calcAuthorisedOverdraftLimit(company_BankFile);
    }
    // result
    get cash() {
        return this.balance - this.termDeposit;
    }
    get balance() {
        return this.credit - this.debit - this.overdraft;
    }
    get overdraft() {
        if (this.debit <= this.credit) {
            return 0;
        }
        return this.debit - this.credit;
    }
    get authorisedOverdraft() {
        if (this.overdraft <= this.overdraftLimit) {
            return this.overdraft;
        }
        return this.overdraftLimit;
    }
    get unAuthorisedOverdraft() {
        return this.overdraft - this.overdraftLimit;
    }
    get interestReceived() {
        let interestRate = this.bank.termDepositCreditorInterestRate;
        let base = this.termDeposit;
        let prorataTemporis = this.params.periodDaysNb / 360;
        return Utils.round(base * interestRate * prorataTemporis);
    }
    get overdraftInterestPaid() {
        // The interest rate charged on an unauthorised overdraft is much higher. 
        // Furthermore, this higher rate will apply to the whole overdraft, and not just the excess over your authorised limit.
        let interestRate = this.unAuthorisedOverdraft === 0 ? this.bank.authorisedOverdraftInterestRate : this.bank.unAuthorisedOverdraftInterestRate;
        let base = (this.overdraft + this.initialOverdraft) / 2;
        let prorataTemporis = this.params.periodDaysNb / 360;
        return Utils.round(base * interestRate * prorataTemporis);
    }
    get termLoansInterestPaid() {
        let interestRate = this.bank.termLoansInterestRate;
        let base = this.termLoans;
        let prorataTemporis = this.params.periodDaysNb / 360;
        return Utils.round(base * interestRate * prorataTemporis);
    }
    get interestPaid() {
        return this.termLoansInterestPaid + this.overdraftInterestPaid;
    }
    // this period receipts
    get additionalLoans() {
        if (this.bank.params.termLoansAvailability === ENUMS.FUTURES.IMMEDIATE) {
            return this.additionnelTermLoans;
        }
        return 0;
    }
    onFinish() {
        this.CashFlow.addPayment(this.interestPaid, this.params.payments, 'interest', ENUMS.ACTIVITY.FINANCING);
        this.CashFlow.addReceipt(this.interestReceived, this.params.payments, ENUMS.ACTIVITY.INVESTING);
        this.CashFlow.addReceipt(this.additionalLoans, this.params.payments, ENUMS.ACTIVITY.FINANCING);
    }
    get state() {
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
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BankAccount;
//# sourceMappingURL=BankAccount.js.map