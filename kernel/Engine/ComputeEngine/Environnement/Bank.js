"use strict";
const IObject = require('../IObject');
class Bank extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    init(centralBank) {
        super.init();
        // Stack range exception
        //this.centralBank = centralBank;
        this._interestRate = centralBank.initialInterestBaseRate;
    }
    get interestRate() {
        return this._interestRate;
    }
    get authorisedOverdraftInterestRate() {
        let baseRate = this.interestRate;
        return baseRate * (1 + this.params.authorisedOverdraftPremiumRate);
    }
    get unAuthorisedOverdraftInterestRate() {
        let baseRate = this.interestRate;
        return baseRate * (1 + this.params.unAuthorisedOverdraftPremiumRate);
    }
    get termLoansInterestRate() {
        return this.params.termloansFixedAnnualInterestRate;
    }
    get termDepositCreditorInterestRate() {
        let baseRate = this.interestRate;
        let termDepositPremiumRate = this.params.termDepositPremiumRate;
        return baseRate * (1 + termDepositPremiumRate);
    }
    // actions
    demandTermLoans(amount) {
        return amount;
    }
    repayTermLoans(amount) {
    }
    // helpers
    calcAuthorisedOverdraftLimit(companyFile) {
        let limit;
        let property = companyFile.property || 0;
        let inventories = companyFile.inventories || 0;
        let tradeReceivables = companyFile.tradeReceivables || 0;
        let tradePayables = companyFile.tradePayables || 0;
        let taxDue = companyFile.taxDue || 0;
        limit = property * 0.5;
        limit += inventories * 0.5;
        limit += tradeReceivables * 0.9;
        limit -= tradePayables;
        limit -= taxDue;
        return limit;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Bank;
//# sourceMappingURL=Bank.js.map