import * as IObject from '../IObject';

import SalesForce from './SalesForce';
import Transport from './Transport';
import ECommerce from './ECommerce';


import * as Scenario from '../../Scenario';

import { Economy, World } from '../Environnement';
import { Product, Warehouse} from '../Manufacturing';


import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');

import Game = require('../../../simulation/Games');

var everpolate = require('everpolate');

var linear = everpolate.linear;

var linearSolver = require('linear-solve');

// TEST
const UNIT_VALUES = [98.85, 157.18, 254.74];



function solveFactorElasticiy(value, desiredElasticities: Elasticity[], isNonPrice: boolean = false): number {
    let g1: number;
    let g2: number;

    let A = [];
    let b = [];

    desiredElasticities.forEach(function (item: Elasticity) {
        let factor = item.value * (1 + Math.log(item.value));

        if (isNonPrice) {
            factor *= -1;
        }

        A.push([1, factor]);
        b.push(item.elasticity);


        if (desiredElasticities.length === 1) {
            factor = item.value;

            if (! isNonPrice) {
                factor *= -1;
            }

            let e2 = Math.pow(item.elasticity, 2);

            A.push([1, factor]);
            b.push(e2);
        }
    });

    let solution = linearSolver.solve(A, b);

    if (!solution || solution.length < 2) {
        console.error("equation solving fails", A, b);
    }

    let gF1 = Utils.round(solution[0], 3);
    let gF2 = Utils.round(solution[1], 3);

    console.info("g1 : %d, g2: %d", gF1, gF2);

    if (isNonPrice) {
        return gF1 - (gF2 * value);
    }

    return gF1 + (gF2 * value);
}



interface ProductPriceRef {
    HQPriceRef: number;
    LQPriceRef: number;
}

interface Elasticity {
    value: number;
    elasticity: number;
}




interface ProductLifeCycle {
    introduction: number;
    growth: number;
    maturity: number;
    decline: number;
}



interface MarketParams extends IObject.ObjectParams {
    marketID?: string;
    name: string;

    acceptBacklog: boolean;
    dissatisfiedOrdersCancelledPercent: number;

    costs: {
        creditControlUnitCost: number; // 0 means inactived
        creditCardRatePerUnitSold: number; // 0 means inactived
        storageCostPerProductUnit: number;
    };

    payments: {
        advertising: ENUMS.PaymentArray;
    };


    defaultCustomerCredit: ENUMS.CREDIT; // days
    periodDaysNb: number;

    economyID: string;

    refPrices: ProductPriceRef[];
    priceRanges: ENUMS.VariableRange[];
    qualityRanges: ENUMS.VariableRange[];
    directAdsBudgetRanges: ENUMS.VariableRange[];
    corporateAdsBudgetRange: ENUMS.VariableRange;

    salesForceStaffRange: ENUMS.VariableRange;
    salesForceCommissionRange: ENUMS.VariableRange;
    salesForceSupportRange: ENUMS.VariableRange;

    seasonalIndexes: Array<number[]>;

    basicDemand: number[];

    productLifeCycle: ProductLifeCycle[];
    initialPLCStage: ENUMS.PLC_STAGE[];

    priceWeights: number[];
    directAdsWeights: number[];
    corporateComWeights: number[];
    creditWeights: number[];
    salesForceWeights: number[];
    qualityWeights: number[];

    websiteQualityWeights?: number[];
}




class SubMarket extends IObject.IObject {
    departmentName = "marketing";

    private economy: Economy | World;
    private market: Market;

    product: Product;
    productId: number;

    private warehouse: Warehouse;

    private salesForce: SalesForce;

    params: MarketParams;

    lastPrices: number[];
    lastQualityScores: number[];
    lastAdsBudgets: number[];
    lastCreditEasings: number[];


    lastStockClosingQ: number;
    lastStockClosingValue: number;

    lastPBacklogQ: number;
    openingBacklogQ: number;

    lastSoldQ: number;


    industrySatisfactionScoreAvg: number;
    lastIndustrySatisfactionScoreAvg: number;
     
    constructor(market: Market, params: MarketParams) {
        super(params);

        this.market = market;
        this.economy = this.market.economy;

    }

    restoreLastState(lastResults: Scenario.subMarketRes[], lastDecs: Scenario.subMarket[]) {
        let i = 0;
        let len = Math.max(lastResults.length, lastDecs.length);

        this.lastPrices = [];
        this.lastAdsBudgets = [];
        this.lastCreditEasings = [];
        this.lastQualityScores = this.product.lastQualityScores;


        let lastPDec: Scenario.subMarket;
        let lastPRes: Scenario.subMarketRes;

        for (; i < len; i++) {
            lastPDec = lastDecs[i];
            lastPRes = lastResults[i];

            this.lastPrices.push(lastPDec.price);
            this.lastAdsBudgets.push(lastPDec.advertisingBudget * 1000);

            let credit = lastPDec.customerCredit || this.params.defaultCustomerCredit;
            let creditEasing = this.calcCreditEasing(credit);

            this.lastCreditEasings.push(creditEasing);
        }

        
        this.lastStockClosingQ = lastPRes.stockQ; // TODO see if it ok
        this.lastStockClosingValue = lastPRes.stockValue || (lastPRes.stockQ * UNIT_VALUES[this.productId]);

        this.lastPBacklogQ = Number(lastPRes.backlogQ) || 0;
        this.openingBacklogQ = Number(lastPRes.backlogQ) || 0;

        this.lastSoldQ = lastPRes.soldQ;

        this.lastIndustrySatisfactionScoreAvg = lastPRes.industrySatisfactionScoreAvg || 0.5;
    }


    init(product: Product, salesForce: SalesForce, lastResults: Scenario.subMarketRes[], lastDecs: Scenario.subMarket[]) {
        super.init();

        this.product = product;
        this.productId = product.params.code;

        this.salesForce = salesForce;

        this.restoreLastState(lastResults, lastDecs);

        // create warehouse
        var warehouseID = "warehouse_" + this.params.id;
        var initialExchangeRate = this.economy.currency.initialExchangeRate;

        var storageCostPerProductUnit = this.params.costs.storageCostPerProductUnit * initialExchangeRate;

        this.warehouse = new Warehouse({
            id: warehouseID,
            label: warehouseID,
            lostProbability: product.params.lostProbability,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: storageCostPerProductUnit,
                externalStorageUnitCost: 0
            }
        });

        this.warehouse.stockedItem = this.product;

        this.warehouse.init(this.lastStockClosingQ, this.lastStockClosingValue);

        this.product.registerLocalStock(this.warehouse);
    }

    reset() {
        super.reset();

        this.orderedQ = 0;

        this.lastPBacklogSoldQ = 0;
        this.openingBacklogQ = 0;
    }

    

    get soldOffQ(): number {
        return this.lastStockClosingQ - this.warehouse.openingQ;
    }

    // decision
    advertisingBudget: number = 0;
    industryDirectAdsBudgetAvg: number;

    price: number = Infinity;
    industryPriceAvg: number;

    customerCredit: ENUMS.CREDIT = ENUMS.CREDIT.CASH;
    industryCreditEasingAvg: number;

    industryQualityScoreAvg: number;

    get deliveredQ(): number {
        return this.warehouse.inQ;
    }

    get effectiveDeliveredQ(): number {
        return this.warehouse.inQ - this.warehouse.lostQ - this.warehouse.spoiledQ;
    }

    // results
    orderedQ: number;

    lastPBacklogSoldQ: number;

    industryTotalSoldQ: number;
    industryTotalSalesRevenue: number;

    get soldQ(): number {
        var demandQ = this.orderedQ + this.lastPBacklogSoldQ;
        var supplyQ = this.effectiveDeliveredQ + this.warehouse.openingQ - this.soldOffQ;

        return Math.min(demandQ, supplyQ);
    }

    get backlogQ(): number {
        if (! this.params.acceptBacklog) {
            return 0;
        }

        return Math.floor(this.shortfallQ * (1 - this.params.dissatisfiedOrdersCancelledPercent));
    }


    get shortfallQ(): number {
        return this.warehouse.shortfallQ;
    }

    get stockQ(): number {
        return this.warehouse.availableQ;
    }

    returnedQ: number;

    get salesRevenue(): number {
        return this.soldQ * this.price;
    }

    get ordersValue(): number {
        return this.orderedQ * this.price;
    }

    get soldOffValue(): number {
        // todo fix for cmup with inventory value
        return this.soldOffQ * this.product.inventoryUnitValue;
    }


    get stockValue(): number {
        // todo fix for cmup with inventory value
        return this.stockQ * this.product.inventoryUnitValue;
    }


    calcCreditEasing(credit: ENUMS.CREDIT): number {
        let maxCredit = this.params.periodDaysNb;

        return credit / maxCredit;
    }

    // effect of previous investments continues to act in the current period. 
    get smoothedCustomerCreditEasing(): number {
        let credit: number;
        let residualFactor = Game.configs.demandFactors.customerCredit.residualEffect;

        let currCreditEasing = this.calcCreditEasing(this.customerCredit);
        let lastSmoothedCreditEasing = Utils.simpleexpSmooth(this.lastCreditEasings, residualFactor);

        // Cumulative effect lasts for 1 or 2 periods.
        credit = currCreditEasing * (1 - residualFactor) + lastSmoothedCreditEasing * residualFactor;

        return credit;
    }

    get creditEfficiency(): number {
        let refRatio = this.smoothedCustomerCreditEasing; // as cash is ref so nothing will be different 
        let industryRatio = this.smoothedCustomerCreditEasing * 0.5 / this.industryCreditEasingAvg;

        let competitorsInfluence = Game.configs.demandFactors.customerCredit.competitorsInfluence;

        let eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);

        if (eff > 1) {
            eff = 1;
        }

        if (eff < 0) {
            eff = 0;
        }

        return Utils.round(eff, 4);
    }


    // effect of previous investments continues to act in the current 
    get smoothedDirectAdsBudget(): number {
        let budget: number;
        let residualFactor = Game.configs.demandFactors.directAds.adsInvestmentCumulativeEffect;

        let lastSmoothedDirectAdsBudget = Utils.simpleexpSmooth(this.lastAdsBudgets, residualFactor);

        // Cumulative effect lasts for 1 or 2 periods.
        budget = this.advertisingBudget * (1 - residualFactor) + lastSmoothedDirectAdsBudget * residualFactor;

        return budget;
    }


    get directAdsEfficiency(): number {
        let range: ENUMS.VariableRange = this.params.directAdsBudgetRanges[this.productId];

        let refRatio = Utils.normalize(this.smoothedDirectAdsBudget, range);

        let industryRatio = this.smoothedDirectAdsBudget * 0.5 / this.industryDirectAdsBudgetAvg;

        let competitorsInfluence = Game.configs.demandFactors.directAds.competitorsInfluence;

        let eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);

        if (eff < 0) {
            eff = 0;
        }

        if (eff > 1) {
            eff = 1;
        }

        return Utils.round(eff, 4);
    }

    get smoothedPrice(): number {
        let price: number;
        let residualFactor = Game.configs.demandFactors.price.residualEffect;

        let lastSmoothedPrice = Utils.simpleexpSmooth(this.lastPrices, residualFactor);

        // Cumulative effect lasts for 1 or 2 periods.
        price = this.price * (1 - residualFactor) + lastSmoothedPrice * residualFactor;

        return price;
    }

    // TODO: devlopt in function of quality
    get priceToRefRatio(): number {
        let pricesByQ = this.params.refPrices[this.productId];

        let minQuality = Game.configs.demandFactors.quality.minValue;
        let maxQuality = Game.configs.demandFactors.quality.maxValue;

        let currency = this.economy.currency;
        let exchangeRate = Utils.round(currency.initialExchangeRate * 0.33 + currency.quotedExchangeRate * 0.67, 2);


        // linear(xx {Array|Number}, XX {Array}, YY {Array}) → {Array}
        let refPrice = everpolate.linear(this.product.qualityScore, [minQuality, maxQuality], [pricesByQ.LQPriceRef, pricesByQ.HQPriceRef]);

        let ratio = (this.price / exchangeRate) * 0.5 / refPrice; // as price in euro and the ref in local curr

        return ratio;
    }

    get smoothedQuality(): number {
        let quality: number;
        let residualFactor = Game.configs.demandFactors.quality.residualEffect;

        let lastSmoothedQuality = Utils.simpleexpSmooth(this.lastQualityScores, residualFactor);

        // Cumulative effect lasts for 1 or 2 periods.
        quality = this.product.qualityScore * (1 - residualFactor) + lastSmoothedQuality * residualFactor;

        return quality;
    }

    get qualityEfficiency(): number {
        let range: ENUMS.VariableRange = this.params.qualityRanges[this.productId];

        let refRatio = Utils.normalize(this.smoothedQuality, range);

        let industryRatio = this.smoothedQuality * 0.5 / this.industryQualityScoreAvg;

        let competitorsInfluence = Game.configs.demandFactors.quality.competitorsInfluence;

        let eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);

        if (eff < 0) {
            eff = 0;
        }

        if (eff > 1) {
            eff = 1;
        }

        return Utils.round(eff, 4);
    }

    get customerSatisfactionScore(): number {
        let satisfaction;

        let score;
        let scoreRef = this.priceToRefRatio; // Note recherché par Client

        // is ECommerce
        if (this.market.hasECommerce && this.salesForce.employeesNb <= 0) {
            return 0;
        }

        score = this.directAdsEfficiency * this.params.directAdsWeights[this.productId];
        score += this.creditEfficiency * this.params.creditWeights[this.productId];
        score += this.qualityEfficiency * this.params.qualityWeights[this.productId];

        score += this.market.corporateAdsEfficiency * this.params.corporateComWeights[this.productId];
        score += this.market.salesForceGlobalEfficiency * this.params.salesForceWeights[this.productId];


        if (this.market.hasECommerce) {
            score += this.market.websiteEfficiency * this.params.websiteQualityWeights[this.productId];
        }

        satisfaction = score * 0.5 / scoreRef; // reference so the median effect 50 %

        return Utils.round(satisfaction, 4);
    }


    get developmentRate(): number {
        let rate;

        let PLC = this.params.productLifeCycle[this.productId];

        let initialPLCStage = this.params.initialPLCStage[this.productId];

        let currPeriod = this.market.currPeriod;

        let endGrowth = PLC.introduction + PLC.growth;
        let endMaturity = endGrowth + PLC.maturity;
        let maturityPeak = endGrowth + Math.round(PLC.maturity * 1 / 3);

        let elapsedStageTimeRate;

        let polyInterpolate = everpolate.polynomial;

        // elapsedTime till the middle of the current period (0.5) in months from period 0
        let elapsedTime;

        let RnDImpact = 0;
        let RnDFactor;

        // we add 
        switch (initialPLCStage) {
            case ENUMS.PLC_STAGE.INTRODUCTION:
                elapsedTime = 0;
                break;

            case ENUMS.PLC_STAGE.GROWTH:
                elapsedTime = PLC.introduction;
                break;

            case ENUMS.PLC_STAGE.MATURITY_BEGIN:
                elapsedTime = endGrowth;
                break;

            case ENUMS.PLC_STAGE.MATURITY_END:
                elapsedTime = maturityPeak;
                break;

            case ENUMS.PLC_STAGE.DECLINE:
                elapsedTime = endMaturity;
                break;
        }

        elapsedTime += Math.ceil(currPeriod * Game.daysNbByPeriod / 60);

        if (elapsedTime < 1) {
            elapsedTime = 1;
        }


        /* S-Curve
             *
             * S: Saturation Maximum Feasible Market Penetration
             * Yg Start of Growth Stage = Time to get into the critical mass of 10 %
             * Tm: Take Over Time = Time to get into the red zone of maturity or 90 %
             */

        let S = 1;
        let Yg = PLC.introduction;
        let Tg = PLC.growth;

        let Tm = Math.round(PLC.maturity * 2 / 3);
        let Td = PLC.decline;

        let base;

        if (elapsedTime < maturityPeak) {
            base = (Yg + (Tg / 2) - elapsedTime) / Tg;
            rate = S / (1 + Math.pow(81, base));

        } else {
            base = (Tm + (Td / 2) - (elapsedTime - maturityPeak)) / Td;
            rate = 1 - (S / (1 + Math.pow(81, base)))
        }



        RnDImpact = 0.4 * (1 - 1 / Math.exp(this.product.majorNotYetImplementedNb * 0.2));

        if (this.product.isMajorImplementedLastPeriod && !this.product.majorNotYetImplementedNb) {
            RnDImpact += (1.1 * 0.4 * (1 - 1 / Math.exp(1 * 0.2))); // 110 % from RnD jsut like if it happen now
        }



        // is the inverse of derivatife as it like an elasticity
        base = (-elapsedTime + (Tg / 2) + Yg) / Tg;
        let derivative = Math.log(81) * Math.pow(81, base) / (Tg * Math.pow(Math.pow(81, base) + 1, 2));

        RnDFactor = Utils.round((1 / (10 * derivative + 0.25)) / 2, 2);

        RnDImpact *= (1 + RnDFactor); 

        rate += RnDImpact;

        if (rate > 1.25) {
            rate = 1.25;
        }

        if (rate < 0) {
            rate = 0;
        }

        return Utils.round(rate, 4);
    }


    __testArr: number[];

    __developmentRate(elapsedTime, majors): number {

        this.__testArr = this.__testArr || [];

        let rate;

        let PLC = this.params.productLifeCycle[this.productId];

        let initialPLCStage = this.params.initialPLCStage[this.productId];

        let currPeriod = this.market.currPeriod;

        let endGrowth = PLC.introduction + PLC.growth;
        let endMaturity = endGrowth + PLC.maturity;

        let maturityPeak = endGrowth + Math.round(PLC.maturity * 1 / 3);

        let elapsedStageTimeRate;

        let polyInterpolate = everpolate.polynomial;


        let RnDImpact = 0;
        let RnDFactor;


        /* S-Curve
             *
             * S: Saturation Maximum Feasible Market Penetration
             * Yg Start of Growth Stage = Time to get into the critical mass of 10 %
             * Tm: Take Over Time = Time to get into the red zone of maturity or 90 %
             */

        let S = 1;
        let Yg = PLC.introduction;
        let Tg = PLC.growth;

        let Tm = Math.round(PLC.maturity * 2 / 3);
        let Td = PLC.decline;

        let base;

        if (elapsedTime < maturityPeak) {
            base = (Yg + (Tg / 2) - elapsedTime) / Tg;
            rate = S / (1 + Math.pow(81, base));

        } else {
            base = (Tm + (Td / 2) - (elapsedTime - maturityPeak)) / Td;
            rate = 1 - (S / (1 + Math.pow(81, base)))
        }



        RnDImpact = 0.4 * (1 - 1 / Math.exp(majors * 0.2));

        this.__testArr[elapsedTime] = majors;

        if (this.__testArr[elapsedTime - 1]) {
            RnDImpact += 0.09;
        }



        // is the inverse of derivatife as it like an elasticity
        base = (-elapsedTime + (Tg / 2) + Yg) / Tg;
        let derivative = Math.log(81) * Math.pow(81, base) / (Tg * Math.pow(Math.pow(81, base) + 1, 2));

        RnDFactor = Utils.round((1 / (10 * derivative + 0.25)) / 2, 2);

        RnDImpact *= (1 + RnDFactor);

        rate += RnDImpact;

        if (rate > 1.25) {
            rate = 1.25;
        }

        if (rate < 0) {
            rate = 0;
        }

        return Utils.round(rate, 4);
    }
    // cash flows


    get tradingReceipts(): number {
        var currPeriodReceiptsRatio: number,
            credit = this.customerCredit,
            latePaymentsRate = 0;

        if (credit === ENUMS.CREDIT.CASH) {
            currPeriodReceiptsRatio = 1;

        } else if (credit >= this.params.periodDaysNb) {
            currPeriodReceiptsRatio = 0;

        } else {
            latePaymentsRate = this.economy.calcLatePaymentsRate(credit);

            currPeriodReceiptsRatio = 1 - credit / this.params.periodDaysNb;
            currPeriodReceiptsRatio = Utils.ceil(currPeriodReceiptsRatio, 2);

        }

        return this.salesRevenue * currPeriodReceiptsRatio * (1 - latePaymentsRate);
    }

    get tradeReceivablesValue(): number {
        return this.salesRevenue - this.tradingReceipts;
    }

    get marketVolumeShareOfSales(): number {
        if (!this.industryTotalSoldQ) {
            return 0;
        }

        return Utils.round(this.soldQ / this.industryTotalSoldQ, 4) * 100;
    }

    get marketValueShareOfSales(): number {
        if (!this.industryTotalSalesRevenue) {
            return 0;
        }

        return Utils.round(this.salesRevenue / this.industryTotalSalesRevenue, 4) * 100;
    }



    // helpers


    // actions
    receiveFrom(quantity: number, product: Product, price: number, adsBudget: number, customerCredit?: ENUMS.CREDIT): boolean {
        if (!this.isInitialised()) {
            return false;
        }

        var value = quantity * price;

        this.price = price;
        this.advertisingBudget = adsBudget;

        this.customerCredit = customerCredit || this.params.defaultCustomerCredit;

        this.warehouse.moveIn(quantity, value);

        // TODO: develop it f(prix varia
        if (this.openingBacklogQ > 0) {
            var backlogSoldQ = this.getOrdersOf(this.lastPBacklogQ, false); // false not a new order

            this.openingBacklogQ -= backlogSoldQ;
            this.lastPBacklogSoldQ += backlogSoldQ;
        }

        return true;
    }

    getOrdersOf(quantity: number, isNewOrder: boolean = true): number {
        if (!this.isInitialised()) {
            console.debug('not initialised');
            return 0;
        }
        
        if (! Utils.isNumericValid(quantity)) {
            console.warn('Market get orders of @ Quantity not reel : %d', quantity);
            return 0;
        }

        if (isNewOrder) {
            this.orderedQ += quantity;
        }

        var deliveredQ = this.warehouse.moveOut(quantity);

        this.returnForRepair();

        return deliveredQ;
    }


    // TODO: develop it
    _calcReturnedQ(): number {

        //let distributorEff = this.internetMarket.salesForceGlobalEfficiency;

        //let problemsRate = (1 - distributorEff) * 0.04 / 0.5;

        let problemsRate = 0.04;
        let value = Math.round(this.soldQ * problemsRate);

        return value;
    }

    returnForRepair() {
        var returnedQ = this._calcReturnedQ();

        this.product.returnForRepair(returnedQ);
    }

    get state(): any {
        return {
            "effectiveDeliveredQ": this.effectiveDeliveredQ,
            "orderedQ": this.orderedQ,
            "soldQ": this.soldQ,
            "backlogQ": this.backlogQ,
            "stockQ": this.stockQ,
            "price": this.price
        };

    }


}



export default class Market extends IObject.IObject {
    departmentName = "marketing";

    subMarkets: SubMarket[];

    private salesForce: SalesForce;

    private transport: Transport;

    eCommerce: ECommerce = null;

    economy: Economy | World;

    lastCorporateComBudgets: number[];
    lastSalesForceStaffs: number[];
    lastSalesForceCommissions: number[];
    lastSalesForceSupports: number[];

    lastTradingReceivables: number;

    currPeriod: number;

    params: MarketParams;

    constructor(params: MarketParams) {
        super(params);
    }


    get hasECommerce(): boolean {
        return this.eCommerce instanceof ECommerce;
    }

    restoreLastState(lastResults: Scenario.marketRes[], lastDecs: Scenario.market[]) {
        let i = 0;
        let len = Math.max(lastResults.length, lastDecs.length);

        this.lastCorporateComBudgets = [];

        for (; i < len; i++) {
            let lastPDec = lastDecs[i];
            let lastPRes = lastResults[i];


            if (isNaN(lastPDec.corporateComBudget)) {
                console.warn("lastPDec.corporateComBudget NaN");

                lastPDec.corporateComBudget = 0;
            }

            this.lastCorporateComBudgets.push(lastPDec.corporateComBudget * 1000);
        }



        this.lastSalesForceCommissions = this.salesForce.lastCommissionRates;
        this.lastSalesForceStaffs = this.salesForce.lastStaffs;
        this.lastSalesForceSupports = this.salesForce.lastSupports;
    }


    init(economy: Economy | World, products: Product[], salesForce: SalesForce, transport: Transport, lastResults: Scenario.marketRes[], lastDecs: Scenario.market[], lastTradingReceivables: number, currPeriod: number) {
        super.init();

        this.economy = economy;
        this.salesForce = salesForce;
        this.transport = transport;

        this.currPeriod = currPeriod;

        this.restoreLastState(lastResults, lastDecs);

        this.lastTradingReceivables = lastTradingReceivables;

        this.salesForce.market = this;

        var productCode: number,
            subMarket: SubMarket;

        this.subMarkets = [];

        for (let i = 0, len = products.length; i < len; i++) {
            productCode = products[i].params.code;

            var id = this.params.id + "_" + products[i].params.id;
            var params = Utils.ObjectApply({}, this.params, { id: id });

            let subMarketLastResults = [];
            let subMarketLastDecs = [];

            lastResults.forEach(function (res) {
                subMarketLastResults.push(res.products[i]);
            });

            lastDecs.forEach(function (dec) {
                subMarketLastDecs.push(dec.products[i]);
            });

            subMarket = new SubMarket(this, params);
            subMarket.init(products[i], salesForce, subMarketLastResults, subMarketLastDecs);

            this.subMarkets[productCode] = subMarket;
        }

    }


    // decision
    corporateComBudget: number;
    industryCorporateComBudgetAvg: number;


    industrySalesForceStaffAvg: number;
    industrySalesForceCommissionRateAvg: number;
    industrySalesForceSupportAvg: number;

    industryWebsiteLevelAvg: number;

    // results

    get hiredTransportCost(): number {
        return this.transport.hiredTransportCost;
    }

    get salesRevenue(): number {
        // aggregate sales revenue of all subMarkets
        return Utils.sums(this.subMarkets, "salesRevenue");
    }

    // cash flows
    get tradingReceipts(): number {
        return Utils.sums(this.subMarkets, "tradingReceipts");
    }

    get tradeReceivablesValue(): number {
        return Utils.sums(this.subMarkets, "tradeReceivablesValue");
    }


    get soldUnitsNb(): number {
        return Utils.sums(this.subMarkets, "soldQ");
    }

    get ordersValue(): number {
        return Utils.sums(this.subMarkets, "ordersValue");
    }

    get soldOffValue(): number {
        return Utils.sums(this.subMarkets, "soldOffValue");
    }

    get stockValue(): number {
        return Utils.sums(this.subMarkets, "stockValue");
    }

    get advertisingCost(): number {
        var total,
            i = 0,
            len = this.subMarkets.length,
            budget;

        total = this.corporateComBudget;
        total += Utils.sums(this.subMarkets, "advertisingBudget");

        return total;
    }

    get creditControlCost(): number {
        return this.soldUnitsNb * (this.params.costs.creditControlUnitCost + this.params.costs.creditCardRatePerUnitSold);
    }


    // effect of previous investments continues to act in the current period. 
    get smoothedCorporateAdsBudget(): number {
        let budget: number;
        let residualFactor = Game.configs.demandFactors.corporateAds.adsInvestmentCumulativeEffect;

        let lastSmoothedCorporateAdsBudget = Utils.simpleexpSmooth(this.lastCorporateComBudgets, residualFactor);

        // Cumulative effect lasts for 1 or 2 periods.
        budget = this.corporateComBudget * (1 - residualFactor) + lastSmoothedCorporateAdsBudget * residualFactor;

        return budget;
    }



    get corporateAdsEfficiency(): number {
        let range = this.params.corporateAdsBudgetRange;

        let refRatio = Utils.normalize(this.smoothedCorporateAdsBudget, range);
        let industryRatio = this.smoothedCorporateAdsBudget * 0.5 / this.industryCorporateComBudgetAvg;

        let competitorsInfluence = Game.configs.demandFactors.corporateAds.competitorsInfluence;

        let eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);


        if (eff > 1) {
            eff = 1;
        }

        if (eff < 0) {
            eff = 0;
        }

        return Utils.round(eff, 4);
    }

  

    get smoothedSalesForceStaff(): number {
        let staffNb: number;
        let residualFactor = Game.configs.demandFactors.salesForce.staffResidualEffect;

        let lastSmoothedSalesForceStaff = Utils.simpleexpSmooth(this.lastSalesForceStaffs, residualFactor);

        staffNb = this.salesForce.employeesNb * (1 - residualFactor) + lastSmoothedSalesForceStaff * residualFactor;

        return staffNb;
    }


    get salesForceStaffEfficiency(): number {
        let range = this.params.salesForceStaffRange;

        let refRatio = Utils.normalize(this.smoothedSalesForceStaff, range);
        let industryRatio = this.smoothedSalesForceStaff * 0.5 / this.industrySalesForceStaffAvg;

        let competitorsInfluence = Game.configs.demandFactors.salesForce.competitorsInfluence;

        let eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);

        if (eff > 1) {
            eff = 1;
        }

        if (eff < 0) {
            eff = 0;
        }


        return Utils.round(eff, 4);
    }


    get smoothedSalesForceCommission(): number {
        let commissionRate: number;
        let residualFactor = Game.configs.demandFactors.salesForce.commissionResidualEffect;

        let lastSmoothedSalesForceCommission = Utils.simpleexpSmooth(this.lastSalesForceCommissions, residualFactor);

        commissionRate = this.salesForce.commissionRate * (1 - residualFactor) + lastSmoothedSalesForceCommission * residualFactor;

        return commissionRate;
    }


    get salesForceCommissionEfficiency(): number {
        let range = this.params.salesForceCommissionRange;

        let refRatio = Utils.normalize(this.smoothedSalesForceCommission, range);
        let industryRatio = this.smoothedSalesForceCommission * 0.5 / this.industrySalesForceCommissionRateAvg;

        let competitorsInfluence = Game.configs.demandFactors.salesForce.competitorsInfluence;

        let eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);


        if (eff > 1) {
            eff = 1;
        }


        if (eff < 0) {
            eff = 0;
        }

        return Utils.round(eff, 4);
    }



    get smoothedSalesForceSupport(): number {
        let support: number;
        let residualFactor = Game.configs.demandFactors.salesForce.supportResidualEffect;

        let lastSmoothedSalesForceSupport = Utils.simpleexpSmooth(this.lastSalesForceSupports, residualFactor);

        support = this.salesForce.supportPerAgent * (1 - residualFactor) + lastSmoothedSalesForceSupport * residualFactor;

        return support;
    }

    get salesForceSupportEfficiency(): number {
        let range = this.params.salesForceSupportRange;

        let refRatio = Utils.normalize(this.smoothedSalesForceSupport, range);
        let industryRatio = this.smoothedSalesForceCommission * 0.5 / this.industrySalesForceSupportAvg;

        let competitorsInfluence = Game.configs.demandFactors.salesForce.competitorsInfluence;

        let eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);


        if (eff > 1) {
            eff = 1;
        }

        if (eff < 0) {
            eff = 0;
        }

        return Utils.round(eff, 4);
    }

    get salesForceGlobalEfficiency(): number {
        let commissionEff = this.salesForceCommissionEfficiency;
        let staffEff = this.salesForceStaffEfficiency;
        let supportEff = this.salesForceSupportEfficiency;

        let commissionWeight = Game.configs.demandFactors.salesForce.commissionWeight;
        let staffWeight = Game.configs.demandFactors.salesForce.staffWeight;
        let supportWeight = Game.configs.demandFactors.salesForce.supportWeight;


        let eff = (commissionEff * commissionWeight) + (staffEff * staffWeight) + (supportEff * supportWeight);

        return Utils.round(eff, 4);
    }

    // effect of previous level continues to act in the current period. 
    get smoothedWebsiteLevel(): number {
        if (!this.hasECommerce) {
            return 0;
        }


        let level: number;
        let residualFactor = Game.configs.demandFactors.eCommerce.residualEffect;

        let lastSmoothedWebsiteLevel = Utils.simpleexpSmooth(this.eCommerce.lastWebsiteLevels, residualFactor);

        // Cumulative effect lasts for 1 or 2 periods.
        level = this.eCommerce.websiteLevel * (1 - residualFactor) + lastSmoothedWebsiteLevel * residualFactor;

        return level;
    }



    get websiteEfficiency(): number {
        if (!this.hasECommerce) {
            return 0;
        }

        let range = this.eCommerce.params.websiteLevelRange;

        let refRatio = Utils.normalize(this.smoothedWebsiteLevel, range);
        let industryRatio = this.smoothedWebsiteLevel * 0.5 / this.industryWebsiteLevelAvg;

        let competitorsInfluence = Game.configs.demandFactors.eCommerce.competitorsInfluence;

        let eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);


        if (eff > 1) {
            eff = 1;
        }

        if (eff < 0) {
            eff = 0;
        }

        return Utils.round(eff, 4);
    }


    setIndustryMarketingMix(mkgMix: ENUMS.MarketingMix) {
        let marketID = this.params.marketID;

        // just to not getting an illegal divide
        const EPSILON = 2.220446049250313e-16; // Number.EPSILON;

        this.industryCorporateComBudgetAvg = mkgMix.corporateAds[marketID] || EPSILON;
        this.industrySalesForceCommissionRateAvg = mkgMix.salesForceCommissions[marketID] || EPSILON;
        this.industrySalesForceStaffAvg = mkgMix.salesForceStaff[marketID] || EPSILON
        this.industrySalesForceSupportAvg = mkgMix.salesForceSupport[marketID] || EPSILON;

        this.industryWebsiteLevelAvg = mkgMix.websiteLevels[marketID] || EPSILON;

        this.subMarkets.forEach(function (subMarket, idx) {
            subMarket.industryPriceAvg = mkgMix.prices[marketID][idx] || EPSILON;
            subMarket.industryDirectAdsBudgetAvg = mkgMix.directAds[marketID][idx] || EPSILON;
            subMarket.industryCreditEasingAvg = mkgMix.credits[marketID][idx] || EPSILON;
            subMarket.industryQualityScoreAvg = mkgMix.qualities[marketID][idx] || EPSILON;
        });

    }


   

    // actions
    receiveFrom(quantity: number, product: Product, price: number, adsBudget: number, customerCredit?: ENUMS.CREDIT): boolean {
        if (!this.isInitialised()) {
            return false;
        }

        let containerCapacityUnitsNb = product.params.containerCapacityUnitsNb;

        if (Utils.isNumericValid(containerCapacityUnitsNb) && containerCapacityUnitsNb !== 0) {

            let containersNb = quantity / containerCapacityUnitsNb;

            this.transport.load(containersNb);

        } else {
            console.warn("Market %s @ containerCapacityUnitsNb params is not valid %d", this.params.label, containerCapacityUnitsNb);
        }

        var subMarket = this.subMarkets[product.params.code];

        return subMarket && subMarket.receiveFrom.apply(subMarket, arguments);
    }

    setCorporateCom(corporateComBudget: number): boolean {
        if (!this.isInitialised()) {
            return false;
        }

        this.corporateComBudget = corporateComBudget;

        return true;
    }

    get industryTotalSoldQ(): number {
        return Utils.sums(this.subMarkets, "industryTotalSoldQ");
    }


    get industryTotalSalesRevenue(): number {
        return Utils.sums(this.subMarkets, "industryTotalSalesRevenue");
    }


    get firmTotalSoldQ(): number {
        return Utils.sums(this.subMarkets, "soldQ");
    }


    get firmTotalSalesRevenue(): number {
        return Utils.sums(this.subMarkets, "salesRevenue");
    }

    get marketVolumeShareOfSales(): number {
        let share = this.firmTotalSoldQ / this.industryTotalSoldQ;

        return Utils.round(share, 4);
    }

    get marketValueShareOfSales(): number {
        let share = this.firmTotalSalesRevenue / this.industryTotalSalesRevenue;

        return Utils.round(share, 4);
    }

    get shortfallQ(): number {
        return Utils.sums(this.subMarkets, "shortfallQ");
    }

    get shortfallRate(): number {
        return this.shortfallQ / Utils.sums(this.subMarkets, "orderedQ");
    }

    onFinish() {
        this.CashFlow.addPayment(this.advertisingCost, this.params.payments.advertising, 'advertising');
    }

}