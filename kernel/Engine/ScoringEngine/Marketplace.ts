import * as Scenario from '../Scenario';

import { Market } from '../ComputeEngine/Marketing';

import Game = require('../../simulation/Games');


import ENUMS = require('../ComputeEngine/ENUMS');
import console = require('../../utils/logger');
import Utils = require('../../utils/Utils');

import $jStat = require("jstat");
let jStat = $jStat.jStat;



function convert3DMatrixTo2D(matrix: Array<number[][]>): number[][] {
    let flattenMatrix = [];

    // 3D:firms
    matrix.forEach(function (matrice) {
        let arr = [];

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

function convertVectorTo2DMatrix(vector: number[], rowsNb: number, colsNb?: number): number[][] {
    let matrix = [];
    let len = vector.length;

    colsNb = colsNb || Math.round(vector.length / rowsNb);

    do {
        // a new row
        let row = [];

        for (let i = 0; i < colsNb; i++) {
            
            row.push(vector.shift());

            --len;
        }

        matrix.push(row);

    } while (len);

    return matrix;
}

enum MEAN_TYPE {
    ARITHMETIC,
    GEOMETRIC,
    HARMONIC
}


function harmonicMean(matrix: Array<number[]>): number[] {
    // [[f1m1p1, f1m1p2],[f2m1p1, f2m1p2]];
    let transposed = jStat(matrix).transpose(); // [[f1m1p1,f2m1p1],[f1m1p2,f2m1p2]];
    let inversed = jStat(transposed).pow(-1); // [[1 / f1m1p1, 1 / f2m1p1],[1 / f1m1p2, 1 / f2m1p2]];

    let meansArr = [];

    inversed.toArray().forEach(function (row: number[]) {
        let mean = row.length / jStat(row).sum();

        meansArr.push(mean);
    });

    return meansArr;
}


function matrix3DMean(matrix: Array<number[][]>, meanType: MEAN_TYPE = MEAN_TYPE.ARITHMETIC): number[][] {
    let secondDimSize = matrix[0].length;
    let thirdDimSize = matrix[0][0].length;

    let meansVector;

    switch (meanType) {
        case MEAN_TYPE.ARITHMETIC :
            meansVector = jStat(convert3DMatrixTo2D(matrix)).mean();
            break;

        case MEAN_TYPE.GEOMETRIC :
            meansVector = jStat(convert3DMatrixTo2D(matrix)).geomean();
            break; 

        case MEAN_TYPE.HARMONIC:
            meansVector = harmonicMean(convert3DMatrixTo2D(matrix));
            break;
    }

    return convertVectorTo2DMatrix(meansVector, secondDimSize, thirdDimSize);
}



export class Marketplace {

    private static _instance: Marketplace = null;

    firmsOMarkets: Array<Market[]> = [];

    public static init() {
        if (Marketplace._instance) {
            delete Marketplace._instance;
        }

        Marketplace._instance = new Marketplace();
    }


    constructor() {
        if (Marketplace._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        Marketplace._instance = this;
    }

    public static getInstance(): Marketplace {
        if (Marketplace._instance === null) {
            Marketplace._instance = new Marketplace();
        }
        return Marketplace._instance;
    }

    public static register(firmOMarkets: Market[]) {
        let that = this.getInstance();

        that.firmsOMarkets.push(firmOMarkets);
    }

    /*
     *   p1 p2 p3
     * m1
     * m2
     * m3
     */
    static getFirmsMarketingMix(): ENUMS.MarketingMix[] {
        let results = [];

        let that = this.getInstance();

        that.firmsOMarkets.forEach(function (firmOMarkets) {

            let supplyMatrix = [];
            let pricesMatrix = [];
            let creditsMatrix = [];
            let directAdsMatrix = [];
            let websiteLevelsMatrix = [];

            let corporateAdsMatrix = [];
            let salesForceCommissionsMatrix = [];
            let salesForceStaffMatrix = [];
            let salesForceSupportMatrix = [];
            let productsQualitiesMatrix = [];


            firmOMarkets.forEach(function (oMarket, idx) {

                let subMarketSupplyRow = [];

                let subMarketPricesRow = [];
                let subMarketCreditsRow = [];
                let subMarketDirectAdsRow = [];
                let subMarketPdtQualitiesRow = [];


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


            let result: ENUMS.MarketingMix = {
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
    }

    static calcIndustryMarketingMixAvg(): ENUMS.MarketingMix {
        let that = this.getInstance();

        let firmsMkgMixes = this.getFirmsMarketingMix();

        global.debug_data.firmsMkgMixes = firmsMkgMixes;


        let supplyMatrix = []; // [f1... [...[m2p1, m2p2, m2p3]...] ...]
        let pricesMatrix = [];
        let qualitiesMatrix = [];
        let creditsMatrix = [];
        let directAdsMatrix = [];

        let corporateAdsMatrix = []; // [ ... f2: [ m1, m2, m3] ...] => jStat([[1,2],[3,4]]).mean() === [ 2, 3 ]
        let salesForceCommissionsMatrix = [];
        let salesForceStaffMatrix = [];
        let salesForceSupportMatrix = [];
        let websiteLevelsMatrix = [];


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


        let corporateAdsMeans = jStat(corporateAdsMatrix).mean();
        let salesForceCommissionsMeans = jStat(salesForceCommissionsMatrix).mean();
        let salesForceStaffMeans = jStat(salesForceStaffMatrix).mean();
        let salesForceSupportMeans = jStat(salesForceSupportMatrix).mean();
        let websiteLevelsMeans = jStat(websiteLevelsMatrix).mean();

        let supplyMeansMatrix = matrix3DMean(supplyMatrix);
        let pricesMeansMatrix = matrix3DMean(pricesMatrix, MEAN_TYPE.HARMONIC);
        let directAdsMeansMatrix = matrix3DMean(directAdsMatrix);
        let qualitiesMeansMatrix = matrix3DMean(qualitiesMatrix);
        let creditsMeansMatrix = matrix3DMean(creditsMatrix);

        let industryMix: ENUMS.MarketingMix = {
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
    }


    static calcIndustrySatisfactionScoreAvg(): Array<number[]> {
        let scoresAvgs;

        let that = this.getInstance();
        let firmsMatrixes = [];

        this.calcIndustryMarketingMixAvg();


        that.firmsOMarkets.forEach(function (oMarkets) {

            let matrix = [];

            oMarkets.forEach(function (oMarket) {
                let subMarketsScoresRow = [];

                oMarket.subMarkets.forEach(function (oSubMarket) {
                    let score = oSubMarket.customerSatisfactionScore;

                    subMarketsScoresRow.push(score);
                });

                matrix.push(subMarketsScoresRow);
            });

            firmsMatrixes.push(matrix);
        });

        scoresAvgs = matrix3DMean(firmsMatrixes);

        return scoresAvgs;
    }


    static _calcFirmDemand(firmsNb: number, period: number, industrySatisfaction: number, lastPIndustrySatisfaction: number, firmSatisfaction: number, oSubMarket: Market|any): number {
        let productId = oSubMarket["productId"];

        let seasonalIndexes = oSubMarket.params.seasonalIndexes[productId];
        let lastPSeasonalIdx = period === 0 ? seasonalIndexes[seasonalIndexes.length - 1] : seasonalIndexes[period - 1];
        let seasonalIdx = seasonalIndexes[period];
        let marketDevelopmentRate = oSubMarket.developmentRate;
        let economicBase100Idx = oSubMarket.economy.economicBase100Index;

        let basicDemand = oSubMarket.params.basicDemand[productId];

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

        let avgDemandPerFirm = basicDemand * industrySatisfaction / 0.5;
        let lastPAvgDemandPerFirm = basicDemand * lastPIndustrySatisfaction / 0.5;

        console.silly("Pdt %d avgDemandPerFirm %d : basicDemand %d, seasonalIdx %d, marketDevelopmentRate % d, economicBase100Idx % d, industrySatisfaction % d", productId, avgDemandPerFirm, basicDemand, seasonalIdx,  marketDevelopmentRate, economicBase100Idx, industrySatisfaction);

        
        let demandVariation = avgDemandPerFirm - lastPAvgDemandPerFirm;

        let renewalElasticity = Game.configs.demandFactors.renewalElasticity;
        let incomingElasticity = Game.configs.demandFactors.incomingElasticity;


        let differentiationRate = (firmSatisfaction - industrySatisfaction) / industrySatisfaction;

        if (differentiationRate < 0) {
            differentiationRate = 0;
        }

        console.silly("differentiationRate %d, demandVariation %d");


        // old clients
        let renewalDemand = Math.round(lastPAvgDemandPerFirm * (1 + renewalElasticity * differentiationRate) * seasonalIdx * marketDevelopmentRate * (economicBase100Idx / 100));

        if (renewalDemand < 0) {
            renewalDemand = 0;
        }

        // new one
        let expansionDemand = demandVariation > 0 ? Math.round(demandVariation * (1 + incomingElasticity * differentiationRate) * seasonalIdx * marketDevelopmentRate * (economicBase100Idx / 100)) : 0;

        if (expansionDemand < 0) {
            expansionDemand = 0;
        }

        // considering demand before stockout redistribution
        let primaryDemand = renewalDemand + expansionDemand;

        console.silly("primaryDemand %d = , renewalDemand %d, expansionDemand %d", primaryDemand, renewalDemand, expansionDemand);

        return primaryDemand;
    }
    
    static simulate() {
        let self = this;
        let that = this.getInstance();

        let industrySatisfactionScoreAvgs = this.calcIndustrySatisfactionScoreAvg();

        console.silly('industrySatisfactionScoreAvgs 1');

        let firmsNb = that.firmsOMarkets.length;
        let period = 0;


        industrySatisfactionScoreAvgs.forEach(function (market, marketIdx: number) {

            market.forEach(function (industrySatisfaction, subMIdx: number) {

                let i = 0;

                let stockoutQ = 0;

                for (; i < firmsNb; i++) {
                    let oMarket = that.firmsOMarkets[i][marketIdx];
                    let oSubMarket = oMarket.subMarkets[subMIdx];

                    let firmSatisfaction = oSubMarket.customerSatisfactionScore;
                    let lastPIndustrySatisfaction = oSubMarket.lastIndustrySatisfactionScoreAvg;

                    let primaryDemand = self._calcFirmDemand(firmsNb, period, industrySatisfaction, lastPIndustrySatisfaction, firmSatisfaction, oSubMarket);

                    let soldQ = oSubMarket.getOrdersOf(primaryDemand);
                    let backlogQ = Math.floor((primaryDemand - soldQ) * oSubMarket.params.dissatisfiedOrdersCancelledPercent);

                    stockoutQ += (primaryDemand - soldQ - backlogQ);
                }


                let _tries = 0;

                while (stockoutQ > 0) {


                    if (_tries > 100) {
                        console.warn("something strange with stockout loop");
                        break;
                    }
                        


                    i = 0;

                    let stockoutSold = 0;

                    for (; i < firmsNb; i++) {
                        let oMarket = that.firmsOMarkets[i][marketIdx];
                        let oSubMarket = oMarket.subMarkets[subMIdx];

                        let firmSatisfaction = oSubMarket.customerSatisfactionScore;

                        // proportion contributed by a company to the determination of industry demand
                        let residualDemand = Math.round(stockoutQ * firmSatisfaction / (industrySatisfaction * firmsNb));

                        if (residualDemand < 0) {
                            residualDemand = 0;
                        }

                        let soldQ = oSubMarket.getOrdersOf(residualDemand);
                        let backlogQ = Math.floor((residualDemand - soldQ) * oSubMarket.params.dissatisfiedOrdersCancelledPercent);

                        stockoutSold += (soldQ + backlogQ);
                    }

                    if (stockoutSold === 0) {
                        break;
                    }

                    stockoutQ -= stockoutSold;


                    ++_tries;
                    
                }


                let totalSoldQ = 0;
                let totalSalesRevenue = 0;
                
                for (let j = 0; j < firmsNb; j++) {
                    let oMarket = that.firmsOMarkets[j][marketIdx];
                    let oSubMarket = oMarket.subMarkets[subMIdx];

                    totalSoldQ += oSubMarket.soldQ;
                    totalSalesRevenue += oSubMarket.salesRevenue;
                }



                for (let j = 0; j < firmsNb; j++) {
                    let oMarket = that.firmsOMarkets[j][marketIdx];
                    let oSubMarket = oMarket.subMarkets[subMIdx];

                    oSubMarket.industryTotalSalesRevenue = totalSalesRevenue;
                    oSubMarket.industryTotalSoldQ = totalSoldQ;

                    oSubMarket.industrySatisfactionScoreAvg = industrySatisfaction;
                }

            });
        });

        
    }


    static simulateEnv() {
        let materialMarketPrices = [
            { term: ENUMS.FUTURES.IMMEDIATE, basePrice: 50.754 },
            { term: ENUMS.FUTURES.THREE_MONTH, basePrice: 32.615 },
            { term: ENUMS.FUTURES.SIX_MONTH, basePrice: 29.748 }
        ];

        let componentsPrices = {
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

        let buildingCost = 1000;


        return {
            componentsPrices: componentsPrices,
            materialMarketPrices: materialMarketPrices,
            buildingCost: buildingCost
        };

    }
}