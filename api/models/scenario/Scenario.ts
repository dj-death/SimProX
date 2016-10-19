import http = require('http');
import util = require('util');
import path = require('path');

let mongoose = require('mongoose');
let request = require('request');
let q = require('q');
let Dir = require('node-dir');

import Utils = require('../../../kernel/utils/Utils');
import console = require('../../../kernel/utils/logger');

import Flat = require('../../utils/Flat');
import Excel = require('../../utils/ExcelUtils');

import PlayerDecision = require('../decision/Decision');

import config = require('../../../config');
let EngineConfig = config.engine;


import scenarioSchema = require('./Schema');

let Scenario = mongoose.model('scenario', scenarioSchema);


// Persistent datastore with automatic loading 
let Datastore = require('nedb');
let scenariosDb = new Datastore({
    filename: EngineConfig.scenariosDbPath + '/scenarios.nosql',
    autoload: false,
    corruptAlertThreshold: 0
});


export function loadScenario(scenarioID) {

    var deferred = q.defer();

    scenariosDb.loadDatabase(function  (err) {
        // Now commands will be executed
        if (err) {
            deferred.reject({
                msg: err
            });
        }

        console.log('success loading scenarios..');

        scenariosDb.findOne({ ref: scenarioID }, function  (err, doc) {

            if (err || !doc || !doc.historiques) {
                deferred.reject({
                    err: err,
                    msg: 'cannot find matched scenario : ' + scenarioID
                });

                return false;
            }

            var historiques = doc.historiques.sort(function  (v, w) {
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
};


export function  loadEmptyScenario () {

    var deferred = q.defer();

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

            var hist = doc.historiques[doc.historiques.length - 1];
            var decision = PlayerDecision.resetRawDecision(hist);

            decision.period = 0;

            deferred.resolve({
                msg: 'success opening empty scenario',
                historiques: [decision]
            });

        });

    });

    return deferred.promise;
}

export function  getScenario (options, res) {
    scenariosDb.loadDatabase(function  (err, next) {
        // Now commands will be executed
        if (err) {
            return next(new Error(err));
        }

        scenariosDb.findOne({ ref: options.scenarioID }, function  (err, doc) {
            if (err) {
                return next(new Error(err));
            }

            if (doc) {
                res.send(200, doc);

            } else {
                res.send(404, 'cannot find matched doc....');
            }
        });

    });
}


export function  createScenario (options) {

    var deferred = q.defer();

    var scenariosDbPath = EngineConfig.scenariosDbPath;

    Dir.subdirs(scenariosDbPath, function  (err, subdirs) {
        if (err) {
            deferred.reject({
                msg: err
            });
        }

        var counter = subdirs.length;

        subdirs.forEach(function  (subdir, idx) {
            console.log(subdir);

            var scenario;
            var historiques = [];


            Dir.files(subdir, function  (err, files) {
                if (err) {
                    deferred.reject({
                        msg: err
                    });
                }

                var periodsNb = files.length;

                // sort ascending
                files.sort();
                files.forEach(function  (file, idx) {

                    // add automoaticay period
                    var period = idx + 1 - periodsNb;

                    var flatHist = Excel.excelImport(file);
                    var data = Flat.unflatten(flatHist, { delimiter: '_' });
                    data["period"] = isNaN(data["period"]) ? period : data["period"];

                    data["res"]["report"] = flatHist;

                    if (!data) {
                        console.debug(path.basename(file), ' failed');
                        return false;
                    }

                    var histRecord = {
                        period: data["period"],
                        decision: data["dec"],
                        results: data["res"]
                    };

                    for (var key in data) {
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
                    var scenarioID = historiques[0].scenarioID;
                    scenarioID = scenarioID ? scenarioID.trim() : "14C";

                    scenario = {
                        ref: scenarioID,
                        historiques: historiques
                    };

                    scenariosDb.loadDatabase(function  (err) {
                        // Now commands will be executed
                        if (err) {
                            deferred.reject({
                                msg: err
                            });
                        }

                        // Removing all documents
                        scenariosDb.remove({}, { multi: true }, function  (err, numRemoved) {

                            scenariosDb.insert(scenario, function  (err, newDoc) {
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
