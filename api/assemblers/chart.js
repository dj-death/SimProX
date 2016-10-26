"use strict";
/*
 所有chart
 */
var consts = require('../consts');
//Market Share
function marketShareInValue(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_ValueSegmentShare[consts.ConsumerSegmentsMaxTotal - 1];
    });
}
exports.marketShareInValue = marketShareInValue;
function marketShareInVolume(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_VolumeSegmentShare[consts.ConsumerSegmentsMaxTotal - 1];
    });
}
exports.marketShareInVolume = marketShareInVolume;
function mindSpaceShare(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_MindSpaceShare;
    });
}
exports.mindSpaceShare = mindSpaceShare;
function shelfSpaceShare(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_ShelfSpace;
    });
}
exports.shelfSpaceShare = shelfSpaceShare;
//Investment and Profits
function totalInvestment(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_TotalSpending;
    });
}
exports.totalInvestment = totalInvestment;
function netProfitByCompanies(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_NetProfit;
    });
}
exports.netProfitByCompanies = netProfitByCompanies;
function returnOnInvestment(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_ReturnOnInvestment;
    });
}
exports.returnOnInvestment = returnOnInvestment;
function investmentsVersusBudget(allResults, simulationSpan) {
    var companyNum = allResults[allResults.length - 1].p_Market.m_CompaniesCount;
    var result = {
        companyNames: [],
        chartData: [],
        periods: []
    };
    for (var i = 4; i < allResults.length; i++) {
        var onePeriodResult = allResults[i];
        result.chartData.push([]);
        result.periods.push(onePeriodResult.period);
        for (var j = 0; j < companyNum; j++) {
            var company = onePeriodResult.p_Companies[j];
            var companyName = company.c_CompanyName;
            if (result.companyNames.length <= j) {
                result.companyNames.push(companyName);
            }
            var percentage = (i + 1) / simulationSpan
                * (company.c_TotalInvestmentBudget - company.c_FutureXtraBudget);
            if (percentage > 0) {
                percentage = company.c_CumulatedInvestments / percentage * 100;
            }
            else {
                percentage = 0;
            }
            result.chartData[i - 4].push(percentage);
        }
    }
    return result;
}
exports.investmentsVersusBudget = investmentsVersusBudget;
;
//Market Sales and Inventory
function marketSalesValue(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_MarketSalesValue[consts.ConsumerSegmentsMaxTotal - 1];
    });
}
exports.marketSalesValue = marketSalesValue;
function marketSalesVolume(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_MarketSalesVolume[consts.ConsumerSegmentsMaxTotal - 1];
    });
}
exports.marketSalesVolume = marketSalesVolume;
function totalInventoryAtFactory(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_FactoryStocks[consts.StocksMaxTotal].s_Volume;
    });
}
exports.totalInventoryAtFactory = totalInventoryAtFactory;
function totalInventoryAtTrade(allResults) {
    return generateChartData(allResults, function (company) {
        return company.c_RetailStocks[consts.StocksMaxTotal].s_Volume +
            company.c_WholesalesStocks[consts.StocksMaxTotal].s_Volume;
    });
}
exports.totalInventoryAtTrade = totalInventoryAtTrade;
//segment leader top 5
function segmentsLeadersByValue(allResults, segment) {
    var result = [];
    /*allResults.forEach(function (onePeriodResult) {
        let segmentNameAndIndex = config.segmentNameAndIndex;
        let segmentIndex = segmentNameAndIndex[segment];

        let valueSegmentShare = onePeriodResult.p_SKUs.map(function (SKU) {
            let brand = utility.findBrand(onePeriodResult, SKU.u_ParentBrandID);
            let brandName = brand.b_BrandName;

            let SKUName = brandName + SKU.u_SKUName;
            return {
                SKUName: SKUName,
                valueSegmentShare: SKU.u_ValueSegmentShare[segmentIndex]
            };
        });

        valueSegmentShare.sort(function (a, b) {
            return b.valueSegmentShare - a.valueSegmentShare;
        })

        result.push({
            chartData: valueSegmentShare.slice(0, 5),
            period: onePeriodResult.period
        });
    });*/
    return result;
}
exports.segmentsLeadersByValue = segmentsLeadersByValue;
//Market evolution
function growthRateInVolume(allResults) {
    return extractMarketEvolutionChartData(allResults, function (market) {
        return market.m_ChangeInVolume;
    });
}
exports.growthRateInVolume = growthRateInVolume;
;
function growthRateInValue(allResults) {
    return extractMarketEvolutionChartData(allResults, function (market) {
        return market.m_ChangeInValue;
    });
}
exports.growthRateInValue = growthRateInValue;
;
function netMarketPrice(allResults) {
    return extractMarketEvolutionChartData(allResults, function (market) {
        return market.m_ChangeInNetMarketPrice;
    });
}
exports.netMarketPrice = netMarketPrice;
;
function segmentValueShareTotalMarket(allResults) {
    var currentPeriodIndex = allResults.length - 1;
    var period = allResults[currentPeriodIndex];
    var market = period.p_Market;
    //there are only 6 segments
    var segmentNum = consts.ConsumerSegmentsMaxTotal - 1;
    //let segmentNames = config.segmentNames;
    var results = {
        chartData: []
    };
    for (var i = 0; i < segmentNum; i++) {
        //let segmentName = segmentNames[i];
        results.chartData.push({
            segmentName: i,
            value: market.m_ValueSegmentShare[i]
        });
    }
    return results;
}
exports.segmentValueShareTotalMarket = segmentValueShareTotalMarket;
;
/**
 * Generate perception map chart
 *
 * @method perceptionMap
 * @param {Object} exogenous parameters of the game
 */
function perceptionMap(allResults, exogenous) {
    var result = {
        periods: [],
        exogenous: []
    };
    //Exogenous
    var exoSegmentsIdealPoints = exogenous.exo_SegmentsIdealPoints;
    for (var p = 0; p < exoSegmentsIdealPoints.length; p++) {
        var point = exoSegmentsIdealPoints[p];
        result.exogenous.push({
            segmentName: p,
            imagePerception: point[1],
            valuePerception: point[0]
        });
    }
    allResults.forEach(function (onePeriodResult) {
        var perviousPeriodResult;
        if (onePeriodResult.period != -3) {
            perviousPeriodResult = allResults[onePeriodResult.period + 2];
        }
        else {
            perviousPeriodResult = undefined;
        }
        var periodReport = {
            period: onePeriodResult.period,
            allCompanyData: []
        };
        for (var i = 0; i < onePeriodResult.p_Companies.length; i++) {
            var company = onePeriodResult.p_Companies[i];
            var companyName = company.c_CompanyName;
            var companyData = {
                companyName: companyName,
                brands: [],
                SKUs: []
            };
            //brands data
            for (var j = 0; j < onePeriodResult.p_Brands.length; j++) {
                var brand = onePeriodResult.p_Brands[j];
                if (company.c_CompanyID === brand.b_ParentCompanyID) {
                    companyData.brands.push({
                        brandName: brand.b_BrandName,
                        imagePerception: brand.b_Perception[1],
                        valuePerception: brand.b_Perception[0]
                    });
                }
            }
        }
        result.periods.push(periodReport);
    });
    return result;
}
exports.perceptionMap = perceptionMap;
function inventoryReport(allResults) {
    var periodResult = allResults[allResults.length - 1];
    var result = [];
    for (var i = 0; i < periodResult.p_Companies.length; i++) {
        var company = periodResult.p_Companies[i];
        var companyName = company.c_CompanyName;
        var companyData = {
            companyName: companyName,
            companyId: company.c_CompanyID,
            SKUs: []
        };
        /*for (let k = 0; k < periodResult.p_SKUs.length; k++) {
            let SKU = periodResult.p_SKUs[k];
            let brand = utility.findBrand(periodResult, SKU.u_ParentBrandID);
            if (company.c_CompanyID === SKU.u_ParentCompanyID) {
                companyData.SKUs.push({
                    SKUName: brand.b_BrandName + SKU.u_SKUName,
                    inventoryData: getSKUInventory(SKU)
                })
            }
        }*/
        result.push(companyData);
    }
    return result;
    function getSKUInventory(SKU) {
        if (!SKU)
            throw new Error("Invalid parameter SKU.");
        var result = [];
        //FMCG can keep stocks in 3 periods
        for (var i = 2; i >= 0; i--) {
            var totalStock = SKU.u_ps_FactoryStocks[i].s_ps_Volume + SKU.u_ps_WholesaleStocks[i].s_ps_Volume + SKU.u_ps_RetailStocks[i].s_ps_Volume;
            totalStock = totalStock * consts.ActualSize[SKU.u_PackSize];
            result.push({
                // 'FMCG': [
                //   0:  'FreshInventory',
                //   1:  'PreviousInventory',
                //   2:  'CloseToEXpireInventory'
                // ],
                // 'DURABLES': [
                //   0:  'Latest Stock',
                //   1:  'one-year old Stock',
                //   2:  'Two-year old Stock',
                //   3:  'Three-year old Stock',
                //   4:  'Oldest Stock'
                // ]
                inventoryName: i,
                inventoryValue: totalStock
            });
        }
        return result;
    }
}
exports.inventoryReport = inventoryReport;
/**
 * Prepare tooltips data for SKU label on SKU perception map
 *
 * @method prepareSKUToolTips
 * @param {Object} the JSON object got from allResults CGI
 * @param {Function} the function to get a certain field of JSON object
 * @return {Object} chart data
 */
function prepareSKUTooltips(currentPeriodResult, perviousPeriodResult, SKUID) {
    if (!SKUID) {
        throw new Error("SKUID can't be empty");
    }
    // let currentPeriodResult = allResults[allResults.length-1];
    // let perviousPeriodResult = allResults[allResults.length-2];
    /*let tooltips = [];
    let currentPeriodSKU = utility.findSKU(currentPeriodResult, SKUID);

    let previousPeriodSKU;

    if (!perviousPeriodResult) {
        let previousPeriodSKU = undefined;
    } else {
        let previousPeriodSKU = utility.findSKU(perviousPeriodResult, SKUID);
    }

    if (!currentPeriodSKU) {
        currentPeriodSKU = {
            u_AverageDisplayPrice: 0,
            u_ValueSegmentShare: [0, 0, 0, 0, 0, 0],
            u_Awareness: 0,
            u_ShelfSpace: 0,
            u_Perception: [0, 0]
        };
    }

    if (!previousPeriodSKU) {
        previousPeriodSKU = {
            u_AverageDisplayPrice: 0,
            u_ValueSegmentShare: [0, 0, 0, 0, 0, 0],
            u_Awareness: 0,
            u_ShelfSpace: 0,
            u_Perception: [0, 0]
        };
    }

    //marke share
    let marketShareChange = compare(currentPeriodSKU.u_ValueSegmentShare[consts.ConsumerSegmentsMax]
        , previousPeriodSKU.u_ValueSegmentShare[consts.ConsumerSegmentsMax]);
    tooltips.push({
        name: 'Market Share(value %)',
        value: currentPeriodSKU.u_ValueSegmentShare[consts.ConsumerSegmentsMax],
        compareWithPreviousPeriod: marketShareChange
    });

    //average display price
    let averageDisplayPriceChange = compare(currentPeriodSKU.u_AverageDisplayPrice,
        previousPeriodSKU.u_AverageDisplayPrice);
    tooltips.push({
        name: 'Average display price',
        value: currentPeriodSKU.u_AverageDisplayPrice,
        compareWithPreviousPeriod: averageDisplayPriceChange
    });

    let tIndexChange = compare(getTechnologyLevel(currentPeriodSKU),
        getTechnologyLevel(previousPeriodSKU));
    tooltips.push({
        name: 'Applied Technology Index',
        value: getTechnologyLevel(currentPeriodSKU),
        compareWithPreviousPeriod: tIndexChange
    });

    let qualityChange = compare(getIngredientsQuality(currentPeriodSKU),
        getIngredientsQuality(previousPeriodSKU));
    tooltips.push({
        name: 'Ingredients Quality Index',
        value: getIngredientsQuality(currentPeriodSKU),
        compareWithPreviousPeriod: qualityChange
    });

    tooltips.push({
        name: 'Awareness(%)',
        value: currentPeriodSKU.u_Awareness,
        compareWithPreviousPeriod: compare(currentPeriodSKU.u_Awareness, previousPeriodSKU.u_Awareness)
    });

    tooltips.push({
        name: 'Shelf Space(%)',
        value: currentPeriodSKU.u_ShelfSpace,
        compareWithPreviousPeriod: compare(currentPeriodSKU.u_ShelfSpace, previousPeriodSKU.u_ShelfSpace)
    });

    tooltips.push({
        name: 'Value Perception Change',
        value: currentPeriodSKU.u_Perception[0],
        compareWithPreviousPeriod: compare(currentPeriodSKU.u_Perception, previousPeriodSKU.u_Perception[0])
    });

    tooltips.push({
        name: 'Image Perception Change',
        value: currentPeriodSKU.u_Perception[1],
        compareWithPreviousPeriod: compare(currentPeriodSKU.u_Perception, previousPeriodSKU.u_Perception[1])
    });

    return tooltips;

    function compare(a, b) {
        let r = a - b;
        if (r > 0) {
            return 1;
        } else if (r < 0) {
            return 0;
        } else {
            return -1;
        }
    }

    function getTechnologyLevel(SKU) {
        if (!SKU.u_ps_RetailStocks) { return '/'; }
        if (SKU.u_ps_RetailStocks[consts.StocksMaxTotal].s_ps_Volume > 0) {
            return SKU.u_ps_RetailStocks[consts.StocksMaxTotal].s_Technology;

        } else if (SKU.u_ps_WholesaleStocks[consts.StocksMaxTotal].s_ps_Volume > 0) {
            return SKU.u_ps_WholesaleStocks[consts.StocksMaxTotal].s_Technology;

        } else if (SKU.u_ps_FactoryStocks[consts.StocksMaxTotal].s_ps_Volume > 0) {
            return SKU.u_ps_FactoryStocks[consts.StocksMaxTotal].s_Technology;

        } else {
            return SKU.u_ps_FactoryStocks[0].s_Technology;
        }
    }

    function getIngredientsQuality(SKU) {
        if (!SKU.u_ps_RetailStocks) { return '/'; }
        if (SKU.u_ps_RetailStocks[consts.StocksMaxTotal].s_ps_Volume > 0) {
            return SKU.u_ps_RetailStocks[consts.StocksMaxTotal].s_IngredientsQuality;

        } else if (SKU.u_ps_WholesaleStocks[consts.StocksMaxTotal].s_ps_Volume > 0) {
            return SKU.u_ps_WholesaleStocks[consts.StocksMaxTotal].s_IngredientsQuality;

        } else if (SKU.u_ps_FactoryStocks[consts.StocksMaxTotal].s_ps_Volume > 0) {
            return SKU.u_ps_FactoryStocks[consts.StocksMaxTotal].s_IngredientsQuality;

        } else {
            return SKU.u_ps_FactoryStocks[0].s_IngredientsQuality;
        }
    }

    */
}
/**
 * Helper function for some charts
 *
 * @method generateChartData
 * @param {Object} the JSON object got from allresults CGI
 * @param {Function} the function to get a certain field of JSON object
 * @return {Object} chart data
 */
function generateChartData(allResults, dataExtractor) {
    var lastPeriodResult = allResults[allResults.length - 1];
    var companyNum = lastPeriodResult.companies.length;
    var result = {
        periods: [],
        companyNames: [],
        chartData: []
    };
    for (var i = 0; i < allResults.length; i++) {
        var onePeriodResult = allResults[i];
        var periodId = allResults[i].period;
        result.periods.push(periodId);
        var periodChartData = [];
        for (var j = 0; j < companyNum; j++) {
            var company = onePeriodResult.companies[j];
            var companyName = company.c_CompanyName;
            if (result.companyNames.indexOf(companyName) === -1) {
                result.companyNames.push(companyName);
            }
            periodChartData.push(dataExtractor(company));
        }
        result.chartData.push(periodChartData);
    }
    return result;
}
/**
 * Helper function to generate MarketEvolution chart
 *
 * @method extractMarketEvolutionChartData
 * @param {Object} allResults the JSON object got from allresults CGI
 * @param {Function} dataExtractor the function to get a certain field of JSON object
 * @return {Object} chart data
 */
// segmentNames: [
// 0 - 'priceSensitive',
// 1 - 'pretenders',
// 2 - 'moderate',
// 3 - 'goodLife',
// 4 - 'ultimate',
// 5 - 'pragmatic',
// 6 - 'allSegments'
// ],
function extractMarketEvolutionChartData(allResults, dataExtractor) {
    /*let segmentNum = consts.ConsumerSegmentsMaxTotal;
    let periodNum = allResults.length;
    let segmentNameAndIndex = config.segmentNameAndIndex;
    let segmentNames = config.segmentNames;

    let result = {
        periods: [],
        segmentNames: [],
        chartData: []
    };

    for (let i = 0; i < periodNum; i++) {
        let periodResult = allResults[i];
        let periodId = allResults[i].period;

        let market = periodResult.p_Market;

        result.periods.push(periodId);
        let segmentChartData = [];
        for (let j = 0; j < segmentNum; j++) {
            // segmentNames: [
            // 0 - 'priceSensitive',
            // 1 - 'pretenders',
            // 2 - 'moderate',
            // 3 - 'goodLife',
            // 4 - 'ultimate',
            // 5 - 'pragmatic',
            // 6 - 'allSegments'
            // ],
            if (result.segmentNames.indexOf(j) === -1) {
                result.segmentNames.push(j);
            }

            segmentChartData.push(dataExtractor(market)[j]);
        }
        result.chartData.push(segmentChartData);
    }

    return result;

    */
}
function extractChartData(results, settings) {
    //生成chart数据
    var _marketShareInValue = marketShareInValue(results);
    var _marketShareInVolume = marketShareInVolume(results);
    var _mindSpaceShare = mindSpaceShare(results);
    var _shelfSpaceShare = shelfSpaceShare(results);
    //investment and profit
    var _totalInvestment = totalInvestment(results);
    var _netProfitByCompanies = netProfitByCompanies(results);
    var _returnOnInvestment = returnOnInvestment(results);
    var _investmentsVersusBudget = investmentsVersusBudget(results, settings.simulationSpan);
    //market sales and inventory
    var _marketSalesValue = marketSalesValue(results);
    var _marketSalesVolume = marketSalesVolume(results);
    var _totalInventoryAtFactory = totalInventoryAtFactory(results);
    var _totalInventoryAtTrade = totalInventoryAtTrade(results);
    //segment leaders top 5
    var segmentsLeadersByValuePriceSensitive = segmentsLeadersByValue(results, 'priceSensitive');
    var segmentsLeadersByValuePretenders = segmentsLeadersByValue(results, 'pretenders');
    var segmentsLeadersByValueModerate = segmentsLeadersByValue(results, 'moderate');
    var segmentsLeadersByValueGoodLife = segmentsLeadersByValue(results, 'goodLife');
    var segmentsLeadersByValueUltimate = segmentsLeadersByValue(results, 'ultimate');
    var segmentsLeadersByValuePragmatic = segmentsLeadersByValue(results, 'pragmatic');
    //Market evolution
    var _growthRateInVolume = growthRateInVolume(results);
    var _growthRateInValue = growthRateInValue(results);
    var _netMarketPrice = netMarketPrice(results);
    var _segmentValueShareTotalMarket = segmentValueShareTotalMarket(results);
    var _perceptionMap = perceptionMap(results, settings.exogenous);
    var _inventoryReport = inventoryReport(results);
    return [
        {
            chartName: 'marketShareInValue',
            chartData: _marketShareInValue
        },
        {
            chartName: 'marketShareInVolume',
            chartData: _marketShareInVolume
        },
        {
            chartName: 'mindSpaceShare',
            chartData: _mindSpaceShare
        },
        {
            chartName: 'shelfSpaceShare',
            chartData: _shelfSpaceShare
        },
        {
            chartName: 'totalInvestment',
            chartData: _totalInvestment
        },
        {
            chartName: 'netProfitByCompanies',
            chartData: _netProfitByCompanies
        },
        {
            chartName: 'returnOnInvestment',
            chartData: _returnOnInvestment
        },
        {
            chartName: 'investmentsVersusBudget',
            chartData: _investmentsVersusBudget
        },
        {
            chartName: 'marketSalesValue',
            chartData: _marketSalesValue
        },
        {
            chartName: 'marketSalesVolume',
            chartData: _marketSalesVolume
        },
        {
            chartName: 'totalInventoryAtFactory',
            chartData: _totalInventoryAtFactory
        },
        {
            chartName: 'totalInventoryAtTrade',
            chartData: _totalInventoryAtTrade
        },
        {
            chartName: 'segmentsLeadersByValuePriceSensitive',
            chartData: segmentsLeadersByValuePriceSensitive
        },
        {
            chartName: 'segmentsLeadersByValuePretenders',
            chartData: segmentsLeadersByValuePretenders
        },
        {
            chartName: 'segmentsLeadersByValueModerate',
            chartData: segmentsLeadersByValueModerate
        },
        {
            chartName: 'segmentsLeadersByValueGoodLife',
            chartData: segmentsLeadersByValueGoodLife
        },
        {
            chartName: 'segmentsLeadersByValueUltimate',
            chartData: segmentsLeadersByValueUltimate
        },
        {
            chartName: 'segmentsLeadersByValuePragmatic',
            chartData: segmentsLeadersByValuePragmatic
        },
        {
            chartName: 'growthRateInVolume',
            chartData: _growthRateInVolume
        },
        {
            chartName: 'growthRateInValue',
            chartData: _growthRateInValue
        },
        {
            chartName: 'netMarketPrice',
            chartData: _netMarketPrice
        },
        {
            chartName: 'segmentValueShareTotalMarket',
            chartData: _segmentValueShareTotalMarket
        },
        {
            chartName: 'perceptionMap',
            chartData: _perceptionMap
        },
        {
            chartName: 'inventoryReport',
            chartData: _inventoryReport
        }
    ];
}
exports.extractChartData = extractChartData;
//# sourceMappingURL=chart.js.map