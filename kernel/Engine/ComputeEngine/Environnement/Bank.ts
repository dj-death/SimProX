import * as IObject from '../IObject';

import CentralBank  from './CentralBank';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface BankParams extends IObject.ObjectParams {
    bankID?: string;

    termloansFixedAnnualInterestRate: number;
    authorisedOverdraftPremiumRate: number;
    unAuthorisedOverdraftPremiumRate: number;

    termDepositMaturity: ENUMS.FUTURES;

    termDepositPremiumRate: number;

    canTermLoansToBeRepaidDuringGame: boolean;
    termLoansAvailability: ENUMS.FUTURES;

    centralBankID: string;
}


export default class Bank extends IObject.IObject {
    departmentName = "environnement";

    protected isPersistedObject: boolean = true;

    public params: BankParams;

    constructor(params: BankParams) {
        super(params);
    }

    //private centralBank: CentralBank;

    private _interestRate: number;

    init(centralBank: CentralBank) {
        super.init();

        // Stack range exception
        //this.centralBank = centralBank;

        this._interestRate = centralBank.initialInterestBaseRate;
    }

    get interestRate(): number {
        return this._interestRate;
    }

    get authorisedOverdraftInterestRate(): number {
        var baseRate = this.interestRate;

        return baseRate * (1 + this.params.authorisedOverdraftPremiumRate);
    }

    get unAuthorisedOverdraftInterestRate(): number {
        var baseRate = this.interestRate;

        return baseRate * (1 + this.params.unAuthorisedOverdraftPremiumRate);
    }

    get termLoansInterestRate(): number {
        return this.params.termloansFixedAnnualInterestRate;
    }

    get termDepositCreditorInterestRate(): number {
        var baseRate = this.interestRate;
        var termDepositPremiumRate = this.params.termDepositPremiumRate;

        return baseRate * (1 + termDepositPremiumRate);
    }

    // actions

    demandTermLoans(amount: number): number {
        return amount;
    }

    repayTermLoans(amount: number) {

    }

    // helpers

    calcAuthorisedOverdraftLimit(companyFile: ENUMS.Company_BankFile): number {
        var limit: number;

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
    }

}
