"use strict";
const IObject = require('../IObject');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
const $jStat = require("jstat");
let jStat = $jStat.jStat;
class StockMarket extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    init() {
        super.init();
    }
    reset() {
        super.reset();
        this._stockMarketReturnRate = null;
    }
    get riskFreeRate() {
        return this.economy.centralBank.treasuryBondsInterestRate;
    }
    get marketRiskPrime() {
        return this.stockMarketReturnRate - this.riskFreeRate;
    }
    // result
    get stockMarketReturnRate() {
        return this._stockMarketReturnRate;
    }
    // action
    simulate(currPeriod) {
        let params = this.params;
        let stats = params.stockMarketReturnRateStats;
        let rate;
        if (stats && stats.length) {
            rate = Utils.round(Utils.getStat(stats, currPeriod) / 100, 4);
        }
        else {
            rate = params.stockMarketReturnBaseRate;
        }
        this._stockMarketReturnRate = rate;
    }
    _calcEquityDCFValue(company) {
        let futurePeriodsNb = this.params.projectionFuturePeriodsNb;
        let freeCashFlow = company._normalizedFCF;
        let lastFreeCashFlows = company.lastFreeCashFlows;
        let wacc = company._weightedAvgCapitalCost;
        /* expectedFCFGrowthRate */
        let expectedFCFGrowthRate = company._expectedFCFGrowthRate;
        /* Disc FCF*/
        let discountedFutureFreeCashFlow;
        let rate = (1 + expectedFCFGrowthRate) / (1 + wacc);
        let base = (1 - Math.pow(rate, futurePeriodsNb + 1)) / (1 - rate);
        discountedFutureFreeCashFlow = (freeCashFlow + 1) * (base - 1);
        /* Terminal value */
        // Le taux de croissance à l'infini 0.5 % à 2 %
        let g;
        if (expectedFCFGrowthRate > 0.02) {
            g = 0.02;
        }
        else if (expectedFCFGrowthRate > 0.005) {
            g = expectedFCFGrowthRate;
        }
        else {
            g = 0.005;
        }
        let terminalValue = (freeCashFlow + 1) * Math.pow(1 + g, futurePeriodsNb);
        let discountRate = (1 + g) / (wacc - g);
        let terminalDiscountedFreeCashFlow = terminalValue * discountRate;
        /* result of DCF */
        let discountedFirmValue = discountedFutureFreeCashFlow + terminalDiscountedFreeCashFlow + company.FinanceDept.cashValue;
        /* Debt market value */
        let debtMarketValue;
        let debts = company._debtsTotalValue;
        let debtCost = company._debtCost;
        if (debts === 0) {
            debtMarketValue = 0;
        }
        else {
            let maturity = 5; // years
            let discountDebt = debts / Math.pow(1 + debtCost, maturity);
            let rate = (1 - 1 / Math.pow(1 + debtCost, maturity)) / debtCost;
            let value = company.interestExpense * rate + discountDebt;
            debtMarketValue = Math.round(value);
        }
        /* final */
        let equityMarketValue = discountedFirmValue - debtMarketValue;
        return equityMarketValue;
    }
    _calcAdjustedEquityPresentValue(company) {
        let futurePeriodsNb = this.params.projectionFuturePeriodsNb;
        let freeCashFlow = company._normalizedFCF;
        let lastFreeCashFlows = company.lastFreeCashFlows;
        let wacc = company._weightedAvgCapitalCost;
        let debts = company._debtsTotalValue;
        let debtCost = company._debtCost;
        /* expectedFCFGrowthRate */
        let expectedFCFGrowthRate = company._expectedFCFGrowthRate;
        /* adjustedFirmPresentValue */
        let taxAnnumRate = company.params.taxAnnumRate;
        let unleveredEquityCost = company._unleveredEquityCost;
        let unleveredValue = (freeCashFlow + 1) * (1 + expectedFCFGrowthRate) / (unleveredEquityCost - expectedFCFGrowthRate);
        let taxBenefits = debts * taxAnnumRate * company._unleveredEquityCost / (unleveredEquityCost - expectedFCFGrowthRate);
        let bankruptcyCosts = unleveredValue * company.bankruptcyPb * 0.4;
        let adjustedFirmPresentValue = Math.round(unleveredValue + taxBenefits - bankruptcyCosts + company.FinanceDept.cashValue);
        /* Debt market value */
        let debtMarketValue;
        if (debts === 0) {
            debtMarketValue = 0;
        }
        else {
            let maturity = 5; // years
            let discountDebt = debts / Math.pow(1 + debtCost, maturity);
            let rate = (1 - 1 / Math.pow(1 + debtCost, maturity)) / debtCost;
            let value = company.interestExpense * rate + discountDebt;
            if (value < 0) {
                value = 0;
            }
            debtMarketValue = Math.round(value);
        }
        /* final */
        let value = adjustedFirmPresentValue - debtMarketValue;
        return value;
    }
    evaluate(company) {
        // une valeur nulle ou négative d'actif net c' la faillite on ne peut pas coter cette société
        if (company._assetsNetValue <= 0) {
            return 0;
        }
        let openingSharePrice = company.openingSharePrice;
        let DCFEquityMarketValue = this._calcEquityDCFValue(company);
        let adjustedEquityPresentValue = this._calcAdjustedEquityPresentValue(company);
        let DCFShareValue = Utils.round(DCFEquityMarketValue / company.sharesNb, 2);
        let APVShareValue = Utils.round(adjustedEquityPresentValue / company.sharesNb, 2);
        let projectedValue = 0.5 * DCFShareValue + 0.5 * APVShareValue;
        let bookNetValuePerShare = company._bookNetValuePerShare;
        let dividendPerShare = company.FinanceDept.capital.dividendPerShare;
        console.info("openingSharePrice : %d", openingSharePrice);
        console.info("bookNetValuePerShare : %d", bookNetValuePerShare);
        console.info("DCFShareValue : %d", DCFShareValue);
        console.info("APVShareValue : %d", APVShareValue);
        // past present future
        let shareValue = 1.0498 * bookNetValuePerShare + 0.0183 * dividendPerShare + 0.0815 * projectedValue;
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
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StockMarket;
//# sourceMappingURL=StockMarket.js.map