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


import SimMain = require('../../../kernel/app');


import Flat = require('../../utils/Flat');
import Utils = require('../../../kernel/utils/Utils');

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

global.debug_data.SimMain = SimMain;


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



export function runSimulation(){
    let status;

    return function(req, res, next){
        if(status == 'pending'){
            return res.send(400, {message: "Last request is still pending, please wait for runSimulation process complete..."})
        } else {
            status = 'pending';

            let seminarId = req.params.seminar_id;
            let goingToNewPeriod = req.body.goingToNewPeriod;
            let decisionsOverwriteSwitchers = req.body.decisionsOverwriteSwitchers || [];

            let selectedPeriod;

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
                    for(let i=0; i<dbSeminar.company_num; i++){
                        decisionsOverwriteSwitchers.push(true);
                    }
                } else {
                    selectedPeriod = dbSeminar.currentPeriod - 1;

                    if(decisionsOverwriteSwitchers.length != dbSeminar.company_num){
                        throw {message: "Cancel promise chains. Because Incorrect parameter decisionsOverwriteSwitchers in the post request."}
                    }

                }

                let companies = [];
                for(let i = 0 ; i< dbSeminar.company_num; i++){
                    companies.push(i+1);
                }


                // simulate env
                return simulationResultModel.findAllBefore(seminarId, selectedPeriod - 1).then(function (lastResults) {
                    if (!lastResults.length) {
                        throw { message: "Cancel promise chains. Because Incorrect parameter decisionsOverwriteSwitchers in the post request." }
                    }

                    let envLastStates = [];
                    let lastCompaniesResults = [];

                    lastResults.forEach(function (result) {
                        let envState = result.environnement;
                        let compsStates = result.companies;

                        envState.period = result.period;

                        envLastStates.push(envState);
                        lastCompaniesResults.push(compsStates);
                    });

                    global.debug_data.envLastStates = envLastStates;
                    global.debug_data.lastCompaniesResults = lastCompaniesResults;

                    SimMain.launchSim();
                    console.silly("launch sim success !");

                    SimMain.initEnvironnemet(selectedPeriod, envLastStates);
                    console.silly("init env success !");

                    SimMain.simulateEnv(selectedPeriod);
                    console.silly("sim env success !");


                    // export all decisions grouped by period desc
                    return companyDecisionModel.findAllBeforePeriod(seminarId, selectedPeriod).then(function (allCompaniesDecision) {
                        global.debug_data.allCompaniesDecision = allCompaniesDecision;

                        allCompaniesDecision.forEach(function (data) {
                            let d_CID = data._id;

                            console.warn("sim begin with ", d_CID);

                            let decisions = [];
                            let lastResults = [];

                            lastCompaniesResults.forEach(function (data) {
                                let res = data[d_CID - 1];

                                console.warn(d_CID - 1);
                                global.debug_data.dataBBB = data;

                                lastResults.push(res);
                            });

                            data.decisions.forEach(function (obj) {
                                decisions.push(obj.decision);
                            });

                            let currPDecision = decisions.pop();

                            global.debug_data.d_CID = d_CID;
                            global.debug_data.selectedPeriod = selectedPeriod;
                            global.debug_data.decisions = decisions;
                            global.debug_data.lastResults = lastResults;
                            global.debug_data.envLastStates = envLastStates;
                            global.debug_data.currPDecision = currPDecision;


                            SimMain.initialize(d_CID, selectedPeriod, decisions, lastResults, envLastStates);
                            console.silly("sim init success !");

                            SimMain.setDecisions(d_CID, selectedPeriod, currPDecision);
                            console.warn("sim set decision success !", d_CID);

                        });

                        console.silly("sim market begin !");
                        SimMain.simulateMarketplace();
                        console.silly("sim market sim success !");

                    }).then(function () {

                        return SimMain.getEnvironnementState().then(convertEndState).then(function (envSimResult) {

                            if (!envSimResult) {
                                throw new Error('process envSimResult failed nothing got');
                            }

                            global.debug_data.envSimResult = envSimResult;


                            let p = Q();

                            let currPeriodResult = {
                                environnement: envSimResult,
                                companies: []
                            };


                            companies.forEach(function (d_CID) {
                                p = p.then(function (result) {

                                    let deferred = Q.defer();

                                    processEndState(d_CID, selectedPeriod).then(function (playerEndState) {

                                        if (!playerEndState) {
                                            throw new Error('process end state failed nothing got');
                                        }

                                        currPeriodResult.companies.push(playerEndState);

                                        deferred.resolve(currPeriodResult);

                                    });


                                    return deferred.promise;
                                });


                            });


                            return p;

                        });

                   });

                }).then(function(simulationResult){
                    console.log('run simulation finished.');
                    global.debug_data.simulationResult = simulationResult;


                    if(!simulationResult){
                        throw {message: 'Cancel promise chains. Because no simulationResult'};
                    }

                    return Q.all([
                        removeCurrentPeriodSimulationResult(seminarId, selectedPeriod),
                        chartModel.remove(seminarId),
                        reportModel.remove(seminarId)

                    ]).then(function () {
                        console.log('get current period simulation result finished.');
                        //once removeCurrentPeriodSimulationResult success,
                        //query and save the current period simulation result
                        return initCurrentPeriodSimulationResult(seminarId, selectedPeriod, simulationResult);
                    });

                }).then(function(){
                    return Q.all([
                        simulationResultModel.findAll(seminarId)
                    ]).spread(function(allResults){
                        return Q.all([
                            /*initChartData(seminarId, allResults),
                            initCompanyStatusReport(seminarId, allResults, selectedPeriod),
                            initFinancialReport(seminarId, allResults),
                            initProfitabilityEvolutionReport(seminarId, allResults, selectedPeriod),
                            initSegmentDistributionReport(seminarId, allResults),
                            initCompetitorIntelligenceReport(seminarId, allResults),
                            initMarketTrendsReport(seminarId, allResults, selectedPeriod),
                            initMarketIndicatorReport(seminarId, selectedPeriod)*/
                        ]);
                    });

                }).then(function(){
                    console.log('generate report/chart finished.');

                    //for the last period OR re-run last period,
                    //DO NOT create the next period decision automatically
                    if(dbSeminar.currentPeriod < dbSeminar.simulation_span){
                        status = 'active';
                        return createNewDecisionBasedOnLastPeriodDecision(seminarId, selectedPeriod, decisionsOverwriteSwitchers, goingToNewPeriod);
                    } else {
                        return undefined;
                    }

                }).then(function (){
                    console.log('create duplicate decision from last period finished.');

                    if (goingToNewPeriod) {

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



function initCurrentPeriodSimulationResult(seminarId, currentPeriod, currentPeriodResult){
    if (!currentPeriodResult) {
        throw { message: 'Cancel promise chains. Because no currentPeriodResult.' };
    }

    //allResultsCleaner.clean(currentPeriodResult);

    currentPeriodResult.seminarId = seminarId;
    currentPeriodResult.period = currentPeriod;

    return simulationResultModel.insert(currentPeriodResult);
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
            //console.log("submit decision finished.");
            return submitDecision(companyId, period, seminarId);
        });
    });

    return p;
}


function submitDecision(companyId, period, seminarId){
    let result: any = {};

    console.log('Submit Decision For companyId:' + companyId + ', period:' + period + ', seminarId:' + seminarId);

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

        result.decision = decision.decision;


       

    }).then(function(){
        /*if(Object.keys(result).length===0){
            return res.send(500, {message: "fail to get decisions"})
        }

        //insertEmptyBrandsAndSKUs(result);
        //convert result to data format that can be accepted by CGI service

        decisionConvertor.convert(result);


        let reqUrl = url.resolve(config.cgiService, 'decisions.exe');

        //console.log(require('util').inspect(result.d_BrandsDecisions));
        return request.post(reqUrl, {
            decision: JSON.stringify(result),
            seminarId: seminarId,
            period: period,
            team: companyId
        });*/
    });


    
}



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
                let decision = {
                    period: data.period,
                    seminarId: seminarId,
                    d_CID: comp.companyId,
                    d_CompanyName: comp.companyName,
                    decision: clone(data.decision)
                }; 

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
            let refResults = clone(data.results);
            let period = data.period;

            if (period > 0) {
                return;
            }


            let results: any = {
                period: period,
                seminarId: seminarId,
                
            };


            results.environnement = {
                economies: refResults.economies,
                materialMarkets: refResults.materialMarkets,
                buildingContractors: refResults.buildingContractors,
                businessReport: refResults.businessReport,
                BI: refResults.BI
            };


            results.companies = [];

            companies.forEach(function (comp) {
                let refCompResults = clone(data.results)

                results.d_CID = comp.companyId;
                results.d_CompanyName = comp.companyName;
                
                results.companies.push(refCompResults);
            });


            allResults.push(results);

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


        let emptyCompanyDecision = allCompanyDecision[0].toObject().decision;

        reset(emptyCompanyDecision);

        allCompanyDecision.forEach(function(companyDecision){
           

            let tempCompanyDecision = {

                period: companyDecision.period + 1,
                seminarId: companyDecision.seminarId,
                d_CID: companyDecision.d_CID,
                d_CompanyName: companyDecision.d_CompanyName,

                decision: clone(emptyCompanyDecision)
            };

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

        return result;
    })
}

/*
//createNewDecisionBasedOnLastPeriodDecision
//a) copy previous to current except dropped SKUs/Brands
//b) clean array brandDecisions.d_SKUsDecisions
//c) clean array companyDecisions.
*/

function createNewDecisionBasedOnLastPeriodDecision(seminarId, lastPeriod, decisionsOverwriteSwitchers, goingToNewPeriod){

    return companyDecisionModel.findAllInPeriod(seminarId, lastPeriod)
    .then(function (allCompanyDecision) {
        let p = Q('init');

        allCompanyDecision.forEach(function (companyDecision) {
            let decision = companyDecision.toObject().decision;
            //reset(decision);


            let tempCompanyDecision: any = {

                period: companyDecision.period + 1,
                seminarId: companyDecision.seminarId,
                d_CID: companyDecision.d_CID,
                d_CompanyName: companyDecision.d_CompanyName,

                decision: decision
            };

          
            /*
            if (companyDecision.bs_AdditionalBudgetApplicationCounter >= 2) {
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
            */

            //only when admin turn on the overwrite switchers, delete old & generate new decision for next period
            if (decisionsOverwriteSwitchers[tempCompanyDecision.d_CID - 1]) {
                p = p.then(function (result) {
                    if (!result) {
                        throw { message: "Cancel promise chains. Because save comanyDecision failed during create copy of last period decision." };
                    }

                    tempCompanyDecision.reRunLastRound = !goingToNewPeriod;

                    return companyDecisionModel.save(tempCompanyDecision);
                });
            }


        });

        return p;
    });

}



function convertEndState(endState) {
    let deferred = Q.defer();

    if (!endState) {
        return deferred.reject(new Error("no endState"));
    }


    let result = Flat.unflatten(endState, {
        delimiter: "_"
    });


    deferred.resolve(result);

    return deferred.promise;
}




function processEndState(playerID: number, currPeriod: number) {

    let deferred = Q.defer();

    if (playerID === undefined || currPeriod === undefined) {
        return deferred.reject(new Error("Invalid argument playerId, currPeriod for processEndState"));
    }


    SimMain.getEndState(playerID, currPeriod).then(function (playerEndState) {
        if (!playerEndState) {
            return deferred.reject(new Error("Error at genereting endState"));
        }


        // flat report
        playerEndState["report"] = processFlatReport(playerEndState);

        let playerResults = Flat.unflatten(playerEndState, {
            delimiter: "_"
        });

        console.silly('player:' + playerID + ' endstats succes');


        deferred.resolve(playerResults);

    }).fail(function (err) {
        console.error(err);

        deferred.reject(err);

    }).done();


    function processFlatReport(playerEndState: any) {
        let flatReport = {};

        Object.keys(playerEndState).forEach(function (key) {
            var newKey = "res_" + key;
            flatReport[newKey] = playerEndState[key];
        });

        return flatReport;
    }


    return deferred.promise;
}


/*
function prepareBI(finalResults: any[]) {

    let deferred = Q.defer();


    setImmediate(function () {
        // BI
        let BI_free: any = getBIInfos(finalResults, startFromPlayerID, 0);
        let BI_corporateActivity = getBIInfos(finalResults, startFromPlayerID, 1);
        let BI_marketShares = getBIInfos(finalResults, startFromPlayerID, 2);


        let i = 0;
        let len = finalResults.length;

        for (; i < len; i++) {
            let playerEndState: any = finalResults[i];

            let decision = currPData[i].decision;
            let isCorporateActivityOrdered = decision.orderCorporateActivityInfo;
            let areMarketSharesOrdered = decision.orderMarketSharesInfo;


            playerEndState.report = Utils.ObjectApply(playerEndState.report, BI_free);

            if (isCorporateActivityOrdered) {
                playerEndState.report = Utils.ObjectApply(playerEndState.report, BI_corporateActivity);
            }

            if (areMarketSharesOrdered) {
                playerEndState.report = Utils.ObjectApply(playerEndState.report, BI_marketShares);
            }

            finalResults[i] = playerEndState;
        }

        deferred.resolve(finalResults);

    });

    return deferred.promise;
}


function getBIInfos(results, startFromPlayerID, includeInfoType) {
    var BI = {};
    var playerID = startFromPlayerID;

    var corporateActivityInfo = SimMain.getList_corporateActivityInfo();
    var freeInfo = SimMain.getList_freeInfo();

    results.forEach(function (res, idx) {
        var prefix = "res_BI_corporate" + playerID + "_";

        BI[prefix + "playerID"] = playerID;


        var report = res.report;

        for (var key in report) {
            if (!report.hasOwnProperty(key)) {
                continue;
            }

            var splits = key.split("_");

            if (!splits) {
                continue;
            }

            // remove res or dec
            splits.shift();

            var property = splits[splits.length - 1];

            if (property === "marketVolumeShareOfSales") {

                if (includeInfoType !== 2) {
                    continue;
                }

            } else if (corporateActivityInfo.indexOf(property) !== -1) {
                if (includeInfoType !== 1) {
                    continue;
                }

            } else if (freeInfo.indexOf(property) !== -1 || property.indexOf("price") !== -1) {
                if (includeInfoType !== 0) {
                    continue;
                }

            } else {
                continue;
            }


            var newKey = prefix + splits.join("_");

            BI[newKey] = report[key];
        }

        ++playerID;
    });

    return BI;
}
*/