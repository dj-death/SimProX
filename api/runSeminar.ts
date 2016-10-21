import http = require('http');
import util = require('util');
import Q = require('q');

let request = require('request');

import Seminar = require('./models/seminar/Seminar');
import PlayerDecision = require('./models/decision/Decision');

var Flat = require('./utils/Flat.js');

import Utils = require('../kernel/utils/Utils');
import console = require('../kernel/utils/logger');

import SimMain = require('../kernel/app');

let pm2 = require('pm2');


// debug
if (Utils.NODE_ENV() === "dev") {
    global.debug_data.SimMain = SimMain;
    global.debug_data.pm2 = pm2;
}



export function  runSeminar(io) {

    return function  (req, res, next) {
        console.silly('run seminar');

        var options = {

            seminar: req.body.seminar,

            period: Number(req.body.period),

            startFrom: Number(req.body.period), // see from what to start
            endWith: Number(req.body.period),

            playersNb: Number(req.body.playersNb),

            keepExistedNextPeriodDecision: req.body.keepExistedNextPeriodDecision
        };


        runPromiseChain(io, options, res);
    };
}


function  __processDec(playerID, currPeriod, playerCurrPData, lastPeriodsData, onError) {
    var playerAllLastStates = [];

    for (var i = 0, len = lastPeriodsData.length; i < len; i++) {
        var data = lastPeriodsData[i];

        var playerState = data.filter(function  (playerLastPData) {
            // regression
            if (playerLastPData.playerID === undefined) {
                return playerLastPData.results.d_CID === playerCurrPData.playerID;
            }

            return playerLastPData.playerID === playerCurrPData.playerID;
        })[0];

        playerAllLastStates.unshift(playerState);
    }


    if (!playerCurrPData || !playerAllLastStates) {
        onError("Data is not suffisent or absent !");
    }


    playerAllLastStates.sort(function  (a, b) {
        return a.period - b.period;
    });

    // debug
    if (Utils.NODE_ENV() === "dev") {
        global.debug_data.playerLastState = playerAllLastStates;
        global.debug_data.playerCurrPData = playerCurrPData;
    }

    SimMain.initialize(playerAllLastStates, currPeriod, playerID);

    SimMain.setDecisions(playerCurrPData.decision, playerAllLastStates, playerID);

    console.silly('player:' + playerID + ' processing decisions succes');
}


function  __processEndState(playerID: number, currPeriod: number) {
    let deferred = Q.defer();
  

    SimMain.getEndState(playerID, currPeriod).done(function  (playerEndState) {

        let flatReport = {};
        let playerResults;

        Object.keys(playerEndState).forEach(function  (key) {
            var newKey = "res_" + key;
            flatReport[newKey] = playerEndState[key];
        });

        playerEndState["report"] = flatReport;

        playerResults = Flat.unflatten(playerEndState, {
            delimiter: "_"
        });

        console.silly('player:' + playerID + ' endstats succes');

        deferred.resolve(playerResults);

    }, function  (err) {
        console.error(err);

        deferred.reject(err);
    });

    return deferred.promise;
    
}



function  getBIInfos(results, startFromPlayerID, includeInfoType) {
    var BI = {};
    var playerID = startFromPlayerID;

    var corporateActivityInfo = SimMain.getList_corporateActivityInfo();
    var freeInfo = SimMain.getList_freeInfo();

    results.forEach(function  (res, idx) {
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


function  processDecisions(currPData, lastPeriodsData: Array<any>, options, io) {


    var playersNb = currPData.length;
    var startFromPlayerID = 1;
    var endWithPlayerID = playersNb;

    var currPeriod = options.period;

    var envLastStates = [];

    var deferred = Q.defer();

    function  onError(msg) {
        msg = 'Failed to simulate :' + msg;

        deferred.reject({
            msg: msg
        });

    }


    for (let i = 0, len = lastPeriodsData.length; i < len; i++) {
        // we take the last period and then what ever player as env is common
        let state = lastPeriodsData[i][0];
        let envState = state.results;

        envState.period = state.period;

       envLastStates.push(envState);
    }


    // debug
    if (Utils.NODE_ENV() === "dev") {
        global.debug_data.lastPeriodsData = lastPeriodsData || currPData; // regrression for beginning
        global.debug_data.currPData = currPData;
        global.debug_data.envLastStates = envLastStates;
    }


    SimMain.launchSim();

    SimMain.initEnvironnemet(envLastStates, currPeriod);
    SimMain.simulateEnv(currPeriod);

    console.silly("Environnement simulation success !");


    for (let ID = startFromPlayerID; ID <= endWithPlayerID; ID++) {
        let playerCurrPData = currPData[ID - 1];

        if (playerCurrPData.playerID !== ID) {
            playerCurrPData = currPData.filter(function  (player, idx) {
                return player.playerID === ID;
            })[0];
        }

        __processDec(ID, currPeriod, playerCurrPData, lastPeriodsData, onError);
    }


    // to get market shares let's confronte company decisions
    SimMain.simulateMarketplace();

    io.sockets.emit('KernelProcessLog', {
        msg: "Processing simulation results ...",
        isError: false
    });



    let results = [];


    let p = Q(undefined);


    for (let ID = startFromPlayerID; ID <= endWithPlayerID; ID++) {
        // we should recall process decision as there is no way to restore states without inssue in perfs so make it easy
        p = p.then(__processEndState.bind(null, ID, currPeriod)).then(function  (result) {
            results.push(result);

            io.sockets.emit('KernelProcessLog', {
                msg: "Processing results of player " + ID,
                isError: false
            });

            return results;
        });

    }


    p.then(function  (finalResults: any[]) {

        let deferred = Q.defer();

        setImmediate(function  () {
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

    }).done(function  (endResults) {

        // debug
        if (Utils.NODE_ENV() === "dev") {
            global.debug_data.endResults = endResults;
        }


        deferred.resolve({
            msg: 'Simulation done of period: ' + currPeriod,
            data: endResults
        });


        if (Utils.NODE_ENV() === "prod") {
            SimMain.reset();

            io.sockets.emit('KernelProcessLog', {
                msg: "Cleaning memory",
                isError: false
            });
       }

    }, function  (err) {
        console.error(err);

        deferred.reject(err);
    });


   

    return deferred.promise;
}



function  runPromiseChain(io, options, res) {
    //export R3 and P4
    var status;

    var simParams;

    var playersData;
    var currPData;

    if (status == 'pending') {
        res.res.status(400).send('Service is locked by other process, please wait for seconds.');
    } else {

        // export all decisions grouped by period desc
        PlayerDecision.exportToJson(options).then(function  (result) {

            io.sockets.emit('KernelProcessLog', {
                msg: result.msg,
                isError: false
            });

            playersData = result.records;

            // debug
            if (Utils.NODE_ENV() === "dev") {
                global.debug_data.playersData = playersData;
            }



            // get seminar sim params
            return Seminar.getSimulationParams(options);

        }).then(function  (result) {
            io.sockets.emit('KernelProcessLog', {
                msg: result.msg,
                isError: false
            });

            simParams = result.simParams;

            let i = 0;
            let len = playersData.length;

            let currPData = playersData[len - 1].data;
            let lastPeriodsData = [];

            for (; i < (len -1); i++) {
                lastPeriodsData.push(playersData[i].data);
            }

            return processDecisions(currPData, lastPeriodsData, options, io);

        }).then(function  (result) {

            io.sockets.emit('KernelProcessLog', {
                msg: result.msg,
                isError: false
            });

            var data = result.data;

            // debug
            if (Utils.NODE_ENV() === "dev") {
                global.debug_data.data = data;
            }

            // now update with results
            options.startFromPlayerID = 1;
            options.endWithPlayerID = options.playersNb;

            console.silly('saving to database ...');

            return PlayerDecision.addPeriodResults(options, data);

        }).then(function  (result) {
            io.sockets.emit('KernelProcessLog', {
                msg: result.msg,
                isError: false
            });

            console.silly('adding results');

            //deal with promises chain
            res.status(200).send('Run period start from ' + options.startFrom + ' to ' + options.endWith + ' done.');
            status = 'actived';


        }, function  (error) { //log the error
            console.error(error.msg);

            io.sockets.emit('KernelProcessLog', {
                msg: error.msg,
                isError: true
            });

            status = 'actived';
            res.status(300).send('error');

        }, function  (progress) { //log the progress
            io.sockets.emit('KernelProcessLog', {
                msg: progress.msg,
                isError: false
            });

        }).done();
    }
}