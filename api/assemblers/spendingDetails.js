//let gameParameters = require('../gameParameters.js').parameters;
"use strict";
const simulationResultModel = require('../models/simulation/Result');
const seminarModel = require('../models/Seminar');
const decisionAssembler = require('../assemblers/decision');
let consts = require('../consts');
let Q = require('q');
/**
* @param {Number} currentPeriod
*/
function getSpendingDetails(seminarId, currentPeriod, companyId) {
    return Q.all([
        decisionAssembler.getDecision(seminarId, currentPeriod, companyId),
        seminarModel.findOneQ({ seminarId: seminarId }),
        simulationResultModel.findOne(seminarId, currentPeriod - 1)
    ])
        .spread(function (decision, seminar, lastPeriodResult) {
        let brandData = [];
        let companyData = {};
        //assemble brand data
        /*for (let i = 0; i < decision.d_BrandsDecisions.length; i++) {
            let brandDecision = decision.d_BrandsDecisions[i];
            let brandDataRow: any = {};

            brandDataRow.brandName = brandDecision.d_BrandName;
            brandDataRow.salesForce = brandDecision.d_SalesForce;
            brandDataRow.consumerCommunication = 0;
            brandDataRow.consumerPromotion = 0;
            brandDataRow.tradeExpenses = 0;
            brandDataRow.estimatedAdditionalTradeMarginCost = 0;
            brandDataRow.estimatedWholesaleBonusCost = 0;

            for (let j = 0; j < brandDecision.d_SKUsDecisions.length; j++) {
                let SKUDecision = brandDecision.d_SKUsDecisions[j];

                brandDataRow.consumerCommunication += SKUDecision.d_Advertising;
                brandDataRow.consumerPromotion += SKUDecision.d_PromotionalBudget;
                brandDataRow.tradeExpenses += SKUDecision.d_TradeExpenses;
                brandDataRow.estimatedAdditionalTradeMarginCost += SKUDecision.d_AdditionalTradeMargin;
                brandDataRow.estimatedWholesaleBonusCost += SKUDecision.d_WholesalesBonusRate;
            }

            brandDataRow.estimatedAdditionalTradeMarginCost = brandDataRow.estimatedAdditionalTradeMarginCost;
            brandDataRow.estimatedWholesaleBonusCost = brandDataRow.estimatedWholesaleBonusCost;

            brandData.push(brandDataRow);
        }

        //calculate total value
        let total: any = {};

        total.brandName = "Total";

        total.salesForce = brandData.reduce(function (lastResult, nextValue) {
            return lastResult + nextValue.salesForce;
        }, 0);

        total.consumerCommunication = brandData.reduce(function (lastResult, nextValue) {
            return lastResult + nextValue.consumerCommunication;
        }, 0);

        total.consumerPromotion = brandData.reduce(function (lastResult, nextValue) {
            return lastResult + nextValue.consumerPromotion;
        }, 0);

        total.tradeExpenses = brandData.reduce(function (lastResult, nextValue) {
            return lastResult + nextValue.tradeExpenses;
        }, 0);

        total.estimatedAdditionalTradeMarginCost = brandData.reduce(function (lastResult, nextValue) {
            return lastResult + parseFloat(nextValue.estimatedAdditionalTradeMarginCost);
        }, 0)

        total.estimatedWholesaleBonusCost = brandData.reduce(function (lastResult, nextValue) {
            return lastResult + parseFloat(nextValue.estimatedWholesaleBonusCost);
        }, 0);


        brandData.push(total);*/
        //assemble company data
        companyData.investmentInProductionEfficiency = 100; //decision.d_InvestmentInEfficiency;
        companyData.investmentInProcessingTechnology = 25; //decision.d_InvestmentInTechnology;
        companyData.totalInvestment = 5000;
        /*total.salesForce + total.consumerCommunication + total.consumerPromotion
            + total.tradeExpenses + total.estimatedAdditionalTradeMarginCost + total.estimatedWholesaleBonusCost + companyData.investmentInProductionEfficiency + companyData.investmentInProcessingTechnology;
            */
        let companyDataInAllResults; // = utility.findCompany(lastPeriodResult, companyId)
        //average budget per period
        companyData.averageBudgetPerPeriod = 500000; //companyDataInAllResults.c_TotalInvestmentBudget / (seminar.simulationSpan);
        companyData.totalInvestmentBudget = 6666666666666; //companyDataInAllResults.c_TotalInvestmentBudget;
        companyData.cumulatedPreviousInvestments = 7588484; //companyDataInAllResults.c_CumulatedInvestments;
        companyData.availableBudget = 55555555; /*companyDataInAllResults.c_TotalInvestmentBudget - companyDataInAllResults.c_CumulatedInvestments
            - companyData.totalInvestment;*/
        //normal capacity
        companyData.normalCapacity = 55555; //companyDataInAllResults.c_Capacity - utility.calculateTotalVolume(decision)
        if (companyData.normalCapacity < 0) {
            companyData.normalCapacity = 0;
        }
        //company data in all results
        /*if (companyDataInAllResults.c_Capacity - utility.calculateTotalVolume(decision) < 0) {
            companyData.availableOvertimeCapacityExtension = companyDataInAllResults.c_Capacity * gameParameters.pgen.firm_OvertimeCapacity + (companyDataInAllResults.c_Capacity - utility.calculateTotalVolume(decision));
        } else {
            companyData.availableOvertimeCapacityExtension = companyDataInAllResults.c_Capacity * gameParameters.pgen.firm_OvertimeCapacity;
        }*/
        companyData.acquiredEfficiency = 4; //companyDataInAllResults.c_AcquiredEfficiency * 100;
        companyData.acquiredProductionVolumeFlexibility = 6; // companyDataInAllResults.c_AcquiredFlexibility * 100;
        companyData.acquiredTechnologyLevel = 9; //companyDataInAllResults.c_AcquiredTechnologyLevel;
        return {
            //brandData: brandData,
            companyData: companyData
        };
    });
}
exports.getSpendingDetails = getSpendingDetails;
//# sourceMappingURL=spendingDetails.js.map