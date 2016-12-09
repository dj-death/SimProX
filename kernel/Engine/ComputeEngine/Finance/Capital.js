"use strict";
const IObject = require('../IObject');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class Capital extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "finance";
    }
    init(initialShareCapital, sharesNb, openingSharePrice, openingMarketValuation, lastRetainedEarnings, sharesNbAtStartOfYear, currQuarter) {
        super.init();
        if (isNaN(initialShareCapital)) {
            console.warn("initialShareCapital NaN");
            initialShareCapital = this.params.shareNominalValue * this.params.initialSharesNb;
        }
        if (isNaN(sharesNb)) {
            console.warn("sharesNb NaN");
            sharesNb = this.params.initialSharesNb;
        }
        if (isNaN(openingSharePrice)) {
            console.warn("openingSharePrice NaN");
            openingSharePrice = this.params.shareNominalValue;
        }
        if (isNaN(lastRetainedEarnings)) {
            console.warn("lastRetainedEarnings NaN");
            lastRetainedEarnings = 0;
        }
        if (isNaN(sharesNbAtStartOfYear)) {
            console.warn("sharesNbAtStartOfYear NaN");
            sharesNbAtStartOfYear = this.params.initialSharesNb;
        }
        if (isNaN(currQuarter)) {
            console.warn("currQuarter NaN");
            currQuarter = 0;
        }
        this.initialShareCapital = initialShareCapital;
        this.initialSharesNb = sharesNb;
        this.openingSharePrice = openingSharePrice;
        this.lastRetainedEarnings = lastRetainedEarnings;
        this.sharesNbAtStartOfYear = sharesNbAtStartOfYear;
        this.lastShareNominalValue = sharesNb && Math.round(initialShareCapital / sharesNb);
        this.currQuarter = currQuarter;
    }
    reset() {
        super.reset();
        this.issuedSharesNb = 0;
        this.repurchasedSharesNb = 0;
    }
    // result
    get sharesNb() {
        return this.initialSharesNb + this.issuedSharesNb - this.repurchasedSharesNb;
    }
    get shareNominalValue() {
        return this.lastShareNominalValue || this.params.shareNominalValue;
    }
    get shareCapital() {
        return this.sharesNb * this.shareNominalValue;
    }
    // actions
    changeSharesNb(quantity) {
        if (quantity > 0) {
            this.issueShares(quantity);
        }
        if (quantity < 0) {
            this.repurchaseShares(quantity);
        }
    }
    issueShares(quantity) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToIssueShares) {
            this.issuedSharesNb = 0;
            return;
        }
        let variationRate = Math.abs((this.initialSharesNb - this.sharesNbAtStartOfYear) / this.sharesNbAtStartOfYear);
        let maxAllowedVariationRate = this.params.restrictions.capitalAnnualVariationLimitRate - variationRate;
        let currPeriodMaxIssuedSharesNb = Math.ceil(maxAllowedVariationRate * this.sharesNbAtStartOfYear);
        if (quantity > currPeriodMaxIssuedSharesNb) {
            this.issuedSharesNb = currPeriodMaxIssuedSharesNb;
            return;
        }
        this.issuedSharesNb = quantity;
    }
    repurchaseShares(quantity) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToRepurchaseShares) {
            this.repurchasedSharesNb = 0;
            return;
        }
        let variationRate = Math.abs((this.initialSharesNb - this.sharesNbAtStartOfYear) / this.sharesNbAtStartOfYear);
        let maxAllowedVariationRate = this.params.restrictions.capitalAnnualVariationLimitRate - variationRate;
        let currPeriodMaxRepurchasedSharesNb = Math.ceil(maxAllowedVariationRate * this.sharesNbAtStartOfYear);
        if (quantity > currPeriodMaxRepurchasedSharesNb) {
            this.repurchasedSharesNb = currPeriodMaxRepurchasedSharesNb;
            return;
        }
        this.repurchasedSharesNb = quantity;
    }
    payDividend(rate) {
        if (rate < 0) {
            return;
        }
        if (rate > 1) {
            rate = 1;
        }
        this.dividendRate = rate;
        this.dividendPaid = Utils.round(this.lastRetainedEarnings * rate, 2);
    }
    get dividendPerShare() {
        return this.dividendPaid / this.initialSharesNb;
    }
    get sharesIssued() {
        return this.issuedSharesNb * this.openingSharePrice;
    }
    get sharesRepurchased() {
        return this.repurchasedSharesNb * this.openingSharePrice;
    }
    get sharePremiumAccount() {
        if (this.sharesIssued > 0) {
            return this.issuedSharesNb * (this.openingSharePrice - this.params.shareNominalValue);
        }
        return 0;
    }
    onFinish() {
        this.CashFlow.addPayment(this.dividendPaid, this.params.payments, 'dividendPaid', ENUMS.ACTIVITY.FINANCING);
        this.CashFlow.addPayment(this.sharesRepurchased, this.params.payments, 'sharesRepurchased', ENUMS.ACTIVITY.FINANCING);
        this.CashFlow.addReceipt(this.sharesIssued, this.params.payments, ENUMS.ACTIVITY.FINANCING);
        // setup again as w're about a new year
        if (this.currQuarter === 4) {
            this.sharesNbAtStartOfYear = this.sharesNb;
        }
    }
    get state() {
        return {
            "shareCapital": this.shareCapital,
            "shareNb": this.sharesNb,
            "sharePremiumAccount": this.sharePremiumAccount,
            "sharesRepurchased": this.sharesRepurchased,
            "sharesIssued": this.sharesIssued,
            "dividendPaid": this.dividendPaid,
            "sharesNbAtStartOfYear": this.sharesNbAtStartOfYear
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Capital;
//# sourceMappingURL=Capital.js.map