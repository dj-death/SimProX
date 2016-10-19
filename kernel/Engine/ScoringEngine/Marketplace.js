"use strict";
var Game = require('../../simulation/Games');
var ENUMS = require('../ComputeEngine/ENUMS');
var console = require('../../utils/logger');
var Utils = require('../../utils/Utils');
var $jStat = require("jstat");
var jStat = $jStat.jStat;
function convert3DMatrixTo2D(matrix) {
    var flattenMatrix = [];
    // 3D:firms
    matrix.forEach(function (matrice) {
        var arr = [];
        // 2D: markets
        matrice.forEach(function (vector) {
            // products // <1m1p1 f1mp1p2 >
            vector.forEach(function (scale) {
                arr.push(scale);
            });
        });
        flattenMatrix.push(arr);
    });
    return flattenMatrix;
}
function convertVectorTo2DMatrix(vector, rowsNb, colsNb) {
    var matrix = [];
    var len = vector.length;
    colsNb = colsNb || Math.round(vector.length / rowsNb);
    do {
        // a new row
        var row = [];
        for (var i = 0; i < colsNb; i++) {
            row.push(vector.shift());
            --len;
        }
        matrix.push(row);
    } while (len);
    return matrix;
}
var MEAN_TYPE;
(function (MEAN_TYPE) {
    MEAN_TYPE[MEAN_TYPE["ARITHMETIC"] = 0] = "ARITHMETIC";
    MEAN_TYPE[MEAN_TYPE["GEOMETRIC"] = 1] = "GEOMETRIC";
    MEAN_TYPE[MEAN_TYPE["HARMONIC"] = 2] = "HARMONIC";
})(MEAN_TYPE || (MEAN_TYPE = {}));
function harmonicMean(matrix) {
    // [[f1m1p1, f1m1p2],[f2m1p1, f2m1p2]];
    var transposed = jStat(matrix).transpose(); // [[f1m1p1,f2m1p1],[f1m1p2,f2m1p2]];
    var inversed = jStat(transposed).pow(-1); // [[1 / f1m1p1, 1 / f2m1p1],[1 / f1m1p2, 1 / f2m1p2]];
    var meansArr = [];
    inversed.toArray().forEach(function (row) {
        var mean = row.length / jStat(row).sum();
        meansArr.push(mean);
    });
    return meansArr;
}
function matrix3DMean(matrix, meanType) {
    if (meanType === void 0) { meanType = MEAN_TYPE.ARITHMETIC; }
    var secondDimSize = matrix[0].length;
    var thirdDimSize = matrix[0][0].length;
    var meansVector;
    switch (meanType) {
        case MEAN_TYPE.ARITHMETIC:
            meansVector = jStat(convert3DMatrixTo2D(matrix)).mean();
            break;
        case MEAN_TYPE.GEOMETRIC:
            meansVector = jStat(convert3DMatrixTo2D(matrix)).geomean();
            break;
        case MEAN_TYPE.HARMONIC:
            meansVector = harmonicMean(convert3DMatrixTo2D(matrix));
            break;
    }
    return convertVectorTo2DMatrix(meansVector, secondDimSize, thirdDimSize);
}
var Marketplace = (function () {
    function Marketplace() {
        this.firmsOMarkets = [];
        if (Marketplace._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Marketplace._instance = this;
    }
    Marketplace.init = function () {
        if (Marketplace._instance) {
            delete Marketplace._instance;
        }
        Marketplace._instance = new Marketplace();
    };
    Marketplace.getInstance = function () {
        if (Marketplace._instance === null) {
            Marketplace._instance = new Marketplace();
        }
        return Marketplace._instance;
    };
    Marketplace.register = function (firmOMarkets) {
        var that = this.getInstance();
        that.firmsOMarkets.push(firmOMarkets);
    };
    /*
     *   p1 p2 p3
     * m1
     * m2
     * m3
     */
    Marketplace.getFirmsMarketingMix = function () {
        var results = [];
        var that = this.getInstance();
        that.firmsOMarkets.forEach(function (firmOMarkets) {
            var supplyMatrix = [];
            var pricesMatrix = [];
            var creditsMatrix = [];
            var directAdsMatrix = [];
            var websiteLevelsMatrix = [];
            var corporateAdsMatrix = [];
            var salesForceCommissionsMatrix = [];
            var salesForceStaffMatrix = [];
            var salesForceSupportMatrix = [];
            var productsQualitiesMatrix = [];
            firmOMarkets.forEach(function (oMarket, idx) {
                var subMarketSupplyRow = [];
                var subMarketPricesRow = [];
                var subMarketCreditsRow = [];
                var subMarketDirectAdsRow = [];
                var subMarketPdtQualitiesRow = [];
                corporateAdsMatrix.push(oMarket.smoothedCorporateAdsBudget);
                salesForceCommissionsMatrix.push(oMarket.smoothedSalesForceCommission);
                salesForceStaffMatrix.push(oMarket.smoothedSalesForceStaff);
                salesForceSupportMatrix.push(oMarket.smoothedSalesForceSupport);
                websiteLevelsMatrix.push(oMarket.smoothedWebsiteLevel);
                oMarket.subMarkets.forEach(function (oSubMarket) {
                    subMarketSupplyRow.push(oSubMarket.effectiveDeliveredQ);
                    subMarketPricesRow.push(oSubMarket.smoothedPrice);
                    subMarketCreditsRow.push(oSubMarket.smoothedCustomerCreditEasing);
                    subMarketDirectAdsRow.push(oSubMarket.smoothedDirectAdsBudget);
                    subMarketPdtQualitiesRow.push(oSubMarket.smoothedQuality);
                });
                supplyMatrix.push(subMarketSupplyRow);
                pricesMatrix.push(subMarketPricesRow);
                creditsMatrix.push(subMarketCreditsRow);
                directAdsMatrix.push(subMarketDirectAdsRow);
                productsQualitiesMatrix.push(subMarketPdtQualitiesRow);
            });
            var result = {
                supply: supplyMatrix,
                prices: pricesMatrix,
                credits: creditsMatrix,
                directAds: directAdsMatrix,
                corporateAds: corporateAdsMatrix,
                qualities: productsQualitiesMatrix,
                salesForceCommissions: salesForceCommissionsMatrix,
                salesForceStaff: salesForceStaffMatrix,
                salesForceSupport: salesForceSupportMatrix,
                websiteLevels: websiteLevelsMatrix
            };
            results.push(result);
        });
        return results;
    };
    Marketplace.calcIndustryMarketingMixAvg = function () {
        var that = this.getInstance();
        var firmsMkgMixes = this.getFirmsMarketingMix();
        var supplyMatrix = []; // [f1... [...[m2p1, m2p2, m2p3]...] ...]
        var pricesMatrix = [];
        var qualitiesMatrix = [];
        var creditsMatrix = [];
        var directAdsMatrix = [];
        var corporateAdsMatrix = []; // [ ... f2: [ m1, m2, m3] ...] => jStat([[1,2],[3,4]]).mean() === [ 2, 3 ]
        var salesForceCommissionsMatrix = [];
        var salesForceStaffMatrix = [];
        var salesForceSupportMatrix = [];
        var websiteLevelsMatrix = [];
        firmsMkgMixes.forEach(function (firmMkgMix) {
            corporateAdsMatrix.push(firmMkgMix.corporateAds);
            salesForceCommissionsMatrix.push(firmMkgMix.salesForceCommissions);
            salesForceStaffMatrix.push(firmMkgMix.salesForceStaff);
            salesForceSupportMatrix.push(firmMkgMix.salesForceSupport);
            websiteLevelsMatrix.push(firmMkgMix.websiteLevels);
            pricesMatrix.push(firmMkgMix.prices);
            supplyMatrix.push(firmMkgMix.supply);
            directAdsMatrix.push(firmMkgMix.directAds);
            creditsMatrix.push(firmMkgMix.credits);
            qualitiesMatrix.push(firmMkgMix.qualities);
        });
        var corporateAdsMeans = jStat(corporateAdsMatrix).mean();
        var salesForceCommissionsMeans = jStat(salesForceCommissionsMatrix).mean();
        var salesForceStaffMeans = jStat(salesForceStaffMatrix).mean();
        var salesForceSupportMeans = jStat(salesForceSupportMatrix).mean();
        var websiteLevelsMeans = jStat(websiteLevelsMatrix).mean();
        var supplyMeansMatrix = matrix3DMean(supplyMatrix);
        var pricesMeansMatrix = matrix3DMean(pricesMatrix, MEAN_TYPE.HARMONIC);
        var directAdsMeansMatrix = matrix3DMean(directAdsMatrix);
        var qualitiesMeansMatrix = matrix3DMean(qualitiesMatrix);
        var creditsMeansMatrix = matrix3DMean(creditsMatrix);
        var industryMix = {
            corporateAds: corporateAdsMeans,
            salesForceCommissions: salesForceCommissionsMeans,
            salesForceStaff: salesForceStaffMeans,
            salesForceSupport: salesForceSupportMeans,
            supply: supplyMeansMatrix,
            prices: pricesMeansMatrix,
            directAds: directAdsMeansMatrix,
            qualities: qualitiesMeansMatrix,
            credits: creditsMeansMatrix,
            websiteLevels: websiteLevelsMeans
        };
        that.firmsOMarkets.forEach(function (oMarkets) {
            oMarkets.forEach(function (oMarket) {
                oMarket.setIndustryMarketingMix(industryMix);
            });
        });
        return industryMix;
    };
    Marketplace.calcIndustrySatisfactionScoreAvg = function () {
        var scoresAvgs;
        var that = this.getInstance();
        var firmsMatrixes = [];
        this.calcIndustryMarketingMixAvg();
        that.firmsOMarkets.forEach(function (oMarkets) {
            var matrix = [];
            oMarkets.forEach(function (oMarket) {
                var subMarketsScoresRow = [];
                oMarket.subMarkets.forEach(function (oSubMarket) {
                    var score = oSubMarket.customerSatisfactionScore;
                    subMarketsScoresRow.push(score);
                });
                matrix.push(subMarketsScoresRow);
            });
            firmsMatrixes.push(matrix);
        });
        scoresAvgs = matrix3DMean(firmsMatrixes);
        return scoresAvgs;
    };
    Marketplace._calcFirmDemand = function (firmsNb, period, industrySatisfaction, lastPIndustrySatisfaction, firmSatisfaction, oSubMarket) {
        var productId = oSubMarket["productId"];
        var seasonalIndexes = oSubMarket.params.seasonalIndexes[productId];
        var lastPSeasonalIdx = period === 0 ? seasonalIndexes[seasonalIndexes.length - 1] : seasonalIndexes[period - 1];
        var seasonalIdx = seasonalIndexes[period];
        var marketDevelopmentRate = oSubMarket.developmentRate;
        var economicBase100Idx = oSubMarket.economy.economicBase100Index;
        var basicDemand = oSubMarket.params.basicDemand[productId];
        if (!Utils.isNumericValid(basicDemand)) {
            console.warn("Basic demand of %s is not reel: %d", oSubMarket.params.id, basicDemand);
            return 0;
        }
        if (!Utils.isNumericValid(seasonalIdx) || !Utils.isNumericValid(lastPSeasonalIdx)) {
            console.warn("seasonalIdx of %s is not reel: %d", oSubMarket.params.id, seasonalIdx);
            return 0;
        }
        if (!Utils.isNumericValid(industrySatisfaction) || isNaN(lastPIndustrySatisfaction)) {
            console.warn("industrySatisfaction of %s is not reel: %d", oSubMarket.params.id, industrySatisfaction);
            return 0;
        }
        var avgDemandPerFirm = basicDemand * industrySatisfaction / 0.5;
        var lastPAvgDemandPerFirm = basicDemand * lastPIndustrySatisfaction / 0.5;
        console.silly("Pdt %d avgDemandPerFirm %d : basicDemand %d, seasonalIdx %d, marketDevelopmentRate % d, economicBase100Idx % d, industrySatisfaction % d", productId, avgDemandPerFirm, basicDemand, seasonalIdx, marketDevelopmentRate, economicBase100Idx, industrySatisfaction);
        var demandVariation = avgDemandPerFirm - lastPAvgDemandPerFirm;
        var renewalElasticity = Game.configs.demandFactors.renewalElasticity;
        var incomingElasticity = Game.configs.demandFactors.incomingElasticity;
        var differentiationRate = (firmSatisfaction - industrySatisfaction) / industrySatisfaction;
        if (differentiationRate < 0) {
            differentiationRate = 0;
        }
        console.silly("differentiationRate %d, demandVariation %d");
        // old clients
        var renewalDemand = Math.round(lastPAvgDemandPerFirm * (1 + renewalElasticity * differentiationRate) * seasonalIdx * marketDevelopmentRate * (economicBase100Idx / 100));
        if (renewalDemand < 0) {
            renewalDemand = 0;
        }
        // new one
        var expansionDemand = demandVariation > 0 ? Math.round(demandVariation * (1 + incomingElasticity * differentiationRate) * seasonalIdx * marketDevelopmentRate * (economicBase100Idx / 100)) : 0;
        if (expansionDemand < 0) {
            expansionDemand = 0;
        }
        // considering demand before stockout redistribution
        var primaryDemand = renewalDemand + expansionDemand;
        console.silly("primaryDemand %d = , renewalDemand %d, expansionDemand %d", primaryDemand, renewalDemand, expansionDemand);
        return primaryDemand;
    };
    Marketplace.simulate = function () {
        var self = this;
        var that = this.getInstance();
        var industrySatisfactionScoreAvgs = this.calcIndustrySatisfactionScoreAvg();
        var firmsNb = that.firmsOMarkets.length;
        var period = 0;
        industrySatisfactionScoreAvgs.forEach(function (market, marketIdx) {
            market.forEach(function (industrySatisfaction, subMIdx) {
                var i = 0;
                var stockoutQ = 0;
                for (; i < firmsNb; i++) {
                    var oMarket = that.firmsOMarkets[i][marketIdx];
                    var oSubMarket = oMarket.subMarkets[subMIdx];
                    var firmSatisfaction = oSubMarket.customerSatisfactionScore;
                    var lastPIndustrySatisfaction = oSubMarket.lastIndustrySatisfactionScoreAvg;
                    var primaryDemand = self._calcFirmDemand(firmsNb, period, industrySatisfaction, lastPIndustrySatisfaction, firmSatisfaction, oSubMarket);
                    var soldQ = oSubMarket.getOrdersOf(primaryDemand);
                    var backlogQ = Math.floor((primaryDemand - soldQ) * oSubMarket.params.dissatisfiedOrdersCancelledPercent);
                    stockoutQ += (primaryDemand - soldQ - backlogQ);
                }
                var _tries = 0;
                while (stockoutQ > 0) {
                    if (_tries > 100) {
                        console.warn("something strange with stockout loop");
                        break;
                    }
                    i = 0;
                    var stockoutSold = 0;
                    for (; i < firmsNb; i++) {
                        var oMarket = that.firmsOMarkets[i][marketIdx];
                        var oSubMarket = oMarket.subMarkets[subMIdx];
                        var firmSatisfaction = oSubMarket.customerSatisfactionScore;
                        // proportion contributed by a company to the determination of industry demand
                        var residualDemand = Math.round(stockoutQ * firmSatisfaction / (industrySatisfaction * firmsNb));
                        if (residualDemand < 0) {
                            residualDemand = 0;
                        }
                        var soldQ = oSubMarket.getOrdersOf(residualDemand);
                        var backlogQ = Math.floor((residualDemand - soldQ) * oSubMarket.params.dissatisfiedOrdersCancelledPercent);
                        stockoutSold += (soldQ + backlogQ);
                    }
                    if (stockoutSold === 0) {
                        break;
                    }
                    stockoutQ -= stockoutSold;
                    ++_tries;
                }
                var totalSoldQ = 0;
                var totalSalesRevenue = 0;
                for (var j = 0; j < firmsNb; j++) {
                    var oMarket = that.firmsOMarkets[j][marketIdx];
                    var oSubMarket = oMarket.subMarkets[subMIdx];
                    totalSoldQ += oSubMarket.soldQ;
                    totalSalesRevenue += oSubMarket.salesRevenue;
                }
                for (var j = 0; j < firmsNb; j++) {
                    var oMarket = that.firmsOMarkets[j][marketIdx];
                    var oSubMarket = oMarket.subMarkets[subMIdx];
                    oSubMarket.industryTotalSalesRevenue = totalSalesRevenue;
                    oSubMarket.industryTotalSoldQ = totalSoldQ;
                    oSubMarket.industrySatisfactionScoreAvg = industrySatisfaction;
                }
            });
        });
    };
    Marketplace.simulateEnv = function () {
        var materialMarketPrices = [
            { term: ENUMS.FUTURES.IMMEDIATE, basePrice: 50.754 },
            { term: ENUMS.FUTURES.THREE_MONTH, basePrice: 32.615 },
            { term: ENUMS.FUTURES.SIX_MONTH, basePrice: 29.748 }
        ];
        var componentsPrices = {
            p1: {
                marketPrice: [
                    { term: ENUMS.FUTURES.THREE_MONTH, basePrice: 123 },
                ],
                qualityPremium: [
                    { index: ENUMS.QUALITY.HQ, premium: 145 / 123 }
                ]
            },
            p2: {
                marketPrice: [
                    { term: ENUMS.FUTURES.THREE_MONTH, basePrice: 187 },
                ],
                qualityPremium: [
                    { index: ENUMS.QUALITY.HQ, premium: 232 / 187 }
                ]
            },
            p3: {
                marketPrice: [
                    { term: ENUMS.FUTURES.THREE_MONTH, basePrice: 290 },
                ],
                qualityPremium: [
                    { index: ENUMS.QUALITY.HQ, premium: 358 / 290 }
                ]
            }
        };
        var buildingCost = 1000;
        return {
            componentsPrices: componentsPrices,
            materialMarketPrices: materialMarketPrices,
            buildingCost: buildingCost
        };
    };
    Marketplace._instance = null;
    return Marketplace;
}());
exports.Marketplace = Marketplace;
//# sourceMappingURL=Marketplace.js.map