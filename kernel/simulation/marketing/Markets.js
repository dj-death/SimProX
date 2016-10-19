"use strict";
var Marketing_1 = require('../../engine/ComputeEngine/Marketing');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var game = require('../Games');
var periodDaysNb = game.daysNbByPeriod;
var advertisingPayments = {
    "THREE_MONTH": {
        credit: ENUMS.CREDIT.THREE_MONTH,
        part: 1
    }
};
var defaultPayments = {
    advertising: advertisingPayments
};
var p1AdsRange = {
    threshold: 1000,
    mediane: 30000,
    wearout: 99000
};
var p2AdsRange = {
    threshold: 1000,
    mediane: 35000,
    wearout: 99000
};
var p3AdsRange = {
    threshold: 1000,
    mediane: 50000,
    wearout: 99000
};
var p1QualityRange = {
    threshold: 1,
    mediane: 4.5,
    wearout: 6
};
var p2QualityRange = {
    threshold: 1,
    mediane: 4.5,
    wearout: 6
};
var p3QualityRange = {
    threshold: 1,
    mediane: 4.5,
    wearout: 6
};
var basicDemandMatrix = [
    [2000, 1000, 800],
    [2100, 1200, 900],
    [1000000, 500000, 250000]
];
function create() {
    var euroMarket = new Marketing_1.Market({
        id: "market1",
        label: "market1",
        marketID: "0",
        economyID: "0",
        name: 'Euro Zone',
        acceptBacklog: true,
        dissatisfiedOrdersCancelledPercent: 0.5,
        costs: {
            creditCardRatePerUnitSold: 0,
            creditControlUnitCost: 1,
            storageCostPerProductUnit: 3.5
        },
        payments: defaultPayments,
        defaultCustomerCredit: ENUMS.CREDIT.TWO_MONTH,
        periodDaysNb: periodDaysNb,
        refPrices: [
            {
                LQPriceRef: 380,
                HQPriceRef: 380
            }, {
                LQPriceRef: 660,
                HQPriceRef: 660
            }, {
                LQPriceRef: 960,
                HQPriceRef: 960
            }
        ],
        seasonalIndexes: [[0.5, 1.6, 1.4, 0.5], [0.5, 2.1, 0.9, 0.5], [0.8, 1.2, 1.1, 0.9]],
        basicDemand: basicDemandMatrix[0],
        initialPLCStage: [ENUMS.PLC_STAGE.DECLINE, ENUMS.PLC_STAGE.MATURITY_END, ENUMS.PLC_STAGE.MATURITY_BEGIN],
        productLifeCycle: [{
                introduction: 3,
                growth: 5,
                maturity: 16,
                decline: 12
            }, {
                introduction: 3,
                growth: 5,
                maturity: 16,
                decline: 12
            }, {
                introduction: 5,
                growth: 7,
                maturity: 16,
                decline: 12
            }],
        corporateAdsBudgetRange: {
            threshold: 1000,
            mediane: 50000,
            wearout: 99000
        },
        directAdsBudgetRanges: [p1AdsRange, p2AdsRange, p3AdsRange],
        salesForceCommissionRange: {
            threshold: 0.01,
            mediane: 0.1,
            wearout: 0.2
        },
        salesForceStaffRange: {
            threshold: 1,
            mediane: 3,
            wearout: 20
        },
        salesForceSupportRange: {
            threshold: 5000,
            mediane: 15000,
            wearout: 99000
        },
        priceRanges: [],
        qualityRanges: [p1QualityRange, p2QualityRange, p3QualityRange],
        corporateComWeights: [0.22, 0.23, 0.25],
        creditWeights: [0.05, 0.05, 0.05],
        directAdsWeights: [0.29, 0.27, 0.23],
        priceWeights: [],
        salesForceWeights: [0.17, 0.15, 0.12],
        qualityWeights: [0.27, 0.3, 0.35]
    });
    var naftaMarket = new Marketing_1.Market({
        id: "market2",
        label: "market2",
        marketID: "1",
        economyID: "1",
        name: 'NAFTA Market',
        acceptBacklog: true,
        dissatisfiedOrdersCancelledPercent: 0.5,
        costs: {
            creditCardRatePerUnitSold: 0,
            creditControlUnitCost: 1,
            storageCostPerProductUnit: 4
        },
        payments: defaultPayments,
        defaultCustomerCredit: ENUMS.CREDIT.THREE_MONTH,
        periodDaysNb: periodDaysNb,
        refPrices: [
            {
                LQPriceRef: 380,
                HQPriceRef: 380
            }, {
                LQPriceRef: 660,
                HQPriceRef: 660
            }, {
                LQPriceRef: 960,
                HQPriceRef: 960
            }
        ],
        seasonalIndexes: [[0.5, 1.6, 1.4, 0.5], [0.5, 2.1, 0.9, 0.5], [0.8, 1.2, 1.1, 0.9]],
        basicDemand: basicDemandMatrix[1],
        initialPLCStage: [ENUMS.PLC_STAGE.DECLINE, ENUMS.PLC_STAGE.MATURITY_END, ENUMS.PLC_STAGE.MATURITY_BEGIN],
        productLifeCycle: [{
                introduction: 5,
                growth: 7,
                maturity: 12,
                decline: 9
            }, {
                introduction: 5,
                growth: 7,
                maturity: 12,
                decline: 9
            }, {
                introduction: 9,
                growth: 7,
                maturity: 12,
                decline: 9
            }],
        corporateAdsBudgetRange: {
            threshold: 1000,
            mediane: 50000,
            wearout: 99000
        },
        directAdsBudgetRanges: [p1AdsRange, p2AdsRange, p3AdsRange],
        salesForceCommissionRange: {
            threshold: 0.01,
            mediane: 0.10,
            wearout: 0.2
        },
        salesForceStaffRange: {
            threshold: 1,
            mediane: 2,
            wearout: 10
        },
        salesForceSupportRange: {
            threshold: 5000,
            mediane: 15000,
            wearout: 99000
        },
        priceRanges: [],
        qualityRanges: [p1QualityRange, p2QualityRange, p3QualityRange],
        corporateComWeights: [0.26, 0.27, 0.28],
        creditWeights: [0.05, 0.05, 0.05],
        directAdsWeights: [0.26, 0.25, 0.24],
        priceWeights: [],
        salesForceWeights: [0.08, 0.08, 0.06],
        qualityWeights: [0.35, 0.35, 0.37]
    });
    var internetMarket = new Marketing_1.Market({
        id: "market3",
        label: "market3",
        marketID: "2",
        economyID: "3",
        name: 'Internet',
        acceptBacklog: false,
        dissatisfiedOrdersCancelledPercent: 1,
        costs: {
            creditCardRatePerUnitSold: 1,
            creditControlUnitCost: 0,
            storageCostPerProductUnit: 3.5
        },
        payments: defaultPayments,
        defaultCustomerCredit: ENUMS.CREDIT.CASH,
        periodDaysNb: periodDaysNb,
        refPrices: [
            {
                LQPriceRef: 350,
                HQPriceRef: 350
            }, {
                LQPriceRef: 600,
                HQPriceRef: 600
            }, {
                LQPriceRef: 900,
                HQPriceRef: 900
            }
        ],
        seasonalIndexes: [[0.5, 1.6, 1.4, 0.5], [0.5, 2.1, 0.9, 0.5], [0.8, 1.2, 1.1, 0.9]],
        basicDemand: basicDemandMatrix[2],
        initialPLCStage: [ENUMS.PLC_STAGE.GROWTH, ENUMS.PLC_STAGE.GROWTH, ENUMS.PLC_STAGE.GROWTH],
        productLifeCycle: [{
                introduction: 6,
                growth: 5,
                maturity: 12,
                decline: 9
            }, {
                introduction: 6,
                growth: 5,
                maturity: 12,
                decline: 9
            }, {
                introduction: 6,
                growth: 7,
                maturity: 14,
                decline: 9
            }],
        corporateAdsBudgetRange: {
            threshold: 1000,
            mediane: 50000,
            wearout: 99000
        },
        directAdsBudgetRanges: [p1AdsRange, p2AdsRange, p3AdsRange],
        salesForceCommissionRange: {
            threshold: 0.01,
            mediane: 0.1,
            wearout: 0.2
        },
        salesForceStaffRange: {
            threshold: 1,
            wearout: 2
        },
        salesForceSupportRange: {
            threshold: 5000,
            mediane: 15000,
            wearout: 99000
        },
        priceRanges: [],
        qualityRanges: [p1QualityRange, p2QualityRange, p3QualityRange],
        corporateComWeights: [0.32, 0.32, 0.32],
        creditWeights: [0, 0, 0],
        directAdsWeights: [0.25, 0.23, 0.2],
        priceWeights: [],
        salesForceWeights: [0.03, 0.03, 0.03],
        qualityWeights: [0.2, 0.22, 0.25],
        websiteQualityWeights: [0.2, 0.2, 0.2]
    });
    return [euroMarket, naftaMarket, internetMarket];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Markets.js.map