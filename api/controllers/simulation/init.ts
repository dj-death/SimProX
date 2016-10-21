import seminarModel = require('../../models/Seminar');
import PlayerDecision = require('../../models/decision/Decision');
import Scenario = require('../../models/scenario/Scenario');
import reportModel = require('../../models/simulation/Report');
import chartModel = require('../../models/simulation/Chart');



import companyDecisionModel = require('../../models/decision/CompanyDecision');
import simulationResultModel = require('../../models/simulation/Result');

/*var brandDecisionModel = require('../../../models/marksimos/brandDecision.js');
var SKUDecisionModel = require('../../../models/marksimos/SKUDecision.js');
*/

import dbutility = require('../../models/dbUtility');
import decisionAssembler = require('../../assemblers/decision');
import decisionCleaner = require('../../convertors/decisionCleaner');


import allResultsCleaner = require('../../convertors/allResultsCleaner');



import console = require('../../../kernel/utils/logger');
import utility = require('../../utils/utility');

let _ = require('underscore');
let Q = require('q');
let http = require('http');
let util = require('util');



let oneHour = 60 * 60 * 1000;

/**
 * Initialize game data, only certain perople can call this method
 *
 * @method init
 *
 */


export function init(io) {
    let status;

    return function (req, res, next) {
        if (status == 'pending') {
            return res.status(404).json({ message: 'Service is locked by other process, please wait for seconds...' });

        } else {
            status = 'pending';

            let seminarResult;

            let seminarId = req.params.seminar_id;

            let simulation_span;
            let company_num;
            let currentPeriod;
            let simulationScenarioID;

            let companies;


            let hists;

            if (!seminarId) {
                status = 'active';
                return res.status(400).json({ message: "seminarId cannot be empty." });
            }


            io.sockets.emit('AdminProcessLog', {
                msg: 'Start calling Initialize.DLL...',
                isError: false
            });


            seminarModel.findOneQ({ seminarId: seminarId }).then(function (dbSeminar) {

                if (!dbSeminar) {
                    status = 'active';
                    throw { message: "Cancel promise chains. Because seminar doesn't exist." }
                }

                if (dbSeminar.currentPeriod !== 1) {
                    status = 'active';
                    throw { message: "Cancel promise chains. Because initialize a seminar that already starts." }
                }


                seminarResult = dbSeminar;
                //before init, a new seminar should be created,
                //and it's currentPeriod should be set correctly = 1
                currentPeriod = dbSeminar.currentPeriod;
                simulation_span = dbSeminar.simulation_span;
                company_num = dbSeminar.company_num;
                simulationScenarioID = dbSeminar.simulationScenarioID;

                //create company array
                companies = dbSeminar.companies || utility.createCompanyArray(company_num);

                global.debug_data.companies = companies;

                return Q.all([
                    simulationResultModel.removeAll(seminarId),
                    dbutility.removeExistedDecisions(seminarId),
                    /*chartModel.remove(seminarId),
                    reportModel.remove(seminarId)*/
                ])
                    .then(function () {
                        return loadScenario(simulationScenarioID);
                    })
                    .then(function (hists) {

                        return Q.all([
                            initSimulationResult(seminarId, companies, hists),
                            initDecision(seminarId, companies, hists),

                        ]);
                    })
                    /*.then(function () {
                        return Q.all([
                            simulationResultModel.findAll(seminarId)
                        ])
                            .spread(function (allResults) {
                                return Q.all([
                                    initChartData(seminarId, allResults),
    
                                    initCompanyStatusReport(seminarId, allResults, 0),
                                    initFinancialReport(seminarId, allResults),
                                    initProfitabilityEvolutionReport(seminarId, allResults, 0),
                                    initSegmentDistributionReport(seminarId, allResults),
                                    initCompetitorIntelligenceReport(seminarId, allResults),
                                    initMarketTrendsReport(seminarId, allResults, 0),
                                    initMarketIndicatorReport(seminarId, currentPeriod)
                                ]);
                            });
                    })*/
                    .then(function () {

                        //copy decision of period (currentPeriod - 1 = 0)
                        //    return undefined;
                        return duplicateLastPeriodDecision(seminarId, currentPeriod - 1);
                    })
                    .then(function () {

                        seminarResult.isInitialized = true;

                        if (seminarResult.roundTime.length > 0) {
                            seminarResult.roundTime[0].startTime = new Date();

                            if (seminarResult.roundTime[0].roundTimeHour !== 0) {
                                seminarResult.roundTime[0].endTime = new Date(new Date().getTime() + oneHour * seminarResult.roundTime[0].roundTimeHour);
                            }
                        }


                        return seminarResult.saveQ();

                    }).then(function (result) {
                        status = 'active';

                        if (!result) {
                            throw new Error("Cancel promise chains. Because there's error during set isInitialized to true.");
                        }


                        io.sockets.emit('AdminProcessLog', {
                            msg: result.msg,
                            isError: false
                        });

                        res.status(200).json({ message: 'initialize success' });

                    }).fail(next).done();

            }).fail(function (err) {
                io.sockets.emit('AdminProcessLog', {
                    msg: err.msg,
                    isError: true
                });

                return next();

            }).done();

        }

    }; // end return

}


/*
export function runSimulation(){
    let status;

    return function(req, res, next){
        if(status == 'pending'){
            return res.send(400, {message: "Last request is still pending, please wait for runSimulation process complete..."})
        } else {
            status = 'pending';

            let seminarId = req.params._id;
            let goingToNewPeriod = req.body.goingToNewPeriod;
            let decisionsOverwriteSwitchers = req.body.decisionsOverwriteSwitchers || [];

            if(!seminarId){
                status = 'active';
                return res.send(400, {message: "You have not choose a seminar."})
            }

            if(goingToNewPeriod == undefined){
                status = 'active';
                return res.send(400, {message: "Which period need to run?"})
            }

            if((decisionsOverwriteSwitchers == [])){
                status = 'active';
                return res.send(400, {message : 'need parameter decisionsOverwriteSwitchers'});
            }

            //check if this seminar exists
            seminarModel.findOneQ({
                seminarId: seminarId
            })
            .then(function(dbSeminar){
                if(!dbSeminar){
                    throw {message: "Cancel promise chains. Because seminar doesn't exist."};
                }

                if(!dbSeminar.isInitialized){
                    throw {message: "Cancel promise chains. Because you have not initialized this seminar."};
                }

                //if all rounds are executed
                if(dbSeminar.isSimulationFinished){
                    throw {message: "the last round simulation has been executed."};
                }


                if(goingToNewPeriod){
                    selectedPeriod = dbSeminar.currentPeriod;

                    decisionsOverwriteSwitchers = [];
                    for(let i=0; i<dbSeminar.companyNum; i++){
                        decisionsOverwriteSwitchers.push(true);
                    }
                } else {
                    selectedPeriod = dbSeminar.currentPeriod - 1;

                    if(decisionsOverwriteSwitchers.length != dbSeminar.companyNum){
                        throw {message: "Cancel promise chains. Because Incorrect parameter decisionsOverwriteSwitchers in the post request."}
                    }

                }

                let companies = [];
                for(let i=0; i<dbSeminar.companyNum; i++){
                    companies.push(i+1);
                }

                //write decision to binary file
                return submitDecisionForAllCompany(companies, selectedPeriod, seminarId).then(function(submitDecisionResult){
                    logger.log('write decision finished.');

                    if(submitDecisionResult.message !== 'submit_decision_success'){
                         throw {message: 'Cancel promise chains. Because ' + submitDecisionResult.message};
                    }

                    //run simulation
                    return cgiapi.runSimulation({
                        seminarId: seminarId,
                        simulation_span: dbSeminar.simulation_span,
                        teams: utility.createCompanyArray(dbSeminar.companyNum),
                        period: selectedPeriod
                    })
                    .then(function(simulationResult){
                        logger.log('run simulation finished.');
                        if(simulationResult.message !== 'run_simulation_success'){
                            throw {message: 'Cancel promise chains. Because ' + simulationResult.message};
                        }

                        return Q.all[
                            removeCurrentPeriodSimulationResult(seminarId, selectedPeriod),
                            chartModel.remove(seminarId),
                            reportModel.remove(seminarId)
                        ];
                    })
                    .then(function(){
                        logger.log('get current period simulation result finished.');
                        //once removeCurrentPeriodSimulationResult success,
                        //query and save the current period simulation result
                        return initCurrentPeriodSimulationResult(seminarId, selectedPeriod);
                    })
                    .then(function(){
                        return Q.all([
                            simulationResultModel.findAll(seminarId)
                        ])
                        .spread(function(allResults){
                            return Q.all([
                                initChartData(seminarId, allResults),
                                initCompanyStatusReport(seminarId, allResults, selectedPeriod),
                                initFinancialReport(seminarId, allResults),
                                initProfitabilityEvolutionReport(seminarId, allResults, selectedPeriod),
                                initSegmentDistributionReport(seminarId, allResults),
                                initCompetitorIntelligenceReport(seminarId, allResults),
                                initMarketTrendsReport(seminarId, allResults, selectedPeriod),
                                initMarketIndicatorReport(seminarId, selectedPeriod)
                            ]);
                        });
                    })
                    .then(function(){
                        logger.log('generate report/chart finished.');
                        //for the last period OR re-run last period,
                        //DO NOT create the next period decision automatically
                        if(dbSeminar.currentPeriod < dbSeminar.simulation_span){
                            status = 'active';
                            return createNewDecisionBasedOnLastPeriodDecision(seminarId, selectedPeriod, decisionsOverwriteSwitchers, goingToNewPeriod);
                        }else{
                            return undefined;
                        }
                    })
                    .then(function(){
                        logger.log('create duplicate decision from last period finished.');

                        if(goingToNewPeriod){


                            if(dbSeminar.currentPeriod < dbSeminar.simulation_span) {
                                //after simulation success, set currentPeriod to next period, only when goingToNewPeriod = true

                            }else if (dbSeminar.currentPeriod = dbSeminar.simulation_span) {
                                dbSeminar.isSimulationFinished = true;
                            }else {
                                throw new Error('Cancel promise chains. Because dbSeminar.currentPeriod > dbSeminar.simulation_span, you cannot run into next period.');
                            }
                            
                            if(dbSeminar.roundTime.length > 0 ){

                                if (typeof dbSeminar.roundTime[dbSeminar.currentPeriod ] !== 'undefined') {
                                    dbSeminar.roundTime[dbSeminar.currentPeriod ].startTime = new Date();

                                    if(dbSeminar.roundTime[dbSeminar.currentPeriod].roundTimeHour !== 0){
                                        dbSeminar.roundTime[dbSeminar.currentPeriod].endTime = new Date( new Date().getTime() + oneHour * dbSeminar.roundTime[dbSeminar.currentPeriod].roundTimeHour);
                                    }
                                }

                            }

                            dbSeminar.currentPeriod = dbSeminar.currentPeriod + 1;

                            return dbSeminar.saveQ().then(function(result){
                                if(result[1] > 1){
                                    throw new Error( "Cancel promise chains. Because there's error during update seminar.");
                                }

                            });
                        }

                    });

                });


            })
            .then(function(){
                status = 'active';
                return res.status(200).send({message: "run simulation success."});

            })
            .fail(function(err){
                 status = 'active';
                if(err.httpStatus){
                    return res.send(err.httpStatus, {message: err.message});
                }
                res.status(500).send( {message: err.message});
            })
            .done();
        }

    }


}

/*

function initCurrentPeriodSimulationResult(seminarId, currentPeriod){
    return cgiapi.queryOnePeriodResult(seminarId, currentPeriod)
    .then(function(currentPeriodResult){
        if(currentPeriodResult && currentPeriodResult.message){
            throw {message: 'Cancel promise chains. Because ' + currentPeriodResult};
        }

        allResultsCleaner.clean(currentPeriodResult);

        currentPeriodResult.seminarId = seminarId;
        currentPeriodResult.period = currentPeriod;

        return simulationResultModel.insert(currentPeriodResult);
    })
}

function removeCurrentPeriodSimulationResult(seminarId, currentPeriod){
    return simulationResultModel.remove({
        seminarId: seminarId,
        period: currentPeriod
    });
}

function submitDecisionForAllCompany(companies, period, seminarId){
    let p = Q();

    companies.forEach(function(companyId){
        p = p.then(function(){
            //logger.log("submit decision finished.");
            return submitDecision(companyId, period, seminarId);
        });
    });

    return p;
}

function submitDecision(companyId, period, seminarId){
    let result = {};
    logger.log('Submit Decision For companyId:' + companyId + ', period:' + period + ', seminarId:' + seminarId);
    return companyDecisionModel.findOne(seminarId, period, companyId).then(function(decision){
        if(!decision){
            throw {message: "Cancel promise chains. Because decision doesn't exist."};
        }

        result.d_CID = decision.d_CID;
        result.d_CompanyName = decision.d_CompanyName;
        result.d_BrandsDecisions = [];
        result.d_IsAdditionalBudgetAccepted = decision.d_IsAdditionalBudgetAccepted;
        result.d_RequestedAdditionalBudget = decision.d_RequestedAdditionalBudget;
        result.d_InvestmentInEfficiency = decision.d_InvestmentInEfficiency;
        result.d_InvestmentInTechnology = decision.d_InvestmentInTechnology;
        result.d_InvestmentInServicing = decision.d_InvestmentInServicing;

        return brandDecisionModel.findAllInCompany(seminarId, period, companyId).then(function(brandDecisions){
            let p2 = Q();
            brandDecisions.forEach(function(brandDecision){
                let tempBrandDecision = {};
                tempBrandDecision.d_BrandID = brandDecision.d_BrandID;
                tempBrandDecision.d_BrandName = brandDecision.d_BrandName;
                tempBrandDecision.d_SalesForce = brandDecision.d_SalesForce;
                tempBrandDecision.d_SKUsDecisions = [];

                p2 = p2.then(function(){
                    return SKUDecisionModel.findAllInBrand(seminarId, period, companyId, brandDecision.d_BrandID);
                }).then(function(SKUDecisions){
                    SKUDecisions.forEach(function(SKUDecision){
                        let tempSKUDecision = {};
                        tempSKUDecision.d_SKUID = SKUDecision.d_SKUID;
                        tempSKUDecision.d_SKUName = SKUDecision.d_SKUName;
                        tempSKUDecision.d_Advertising = SKUDecision.d_Advertising;
                        tempSKUDecision.d_AdditionalTradeMargin = SKUDecision.d_AdditionalTradeMargin;
                        tempSKUDecision.d_FactoryPrice = SKUDecision.d_FactoryPrice;
                        tempSKUDecision.d_ConsumerPrice = SKUDecision.d_ConsumerPrice;
                        tempSKUDecision.d_RepriceFactoryStocks = SKUDecision.d_RepriceFactoryStocks;
                        tempSKUDecision.d_IngredientsQuality = SKUDecision.d_IngredientsQuality;
                        tempSKUDecision.d_PackSize = SKUDecision.d_PackSize;
                        tempSKUDecision.d_ProductionVolume = SKUDecision.d_ProductionVolume;
                        tempSKUDecision.d_PromotionalBudget = SKUDecision.d_PromotionalBudget;
                        tempSKUDecision.d_PromotionalEpisodes = SKUDecision.d_PromotionalEpisodes;
                        tempSKUDecision.d_TargetConsumerSegment = SKUDecision.d_TargetConsumerSegment;
                        tempSKUDecision.d_Technology = SKUDecision.d_Technology;
                        tempSKUDecision.d_ToDrop = SKUDecision.d_ToDrop;
                        tempSKUDecision.d_TradeExpenses = SKUDecision.d_TradeExpenses;
                        tempSKUDecision.d_WholesalesBonusMinVolume = SKUDecision.d_WholesalesBonusMinVolume;
                        tempSKUDecision.d_WholesalesBonusRate = SKUDecision.d_WholesalesBonusRate;
                        tempSKUDecision.d_WarrantyLength = SKUDecision.d_WarrantyLength;
                        tempBrandDecision.d_SKUsDecisions.push(tempSKUDecision);
                    });
                    result.d_BrandsDecisions.push(tempBrandDecision);
                });
            });
            return p2;
        });
    }).then(function(){
        if(Object.keys(result).length===0){
            return res.send(500, {message: "fail to get decisions"})
        }

        insertEmptyBrandsAndSKUs(result);
        //convert result to data format that can be accepted by CGI service

        decisionConvertor.convert(result);


        let reqUrl = url.resolve(config.cgiService, 'decisions.exe');

        //logger.log(require('util').inspect(result.d_BrandsDecisions));
        return request.post(reqUrl, {
            decision: JSON.stringify(result),
            seminarId: seminarId,
            period: period,
            team: companyId
        });
    });


    /**
     * CGI service can not convert JSON string to delphi object,
     * if the number of SKUs or Brands is not the same as
     * the length of correspond array in delphi data structure.
     *
     * @method insertEmptyBrands
     */
/*
    function insertEmptyBrandsAndSKUs(decision){
        for(let i=0; i< decision.d_BrandsDecisions.length; i++){
            let brand = decision.d_BrandsDecisions[i];
            let numOfSKUToInsert = 5 - brand.d_SKUsDecisions.length;
            for(let j=0; j<numOfSKUToInsert; j++){

                if(typeof brand.d_SKUsDecisions[0] === 'undefined'){
                    logger.log("insert Empty SKUs of Brand Info: ", brand.d_SKUsDecisions[0]);
                }

                let emptySKU = JSON.parse(JSON.stringify(brand.d_SKUsDecisions[0]));
                emptySKU.d_SKUID = 0;
                emptySKU.d_SKUName = '\u0000\u0000\u0000';

                brand.d_SKUsDecisions.push(emptySKU);
            }
        }

        let numOfBrandToInsert = 5 - decision.d_BrandsDecisions.length;
        for(let k=0; k<numOfBrandToInsert; k++){
            if(typeof decision.d_BrandsDecisions[0] === 'undefined'){
                logger.log("insert Empty Brands Info: ", decision.d_BrandsDecisions[0]);
            }


            let emptyBrand = JSON.parse(JSON.stringify(decision.d_BrandsDecisions[0]));
            for(let p=0; p<emptyBrand.d_SKUsDecisions.length; p++){
                emptyBrand.d_SKUsDecisions[p].d_SKUID = 0;
                emptyBrand.d_SKUsDecisions[p].d_SKUName = '\u0000\u0000\u0000';
            }
            emptyBrand.d_BrandID = 0;
            emptyBrand.d_BrandName = '\u0000\u0000\u0000\u0000\u0000\u0000';
            decision.d_BrandsDecisions.push(emptyBrand);
        }
    }
}


function initBinaryFile(seminarId, simulation_span, companies){
    return cgiapi.init({
        seminarId: seminarId,
        simulation_span: simulation_span,
        teams: companies
    });
}

*/


function loadScenario(simulationScenarioID) {
    if (!simulationScenarioID) {
        console.warn("empty scenario");

        simulationScenarioID = "14C2";

        //return Scenario.loadEmptyScenario();
    }

    return Scenario.loadScenario(simulationScenarioID);
}

/**
* @param {Array} periods array of periods
*/


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


function initDecision(seminarId, companies: any[], initData) {

    let hists = initData.historiques;
    let tempDecisions = [];

    if (hists.length) {
        hists.forEach(function (data) {

            if (data.period > 0) {
                return;
            }


            companies.forEach(function (comp) {
                let decision = clone(data.decision);

                decision.period = data.period;
                decision.seminarId = seminarId;
                decision.d_CID = comp.companyId;
                decision.d_CompanyName = comp.companyName;

                tempDecisions.push(decision);
            });

        });

        //cleanDecisions(tempDecisions);
    }


    return dbutility.saveDecision(seminarId, tempDecisions);
}



function cleanDecisions(allDecisions){
    allDecisions.forEach(function(decision){
        decisionCleaner.clean(decision);
    })
}

/**
 * @param {Object} allResults allResults of all periods
 */

/*
function initChartData(seminarId, allResults){
    let period = allResults[allResults.length-1].period + 1;

    return Q.all([
        seminarModel.findOneQ({seminarId: seminarId}),
        //get exogenous of period:0, FMCG and GENERIC market
        cgiapi.getExogenous(period)
    ])
    .spread(function(seminar, exogenous){
        //generate charts from allResults
        let chartData = chartAssembler.extractChartData(allResults, {
            simulation_span: seminar.simulation_span,
            exogenous: exogenous
        });

        return chartModel.insert({
            seminarId: seminarId,
            charts: chartData
        })
    });
}
*/

function initSimulationResult(seminarId, companies, initData) {

    let hists = initData.historiques;
    let allResults = [];

    if (hists.length) {
        hists.forEach(function (data) {
            let period = data.period;

            if (period > 0) {
                return;
            }

            companies.forEach(function (comp) {
                let results = clone(data.results);

                results.period = period;
                results.seminarId = seminarId;
                results.d_CID = comp.companyId;
                results.d_CompanyName = comp.companyName;

                allResults.push(results);
            });

        });

        //cleanAllResults(allResults);
    }

    let saveOperations = [];

    for (let i = 0; i < allResults.length; i++) {
        saveOperations.push(simulationResultModel.insert(allResults[i]))
    }


    return Q.all(saveOperations);
}

function cleanAllResults(allResults){
    allResults.forEach(function(onePeriodResult){
        //remove useless data like empty SKU, company
        allResultsCleaner.clean(onePeriodResult);
    })
}

/*
function initCompanyStatusReport(seminarId, allResults, period){
    let queries = [];
    allResults.forEach(function(onePeriodResult){
        queries.push(cgiapi.getExogenous(onePeriodResult.period));
    })

    return Q.all(queries)
    .then(function(allExogenous){
        return reportModel.insert({
            seminarId: seminarId,
            reportName: "company_status",
            reportData: companyStatusReportAssembler.getCompanyStatusReport(allResults, allExogenous, period)
        })
    });
};

function initFinancialReport(seminarId, allResults){
    return reportModel.insert({
        seminarId: seminarId,
        reportName: "financial_report",
        reportData: financialReportAssembler.getFinancialReport(allResults)
    })
}

function initProfitabilityEvolutionReport(seminarId, allResults, period){
    return reportModel.insert({
        seminarId: seminarId,
        reportName: "profitability_evolution",
        reportData: profitabilityEvolutionReportAssembler.getProfitabilityEvolutionReport(allResults, period)
    })
}

function initSegmentDistributionReport(seminarId, allResults){
    let queries = [];
    allResults.forEach(function(onePeriodResult){
        queries.push(cgiapi.getExogenous(onePeriodResult.period));
    })
    return Q.all(queries)
    .then(function(allExogenous){
        return reportModel.insert({
            seminarId: seminarId,
            reportName: "segment_distribution",
            reportData: segmentDistributionReportAssembler.getSegmentDistributionReport(allResults, allExogenous)
        })
    });
}

function initCompetitorIntelligenceReport(seminarId, allResults){
    return reportModel.insert({
        seminarId: seminarId,
        reportName: 'competitor_intelligence',
        reportData: competitorIntelligenceReportAssembler.getCompetitorIntelligenceReport(allResults)
    })
}

function initMarketTrendsReport(seminarId, allResults, period){
    return reportModel.insert({
        seminarId: seminarId,
        reportName: 'market_trends',
        reportData: marketTrendsReportAssembler.getMarketTrendsReport(allResults, period)
    })
}

function initMarketIndicatorReport(seminarId, currentPeriod){
    return cgiapi.getExogenous(currentPeriod)
    .then(function(exogenouse){
        if(!exogenouse || exogenouse.message){
            throw {message: 'Cancel promise chains. Because ' + exogenouse.message};
        }

        return reportModel.insert({
            seminarId: seminarId,
            reportName: 'market_indicators',
            reportData: marketIndicatorsReportAssembler.getMarketIndicators(exogenouse)
        });
    });
}

*/


function reset(variable) {

    switch (typeof variable) {
        case "object":
            for (var key in variable) {
                if (!variable.hasOwnProperty(key)) {
                    continue;
                }

                var prop = variable[key];
                var type = typeof prop;

                if (type !== "object" && type !== "array") {
                    variable[key] = type === 'number' ? 0 : '';

                } else {
                    if (key === '_id') {
                        delete variable._id;
                    } else if (key === '__v') {
                        delete variable.__v;
                    } else {
                        reset(prop);
                    }
                }

            }

            break;

        case "array":
            for (var i = 0, len = variable.length; i < len; i++) {
                reset(variable[i]);
            }

            break;

    }

}

function duplicateLastPeriodDecision(seminarId, lastPeriod) {

    return companyDecisionModel.findAllInPeriod(seminarId, lastPeriod)
    .then(function(allCompanyDecision){
        let p = Q('init');


        let emptyCompanyDecision = allCompanyDecision[0].toObject();

        delete emptyCompanyDecision._id;
        delete emptyCompanyDecision.__v;

        reset(emptyCompanyDecision);

        allCompanyDecision.forEach(function(companyDecision){
            
            let tempCompanyDecision = clone(emptyCompanyDecision);

            tempCompanyDecision.period = companyDecision.period + 1;
            tempCompanyDecision.seminarId = companyDecision.seminarId;
            tempCompanyDecision.d_CID = companyDecision.d_CID;
            tempCompanyDecision.d_CompanyName = companyDecision.d_CompanyName;


            p = p.then(function (result) {
                
                if(!result){
                    throw {message: "Cancel promise chains. Because save comanyDecision failed during create copy of last period decision."};
                }

                return companyDecisionModel.save(tempCompanyDecision);
            })
        })

        return p;
    })
    .then(function(result){
        if(!result){
            throw {message: "save comanyDecision failed during create copy of last period decision."};
        }

        /*
        return brandDecisionModel.findAllInPeriod(seminarId, lastPeriod)
        .then(function(allBrandDecision){
            let p = Q('init');
            allBrandDecision.forEach(function(brandDecision){
                let tempBrandDecision = brandDecision.toObject();

                delete tempBrandDecision._id;
                delete tempBrandDecision.__v;
                tempBrandDecision.period = tempBrandDecision.period + 1;
                tempBrandDecision.d_SalesForce = 0;
                p = p.then(function(result){
                    if(!result){
                        throw {message: "Cancel promise chains. Because save brandDecision failed during create copy of last period decision."};
                    }
                    return brandDecisionModel.initCreate(tempBrandDecision);
                })
            })
            return p;
        })
    })
    .then(function(result){
        if(!result){
            throw {message: "Cancel promise chains. Because save comanyDecision failed during create copy of last period decision."};
        }
        return SKUDecisionModel.findAllInPeriod(seminarId, lastPeriod)
        .then(function(allSKUDecision){
            let p = Q('init');
            allSKUDecision.forEach(function(SKUDecision){
                let tempSKUDecision = JSON.parse(JSON.stringify(SKUDecision));

                delete tempSKUDecision._id;
                delete tempSKUDecision.__v;

                //Make sure to copy all the field instead of field listed below:
                tempSKUDecision.period = tempSKUDecision.period + 1;
                tempSKUDecision.d_Advertising = 0;
                tempSKUDecision.d_AdditionalTradeMargin = 0;
                tempSKUDecision.d_ProductionVolume = 0;
                tempSKUDecision.d_PromotionalBudget = 0;
                tempSKUDecision.d_TradeExpenses = 0;
                tempSKUDecision.d_WholesalesBonusRate = 0;
                tempSKUDecision.d_WholesalesBonusMinVolume = 0;

                p = p.then(function(result){
                    if(!result){
                        {message: "Cancel promise chains. Because save SKUDecision failed during create copy of last period decision."};
                    }
                    return SKUDecisionModel.initCreate(tempSKUDecision);
                })
            })

            return p;
        })*/

        return result;
    })
}

/*

//createNewDecisionBasedOnLastPeriodDecision
//a) copy previous to current except dropped SKUs/Brands
//b) clean array brandDecisions.d_SKUsDecisions
//c) clean array companyDecisions.d_BrandsDecisions
/*
function createNewDecisionBasedOnLastPeriodDecision(seminarId, lastPeriod, decisionsOverwriteSwitchers, goingToNewPeriod){
    let discontinuedSKUId = [];
    let discontinuedBrandId = [];

    return SKUDecisionModel.findAllInPeriod(seminarId, lastPeriod)
        .then(function(allSKUDecision){
            discontinuedSKUId = [];
            discontinuedBrandId = [];

            let p = Q('init');
            allSKUDecision.forEach(function(SKUDecision){
                let tempSKUDecision = JSON.parse(JSON.stringify(SKUDecision));

                if(tempSKUDecision.d_ToDrop){
                    discontinuedSKUId.push(tempSKUDecision.d_SKUID);
                } else {
                    delete tempSKUDecision._id;
                    delete tempSKUDecision.__v;
                    //Make sure to copy all the field instead of field listed below:
                    tempSKUDecision.period = tempSKUDecision.period + 1;
                    tempSKUDecision.d_Advertising = 0;
                    tempSKUDecision.d_AdditionalTradeMargin = 0;
                    tempSKUDecision.d_ProductionVolume = 0;
                    tempSKUDecision.d_PromotionalBudget = 0;
                    tempSKUDecision.d_TradeExpenses = 0;
                    tempSKUDecision.d_WholesalesBonusRate = 0;
                    tempSKUDecision.d_WholesalesBonusMinVolume = 0;

                    //only when admin turn on the overwrite switchers, delete old & generate new decision for next period
                    if(decisionsOverwriteSwitchers[tempSKUDecision.d_CID - 1]){
                        p = p.then(function(result){
                            if(!result){
                                throw {message: "Cancel promise chains. Because save SKUDecision failed during create copy of last period decision."};
                            }
                            tempSKUDecision.reRunLastRound = !goingToNewPeriod;
                            return SKUDecisionModel.createSKUDecisionBasedOnLastPeriodDecision(tempSKUDecision);
                        })
                    }
                }
            })
            return p;
    })
    .then(function(result){
        if(!result){
            throw {message: "Cancel promise chains. Because save comanyDecision failed during create copy of last period decision."};
        }
        return brandDecisionModel.findAllInPeriod(seminarId, lastPeriod)
        .then(function(allBrandDecision){
            let p = Q('init');
            allBrandDecision.forEach(function(brandDecision){
                let tempBrandDecision = JSON.parse(JSON.stringify(brandDecision));

                tempBrandDecision.d_SKUsDecisions = _.difference(tempBrandDecision.d_SKUsDecisions, discontinuedSKUId);
                if(tempBrandDecision.d_SKUsDecisions.length == 0){
                    discontinuedBrandId.push(tempBrandDecision.d_BrandID);
                } else {
                    delete tempBrandDecision._id;
                    delete tempBrandDecision.__v;
                    tempBrandDecision.period = tempBrandDecision.period + 1;
                    tempBrandDecision.d_SalesForce = 0;
                    //only when admin turn on the overwrite switchers, delete old & generate new decision for next period
                    if(decisionsOverwriteSwitchers[tempBrandDecision.d_CID - 1]){
                        p = p.then(function(result){
                            if(!result){
                                throw {message: "Cancel promise chains. Because save brandDecision failed during create copy of last period decision."};
                            }
                            tempBrandDecision.reRunLastRound = !goingToNewPeriod;
                            return brandDecisionModel.createBrandDecisionBasedOnLastPeriodDecision(tempBrandDecision);
                        })
                    }
                }

            })
            return p;
        })
    }).then(function(result){
        return companyDecisionModel.findAllInPeriod(seminarId, lastPeriod)
        .then(function(allCompanyDecision){
            let p = Q('init');
            allCompanyDecision.forEach(function(companyDecision){
                let tempCompanyDecision = JSON.parse(JSON.stringify(companyDecision));

                delete tempCompanyDecision._id;
                delete tempCompanyDecision.__v;

                if(companyDecision.bs_AdditionalBudgetApplicationCounter >= 2){
                    tempCompanyDecision.bs_BlockBudgetApplication = true;
                } else {
                    tempCompanyDecision.bs_BlockBudgetApplication = false;
                }

                tempCompanyDecision.d_BrandsDecisions = _.difference(tempCompanyDecision.d_BrandsDecisions, discontinuedBrandId);
                tempCompanyDecision.period = tempCompanyDecision.period + 1;
                tempCompanyDecision.d_RequestedAdditionalBudget = 0;
                tempCompanyDecision.d_IsAdditionalBudgetAccepted = false;
                tempCompanyDecision.d_InvestmentInServicing = 0;
                tempCompanyDecision.d_InvestmentInEfficiency = 0;
                tempCompanyDecision.d_InvestmentInTechnology = 0;

                //only when admin turn on the overwrite switchers, delete old & generate new decision for next period
                if(decisionsOverwriteSwitchers[tempCompanyDecision.d_CID - 1]){
                    p = p.then(function(result){
                        if(!result){
                            throw {message: "Cancel promise chains. Because save comanyDecision failed during create copy of last period decision."};
                        }
                        tempCompanyDecision.reRunLastRound = !goingToNewPeriod;
                        return companyDecisionModel.save(tempCompanyDecision);
                    })
                }


            })
            return p;
        })
    })

}*/