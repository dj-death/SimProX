"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var $jStat = require("jstat");
var jStat = $jStat.jStat;
var StockMarket = (function (_super) {
    __extends(StockMarket, _super);
    function StockMarket(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    StockMarket.prototype.init = function () {
        _super.prototype.init.call(this);
    };
    StockMarket.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this._stockMarketReturnRate = null;
    };
    Object.defineProperty(StockMarket.prototype, "riskFreeRate", {
        get: function () {
            return this.economy.centralBank.treasuryBondsInterestRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StockMarket.prototype, "marketRiskPrime", {
        get: function () {
            return this.stockMarketReturnRate - this.riskFreeRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StockMarket.prototype, "stockMarketReturnRate", {
        // result
        get: function () {
            return this._stockMarketReturnRate;
        },
        enumerable: true,
        configurable: true
    });
    // action
    StockMarket.prototype.simulate = function (currPeriod) {
        var params = this.params;
        var stats = params.stockMarketReturnRateStats;
        var rate;
        if (stats && stats.length) {
            rate = Utils.round(Utils.getStat(stats, currPeriod) / 100, 4);
        }
        else {
            rate = params.stockMarketReturnBaseRate;
        }
        this._stockMarketReturnRate = rate;
    };
    StockMarket.prototype._calcEquityDCFValue = function (company) {
        var futurePeriodsNb = this.params.projectionFuturePeriodsNb;
        var freeCashFlow = company._normalizedFCF;
        var lastFreeCashFlows = company.lastFreeCashFlows;
        var wacc = company._weightedAvgCapitalCost;
        /* expectedFCFGrowthRate */
        var expectedFCFGrowthRate = company._expectedFCFGrowthRate;
        /* Disc FCF*/
        var discountedFutureFreeCashFlow;
        var rate = (1 + expectedFCFGrowthRate) / (1 + wacc);
        var base = (1 - Math.pow(rate, futurePeriodsNb + 1)) / (1 - rate);
        discountedFutureFreeCashFlow = (freeCashFlow + 1) * (base - 1);
        /* Terminal value */
        // Le taux de croissance à l'infini 0.5 % à 2 %
        var g;
        if (expectedFCFGrowthRate > 0.02) {
            g = 0.02;
        }
        else if (expectedFCFGrowthRate > 0.005) {
            g = expectedFCFGrowthRate;
        }
        else {
            g = 0.005;
        }
        var terminalValue = (freeCashFlow + 1) * Math.pow(1 + g, futurePeriodsNb);
        var discountRate = (1 + g) / (wacc - g);
        var terminalDiscountedFreeCashFlow = terminalValue * discountRate;
        /* result of DCF */
        var discountedFirmValue = discountedFutureFreeCashFlow + terminalDiscountedFreeCashFlow + company.FinanceDept.cashValue;
        /* Debt market value */
        var debtMarketValue;
        var debts = company._debtsTotalValue;
        var debtCost = company._debtCost;
        if (debts === 0) {
            debtMarketValue = 0;
        }
        else {
            var maturity = 5; // years
            var discountDebt = debts / Math.pow(1 + debtCost, maturity);
            var rate_1 = (1 - 1 / Math.pow(1 + debtCost, maturity)) / debtCost;
            var value = company.interestExpense * rate_1 + discountDebt;
            debtMarketValue = Math.round(value);
        }
        /* final */
        var equityMarketValue = discountedFirmValue - debtMarketValue;
        return equityMarketValue;
    };
    StockMarket.prototype._calcAdjustedEquityPresentValue = function (company) {
        var futurePeriodsNb = this.params.projectionFuturePeriodsNb;
        var freeCashFlow = company._normalizedFCF;
        var lastFreeCashFlows = company.lastFreeCashFlows;
        var wacc = company._weightedAvgCapitalCost;
        var debts = company._debtsTotalValue;
        var debtCost = company._debtCost;
        /* expectedFCFGrowthRate */
        var expectedFCFGrowthRate = company._expectedFCFGrowthRate;
        /* adjustedFirmPresentValue */
        var taxAnnumRate = company.params.taxAnnumRate;
        var unleveredEquityCost = company._unleveredEquityCost;
        var unleveredValue = (freeCashFlow + 1) * (1 + expectedFCFGrowthRate) / (unleveredEquityCost - expectedFCFGrowthRate);
        var taxBenefits = debts * taxAnnumRate * company._unleveredEquityCost / (unleveredEquityCost - expectedFCFGrowthRate);
        var bankruptcyCosts = unleveredValue * company.bankruptcyPb * 0.4;
        var adjustedFirmPresentValue = Math.round(unleveredValue + taxBenefits - bankruptcyCosts + company.FinanceDept.cashValue);
        /* Debt market value */
        var debtMarketValue;
        if (debts === 0) {
            debtMarketValue = 0;
        }
        else {
            var maturity = 5; // years
            var discountDebt = debts / Math.pow(1 + debtCost, maturity);
            var rate = (1 - 1 / Math.pow(1 + debtCost, maturity)) / debtCost;
            var value_1 = company.interestExpense * rate + discountDebt;
            if (value_1 < 0) {
                value_1 = 0;
            }
            debtMarketValue = Math.round(value_1);
        }
        /* final */
        var value = adjustedFirmPresentValue - debtMarketValue;
        return value;
    };
    StockMarket.prototype.evaluate = function (company) {
        // une valeur nulle ou négative d'actif net c' la faillite on ne peut pas coter cette société
        if (company._assetsNetValue <= 0) {
            return 0;
        }
        var openingSharePrice = company.openingSharePrice;
        var DCFEquityMarketValue = this._calcEquityDCFValue(company);
        var adjustedEquityPresentValue = this._calcAdjustedEquityPresentValue(company);
        var DCFShareValue = Utils.round(DCFEquityMarketValue / company.sharesNb, 2);
        var APVShareValue = Utils.round(adjustedEquityPresentValue / company.sharesNb, 2);
        var projectedValue = 0.5 * DCFShareValue + 0.5 * APVShareValue;
        var bookNetValuePerShare = company._bookNetValuePerShare;
        var dividendPerShare = company.FinanceDept.capital.dividendPerShare;
        console.info("openingSharePrice : %d", openingSharePrice);
        console.info("bookNetValuePerShare : %d", bookNetValuePerShare);
        console.info("DCFShareValue : %d", DCFShareValue);
        console.info("APVShareValue : %d", APVShareValue);
        // past present future
        var shareValue = 1.0498 * bookNetValuePerShare + 0.0183 * dividendPerShare + 0.0815 * projectedValue;
        if (shareValue < 0.1) {
            shareValue = 0.1; // 10 cent is the min
        }
        console.info("shareValue : %d", shareValue);
        if (isNaN(shareValue)) {
            console.warn("shareValue NaN openingSharePrice: %d, bookNetValuePerShare %d, DCFShareValue: %d, APVShareValue: %d", openingSharePrice, company._bookNetValuePerShare, DCFShareValue, APVShareValue);
            return;
        }
        shareValue = Utils.round(shareValue, 2);
        return shareValue;
    };
    return StockMarket;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StockMarket;
//# sourceMappingURL=StockMarket.js.map