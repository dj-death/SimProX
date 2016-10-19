import http = require('http');
let util = require('util');

import Seminar = require('./models/seminar/Seminar');
import PlayerDecision = require('./models/decision/Decision');
import Scenario = require('./models/scenario/Scenario');

import console = require('../kernel/utils/logger');


export function  initSeminar(io) {

    var status;

    return function  (req, res, next) {
        if (status == 'pending') {
            res.status(404).send('Service is locked by other process, please wait for seconds.');
        } else {
            status = 'pending';

            var options = {

                seminar: req.body.seminar,
                simulationScenarioID: req.body.simulationScenarioID,
                scenarioID: req.body.simulationScenarioID,

                playersNb: req.body.playersNb,

                simulationSpan: req.body.simulationSpan,
                isKeepExistedPeriod1Decision: req.body.isKeepExistedPeriod1Decision
            };


            //io.sockets.emit('AdminProcessLog', { msg: 'Create separated folder for binary files of seminar : '+ req.body.seminar, isError: false });
            io.sockets.emit('AdminProcessLog', {
                msg: 'Start calling Initialize.DLL...',
                isError: false
            });


            Seminar.initializeSeminar(options).then(function  (result) {
                io.sockets.emit('AdminProcessLog', {
                    msg: result.msg,
                    isError: false
                });

                console.log('initializeSeminar, success');


                if (!options.simulationScenarioID) {
                    console.warn("empty scenario");

                    return Scenario.loadEmptyScenario();
                }

                return Scenario.loadScenario(options);

            }).then(function  (result) {
                io.sockets.emit('AdminProcessLog', {
                    msg: result.msg,
                    isError: false
                });

                let hists = result.historiques;
                let periods = [];

                for (let i = hists[0].period; i < 0; i++) {
                    periods.push(i);
                }

                //global.hists = hists;

                // now we have initial situation
                options["startFromPlayerID"] = 1;
                options["endWithPlayerID"] = options.playersNb;

                options["startFromPeriod"] = hists[0].period;
                options["endWithPeriod"] = 0; // T -1

                options["historiques"] = hists;

                return PlayerDecision.addDecisions(options.seminar, periods, options.playersNb, hists);

            }).then(function  (result) {
                io.sockets.emit('AdminProcessLog', {
                    msg: result.msg,
                    isError: false
                });


                let periods = [];

                for (let i = 1; i < options.simulationSpan; i++) {
                    periods.push(i);
                }
                // now empty decisions

                options["startFromPlayerID"] = 1;
                options["endWithPlayerID"] = options.playersNb;

                options["startFromPeriod"] = 1;
                options["endWithPeriod"] = options.simulationSpan;

                var lastDec = options["historiques"][options["historiques"].length - 1];
                var decision = PlayerDecision.resetRawDecision(lastDec);

                return PlayerDecision.addDecisions(options.seminar, periods, options.playersNb, decision);

            }).then(function  (result) {
                io.sockets.emit('AdminProcessLog', {
                    msg: result.msg,
                    isError: false
                });

                status = 'actived';

                console.log('Initialization Done');

                res.status(200).send('Initialization done.');

            }, function  (error) { //log the error
                io.sockets.emit('AdminProcessLog', {
                    msg: error.msg,
                    isError: true
                });

                status = 'actived';

                res.status(404).send(error.msg);

            }, function  (progress) { //log the progress
                io.sockets.emit('AdminProcessLog', {
                    msg: progress.msg,
                    isError: false
                });

            }).done();


        }
    }
}

/*
exports.initialiseExtendedFeedbackSlides = function (io) {
    return function (req, res, next) {
        var options = {
            producerID: '1',
            retailerID: '1',
            seminar: req.body.seminar,
            startFrom: -3,
            endWith: 0,
            cgiHost: conf.cgi.host,
            cgiPort: conf.cgi.port,
            cgiPath: conf.cgi.path_BG_extendedFeedbackSlides,
        }

        require('./models/BG_extendedFeedbackSlides.js').addInfos(options).then(function (result) {
            io.sockets.emit('AdminProcessLog', {
                msg: result.msg,
                isError: false
            });
            console.log('Initialization Done');
            res.send(200, 'Initialization done.');
        });
    }
}

exports.initialiseSeminarRetailer = function (io) {
    return function (req, res, next) {
        var options = {
            producerID: '1',
            retailerID: '1',
            seminar: req.body.seminar,
            startFrom: -3,
            endWith: 1,
            cgiHost: conf.cgi.host,
            cgiPort: conf.cgi.port,
            cgiPath: conf.cgi.path_retailerDecision,
        }

        require('./models/retailerDecision.js').addRetailerDecisions(options).then(function (result) {
            io.sockets.emit('AdminProcessLog', {
                msg: result.msg,
                isError: false
            });
        });
    }
}
*/
