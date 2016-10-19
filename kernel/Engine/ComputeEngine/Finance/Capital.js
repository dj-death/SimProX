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
var Capital = (function (_super) {
    __extends(Capital, _super);
    function Capital(params) {
        _super.call(this, params);
        this.departmentName = "finance";
    }
    Capital.prototype.init = function (initialShareCapital, sharesNb, openingSharePrice, openingMarketValuation, lastRetainedEarnings, sharesNbAtStartOfYear, currQuarter) {
        _super.prototype.init.call(this);
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
    };
    Capital.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.issuedSharesNb = 0;
        this.repurchasedSharesNb = 0;
    };
    Object.defineProperty(Capital.prototype, "sharesNb", {
        // result
        get: function () {
            return this.initialSharesNb + this.issuedSharesNb - this.repurchasedSharesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "shareNominalValue", {
        get: function () {
            return this.lastShareNominalValue || this.params.shareNominalValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "shareCapital", {
        get: function () {
            return this.sharesNb * this.shareNominalValue;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Capital.prototype.changeSharesNb = function (quantity) {
        if (quantity > 0) {
            this.issueShares(quantity);
        }
        if (quantity < 0) {
            this.repurchaseShares(quantity);
        }
    };
    Capital.prototype.issueShares = function (quantity) {
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
    };
    Capital.prototype.repurchaseShares = function (quantity) {
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
    };
    Capital.prototype.payDividend = function (rate) {
        if (rate < 0) {
            return;
        }
        if (rate > 1) {
            rate = 1;
        }
        this.dividendRate = rate;
        this.dividendPaid = Utils.round(this.lastRetainedEarnings * rate, 2);
    };
    Object.defineProperty(Capital.prototype, "dividendPerShare", {
        get: function () {
            return this.dividendPaid / this.initialSharesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "sharesIssued", {
        get: function () {
            return this.issuedSharesNb * this.openingSharePrice;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "sharesRepurchased", {
        get: function () {
            return this.repurchasedSharesNb * this.openingSharePrice;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Capital.prototype, "sharePremiumAccount", {
        get: function () {
            if (this.sharesIssued > 0) {
                return this.issuedSharesNb * (this.openingSharePrice - this.params.shareNominalValue);
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Capital.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.dividendPaid, this.params.payments, 'dividendPaid', ENUMS.ACTIVITY.FINANCING);
        this.CashFlow.addPayment(this.sharesRepurchased, this.params.payments, 'sharesRepurchased', ENUMS.ACTIVITY.FINANCING);
        this.CashFlow.addReceipt(this.sharesIssued, this.params.payments, ENUMS.ACTIVITY.FINANCING);
        // setup again as w're about a new year
        if (this.currQuarter === 4) {
            this.sharesNbAtStartOfYear = this.sharesNb;
        }
    };
    Object.defineProperty(Capital.prototype, "state", {
        get: function () {
            return {
                "shareCapital": this.shareCapital,
                "shareNb": this.sharesNb,
                "sharePremiumAccount": this.sharePremiumAccount,
                "sharesRepurchased": this.sharesRepurchased,
                "sharesIssued": this.sharesIssued,
                "dividendPaid": this.dividendPaid,
                "sharesNbAtStartOfYear": this.sharesNbAtStartOfYear
            };
        },
        enumerable: true,
        configurable: true
    });
    return Capital;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Capital;
//# sourceMappingURL=Capital.js.map