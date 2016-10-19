"use strict";
var companyDecisionModel = require('../models/decision/CompanyDecision');
/*let brandDecisionModel = require('../models/marksimos/brandDecision.js');
let SKUDecisionModel = require('../models/marksimos/SKUDecision.js');*/
var Q = require('q');
/**
 * Get decision of one period
 */
function getDecision(seminarId, period, companyId) {
    return Q.all([
        companyDecisionModel.findOne(seminarId, period, companyId) /*,
        brandDecisionModel.findAllInCompany(seminarId, period, companyId),
        SKUDecisionModel.findAllInCompany(seminarId, period, companyId)*/
    ])
        .spread(function (companyDecision, brandDecisionList, SKUDecisionList) {
        //brandDecisionList = JSON.parse(JSON.stringify(brandDecisionList));
        //SKUDecisionList = JSON.parse(JSON.stringify(SKUDecisionList));
        /*if (!companyDecision || !brandDecisionList || !SKUDecisionList) {
            throw { message: 'companyDecision/brandDecisionList/SKUDecisionList is empty.' }
        }

        //combine decisions
        brandDecisionList.forEach(function (brandDecision) {

            let tempSKUDecisionList = [];
            for (let i = 0; i < SKUDecisionList.length; i++) {
                let SKUDecision = SKUDecisionList[i];
                if (SKUDecision.d_BrandID === brandDecision.d_BrandID) {

                    tempSKUDecisionList.push(SKUDecision);
                }
            }
            brandDecision.d_SKUsDecisions = tempSKUDecisionList;
        });

        companyDecision.d_BrandsDecisions = brandDecisionList;*/
        return companyDecision;
    });
}
exports.getDecision = getDecision;
;
/**
 * Get decision of all period
 */
function getAllCompanyDecisionsOfAllPeriod(seminarId) {
    return Q.all([
        companyDecisionModel.query.find({ seminarId: seminarId }).where('period').gt(0).sort('d_CID').lean().exec() /*,
        brandDecisionModel.query.find({ seminarId: seminarId }).where('period').gt(0).sort('d_BrandID').lean().exec(),
        SKUDecisionModel.query.find({ seminarId: seminarId }).where('period').gt(0).sort('d_SKUID').lean().exec()*/
    ])
        .spread(function (companyDecision, brandDecisionList, SKUDecisionList) {
        /*if (!companyDecision || !brandDecisionList || !SKUDecisionList) {
            throw { message: 'companyDecision / brandDecisionList / SKUDecisionList is empty.' }
        }

        //combine decisions

        companyDecision.forEach(function (company) {

            company.brandDecisions = [];
            company.SKUDecisions = [];


            SKUDecisionList.forEach(function (SKUDecision) {
                if (SKUDecision.d_CID === company.d_CID && SKUDecision.period === company.period) {

                    company.SKUDecisions.push(SKUDecision);
                }
            });

            brandDecisionList.forEach(function (brandDecision) {

                if (brandDecision.d_CID === company.d_CID && brandDecision.period === company.period) {
                    company.brandDecisions.push(brandDecision);
                }
            });

            company.brandDecisions.forEach(function (brandDecision2) {
                brandDecision2.SKUDecisions = [];

                company.SKUDecisions.forEach(function (SKUDecision2) {

                    if (SKUDecision2.d_BrandID === brandDecision2.d_BrandID) {
                        brandDecision2.SKUDecisions.push(SKUDecision2);
                    }
                })

            });

            company.SKUDecisions = null;

        });
        */
        return companyDecision;
    });
}
exports.getAllCompanyDecisionsOfAllPeriod = getAllCompanyDecisionsOfAllPeriod;
/**
 * Convert decision to a companyDecision object which can be saved to db
 *
 * @param {Object} decision decision got from CGI service
 */
function getCompanyDecision(decision) {
    /*let brandIds = decision.d_BrandsDecisions.map(function (brand) {
        return brand.d_BrandID;
    });*/
    return decision;
    /*return {
        d_CID: decision.d_CID,
        d_CompanyName: decision.d_CompanyName,
        //d_BrandsDecisions: brandIds,
        d_IsAdditionalBudgetAccepted: decision.d_IsAdditionalBudgetAccepted,
        d_RequestedAdditionalBudget: decision.d_RequestedAdditionalBudget,
        d_InvestmentInEfficiency: decision.d_InvestmentInEfficiency,
        d_InvestmentInTechnology: decision.d_InvestmentInTechnology,
        d_InvestmentInServicing: decision.d_InvestmentInServicing
    };*/
}
exports.getCompanyDecision = getCompanyDecision;
/**
 * Convert decision to an array of brandDecision objects which can be saved to db
 *
 * @param {Object} decision decision got from CGI service
 */
function getBrandDecisions(decision) {
    var results = [];
    for (var i = 0; i < decision.d_BrandsDecisions.length; i++) {
        var brandDecision = decision.d_BrandsDecisions[i];
        var SKUIDs = brandDecision.d_SKUsDecisions.map(function (SKUDecision) {
            return SKUDecision.d_SKUID;
        });
        results.push({
            d_CID: decision.d_CID,
            d_BrandID: brandDecision.d_BrandID,
            d_BrandName: brandDecision.d_BrandName,
            d_SalesForce: brandDecision.d_SalesForce,
            d_SKUsDecisions: SKUIDs
        });
    }
    return results;
}
exports.getBrandDecisions = getBrandDecisions;
/**
 * Convert decision to an array of SKUDecision objects which can be saved to db
 *
 * @param {Object} decision decision got from CGI service
 */
function getSKUDecisions(decision) {
    var results = [];
    for (var i = 0; i < decision.d_BrandsDecisions.length; i++) {
        var brandDecision = decision.d_BrandsDecisions[i];
        for (var j = 0; j < brandDecision.d_SKUsDecisions.length; j++) {
            var SKUDecision = brandDecision.d_SKUsDecisions[j];
            results.push({
                d_CID: decision.d_CID,
                d_BrandID: brandDecision.d_BrandID,
                d_SKUID: SKUDecision.d_SKUID,
                d_SKUName: SKUDecision.d_SKUName,
                d_Advertising: SKUDecision.d_Advertising,
                d_AdditionalTradeMargin: SKUDecision.d_AdditionalTradeMargin,
                d_FactoryPrice: SKUDecision.d_FactoryPrice,
                d_ConsumerPrice: SKUDecision.d_ConsumerPrice,
                d_RepriceFactoryStocks: SKUDecision.d_RepriceFactoryStocks,
                d_IngredientsQuality: SKUDecision.d_IngredientsQuality,
                d_PackSize: SKUDecision.d_PackSize,
                d_ProductionVolume: SKUDecision.d_ProductionVolume,
                d_PromotionalBudget: SKUDecision.d_PromotionalBudget,
                d_PromotionalEpisodes: SKUDecision.d_PromotionalEpisodes,
                d_TargetConsumerSegment: SKUDecision.d_TargetConsumerSegment,
                d_Technology: SKUDecision.d_Technology,
                d_ToDrop: SKUDecision.d_ToDrop,
                d_TradeExpenses: SKUDecision.d_TradeExpenses,
                d_WholesalesBonusMinVolume: SKUDecision.d_WholesalesBonusMinVolume,
                d_WholesalesBonusRate: SKUDecision.d_WholesalesBonusRate,
                d_WarrantyLength: SKUDecision.d_WarrantyLength
            });
        }
    }
    return results;
}
exports.getSKUDecisions = getSKUDecisions;
//# sourceMappingURL=decision.js.map