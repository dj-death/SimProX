"use strict";
const path = require('path');
let mongoose = require('mongoose');
let request = require('request');
let q = require('q');
let Dir = require('node-dir');
const console = require('../../../kernel/utils/logger');
const Flat = require('../../utils/Flat');
const Excel = require('../../utils/ExcelUtils');
const config = require('../../../config');
let EngineConfig = config.engine;
const scenarioSchema = require('./Schema');
let Scenario = mongoose.model('scenario', scenarioSchema);
// Persistent datastore with automatic loading 
let Datastore = require('nedb');
let scenariosDb = new Datastore({
    filename: EngineConfig.scenariosDbPath + '/scenarios.nosql',
    autoload: false,
    corruptAlertThreshold: 0
});
function loadScenario(scenarioID) {
    let deferred = q.defer();
    scenariosDb.loadDatabase(function (err) {
        // Now commands will be executed
        if (err) {
            deferred.reject({
                msg: err
            });
        }
        console.log('success loading scenarios..');
        scenariosDb.findOne({ ref: scenarioID }, function (err, doc) {
            if (err || !doc || !doc.historiques) {
                deferred.reject({
                    err: err,
                    msg: 'cannot find matched scenario : ' + scenarioID
                });
                return false;
            }
            let historiques = doc.historiques.sort(function (v, w) {
                /*if (typeof v.periodYear === "undefined" || typeof  v.periodQuarter === "undefined") {
                    return v.period - w.period;
                }

                if (v.periodYear === w.periodYear) {
                    return v.periodQuarter - w.periodQuarter;
                } else {
                    return v.periodYear - w.periodYear;
                }*/
                return v.period - w.period;
            });
            deferred.resolve({
                msg: 'success opening scenario: ' + scenarioID,
                historiques: historiques,
                scenarioID: scenarioID
            });
        });
    });
    return deferred.promise;
}
exports.loadScenario = loadScenario;
;
/*
export function  loadEmptyScenario () {

    let deferred = q.defer();

    scenariosDb.loadDatabase(function  (err) {
        // Now commands will be executed
        if (err) {
            deferred.reject({
                msg: err
            });
        }

        scenariosDb.findOne({ ref: "14C2" }, function  (err, doc) {
            if (err || !doc || !doc.historiques) {
                deferred.reject({
                    err: err,
                    msg: 'cannot find matched scenario'
                });

                return false;
            }

            let hist = doc.historiques[doc.historiques.length - 1];
            let decision = PlayerDecision.resetRawDecision(hist);

            decision.period = 0;

            deferred.resolve({
                msg: 'success opening empty scenario',
                historiques: [decision]
            });

        });

    });

    return deferred.promise;
}
*/
function getScenario(options, res) {
    scenariosDb.loadDatabase(function (err, next) {
        // Now commands will be executed
        if (err) {
            return next(new Error(err));
        }
        scenariosDb.findOne({ ref: options.scenarioID }, function (err, doc) {
            if (err) {
                return next(new Error(err));
            }
            if (doc) {
                res.send(200, doc);
            }
            else {
                res.send(404, 'cannot find matched doc....');
            }
        });
    });
}
exports.getScenario = getScenario;
function createScenario(options) {
    let deferred = q.defer();
    let scenariosDbPath = EngineConfig.scenariosDbPath;
    Dir.subdirs(scenariosDbPath, function (err, subdirs) {
        if (err) {
            deferred.reject({
                msg: err
            });
        }
        let counter = subdirs.length;
        subdirs.forEach(function (subdir, idx) {
            console.log(subdir);
            let scenario;
            let historiques = [];
            Dir.files(subdir, function (err, files) {
                if (err) {
                    deferred.reject({
                        msg: err
                    });
                }
                let periodsNb = files.length;
                // sort ascending
                files.sort();
                files.forEach(function (file, idx) {
                    // add automoaticay period
                    let period = idx + 1 - periodsNb;
                    let flatHist = Excel.excelImport(file);
                    let data = Flat.unflatten(flatHist, { delimiter: '_' });
                    data["period"] = isNaN(data["period"]) ? period : data["period"];
                    data["res"]["report"] = flatHist;
                    if (!data) {
                        console.debug(path.basename(file), ' failed');
                        return false;
                    }
                    let histRecord = {
                        period: data["period"],
                        decision: data["dec"],
                        results: data["res"]
                    };
                    for (let key in data) {
                        if (!data.hasOwnProperty(key)) {
                            continue;
                        }
                        if (key !== "dec" && key !== "res") {
                            histRecord[key] = data[key];
                        }
                    }
                    historiques.push(histRecord);
                });
                if (historiques[0] !== undefined) {
                    let scenarioID = historiques[0].scenarioID;
                    scenarioID = scenarioID ? scenarioID.trim() : "14C";
                    scenario = {
                        ref: scenarioID,
                        historiques: historiques
                    };
                    scenariosDb.loadDatabase(function (err) {
                        // Now commands will be executed
                        if (err) {
                            deferred.reject({
                                msg: err
                            });
                        }
                        // Removing all documents
                        scenariosDb.remove({}, { multi: true }, function (err, numRemoved) {
                            scenariosDb.insert(scenario, function (err, newDoc) {
                                --counter;
                                if (err) {
                                    deferred.reject({
                                        msg: err
                                    });
                                }
                                //console.debug('saved ', newDoc._id);
                                if (counter <= 0) {
                                    deferred.resolve({
                                        msg: "success scenario loaded"
                                    });
                                    console.info("scenario created");
                                }
                            });
                        });
                    });
                }
            });
        });
    });
    return deferred.promise;
}
exports.createScenario = createScenario;
//# sourceMappingURL=Scenario.js.map