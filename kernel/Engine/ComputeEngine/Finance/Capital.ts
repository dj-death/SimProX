import * as IObject from '../IObject';

import * as Company from '../Company';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



interface CapitalParams extends IObject.ObjectParams {
    shareNominalValue: number;
    initialSharesNb: number;

    restrictions: {
        capitalAnnualVariationLimitRate: number;
        minSharePriceToIssueShares: number;
        minSharePriceToRepurchaseShares: number;
    }

    payments: ENUMS.PaymentArray;
}

export default class Capital extends IObject.IObject {
    departmentName = "finance";

    public params: CapitalParams;

    constructor(params: CapitalParams) {
        super(params);
    }

    initialShareCapital: number;

    initialSharesNb: number;

    openingSharePrice: number;

    lastRetainedEarnings: number;

    sharesNbAtStartOfYear: number;

    lastShareNominalValue: number;

    currQuarter: number;


    init(initialShareCapital: number, sharesNb: number, openingSharePrice: number, openingMarketValuation: number, lastRetainedEarnings: number, sharesNbAtStartOfYear: number, currQuarter: number) {
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

    // decision
    issuedSharesNb: number;
    repurchasedSharesNb: number;

    dividendRate: number;


    // result
    get sharesNb(): number {
        return this.initialSharesNb + this.issuedSharesNb - this.repurchasedSharesNb;
    }

    get shareNominalValue(): number {
        return this.lastShareNominalValue || this.params.shareNominalValue;
    }

    get shareCapital(): number {
        return this.sharesNb * this.shareNominalValue;
    }

    // actions
    changeSharesNb(quantity: number) {
        if (quantity > 0) {
            this.issueShares(quantity);
        }

        if (quantity < 0) {
            this.repurchaseShares(quantity);
        }

    }

    issueShares(quantity: number) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToIssueShares) {
            this.issuedSharesNb = 0;

            return;
        }

        var variationRate = Math.abs((this.initialSharesNb - this.sharesNbAtStartOfYear) / this.sharesNbAtStartOfYear);
        var maxAllowedVariationRate = this.params.restrictions.capitalAnnualVariationLimitRate - variationRate;
        var currPeriodMaxIssuedSharesNb = Math.ceil(maxAllowedVariationRate * this.sharesNbAtStartOfYear);

        if (quantity > currPeriodMaxIssuedSharesNb) {
            this.issuedSharesNb = currPeriodMaxIssuedSharesNb;
            return;
        }

        this.issuedSharesNb = quantity;
    }

    repurchaseShares(quantity: number) {
        if (this.openingSharePrice < this.params.restrictions.minSharePriceToRepurchaseShares) {
            this.repurchasedSharesNb = 0;

            return;
        }

        var variationRate = Math.abs((this.initialSharesNb - this.sharesNbAtStartOfYear) / this.sharesNbAtStartOfYear);
        var maxAllowedVariationRate = this.params.restrictions.capitalAnnualVariationLimitRate - variationRate;
        var currPeriodMaxRepurchasedSharesNb = Math.ceil(maxAllowedVariationRate * this.sharesNbAtStartOfYear);

        if (quantity > currPeriodMaxRepurchasedSharesNb) {
            this.repurchasedSharesNb = currPeriodMaxRepurchasedSharesNb;
            return;
        }

        this.repurchasedSharesNb = quantity;
    }

    payDividend(rate: number) {
        if (rate < 0) {
            return;
        }

        if (rate > 1) {
            rate = 1;
        }


        this.dividendRate = rate;
        this.dividendPaid = Utils.round(this.lastRetainedEarnings * rate, 2);
    }


    get dividendPerShare(): number {
        return this.dividendPaid / this.initialSharesNb;
    }



    // cost

    dividendPaid: number;

    get sharesIssued(): number {
        return this.issuedSharesNb * this.openingSharePrice;
    }

    get sharesRepurchased(): number {
        return this.repurchasedSharesNb * this.openingSharePrice;
    }

    get sharePremiumAccount(): number {
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

    get state(): any {
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
