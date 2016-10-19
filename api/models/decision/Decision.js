"use strict";
var mongoose = require('mongoose-q')(require('mongoose'));
var _ = require('underscore');
var request = require('request');
var q = require('q');
var extraString = require("string");
var Utils = require('../../../kernel/utils/Utils');
var console = require('../../../kernel/utils/logger');
var Flat = require('../../utils/Flat');
var Excel = require('../../utils/ExcelUtils');
var decisionSchema = require('./CompanyDecSchema');
var Decision = mongoose.model('Decision', decisionSchema);
function getPlayerReportOrder(seminar, period, playerID) {
    var deferred = q.defer();
    Decision.findOne({
        seminar: seminar,
        period: period,
        playerID: playerID
    }, function (err, doc) {
        if (err) {
            deferred.reject({
                msg: err
            });
        }
        if (!doc) {
            deferred.reject({
                msg: 'cannot find matched doc. ' + 'playerID:' + playerID + '/seminar:' + seminar + '/period:' + period
            });
        }
        else {
            deferred.resolve(doc.marketResearchOrder);
        }
    });
    return deferred.promise;
}
exports.getPlayerReportOrder = getPlayerReportOrder;
function exportToJson(options) {
    var deferred = q.defer();
    var seminar = options.seminar;
    var period = parseInt(options.period);
    Decision.aggregate([{
            $match: {
                period: {
                    $lte: period
                },
                seminar: seminar,
            }
        },
        {
            $group: {
                _id: '$period',
                data: {
                    $push: "$$ROOT"
                }
            }
        },
        {
            $sort: {
                //period: -1, // asc
                playerID: 1 // asc
            }
        }
    ], function (err, docs) {
        if (err) {
            deferred.reject({
                msg: err,
                options: options
            });
        }
        if (!docs) {
            deferred.reject({
                msg: 'Export to json, cannot find matched doc.' + '/seminar:' + options.seminar + '/period:' + options.period
            });
        }
        else {
            docs.sort(function (a, b) {
                return a.data[0].period - b.data[0].period; // asc
            });
            deferred.resolve({
                msg: 'Export json done, period: ' + options.period,
                records: docs
            });
        }
    });
    return deferred.promise;
}
exports.exportToJson = exportToJson;
function exportToBinary(options) {
    var deferred = q.defer();
    var period = options.period;
    Decision.findOne({
        seminar: options.seminar,
        period: options.period,
        playerID: options.playerID
    }, function (err, doc) {
        if (err)
            deferred.reject({
                msg: err,
                options: options
            });
        if (!doc) {
            deferred.reject({
                msg: 'Export to binary, cannot find matched doc. ' + 'playerID:' + options.playerID + '/seminar:' + options.seminar + '/period:' + options.period
            });
        }
        else {
            //console.log(JSON.stringify(doc));
            request.post('http://' + options.cgiHost + ':' + options.cgiPort + options.cgiPath, {
                form: {
                    jsonData: JSON.stringify(doc)
                }
            }, function (error, response) {
                console.log('status:' + response.status);
                console.log('body:' + response.body);
                if (response.status === (500 || 404)) {
                    deferred.reject({
                        msg: 'Failed to export binary, get 500 from CGI server(POST action):' + JSON.stringify(options)
                    });
                }
                else {
                    deferred.resolve({
                        msg: 'Export binary done, producer: ' + options.playerID + ', period: ' + options.period
                    });
                }
            });
        }
    });
    return deferred.promise;
}
exports.exportToBinary = exportToBinary;
function addAllDecisions(options) {
    var deferred = q.defer();
    var startFrom = options.startFrom, endWith = options.endWith;
    (function processPeriod(currentPeriod) {
        Decision.update({
            seminar: options.seminar,
            period: options.period,
            playerID: options.playerID
        }, {
            decision: options.decision,
            //nextBudgetExtension: singleDecision.nextBudgetExtension,
            //approvedBudgetExtension: singleDecision.approvedBudgetExtension,
            marketResearchOrder: options.marketResearchOrder,
        }, {
            upsert: true
        }, function (err, numberAffected, raw) {
            if (err)
                deferred.reject({
                    msg: err,
                    options: options
                });
            if (currentPeriod > startFrom) {
                currentPeriod--;
                processPeriod(currentPeriod);
            }
            else {
                deferred.resolve({
                    msg: 'Decision(player:' + options.playerID + ', seminar:' + options.seminar + ') import done. from period ' + startFrom + ' to ' + endWith,
                    options: options
                });
            }
        });
    })(endWith);
    return deferred.promise;
}
exports.addAllDecisions = addAllDecisions;
function addDecisions(seminarId, periods, endWithPlayerID, raw) {
    var deferred = q.defer();
    var startFromPlayerID = 1;
    var docs = [];
    var rawRecordsNb;
    var isRepeatClone = false;
    if (raw instanceof Array) {
        rawRecordsNb = raw.length;
        console.log('yes');
    }
    else if (typeof raw === "object") {
        rawRecordsNb = 1;
        isRepeatClone = true;
    }
    console.warn('adding decision of period:', seminarId);
    var bulk = Decision.collection.initializeOrderedBulkOp();
    for (var ID = startFromPlayerID; ID <= endWithPlayerID; ID++) {
        periods.forEach(function (period) {
            console.log('adding decision of period:' + period + ' , ' + 'playerID:' + ID);
            var dec, res;
            if (isRepeatClone) {
                dec = raw.decision;
                res = raw.results;
            }
            else {
                var idx = (rawRecordsNb - 1) + period;
                dec = idx < rawRecordsNb ? raw[idx].decision : {};
                res = idx < rawRecordsNb ? raw[idx].results : {};
            }
            bulk.find({
                _id: seminarId,
                period: period,
                playerID: ID
            }).upsert().updateOne({
                $set: {
                    decision: dec,
                    results: res
                }
            });
        });
    }
    bulk.execute(function (err, result) {
        if (err) {
            deferred.reject({
                msg: err
            });
        }
        deferred.resolve({
            msg: 'empty decisions, seminar:' + seminarId + 'import done'
        });
    });
    return deferred.promise;
}
exports.addDecisions = addDecisions;
function addPeriodResults(options, raw) {
    var deferred = q.defer();
    var rawRecordsNb = raw.length;
    var startFromPlayerID = options.startFromPlayerID, endWithPlayerID = options.endWithPlayerID;
    (function __processPlayer(playerID) {
        var idx = playerID - 1;
        var results = idx < rawRecordsNb ? raw[idx] : {};
        console.log('process player ', playerID);
        Decision.update({
            seminar: options.seminar,
            period: options.period,
            playerID: playerID
        }, {
            $set: {
                results: results
            }
        }, {
            upsert: false,
            safe: false
        }, function (err, numberAffected, raw) {
            if (err) {
                deferred.reject({
                    msg: err,
                    options: options
                });
            }
            if (playerID < endWithPlayerID) {
                playerID++;
                __processPlayer(playerID);
            }
            else {
                console.log('Update results Player :' + playerID);
                deferred.resolve({
                    msg: 'Update results Player :' + playerID + ', seminar:' + options.seminar,
                    options: options
                });
            }
        });
    })(startFromPlayerID);
    return deferred.promise;
}
exports.addPeriodResults = addPeriodResults;
function getReportPurchaseStatus(req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        else {
            if (!doc) {
                res.send(404, 'Cannot find matched producer decision doc.');
            }
            else {
                res.send(200, doc.marketResearchOrder);
            }
        }
    });
}
exports.getReportPurchaseStatus = getReportPurchaseStatus;
function updateDecision(io) {
    return function (req, res, next) {
        var queryCondition = {
            seminar: req.body.seminar,
            period: req.body.period,
            playerID: req.body.playerID,
            behaviour: req.body.behaviour,
            value: req.body.value
        };
        var isUpdated = true;
        var index = 0;
        switch (queryCondition.behaviour) {
            case 'updateDecision':
                //doc.decision[queryCondition.additionalIdx] = queryCondition.value;
                console.log('update dec', queryCondition.value);
                break;
            default:
                isUpdated = false;
                res.send(404, 'cannot find matched query behaviour:' + queryCondition.behaviour);
                break;
        }
        if (!isUpdated) {
            return;
        }
        Decision.update({
            seminar: queryCondition.seminar,
            period: queryCondition.period,
            playerID: queryCondition.playerID
        }, {
            $set: {
                decision: queryCondition.value
            }
        }, {
            upsert: false
        }, function (err, numberAffected, raw) {
            if (err)
                return next(new Error(err));
            console.log('save updated, number affected:' + numberAffected);
            if (queryCondition.behaviour != "updateBudgetExtension" && numberAffected != 0 && queryCondition.behaviour != "updateExceptionalCost") {
                io.sockets.emit('socketIO:playerBaseChanged', {
                    period: queryCondition.period,
                    playerID: queryCondition.playerID,
                    seminar: queryCondition.seminar,
                    page: req.body.page
                });
            }
            res.send(200, 'mission complete!');
        });
    };
}
exports.updateDecision = updateDecision;
function getAllDecision(req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        else {
            if (!doc) {
                res.send(404, 'Cannot find matched player decision doc.');
            }
            else {
                res.header("Content-Type", "application/json; charset=UTF-8");
                res.statusCode = 200;
                res.send(doc);
            }
        }
    });
}
exports.getAllDecision = getAllDecision;
function exportToExcel(req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            console.error(err);
            return next(new Error(err));
        }
        if (!doc) {
            res.send(404, 'Cannot find matched player results doc.');
        }
        else {
            var options = {
                lang: req.params.lang
            };
            doc = doc.toObject();
            var aboutInfos = {
                "reportDate": (new Date()).toLocaleDateString(),
                "playerName": "Player " + doc.playerID,
                "playerID": doc.playerID,
                "seminar": doc.seminar,
                "scenarioID": doc.scenarioID,
                "periodYear": doc.periodYear,
                "periodQuarter": doc.periodQuarter,
                "period": doc.period
            };
            var fileName = extraString("Report {{seminar}}{{playerID}} - {{periodYear}}Q{{periodQuarter}}.xlsx").template(aboutInfos).s;
            var flattenDec = Flat.flatten(doc.decision, {
                delimiter: '_',
                prefix: 'dec'
            }, null, null);
            var flattenRes = doc.results.report || Flat.flatten(doc.results, {
                delimiter: '_',
                prefix: 'res'
            });
            var reportData = Utils.ObjectApply(aboutInfos, flattenDec, flattenRes);
            Excel.excelExport(reportData, options, function (err, binary) {
                if (err) {
                    console.error(err);
                    res.status(404).send('error exporting');
                    return false;
                }
                res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
                res.end(binary, 'binary');
            });
        }
    });
}
exports.exportToExcel = exportToExcel;
/*
 * TODO: show what to do
 */
//retailer get producerDecision about var
/*
export function  retailerGetProducerDecision = function (req, res, next) {
    var result = new Array();
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            res.send(404, 'cannot find the decision');
        } else {
            var categoryID = 0;
            if (req.params.brandName.substring(0, 1) == "E") {
                categoryID = 1;
            } else {
                categoryID = 2;
            }
            for (var i = 0; i < doc.proCatDecision[categoryID - 1].proBrandsDecision.length; i++) {
                if (doc.proCatDecision[categoryID - 1].proBrandsDecision[i].brandID != undefined && doc.proCatDecision[categoryID - 1].proBrandsDecision[i].brandID != 0 && doc.proCatDecision[categoryID - 1].proBrandsDecision[i].brandName == req.params.brandName) {
                    for (var j = 0; j < doc.proCatDecision[categoryID - 1].proBrandsDecision[i].proVarDecision.length; j++) {
                        if (doc.proCatDecision[categoryID - 1].proBrandsDecision[i].proVarDecision[j].varID != undefined && doc.proCatDecision[categoryID - 1].proBrandsDecision[i].proVarDecision[j].varID != 0 && doc.proCatDecision[categoryID - 1].proBrandsDecision[i].proVarDecision[j].varName == req.params.varName) {
                            result.push({
                                'composition': doc.proCatDecision[categoryID - 1].proBrandsDecision[i].proVarDecision[j].composition,
                                'currentPriceBM': doc.proCatDecision[categoryID - 1].proBrandsDecision[i].proVarDecision[j].currentPriceBM,
                                //'currentPriceEmall':doc.proCatDecision[categoryID-1].proBrandsDecision[i].proVarDecision[j].currentPriceEmall,
                                'nextPriceBM': doc.proCatDecision[categoryID - 1].proBrandsDecision[i].proVarDecision[j].nextPriceBM
                            });
                            break;
                        }
                    }
                    break;
                }
            }
            res.header("Content-Type", "application/json; charset=UTF-8");
            res.statusCode = 200;
            res.send(result);
        }
    })
}
*/
/*
export function  getProducerProductList = function (req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            console.log('cannot find matched doc...');
            res.send(404, {
                error: 'Cannot find matched doc...'
            });
        } else {
            var allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                return (obj.categoryID == req.params.categoryID);
            });
            var products = new Array();
            var count = 0;
            for (var i = 0; i < allProCatDecisions.length; i++) {
                for (var j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                    if (allProCatDecisions[i].proBrandsDecision[j] != undefined && allProCatDecisions[i].proBrandsDecision[j].brandID != undefined && allProCatDecisions[i].proBrandsDecision[j].brandID != 0) {
                        for (var k = 0; k < allProCatDecisions[i].proBrandsDecision[j].proVarDecision.length; k++) {
                            //edit for contract maybe have a bug
                            if (allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k] != undefined && allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID != undefined &&allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].isMadeForOnlineBeforeNego != true) {
                                //if(allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k]!=undefined&&allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID!=undefined&&allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID!=0){
                                products.push({
                                    'categoryID': req.params.categoryID,
                                    'brandName': allProCatDecisions[i].proBrandsDecision[j].brandName,
                                    'varName': allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varName,
                                    'brandID': allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].parentBrandID,
                                    'varID': allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID,
                                    'parentName': 'Producer ' + req.params.playerID,
                                    'dateOfBirth': allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].dateOfBirth,
                                    'dateOfDeath': allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].dateOfDeath,
                                    'currentPriceBM':allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].currentPriceBM
                                });
                                count++;
                            }
                        }
                    }
                }
            }
            if (count != 0) {
                res.header("Content-Type", "application/json; charset=UTF-8");
                res.statusCode = 200;
                res.send(products);
            }
        }
    });
}

export function  getProducerProductListByAdmin = function (seminar, period, category, producer) {
    var d = q.defer();
    q.all([
        require('./seminar.js').checkProducerDecisionStatusByAdmin(seminar, period, producer),
        Decision.findOne({
            seminar: seminar,
            period: period,
            playerID: producer
        }).exec()
    ]).spread(function (checkResult, doc) {
        if (doc) {
            var allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                return (obj.categoryID == category);
            });
            var products = new Array();
            var count = 0;
            allProCatDecisions.forEach(function (singleCat) {
                singleCat.proBrandsDecision.forEach(function (singleBrand) {
                    if (singleBrand.brandName != "") {
                        singleBrand.proVarDecision.forEach(function (singleVar) {
                            if (singleVar.varName != "" && singleVar.channelPreference != 1) {
                                products.push({
                                    'categoryID': category,
                                    'brandName': singleBrand.brandName,
                                    'varName': singleVar.varName,
                                    'brandID': singleVar.parentBrandID,
                                    'variantID': singleVar.varID,
                                    'parentName': 'Producer ' + producer,
                                    'dateOfBirth': singleVar.dateOfBirth,
                                    'dateOfDeath': singleVar.dateOfDeath,
                                    'currentPriceBM': singleVar.currentPriceBM,
                                    'isReady': checkResult.isPortfolioDecisionCommitted
                                });
                            }
                        })
                    }
                })
            });
            d.resolve({
                msg: 'success',
                result: products
            });
        } else {
            d.reject({
                msg: 'fail',
                result: {}
            })
        }
    }).done();

    return d.promise;
}

export function  getProductionResult = function (req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            res.send(404, {
                err: 'cannot find the doc'
            });
        } else {
            var categoryID = 0;
            if (req.params.brandName.substring(0, 1) == "E") {
                categoryID = 1;
            } else {
                categoryID = 2;
            }
            var allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                return (obj.categoryID == categoryID);
            });
            var result = 0;
            for (var i = 0; i < allProCatDecisions.length; i++) {
                for (var j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                    for (var k = 0; k < allProCatDecisions[i].proBrandsDecision[j].proVarDecision.length; k++) {
                        if (allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID != 0 && allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varName != "") {
                            result += allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].production;
                        }
                    }
                }
            }
            if (req.params.brandName != "brandName" && req.params.varName != "varName") {
                for (var i = 0; i < allProCatDecisions.length; i++) {
                    for (var j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                        if (allProCatDecisions[i].proBrandsDecision[j].brandID != 0 && allProCatDecisions[i].proBrandsDecision[j].brandName == req.params.brandName) {
                            for (var k = 0; k < allProCatDecisions[i].proBrandsDecision[j].proVarDecision.length; k++) {
                                if (allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID != 0 && allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varName == req.params.varName) {
                                    result -= allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].production;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            }
            res.send(200, {
                result: result
            });
        }
    })
}

export function  getProducerExpend = function (req, res, next) {
    q.all([
        Decision.findOne({seminar: req.params.seminar, period: req.params.period, playerID: req.params.playerID}).exec(),
        require('./BG_oneQuarterExogenousData.js').oneQuarterExogenousData.findOne({seminar:req.params.seminar, period:req.params.period, categoryID:1,marketID:1}).exec(),
        require('./BG_oneQuarterExogenousData.js').oneQuarterExogenousData.findOne({seminar:req.params.seminar, period:req.params.period, categoryID:2,marketID:1}).exec(),
    ]).spread(function (decisionDoc, EExogenousDoc, HExogenousDoc){
        if(decisionDoc && EExogenousDoc && HExogenousDoc){
            var result = 0;
            var totalOnlinePlannedVolume  = 0;
            var ESalesValue = 0;
            var HSalesValue = 0;
            var serviceLevelCost = 0;


            for (var i = 0; i < decisionDoc.proCatDecision.length; i++) {
                for (var j = 0; j < decisionDoc.proCatDecision[i].proBrandsDecision.length; j++) {
                    if (decisionDoc.proCatDecision[i].proBrandsDecision[j].brandID != 0 && decisionDoc.proCatDecision[i].proBrandsDecision[j].brandName != "") {

                        result += (
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].advertisingOffLine[0] +
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].advertisingOffLine[1] +
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].advertisingOnLine +
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].supportEmall +
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].supportTraditionalTrade[0] +
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].supportTraditionalTrade[1]
                        );
                        for (var k = 0; k < decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision.length; k++) {
                            if(decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].varID != 0
                            && decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].varName != ""){
                                totalOnlinePlannedVolume += decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePlannedVolume;
                                if(i == 0){
                                    ESalesValue += decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePlannedVolume * decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePrice;
                                } else if(i == 1){
                                    HSalesValue += decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePlannedVolume * decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePrice;
                                }
                            }
                        }

                    }
                }
            }

            if(totalOnlinePlannedVolume > 0 && decisionDoc.serviceLevel != 'SL_BASE'){
                var EDecidedIntercept = _.find(EExogenousDoc.x_Sup_OnlineServiceLevel_Intercept, function (data){  return data.serviceLevel == decisionDoc.serviceLevel; });
                var HDecidedIntercept = _.find(HExogenousDoc.x_Sup_OnlineServiceLevel_Intercept, function (data){  return data.serviceLevel == decisionDoc.serviceLevel; });

                var EBaseIntercept = _.find(EExogenousDoc.x_Sup_OnlineServiceLevel_Intercept, function (data){  return data.serviceLevel == 'SL_BASE'; });
                var HBaseIntercept = _.find(HExogenousDoc.x_Sup_OnlineServiceLevel_Intercept, function (data){  return data.serviceLevel == 'SL_BASE'; });

                var a = (ESalesValue / (ESalesValue + HSalesValue)) * EDecidedIntercept.value + (HSalesValue / (ESalesValue + HSalesValue)) * HDecidedIntercept.value;
                var b = (ESalesValue / (ESalesValue + HSalesValue)) * EBaseIntercept.value + (HSalesValue / (ESalesValue + HSalesValue)) * HBaseIntercept.value;
                serviceLevelCost = a - b;
            }

            result += serviceLevelCost;

            //For ignoring specific item when posing validation data
            if (req.params.brandName == "brandName") {
                return res.send(200, {
                    result: result
                });
            } else if(req.params.location == "serviceLevel") {
                result -= serviceLevelCost;
                return res.send(200, {
                    result: result
                });
            } else {
                if (req.params.brandName.substring(0, 1) == "E") {
                    categoryID = 1;
                } else {
                    categoryID = 2;
                }
                var allProCatDecisions = _.filter(decisionDoc.proCatDecision, function (obj) {
                    return (obj.categoryID == categoryID);
                });
                for (var i = 0; i < allProCatDecisions.length; i++) {
                    for (var j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                        if (allProCatDecisions[i].proBrandsDecision[j].brandID != 0 && allProCatDecisions[i].proBrandsDecision[j].brandName == req.params.brandName) {
                            if (req.params.location == "advertisingOffLine" || req.params.location == "supportTraditionalTrade") {
                                result -= allProCatDecisions[i].proBrandsDecision[j][req.params.location][req.params.additionalIdx];
                            } else {
                                result -= allProCatDecisions[i].proBrandsDecision[j][req.params.location];
                            }
                            break;
                        }
                    }
                }
                return res.send(200, {
                    result: result
                });
            }

        } else {
            return res.send(404, {err : "cannot find related EExogenousDoc/HExogenousDoc."});
        }
    }).fail(function (err){
        return next(new Error(err));
    }).done();
}


//Marketing Spending includes:
//1 - General Marketing - Advertising
//2 - Market Research
export function  getMarketingSpending = function (req, res, next) {
    q.all([
        Decision.findOne({seminar: req.params.seminar, period: req.params.period, playerID: req.params.playerID}).exec(),
        require('./BG_oneQuarterExogenousData.js').oneQuarterExogenousData.findOne({seminar:req.params.seminar, period:req.params.period, categoryID:1,marketID:1}).exec(),
        export function  getProducerReportOrder(req.params.seminar,req.params.period,req.params.playerID)
    ]).spread(function (decisionDoc, quarterExogenousDoc, producerOrderDecision){
            var result = 0;
            for (var i = 0; i < decisionDoc.proCatDecision.length; i++) {
                for (var j = 0; j < decisionDoc.proCatDecision[i].proBrandsDecision.length; j++) {
                    if (decisionDoc.proCatDecision[i].proBrandsDecision[j].brandID != 0 && decisionDoc.proCatDecision[i].proBrandsDecision[j].brandName != "") {
                        result += (
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].advertisingOffLine[0] +
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].advertisingOffLine[1] +
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].advertisingOnLine
                        );
                    }
                }
            }
            for(var i = 0; i < producerOrderDecision.length; i++){
                if(producerOrderDecision[i]){
                    result += quarterExogenousDoc.MarketStudiesPrices[i]
                }
            }
            res.send(200, {
                result: result
            });

    }).fail(function (err){
        return next(new Error(err));
    }).done();
}

//Trade Support Spending
//1 - General Marketing - Traditional Trade Support
//TODO: 2 - All the cost happen in page "Online Store management" AKA Visibility + Promotion Cost
//3 - All the Negotiation Cost
//4 - Service Cost
export function  getTradeSupportSpending = function (req, res, next) {
    q.all([
        Decision.findOne({seminar: req.params.seminar, period: req.params.period, playerID: req.params.playerID}).exec(),
                require('./contract.js').calculateProducerNegotiationCost(req.params.seminar, req.params.playerID, req.params.period,'brandName','varName','ingoreItemNull',0),
                require('./BG_oneQuarterExogenousData.js').oneQuarterExogenousData.findOne({seminar:req.params.seminar, period:req.params.period, categoryID:1,marketID:1}).exec(),
                require('./BG_oneQuarterExogenousData.js').oneQuarterExogenousData.findOne({seminar:req.params.seminar, period:req.params.period, categoryID:2,marketID:1}).exec(),
        ]).spread(function (decisionDoc, producerNegotiationCost, EExogenousDoc, HExogenousDoc){
            var result = 0;

            var totalOnlinePlannedVolume  = 0;
            var ESalesValue = 0;
            var HSalesValue = 0;
            var serviceLevelCost = 0;

            for (var i = 0; i < decisionDoc.proCatDecision.length; i++) {
                for (var j = 0; j < decisionDoc.proCatDecision[i].proBrandsDecision.length; j++) {
                    if (decisionDoc.proCatDecision[i].proBrandsDecision[j].brandID != 0 && decisionDoc.proCatDecision[i].proBrandsDecision[j].brandName != "") {
                        result += (
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].supportEmall +
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].supportTraditionalTrade[0] +
                            decisionDoc.proCatDecision[i].proBrandsDecision[j].supportTraditionalTrade[1]
                        );

                        for (var k = 0; k < decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision.length; k++) {
                            if(decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].varID != 0
                            && decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].varName != ""){
                                totalOnlinePlannedVolume += decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePlannedVolume;
                                if(i == 0){
                                    ESalesValue += decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePlannedVolume * decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePrice;
                                } else if(i == 1){
                                    HSalesValue += decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePlannedVolume * decisionDoc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].onlinePrice;
                                }
                            }
                        }

                    }
                }
            }
            if(totalOnlinePlannedVolume > 0 && decisionDoc.serviceLevel != 'SL_BASE'){
                var EDecidedIntercept = _.find(EExogenousDoc.x_Sup_OnlineServiceLevel_Intercept, function (data){  return data.serviceLevel == decisionDoc.serviceLevel; });
                var HDecidedIntercept = _.find(HExogenousDoc.x_Sup_OnlineServiceLevel_Intercept, function (data){  return data.serviceLevel == decisionDoc.serviceLevel; });

                var EBaseIntercept = _.find(EExogenousDoc.x_Sup_OnlineServiceLevel_Intercept, function (data){  return data.serviceLevel == 'SL_BASE'; });
                var HBaseIntercept = _.find(HExogenousDoc.x_Sup_OnlineServiceLevel_Intercept, function (data){  return data.serviceLevel == 'SL_BASE'; });

                var a = (ESalesValue / (ESalesValue + HSalesValue)) * EDecidedIntercept.value + (HSalesValue / (ESalesValue + HSalesValue)) * HDecidedIntercept.value;
                var b = (ESalesValue / (ESalesValue + HSalesValue)) * EBaseIntercept.value + (HSalesValue / (ESalesValue + HSalesValue)) * HBaseIntercept.value;
                serviceLevelCost = a - b;
            }


            result += producerNegotiationCost.result;
            result += serviceLevelCost;

            res.send(200, {
                result: result
            });

    }).fail(function (err){
        return next(new Error(err));
    }).done();

}

*/
function getPlayerCurrentDecision(req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            res.send(404, {
                err: 'cannot find the doc'
            });
        }
        else {
        }
    });
}
exports.getPlayerCurrentDecision = getPlayerCurrentDecision;
/*
export function  getProducerVariantBM = function (req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            res.send(404, {
                err: 'cannot find the doc'
            });
        } else {
            var result = 0,
                count = 0;
            var allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                return (obj.categoryID == req.params.categoryID);
            });
            for (var i = 0; i < allProCatDecisions.length; i++) {
                for (var j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                    if (allProCatDecisions[i].proBrandsDecision[j].brandID != 0 && allProCatDecisions[i].proBrandsDecision[j].brandName == req.params.brandName) {
                        for (var k = 0; k < allProCatDecisions[i].proBrandsDecision[j].proVarDecision.length; k++) {
                            if (allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID != 0 && allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varName == req.params.varName) {
                                result = allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].currentPriceBM;
                                count++;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            if (count != 0) {
                res.send(200, {
                    result: result
                });
            } else {
                res.send(404, {
                    result: 'BM price for this product has not been decided.'
                });
            }
        }
    })
}
export function  getProductInfo = function (req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            res.send(404, {
                err: 'cannot find the doc'
            });
        } else {
            var categoryID = 0;
            if (req.params.brandName.substring(0, 1) == "E") {
                categoryID = 1;
            } else {
                categoryID = 2;
            }
            var allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                return (obj.categoryID == categoryID);
            });
            var count = 0;
            for (i = 0; i < allProCatDecisions.length; i++) {
                for (j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                    if (allProCatDecisions[i].proBrandsDecision[j].brandID != 0 && allProCatDecisions[i].proBrandsDecision[j].brandName == req.params.brandName) {
                        count++;
                        res.send(200, allProCatDecisions[i].proBrandsDecision[j].proVarDecision);
                        break;
                    }
                }
            }
            if (count == 0) {
                res.send(404, {
                    err: 'cannot find the brand'
                });
            }
        }
    })
}

export function  checkProducerProduct = function (req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            res.send(404, {
                err: 'cannot find the doc'
            });
        } else {
            var allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                return (obj.categoryID == req.params.categoryID);
            });
            if (req.params.checkType == "brand") {
                var count = 0,
                    result = 0;
                for (var i = 0; i < allProCatDecisions.length; i++) {
                    for (var j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                        if (allProCatDecisions[i].proBrandsDecision[j].brandName != "" && allProCatDecisions[i].proBrandsDecision[j].brandID != 0) {
                            count++;
                            if (allProCatDecisions[i].proBrandsDecision[j].brandName == req.params.brandName) {
                                result++;
                            }
                        }
                    }
                }
                if (count >= 5) {
                    res.send(404, {
                        message: 'more than 5'
                    });
                } else if (result != 0) {
                    res.send(404, {
                        message: 'another brand'
                    });
                } else {
                    res.send(200, {
                        message: 'OK'
                    });
                }
            } else {
                var count = 0,
                    result = 0;
                for (var i = 0; i < allProCatDecisions.length; i++) {
                    for (var j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                        if (allProCatDecisions[i].proBrandsDecision[j].brandID != 0 && allProCatDecisions[i].proBrandsDecision[j].brandName == req.params.brandName) {
                            for (var k = 0; k < allProCatDecisions[i].proBrandsDecision[j].proVarDecision.length; k++) {
                                if (allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID != 0 && allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varName != "") {
                                    count++;
                                    if (allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varName == req.params.varName) {
                                        result++;
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
                if (count >= 3) {
                    res.send(404, {
                        message: 'more than 3'
                    });
                } else if (result != 0) {
                    res.send(404, {
                        message: 'another variant'
                    });
                } else {
                    res.send(200, {
                        message: 'OK'
                    });
                }
            }
        }
    })
}
//checkSupplierBMPrice
export function  checkSupplierBMPrice = function (req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (doc) {
            var result = true;
            var allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                return (obj.categoryID == 1);
            });
            allProCatDecisions.forEach(function (singleCategory) {
                singleCategory.proBrandsDecision.forEach(function (singleBrand) {

                    singleBrand.proVarDecision.forEach(function (singleVar){
                        if (singleVar.currentPriceBM == 0 && singleVar.varID != 0 && singleVar.channelPreference != 1) {
                            result = false;
                        }
                    });
                });
            });
            if (result) {
                allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                    return (obj.categoryID == 2);
                });

                allProCatDecisions.forEach(function (singleCategory) {
                    singleCategory.proBrandsDecision.forEach(function (singleBrand) {

                        singleBrand.proVarDecision.forEach(function (singleVar){

                            if (singleVar.currentPriceBM == 0 && singleVar.varID != 0 && singleVar.channelPreference != 1) {
                                result = false;
                            }
                        });
                    });
                });
            }
            res.send(200, result);
        } else {
            res.send(404, {
                err: 'cannot find the doc'
            });
        }
    })
}

//brandHistory
export function  getBrandHistory = function (req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            res.send(404, {
                err: 'cannot find the doc'
            });
        } else {
            var categoryID = 0;
            if (req.params.brandName.substring(0, 1) == "E") {
                categoryID = 1;
            } else {
                categoryID = 2;
            }
            var allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                return (obj.categoryID == categoryID);
            });
            var result = new Array();
            for (var i = 0; i < allProCatDecisions.length; i++) {
                for (var j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                    if (allProCatDecisions[i].proBrandsDecision[j] != undefined && allProCatDecisions[i].proBrandsDecision[j].brandName == req.params.brandName) {
                        result = allProCatDecisions[i].proBrandsDecision[j];
                        break;
                    }
                }
            }
            if (!result) {
                res.send(404, 'cannot find the doc');
            } else {
                res.send(200, result);
            }
        }
    })
}

*/
//companyHistory
function getCompanyHistory(req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            res.send(404, {
                err: 'cannot find the doc'
            });
        }
        else {
        }
    });
}
exports.getCompanyHistory = getCompanyHistory;
/*
export function  getProducerBrandList = function (req, res, next) {
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }

        if (!doc) {
            console.log('cannot find matched doc...');
            res.send(404, {
                error: 'Cannot find matched doc...'
            });
        } else {
            var allProCatDecisions = _.filter(doc.proCatDecision, function (obj) {
                return (obj.categoryID == req.params.categoryID);
            });
            var brands = new Array();
            //var vars=new Array();
            var count = 0;
            for (var i = 0; i < doc.proCatDecision.length; i++) {
                for (var j = 0; j < doc.proCatDecision[i].proBrandsDecision.length; j++) {
                    if (doc.proCatDecision[i].proBrandsDecision[j] != undefined && doc.proCatDecision[i].proBrandsDecision[j].brandID != undefined && doc.proCatDecision[i].proBrandsDecision[j].brandID != 0) {
                        var vars = new Array();
                        for (var k = 0; k < doc.proCatDecision[i].proBrandsDecision[j].proVarDecision.length; k++) {
                            if (doc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].varName != "" && doc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].varID != 0) {
                                vars.push({
                                    'varID': doc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].varID,
                                    'varName': doc.proCatDecision[i].proBrandsDecision[j].proVarDecision[k].varName,
                                    'parentBrandID': doc.proCatDecision[i].proBrandsDecision[j].brandID,
                                    'parentName': doc.proCatDecision[i].proBrandsDecision[j].brandName
                                });

                            }
                        }
                        brands.push({
                            'category': doc.proCatDecision[i].categoryID,
                            'brandName': doc.proCatDecision[i].proBrandsDecision[j].brandName,
                            'brandID': doc.proCatDecision[i].proBrandsDecision[j].brandID,
                            'varList': vars
                        });
                        count++;

                    }
                }
            }
            if (count != 0) {
                res.header("Content-Type", "application/json; charset=UTF-8");
                res.statusCode = 200;
                res.send(brands);
            }
        }
    });
}

export function  getBrand = function (categoryCount, brandCount, playerID, seminar, period) {
    var deferred = q.defer();
    Decision.findOne({
        seminar: seminar,
        period: period,
        playerID: playerID
    }, function (err, doc) {
        if (err) deferred.reject({
            msg: err
        });
        if (doc) {
            deferred.resolve({
                doc: doc,
                msg: 'Find Brand with playerID:' + playerID + ', categoryCount:' + categoryCount + ', brandCount:' + brandCount
            });
        } else {
            deferred.reject({
                doc: doc,
                msg: 'No Brand with playerID:' + playerID + ', categoryCount:' + categoryCount + ', brandCount:' + brandCount
            });
        }
    });
    return deferred.promise;
}

export function  getVariant = function (categoryCount, brandCount, varCount, playerID, seminar, period) {
    var deferred = q.defer();
    Decision.findOne({
        seminar: seminar,
        period: period,
        playerID: playerID
    }, function (err, doc) {
        if (err) deferred.reject({
            msg: err
        });
        if (doc) {
            deferred.resolve({
                doc: doc,
                msg: 'Find Variant with playerID:' + playerID + ', categoryCount:' + categoryCount + ', brandCount:' + brandCount + ', varCount:' + varCount
            });
        } else {
            deferred.reject({
                doc: doc,
                msg: 'No Variant with playerID:' + playerID + ', categoryCount:' + categoryCount + ', brandCount:' + brandCount + ', varCount:' + varCount
            });
        }
    })
    return deferred.promise;
}

export function  getSupplierMarketResearchOrders = function (req,res,next){
    Decision.findOne({
        seminar: req.params.seminar,
        period: req.params.period,
        playerID: req.params.playerID
    }, function (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if(doc){
            res.send(200,doc.marketResearchOrder);
        }else{
            res.send(404,'fail');
        }
    });
}

export function  getProducerBudgetExtensionAndExceptionalCost = function (seminar) {
    var d = q.defer();
    var result = {
        producerBudget: [{playerID: 1,data: []}, {playerID: 2,data: []}, {playerID: 3,data: []}],
        producerExceptionalCost: [{playerID: 1,data: []}, {playerID: 2,data: []}, {playerID: 3,data: []}]
    }
    Decision.find({
        seminar: seminar
    }, function (err, docs) {
        if (err) {
            return next(new Error(err));
        }
        if (docs) {
            docs.forEach(function (single) {
                if (single.period >= 0 && single.playerID != 4) {
                    result.producerBudget[single.playerID - 1].data.push({
                        'playerID': single.playerID,
                        'period': single.period,
                        'nextBudgetExtension': single.nextBudgetExtension === undefined ? 0 : single.nextBudgetExtension,
                        'immediateBudgetExtension': single.immediateBudgetExtension === undefined ? 0 : single.immediateBudgetExtension
                    });
                    single.proCatDecision.forEach(function (singleCategory) {
                        if (singleCategory.exceptionalCostsProfits[0] === undefined || singleCategory.exceptionalCostsProfits[0] === null){
                            singleCategory.exceptionalCostsProfits[0] = 0;
                        }
                        if (singleCategory.exceptionalCostsProfits[1] === undefined || singleCategory.exceptionalCostsProfits[1] === null){
                            singleCategory.exceptionalCostsProfits[1] = 0;
                        }
                        if (singleCategory.categoryID == 1) {
                            result.producerExceptionalCost[single.playerID - 1].data[single.period] = {}
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].exceptionalCostsProfits = [0, 0, 0, 0];
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].playerID = single.playerID;
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].period = single.period;
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].categoryID = singleCategory.categoryID;
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].exceptionalCostsProfits[0] = singleCategory.exceptionalCostsProfits[0];
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].exceptionalCostsProfits[1] = singleCategory.exceptionalCostsProfits[1];
                        } else if (singleCategory.categoryID == 2) {
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].playerID = single.playerID;
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].period = single.period;
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].categoryID = singleCategory.categoryID;
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].exceptionalCostsProfits[2] = singleCategory.exceptionalCostsProfits[0];
                            result.producerExceptionalCost[single.playerID - 1].data[single.period].exceptionalCostsProfits[3] = singleCategory.exceptionalCostsProfits[1];
                        }
                    });
                }
            });
            result.producerBudget.forEach(function (single) {
                single.data.sort(function (a, b) {
                    return a.period > b.period ? 1 : -1
                });
            });
            d.resolve(result);
        } else {
            d.reject('fail');
        }
    });
    return d.promise;
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
                    variable[key] = "";
                }
                else {
                    reset(prop);
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
function resetRawDecision(rawDec) {
    var dec = {};
    if (rawDec === null || typeof rawDec !== "object") {
        return dec;
    }
    dec.decision = clone(rawDec.decision);
    dec.results = clone(rawDec.results);
    reset(dec.decision);
    reset(dec.results);
    return dec;
}
exports.resetRawDecision = resetRawDecision;
function removePlayersDecisions(options) {
    var deferred = q.defer();
    Decision.remove({
        seminar: options.seminar,
    }, function (err, docs) {
        if (err) {
            deferred.reject({
                msg: err
            });
        }
        deferred.resolve();
    });
    return deferred.promise;
}
exports.removePlayersDecisions = removePlayersDecisions;
//# sourceMappingURL=Decision.js.map