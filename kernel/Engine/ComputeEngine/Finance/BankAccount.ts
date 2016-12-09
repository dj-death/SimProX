import * as IObject from '../IObject';

import { Bank } from '../Environnement';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



interface BankAccountParams extends IObject.ObjectParams {
    bankAccountID?: string;
    periodDaysNb: number;

    payments: ENUMS.PaymentArray;

    bankID: string;
}


export default class BankAccount extends IObject.IObject {
    departmentName = "finance";

    public params: BankAccountParams;

    constructor(params: BankAccountParams) {
        super(params);
    }

    private bank: Bank;

    init(bank: Bank, initialBalance: number = 0, lastTermDeposit: number = 0, lastTermLoans: number = 0, lastOverdraft: number = 0, currPeriodOverdraftLimit: number = Number.MAX_VALUE) {
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


    private initialBalance: number;

    private credit: number;
    private debit: number;

    private initialTermLoans: number;
    private additionnelTermLoans: number;// curr period

    private initialOverdraft: number;

    private overdraftLimit: number;

    get termLoans(): number {
       return this.initialTermLoans + this.additionnelTermLoans;   
    }

    private termDeposit: number;

    withdraw(amount: number) {
        // don't accept negative values
        amount = Utils.isNumericValid(amount) ? Number(amount) : 0;

        this.debit += amount;
    }

    payIn(amount: number) {
        // don't accept negative values
        amount = Utils.isNumericValid(amount) ? Number(amount) : 0;

        this.credit += amount;
    }

    // actions
    changeTermDepositAmount(variation: number) {
        if (variation > 0) {
            this.placeOnTermDeposit(variation);
        }

        if (variation < 0) {
            this.withdrawTermDeposit(Math.abs(variation));
        }
    }

    placeOnTermDeposit(amount: number) {
        amount = !isNaN(amount) ? Number(amount) : 0;

        this.termDeposit += amount;
    }

    withdrawTermDeposit(amount: number) {
        amount = !isNaN(amount) ? Number(amount) : 0;

        if (this.termDeposit < amount) {
            amount = this.termDeposit;
        }

        this.termDeposit -= amount;
    }

    takeTermLoans(amount: number) {
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
    repayTermLoans(amount: number) {
        amount = !isNaN(amount) ? Number(amount) : 0;

        if (this.initialTermLoans < amount) {
            amount = this.initialTermLoans;
        }

        this.bank.repayTermLoans(amount);

        this.initialTermLoans -= amount;
    }

    calcOverdraftLimit(company_BankFile): number {
        return this.bank.calcAuthorisedOverdraftLimit(company_BankFile);
    }

    // result
    
    get cash(): number {
        return this.balance - this.termDeposit;
    }

    get balance(): number {
        return this.credit - this.debit - this.overdraft;
    }

    get overdraft(): number {
        if (this.debit <= this.credit) {
            return 0;
        }

        return this.debit - this.credit;
    }

    get authorisedOverdraft(): number {
        if (this.overdraft <= this.overdraftLimit) {
            return this.overdraft;
        }

        return this.overdraftLimit;
    }

    get unAuthorisedOverdraft(): number {
        return this.overdraft - this.overdraftLimit;
    }



    get interestReceived(): number {
        let interestRate = this.bank.termDepositCreditorInterestRate;
        let base = this.termDeposit;
        let prorataTemporis = this.params.periodDaysNb / 360;

        return Utils.round(base * interestRate * prorataTemporis);
    }

    get overdraftInterestPaid(): number {
        // The interest rate charged on an unauthorised overdraft is much higher. 
        // Furthermore, this higher rate will apply to the whole overdraft, and not just the excess over your authorised limit.
        let interestRate = this.unAuthorisedOverdraft === 0 ? this.bank.authorisedOverdraftInterestRate : this.bank.unAuthorisedOverdraftInterestRate;
        let base = (this.overdraft + this.initialOverdraft) / 2;
        let prorataTemporis = this.params.periodDaysNb / 360;

        return Utils.round(base * interestRate * prorataTemporis);
    }

    get termLoansInterestPaid(): number {
        let interestRate = this.bank.termLoansInterestRate;
        let base = this.termLoans;
        let prorataTemporis = this.params.periodDaysNb / 360;

        return Utils.round(base * interestRate * prorataTemporis);
    }

    get interestPaid(): number {
        return this.termLoansInterestPaid + this.overdraftInterestPaid;
    }

    // this period receipts
    get additionalLoans(): number {

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

    get state(): any {
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