"use strict";
var seminarModel = require('../../models/Seminar');
var Scenario = require('../../models/scenario/Scenario');
var reportModel = require('../../models/simulation/Report');
var chartModel = require('../../models/simulation/Chart');
var companyDecisionModel = require('../../models/decision/CompanyDecision');
var simulationResultModel = require('../../models/simulation/Result');
/*var brandDecisionModel = require('../../../models/marksimos/brandDecision.js');
var SKUDecisionModel = require('../../../models/marksimos/SKUDecision.js');
*/
var dbutility = require('../../models/dbUtility');
var decisionCleaner = require('../../convertors/decisionCleaner');
var allResultsCleaner = require('../../convertors/allResultsCleaner');
var chartAssembler = require('../../assemblers/chart');
var SimMain = require('../../../kernel/app');
var Flat = require('../../utils/Flat');
var Utils = require('../../../kernel/utils/Utils');
var console = require('../../../kernel/utils/logger');
var utility = require('../../utils/utility');
var _ = require('underscore');
var Q = require('q');
var http = require('http');
var util = require('util');
var oneHour = 60 * 60 * 1000;
/**
 * Initialize game data, only certain perople can call this method
 *
 * @method init
 *
 */
global.debug_data.SimMain = SimMain;
function init(io) {
    var status;
    return function (req, res, next) {
        if (status == 'pending') {
            return res.status(404).json({ message: 'Service is locked by other process, please wait for seconds...' });
        }
        else {
            status = 'pending';
            var seminarResult_1;
            var seminarId_1 = req.params.seminar_id;
            var simulation_span_1;
            var company_num_1;
            var currentPeriod_1;
            var simulationScenarioID_1;
            var companies_1;
            var hists = void 0;
            if (!seminarId_1) {
                status = 'active';
                return res.status(400).json({ message: "seminarId cannot be empty." });
            }
            io.sockets.emit('AdminProcessLog', {
                msg: 'Start calling Initialize.DLL...',
                isError: false
            });
            seminarModel.findOneQ({ seminarId: seminarId_1 }).then(function (dbSeminar) {
                if (!dbSeminar) {
                    status = 'active';
                    throw { message: "Cancel promise chains. Because seminar doesn't exist." };
                }
                if (dbSeminar.currentPeriod !== 1) {
                    status = 'active';
                    throw { message: "Cancel promise chains. Because initialize a seminar that already starts." };
                }
                seminarResult_1 = dbSeminar;
                //before init, a new seminar should be created,
                //and it's currentPeriod should be set correctly = 1
                currentPeriod_1 = dbSeminar.currentPeriod;
                simulation_span_1 = dbSeminar.simulation_span;
                company_num_1 = dbSeminar.company_num;
                simulationScenarioID_1 = dbSeminar.simulationScenarioID;
                //create company array
                companies_1 = dbSeminar.companies || utility.createCompanyArray(company_num_1);
                return Q.all([
                    simulationResultModel.removeAll(seminarId_1),
                    dbutility.removeExistedDecisions(seminarId_1),
                    chartModel.remove(seminarId_1),
                    reportModel.remove(seminarId_1)
                ])
                    .then(function () {
                    return loadScenario(simulationScenarioID_1);
                })
                    .then(function (hists) {
                    return Q.all([
                        initSimulationResult(seminarId_1, companies_1, hists),
                        initDecision(seminarId_1, companies_1, hists),
                    ]);
                })
                    .then(function () {
                    return Q.all([
                        simulationResultModel.findAll(seminarId_1)
                    ])
                        .spread(function (allResults) {
                        return Q.all([]);
                    });
                })
                    .then(function () {
                    //copy decision of period (currentPeriod - 1 = 0)
                    //    return undefined;
                    return duplicateLastPeriodDecision(seminarId_1, currentPeriod_1 - 1);
                })
                    .then(function () {
                    seminarResult_1.isInitialized = true;
                    if (seminarResult_1.roundTime.length > 0) {
                        seminarResult_1.roundTime[0].startTime = new Date();
                        if (seminarResult_1.roundTime[0].roundTimeHour !== 0) {
                            seminarResult_1.roundTime[0].endTime = new Date(new Date().getTime() + oneHour * seminarResult_1.roundTime[0].roundTimeHour);
                        }
                    }
                    return seminarResult_1.saveQ();
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
exports.init = init;
function runSimulation() {
    var status;
    return function (req, res, next) {
        if (status == 'pending') {
            return res.send(400, { message: "Last request is still pending, please wait for runSimulation process complete..." });
        }
        else {
            status = 'pending';
            var seminarId_2 = req.params.seminar_id;
            var goingToNewPeriod_1 = req.body.goingToNewPeriod;
            var decisionsOverwriteSwitchers_1 = req.body.decisionsOverwriteSwitchers || [];
            var selectedPeriod_1;
            if (!seminarId_2) {
                status = 'active';
                return res.send(400, { message: "You have not choose a seminar." });
            }
            if (goingToNewPeriod_1 == undefined) {
                status = 'active';
                return res.send(400, { message: "Which period need to run?" });
            }
            if ((decisionsOverwriteSwitchers_1 == [])) {
                status = 'active';
                return res.send(400, { message: 'need parameter decisionsOverwriteSwitchers' });
            }
            //check if this seminar exists
            seminarModel.findOneQ({
                seminarId: seminarId_2
            })
                .then(function (dbSeminar) {
                if (!dbSeminar) {
                    throw { message: "Cancel promise chains. Because seminar doesn't exist." };
                }
                if (!dbSeminar.isInitialized) {
                    throw { message: "Cancel promise chains. Because you have not initialized this seminar." };
                }
                //if all rounds are executed
                if (dbSeminar.isSimulationFinished) {
                    throw { message: "the last round simulation has been executed." };
                }
                if (goingToNewPeriod_1) {
                    selectedPeriod_1 = dbSeminar.currentPeriod;
                    decisionsOverwriteSwitchers_1 = [];
                    for (var i = 0; i < dbSeminar.company_num; i++) {
                        decisionsOverwriteSwitchers_1.push(true);
                    }
                }
                else {
                    selectedPeriod_1 = dbSeminar.currentPeriod - 1;
                    if (decisionsOverwriteSwitchers_1.length != dbSeminar.company_num) {
                        throw { message: "Cancel promise chains. Because Incorrect parameter decisionsOverwriteSwitchers in the post request." };
                    }
                }
                var companies = [];
                for (var i = 0; i < dbSeminar.company_num; i++) {
                    companies.push(i + 1);
                }
                // simulate env
                return simulationResultModel.findAllBefore(seminarId_2, selectedPeriod_1 - 1).then(function (lastResults) {
                    if (!lastResults.length) {
                        throw { message: "Cancel promise chains. Because Incorrect parameter decisionsOverwriteSwitchers in the post request." };
                    }
                    var envLastStates = [];
                    var lastCompaniesResults = [];
                    var currPeriodDecisions = [];
                    lastResults.forEach(function (result) {
                        var envState = result.environnement;
                        var compsStates = result.companies;
                        envState.period = result.period;
                        envLastStates.push(envState);
                        lastCompaniesResults.push(compsStates);
                    });
                    global.debug_data.envLastStates = envLastStates;
                    global.debug_data.lastCompaniesResults = lastCompaniesResults;
                    /*
                     *  init simulation and simulate environnement
                     */
                    SimMain.launchSim();
                    console.silly("launch sim success !");
                    SimMain.initEnvironnemet(selectedPeriod_1, envLastStates);
                    console.silly("init env success !");
                    SimMain.simulateEnv(selectedPeriod_1);
                    console.silly("sim env success !");
                    return companyDecisionModel.findAllBeforePeriod(seminarId_2, selectedPeriod_1).then(function (allCompaniesDecision) {
                        global.debug_data.allCompaniesDecision = allCompaniesDecision;
                        allCompaniesDecision.forEach(function (data) {
                            var d_CID = data._id;
                            var decisions = [];
                            var lastResults = [];
                            lastCompaniesResults.forEach(function (data) {
                                var res = data[d_CID - 1];
                                lastResults.push(res);
                            });
                            data.decisions.forEach(function (obj) {
                                decisions.push(obj.decision);
                            });
                            var currPDecision = decisions.pop();
                            currPeriodDecisions.push(currPDecision);
                            global.debug_data.d_CID = d_CID;
                            global.debug_data.selectedPeriod = selectedPeriod_1;
                            global.debug_data.decisions = decisions;
                            global.debug_data.lastResults = lastResults;
                            global.debug_data.envLastStates = envLastStates;
                            global.debug_data.currPDecision = currPDecision;
                            /*
                             *  restore last state and set companies decisions
                             */
                            SimMain.initialize(d_CID, selectedPeriod_1, decisions, lastResults, envLastStates);
                            console.silly("sim init success !");
                            SimMain.setDecisions(d_CID, selectedPeriod_1, currPDecision);
                            console.warn("sim set decision success !", d_CID);
                        });
                        /*
                        *  simulate the market to get sells
                        */
                        SimMain.simulateMarketplace();
                        console.silly("sim market sim success !");
                        return currPeriodDecisions;
                    }).then(function (currPeriodDecisions) {
                        /*
                        *  get simulation environnement result
                        */
                        return SimMain.getEnvironnementState().then(convertEndState).then(function (envSimResult) {
                            if (!envSimResult) {
                                throw new Error('process envSimResult failed nothing got');
                            }
                            var p = Q();
                            var currPeriodResult = {
                                environnement: envSimResult,
                                companies: []
                            };
                            /*
                            *  get simulation companies results and generate flat report
                            */
                            companies.forEach(function (d_CID) {
                                p = p.then(function (result) {
                                    var deferred = Q.defer();
                                    processEndState(d_CID, selectedPeriod_1).then(function (playerEndState) {
                                        if (!playerEndState) {
                                            throw new Error('process end state failed nothing got');
                                        }
                                        currPeriodResult.companies.push(playerEndState);
                                        deferred.resolve(currPeriodResult);
                                    });
                                    return deferred.promise;
                                });
                            });
                            /*
                            *  generate BI report
                            */
                            return p.then(function (simulationResult) {
                                var deferred = Q.defer();
                                prepareBI(simulationResult, currPeriodDecisions).then(function (finalisedCompanyResults) {
                                    if (!finalisedCompanyResults) {
                                        throw new Error('finalisedCompanyResults failed nothing got');
                                    }
                                    deferred.resolve(finalisedCompanyResults);
                                });
                                return deferred.promise;
                            });
                        });
                    });
                }).then(function (simulationResult) {
                    console.log('run simulation finished.');
                    global.debug_data.simulationResult = simulationResult;
                    if (!simulationResult) {
                        throw { message: 'Cancel promise chains. Because no simulationResult' };
                    }
                    return Q.all([
                        removeCurrentPeriodSimulationResult(seminarId_2, selectedPeriod_1),
                        chartModel.remove(seminarId_2),
                        reportModel.remove(seminarId_2)
                    ]).then(function () {
                        console.log('get current period simulation result finished.');
                        //once removeCurrentPeriodSimulationResult success,
                        //query and save the current period simulation result
                        return initCurrentPeriodSimulationResult(seminarId_2, selectedPeriod_1, simulationResult);
                    });
                }).then(function () {
                    return Q.all([
                        simulationResultModel.findAll(seminarId_2)
                    ]).spread(function (allResults) {
                        return Q.all([]);
                    });
                }).then(function () {
                    console.log('generate report/chart finished.');
                    //for the last period OR re-run last period,
                    //DO NOT create the next period decision automatically
                    if (dbSeminar.currentPeriod < dbSeminar.simulation_span) {
                        status = 'active';
                        return createNewDecisionBasedOnLastPeriodDecision(seminarId_2, selectedPeriod_1, decisionsOverwriteSwitchers_1, goingToNewPeriod_1);
                    }
                    else {
                        return undefined;
                    }
                }).then(function () {
                    console.log('create duplicate decision from last period finished.');
                    if (goingToNewPeriod_1) {
                        if (dbSeminar.currentPeriod < dbSeminar.simulation_span) {
                        }
                        else if (dbSeminar.currentPeriod = dbSeminar.simulation_span) {
                            dbSeminar.isSimulationFinished = true;
                        }
                        else {
                            throw new Error('Cancel promise chains. Because dbSeminar.currentPeriod > dbSeminar.simulation_span, you cannot run into next period.');
                        }
                        if (dbSeminar.roundTime.length > 0) {
                            if (typeof dbSeminar.roundTime[dbSeminar.currentPeriod] !== 'undefined') {
                                dbSeminar.roundTime[dbSeminar.currentPeriod].startTime = new Date();
                                if (dbSeminar.roundTime[dbSeminar.currentPeriod].roundTimeHour !== 0) {
                                    dbSeminar.roundTime[dbSeminar.currentPeriod].endTime = new Date(new Date().getTime() + oneHour * dbSeminar.roundTime[dbSeminar.currentPeriod].roundTimeHour);
                                }
                            }
                        }
                        dbSeminar.currentPeriod = dbSeminar.currentPeriod + 1;
                        return dbSeminar.saveQ().then(function (result) {
                            if (result[1] > 1) {
                                throw new Error("Cancel promise chains. Because there's error during update seminar.");
                            }
                        });
                    }
                });
            })
                .then(function () {
                status = 'active';
                return res.status(200).send({ message: "run simulation success." });
            })
                .fail(function (err) {
                status = 'active';
                if (err.httpStatus) {
                    return res.send(err.httpStatus, { message: err.message });
                }
                res.status(500).send({ message: err.message });
            })
                .done();
        }
    };
}
exports.runSimulation = runSimulation;
function initCurrentPeriodSimulationResult(seminarId, currentPeriod, currentPeriodResult) {
    if (!currentPeriodResult) {
        throw { message: 'Cancel promise chains. Because no currentPeriodResult.' };
    }
    //allResultsCleaner.clean(currentPeriodResult);
    currentPeriodResult.seminarId = seminarId;
    currentPeriodResult.period = currentPeriod;
    return simulationResultModel.insert(currentPeriodResult);
}
function removeCurrentPeriodSimulationResult(seminarId, currentPeriod) {
    return simulationResultModel.remove({
        seminarId: seminarId,
        period: currentPeriod
    });
}
function submitDecisionForAllCompany(companies, period, seminarId) {
    var p = Q();
    companies.forEach(function (companyId) {
        p = p.then(function () {
            //console.log("submit decision finished.");
            return submitDecision(companyId, period, seminarId);
        });
    });
    return p;
}
function submitDecision(companyId, period, seminarId) {
    var result = {};
    console.log('Submit Decision For companyId:' + companyId + ', period:' + period + ', seminarId:' + seminarId);
    return companyDecisionModel.findOne(seminarId, period, companyId).then(function (decision) {
        if (!decision) {
            throw { message: "Cancel promise chains. Because decision doesn't exist." };
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
    }).then(function () {
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
    }
    return Scenario.loadScenario(simulationScenarioID);
}
/**
* @param {Array} periods array of periods
*/
function clone(obj) {
    if (null == obj || "object" != typeof obj)
        return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr))
            copy[attr] = obj[attr];
    }
    return copy;
}
function initDecision(seminarId, companies, initData) {
    var hists = initData.historiques;
    var tempDecisions = [];
    if (hists.length) {
        hists.forEach(function (data) {
            if (data.period > 0) {
                return;
            }
            companies.forEach(function (comp) {
                var decision = {
                    period: data.period,
                    seminarId: seminarId,
                    d_CID: comp.companyId,
                    d_CompanyName: comp.companyName,
                    decision: clone(data.decision)
                };
                tempDecisions.push(decision);
            });
        });
    }
    return dbutility.saveDecision(seminarId, tempDecisions);
}
function cleanDecisions(allDecisions) {
    allDecisions.forEach(function (decision) {
        decisionCleaner.clean(decision);
    });
}
function initSimulationResult(seminarId, companies, initData) {
    var hists = initData.historiques;
    var allResults = [];
    if (hists.length) {
        hists.forEach(function (data) {
            var refResults = clone(data.results);
            var period = data.period;
            if (period > 0) {
                return;
            }
            var results = {
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
                var refCompResults = clone(data.results);
                results.c_CID = comp.companyId;
                results.c_CompanyName = comp.companyName;
                results.companies.push(refCompResults);
            });
            allResults.push(results);
        });
    }
    var saveOperations = [];
    for (var i = 0; i < allResults.length; i++) {
        saveOperations.push(simulationResultModel.insert(allResults[i]));
    }
    return Q.all(saveOperations);
}
function cleanAllResults(allResults) {
    allResults.forEach(function (onePeriodResult) {
        //remove useless data like empty SKU, company
        allResultsCleaner.clean(onePeriodResult);
    });
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
/**
 * @param {Object} allResults allResults of all periods
 */
function initChartData(seminarId, allResults) {
    var period = allResults[allResults.length - 1].period + 1;
    return Q.all([
        seminarModel.findOneQ({ seminarId: seminarId }),
    ])
        .spread(function (seminar, exogenous) {
        //generate charts from allResults
        var chartData = chartAssembler.extractChartData(allResults, {
            simulation_span: seminar.simulation_span,
            exogenous: exogenous
        });
        return chartModel.insert({
            seminarId: seminarId,
            charts: chartData
        });
    });
}
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
                }
                else {
                    if (key === '_id') {
                        delete variable._id;
                    }
                    else if (key === '__v') {
                        delete variable.__v;
                    }
                    else {
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
        .then(function (allCompanyDecision) {
        var p = Q('init');
        var emptyCompanyDecision = allCompanyDecision[0].toObject().decision;
        reset(emptyCompanyDecision);
        allCompanyDecision.forEach(function (companyDecision) {
            var tempCompanyDecision = {
                period: companyDecision.period + 1,
                seminarId: companyDecision.seminarId,
                d_CID: companyDecision.d_CID,
                d_CompanyName: companyDecision.d_CompanyName,
                decision: clone(emptyCompanyDecision)
            };
            p = p.then(function (result) {
                if (!result) {
                    throw { message: "Cancel promise chains. Because save comanyDecision failed during create copy of last period decision." };
                }
                return companyDecisionModel.save(tempCompanyDecision);
            });
        });
        return p;
    })
        .then(function (result) {
        if (!result) {
            throw { message: "save comanyDecision failed during create copy of last period decision." };
        }
        return result;
    });
}
/*
//createNewDecisionBasedOnLastPeriodDecision
//a) copy previous to current except dropped SKUs/Brands
//b) clean array brandDecisions.d_SKUsDecisions
//c) clean array companyDecisions.
*/
function createNewDecisionBasedOnLastPeriodDecision(seminarId, lastPeriod, decisionsOverwriteSwitchers, goingToNewPeriod) {
    return companyDecisionModel.findAllInPeriod(seminarId, lastPeriod)
        .then(function (allCompanyDecision) {
        var p = Q('init');
        allCompanyDecision.forEach(function (companyDecision) {
            var decision = companyDecision.toObject().decision;
            //reset(decision);
            var tempCompanyDecision = {
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
    var deferred = Q.defer();
    if (!endState) {
        return deferred.reject(new Error("no endState"));
    }
    var result = Flat.unflatten(endState, {
        delimiter: "_"
    });
    deferred.resolve(result);
    return deferred.promise;
}
function processEndState(playerID, currPeriod) {
    var deferred = Q.defer();
    if (playerID === undefined || currPeriod === undefined) {
        return deferred.reject(new Error("Invalid argument playerId, currPeriod for processEndState"));
    }
    SimMain.getEndState(playerID, currPeriod).then(function (playerEndState) {
        if (!playerEndState) {
            return deferred.reject(new Error("Error at genereting endState"));
        }
        // flat report
        playerEndState["report"] = processFlatReport(playerEndState);
        var playerResults = Flat.unflatten(playerEndState, {
            delimiter: "_"
        });
        console.silly('player:' + playerID + ' endstats succes');
        deferred.resolve(playerResults);
    }).fail(function (err) {
        console.error(err);
        deferred.reject(err);
    }).done();
    function processFlatReport(playerEndState) {
        var flatReport = {};
        Object.keys(playerEndState).forEach(function (key) {
            var newKey = "res_" + key;
            flatReport[newKey] = playerEndState[key];
        });
        return flatReport;
    }
    return deferred.promise;
}
function prepareBI(simulationResult, allCompaniesDecs) {
    var deferred = Q.defer();
    setImmediate(function () {
        var companiesResults = simulationResult.companies;
        // BI
        var BI_free = getBIInfos(companiesResults, 0);
        var BI_corporateActivity = getBIInfos(companiesResults, 1);
        var BI_marketShares = getBIInfos(companiesResults, 2);
        var i = 0;
        var len = companiesResults.length;
        for (; i < len; i++) {
            var playerEndState = companiesResults[i];
            var decision = allCompaniesDecs[i];
            var isCorporateActivityOrdered = decision.orderCorporateActivityInfo;
            var areMarketSharesOrdered = decision.orderMarketSharesInfo;
            playerEndState.report = Utils.ObjectApply(playerEndState.report, BI_free);
            if (isCorporateActivityOrdered) {
                playerEndState.report = Utils.ObjectApply(playerEndState.report, BI_corporateActivity);
            }
            if (areMarketSharesOrdered) {
                playerEndState.report = Utils.ObjectApply(playerEndState.report, BI_marketShares);
            }
            companiesResults[i] = playerEndState;
        }
        simulationResult.companies = companiesResults;
        deferred.resolve(simulationResult);
    });
    return deferred.promise;
}
function getBIInfos(results, includeInfoType) {
    var BI = {};
    var corporateActivityInfo = SimMain.getList_corporateActivityInfo();
    var freeInfo = SimMain.getList_freeInfo();
    results.forEach(function (res, idx) {
        var CID = idx + 1;
        var prefix = "res_BI_corporate" + CID + "_";
        BI[prefix + "playerID"] = CID;
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
            }
            else if (corporateActivityInfo.indexOf(property) !== -1) {
                if (includeInfoType !== 1) {
                    continue;
                }
            }
            else if (freeInfo.indexOf(property) !== -1 || property.indexOf("price") !== -1) {
                if (includeInfoType !== 0) {
                    continue;
                }
            }
            else {
                continue;
            }
            var newKey = prefix + splits.join("_");
            BI[newKey] = report[key];
        }
    });
    return BI;
}
//# sourceMappingURL=init.js.map