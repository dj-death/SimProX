import http = require('http');
import util = require('util');
import path = require('path');

let mongoose = require('mongoose-q')(require('mongoose'));

let io = require('socket.io');
let _ = require('underscore');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let check = require('validator');
let events = require('events');
let q = require('q');

import PlayerDecision = require('../decision/Decision');

let userRoles = require('../../../public/js/routingConfig.js').userRoles;


import Utils = require('../../../kernel/utils/Utils');
import console = require('../../../kernel/utils/logger');

import Flat = require('../../utils/Flat');
import Excel = require('../../utils/ExcelUtils');


import config = require('../../../config');
let EngineConfig = config.engine;


import seminarSchema = require('./Schema');

let Seminar = mongoose.model('seminar', seminarSchema);



export let localStrategy = new LocalStrategy(function  (username, password, done) {
    var parameters = ['', '', ''],
        j = 0;
    var tempSeminar: any = {};

    for (var i = 0; i < username.length; i++) {
        if (username[i] == '^') j = j + 1;
        else parameters[j] = parameters[j] + username[i];
        if (j > 2) break;
    }

    var para_seminar = parameters[0],
        para_role = parameters[1],
        para_roleID = parameters[2];

    Seminar.findOne({
        seminarCode: para_seminar

    }, function  (err, doc) {
        if (err) {
            return done(err);
        }
        if (!doc) {
            return done(null, false, {
                message: 'Incorrect seminar code.'
            });
        }

        if (!doc.isInitialise) {
            console.log('Seminar has not opened.');

            return done(null, false, {
                message: 'Seminar has not opened.'
            })
        }

        console.log(userRoles.player, parseInt(para_role, 10), doc.players[Number(para_roleID) - 1].password)

        switch (parseInt(para_role, 10)) {
            case userRoles.player:
                if (doc.players[Number(para_roleID) - 1].password != password) {
                    return done(null, false, {
                        message: 'Incorrect password'
                    });
                }

                break;

            case userRoles.facilitator:
                if (doc.facilitator[Number(para_roleID) - 1].password != password) {
                    return done(null, false, {
                        message: 'Incorrect password'
                    });
                }
                break;

            default:
                return done(null, false, {
                    message: 'role does not exist.'
                });
        }



        tempSeminar.seminarCode = doc.seminarCode;
        tempSeminar.seminarDescription = doc.seminarDescription;
        tempSeminar.currentPeriod = doc.currentPeriod;
        tempSeminar.simulationSpan = doc.simulationSpan;

        return done(null, {
            seminar: tempSeminar,
            role: para_role,
            roleID: Number(para_roleID),
            username: username
        });

    });
})



export function  serializeUser (user, done) {
    done(null, user.username);
}

export function  deserializeUser (username, done) {
    var parameters = ['', '', ''],
        j = 0;
    var tempSeminar = {};

    for (var i = 0; i < username.length; i++) {
        if (username[i] == '^') j = j + 1;
        else parameters[j] = parameters[j] + username[i];
        if (j > 2) break;
    }

    var para_seminar = parameters[0],
        para_role = parameters[1],
        para_roleID = parameters[2];

    Seminar.findOne({
        seminarCode: para_seminar
    }, function  (err, doc) {
        if (err) {
            return done(err);
        }
        if (!doc) {
            return done(null, false, {
                message: 'Incorrect seminar code.'
            });
        }
        if (!doc.isInitialise) {
            return done(null, false, {
                message: 'Seminar has not opened.'
            })
        }
        tempSeminar["seminarCode"] = doc.seminarCode;
        tempSeminar["seminarDescription"] = doc.seminarDescription;
        tempSeminar["currentPeriod"] = doc.currentPeriod;
        tempSeminar["simulationSpan"] = doc.simulationSpan;

        return done(null, {
            seminar: tempSeminar,
            role: para_role,
            roleID: Number(para_roleID),
            username: username
        });
    });
}

export function  getSeminarList (req, res, next) {
    return Seminar.find(function  (err, docs) {
        if (!err) {
            return res.status(200).send(docs);
        } else {
            res.status(400);

            return console.log(err);
        }
    });
}

export function  getSeminarReportPurchaseStatus (req, res, next) {
    // body...
    var tempReportPurchaseStatus = {};
    return Seminar.findOne({
        seminarCode: req.params.seminar
    }, function  (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            console.log('cannot find matched doc');
        } else {

            /*
			if (req.params.type == "P") {
				for (var i = 0; i < doc.producers[req.params.playerID - 1].reportPurchaseStatus.length; i++) {
					if (req.params.period == doc.producers[req.params.playerID - 1].reportPurchaseStatus[i].period) {
						tempReportPurchaseStatus = doc.producers[req.params.playerID - 1].reportPurchaseStatus[i];
						break;
					}
				}

			} else {
				for (var i = 0; i < doc.retailers[req.params.playerID - 1].reportPurchaseStatus.length; i++) {
					if (req.params.period == doc.retailers[req.params.playerID - 1].reportPurchaseStatus[i].period) {
						tempReportPurchaseStatus = doc.retailers[req.params.playerID - 1].reportPurchaseStatus[i];
						break;
					}
				}
			}
			*/

            if (req.params.type == "P") {
                for (var i = 0; i < doc.players[req.params.playerID - 1].reportPurchaseStatus.length; i++) {
                    if (req.params.period == doc.players[req.params.playerID - 1].reportPurchaseStatus[i].period) {
                        tempReportPurchaseStatus = doc.players[req.params.playerID - 1].reportPurchaseStatus[i];
                        break;
                    }
                }

            }

            res.status(200).send(tempReportPurchaseStatus);
        }
    })
}

export function  getSeminarInfo (req, res, next) {
    var tempSeminar = {};
    return Seminar.findOne({
        seminarCode: req.params.seminar
    }, function  (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            console.log('cannot find matched doc');
        } else {
            tempSeminar["seminarCode"] = doc.seminarCode;
            tempSeminar["seminarDescription"] = doc.seminarDescription;
            tempSeminar["currentPeriod"] = doc.currentPeriod;
            tempSeminar["simulationSpan"] = doc.simulationSpan;

            res.status(200).send(tempSeminar);
        }
    })
}


export function  checkPlayerDecisionStatus (req, res, next) {
    Seminar.findOne({
        seminarCode: req.params.seminar
    }, function  (err, doc) {
        if (err) {
            return next(new Error(err));
        }

        if (doc) {
            var result = {
                //'isPortfolioDecisionCommitted': false,
                //'isContractDeal': false,
                //'isContractFinalized': false,

                'isDecisionCommitted': false
            };

            for (var i = 0; i < doc.players[req.params.playerID - 1].decisionCommitStatus.length; i++) {

                if (doc.players[req.params.playerID - 1].decisionCommitStatus[i].period == req.params.period) {

                    //result.isPortfolioDecisionCommitted = doc.producers[req.params.producerID - 1].decisionCommitStatus[i].isPortfolioDecisionCommitted;
                    //result.isContractDeal = doc.producers[req.params.producerID - 1].decisionCommitStatus[i].isContractDeal;
                    //result.isContractFinalized = doc.producers[req.params.producerID - 1].decisionCommitStatus[i].isContractFinalized;

                    result.isDecisionCommitted = doc.players[req.params.playerID - 1].decisionCommitStatus[i].isDecisionCommitted;
                }
            }

            res.status(200).send(result);

        } else {
            res.status(404).send('there is no contract');
        }
    })
}


export function  submitFinalDecision (io) {
    return function  (req, res, next) {
        var queryCondition = {
            seminar: req.body.seminar,
            playerID: req.body.playerID,
            period: req.body.period,
            value: req.body.value
        }

        Seminar.findOne({
            seminarCode: queryCondition.seminar
        }, function  (err, doc) {
            if (err) {
                return next(new Error(err));
            }
            if (doc) {
                var player = doc.players[queryCondition.playerID - 1];

                switch (queryCondition["role"]) {


                    default:

                        console.log(queryCondition);

                        for (var i = 0; i < player.decisionCommitStatus.length; i++) {
                            if (player.decisionCommitStatus[i].period == queryCondition.period) {
                                player.decisionCommitStatus[i].isDecisionCommitted = true;
                            }
                        }

                        doc.markModified('players');

                        break;

                }

                doc.save(function  (err) {
                    if (!err) {
                        io.sockets.emit('socketIO:committeDecision', {
                            seminar: queryCondition.seminar,
                            role: queryCondition["role"],
                            roleID: queryCondition["roleID"],
                            period: queryCondition["period"],

                            result: [{
                                playerID: queryCondition.playerID
                            }],
                        });

                        res.status(200).send({
                            result: 'success'
                        });

                    } else {
                        res.status(400).send({
                            result: 'fail'
                        });
                    }
                })

            } else {
                res.status(404).send('there is no contract');
            }
        })
    }
}


/*
export function  checkProducerDecisionStatus = function (req, res, next) {
	Seminar.findOne({
		seminarCode: req.params.seminar
	}, function (err, doc) {
		if (err) {
			return next(new Error(err))
		};
		if (doc) {
			var result = {
				'isPortfolioDecisionCommitted': false,
				'isContractDeal': false,
				'isContractFinalized': false,
				'isDecisionCommitted': false
			};
			for (var i = 0; i < doc.producers[req.params.producerID - 1].decisionCommitStatus.length; i++) {
				if (doc.producers[req.params.producerID - 1].decisionCommitStatus[i].period == req.params.period) {
					result.isPortfolioDecisionCommitted = doc.producers[req.params.producerID - 1].decisionCommitStatus[i].isPortfolioDecisionCommitted;
					result.isContractDeal = doc.producers[req.params.producerID - 1].decisionCommitStatus[i].isContractDeal;
					result.isContractFinalized = doc.producers[req.params.producerID - 1].decisionCommitStatus[i].isContractFinalized;
					result.isDecisionCommitted = doc.producers[req.params.producerID - 1].decisionCommitStatus[i].isDecisionCommitted;
				}
			}
			res.send(200, result);
		} else {
			res.send(404, 'there is no contract');
		}
	})
}

export function  checkRetailerDecisionStatus = function (req, res, next) {
	Seminar.findOne({
		seminarCode: req.params.seminar
	}, function (err, doc) {
		if (err) {
			return next(new Error(err))
		};
		if (doc) {
			var result = {
				'isContractDeal': false,
				'isContractFinalized': false,
				'isDecisionCommitted': false
			};
			for (var i = 0; i < doc.retailers[req.params.retailerID - 1].decisionCommitStatus.length; i++) {
				if (doc.retailers[req.params.retailerID - 1].decisionCommitStatus[i].period == req.params.period) {
					result.isContractDeal = doc.retailers[req.params.retailerID - 1].decisionCommitStatus[i].isContractDeal;
					result.isContractFinalized = doc.retailers[req.params.retailerID - 1].decisionCommitStatus[i].isContractFinalized;
					result.isDecisionCommitted = doc.retailers[req.params.retailerID - 1].decisionCommitStatus[i].isDecisionCommitted;

				}
			}
			res.send(200, result);
		} else {
			res.send(404, 'there is no contract');
		}
	})
}

*/


/*

export function  submitPortfolioDecision = function (io) {
	return function (req, res, next) {
		var queryCondition = {
			seminar: req.body.seminar,
			producerID: req.body.producerID,
			period: req.body.period,
			value: req.body.value
		}

		Seminar.findOne({
			seminarCode: queryCondition.seminar
		}, function (err, doc) {
			if (err) {
				return next(new Error(err))
			};
			if (doc) {
				for (var i = 0; i < doc.producers[queryCondition.producerID - 1].decisionCommitStatus.length; i++) {
					if (doc.producers[queryCondition.producerID - 1].decisionCommitStatus[i].period == queryCondition.period) {
						doc.producers[queryCondition.producerID - 1].decisionCommitStatus[i].isPortfolioDecisionCommitted = queryCondition.value;
					}
				}
				doc.markModified('producers');

				//notify Retailer that supplier X has committed portfolio decision.
				//io.sockets.emit('socketIO:producerPortfolioDecisionStatusChanged', {period : queryCondition.period, producerID : queryCondition.producerID, seminar : queryCondition.seminar});                

				//notify Retailer to refresh negotiation page automatically 


				doc.save(function (err) {
					if (err) {
						res.send(400, 'fail')
					} else {
						io.sockets.emit('socketIO:committedPortfolio', {
							result: [{
								producerID: queryCondition.producerID
							}],
							period: queryCondition.period,
							seminar: queryCondition.seminar
						});
						res.send(200, 'success');
					}
				})
			} else {
				res.send(404, 'there is no contract');
			}
		})
	}
}

export function  submitContractDeal = function (io) {
	return function (req, res, next) {
		var queryCondition = {
			seminar: req.body.seminar,
			roleID: req.body.roleID,
			role: req.body.role,
			period: req.body.period,
			value: req.body.value,
		}
		Seminar.findOne({
			seminarCode: queryCondition.seminar
		}, function (err, doc) {
			if (err) {
				return next(new Error(err));
			}
			if (doc) {
				switch (queryCondition.role) {
					case 'Producer':
						for (var i = 0; i < doc.producers[queryCondition.roleID - 1].decisionCommitStatus.length; i++) {
							if (doc.producers[queryCondition.roleID - 1].decisionCommitStatus[i].period == queryCondition.period) {
								doc.producers[queryCondition.roleID - 1].decisionCommitStatus[i].isContractDeal = queryCondition.value;
							}
						}
						doc.markModified('producers');
						break;
					case 'Retailer':
						for (var i = 0; i < doc.retailers[queryCondition.roleID - 1].decisionCommitStatus.length; i++) {
							if (doc.retailers[queryCondition.roleID - 1].decisionCommitStatus[i].period == queryCondition.period) {
								doc.retailers[queryCondition.roleID - 1].decisionCommitStatus[i].isContractDeal = queryCondition.value;
							}
						}
						doc.markModified('retailers');
						break;
				}
				doc.save(function (err) {
					if (!err) {
						if (queryCondition.value && queryCondition.role == "Producer") {
							io.sockets.emit('socketIO:dealContract', {
								seminar: queryCondition.seminar,
								producerID: queryCondition.roleID,
								period: queryCondition.period
							});
						}
						res.send(200, {
							result: 'success'
						});
					} else {
						res.send(400, {
							result: 'fail'
						});
					}
				})
			} else {
				res.send(404, 'there is no contract');
			}
		})
	}
}

export function  submitContractFinalized = function (io) {
	return function (req, res, next) {
		var queryCondition = {
			seminar: req.body.seminar,
			roleID: req.body.roleID,
			role: req.body.role,
			period: req.body.period,
			value: req.body.value,
		}

		Seminar.findOne({
			seminarCode: queryCondition.seminar
		}, function (err, doc) {
			if (err) {
				return next(new Error(err));
			}
			if (doc) {
				switch (queryCondition.role) {
					case 'Producer':
						for (var i = 0; i < doc.producers[queryCondition.roleID - 1].decisionCommitStatus.length; i++) {
							if (doc.producers[queryCondition.roleID - 1].decisionCommitStatus[i].period == queryCondition.period) {
								doc.producers[queryCondition.roleID - 1].decisionCommitStatus[i].isContractFinalized = queryCondition.value;
							}
						}
						doc.markModified('producers');
						break;
					case 'Retailer':
						for (var i = 0; i < doc.retailers[queryCondition.roleID - 1].decisionCommitStatus.length; i++) {
							if (doc.retailers[queryCondition.roleID - 1].decisionCommitStatus[i].period == queryCondition.period) {
								doc.retailers[queryCondition.roleID - 1].decisionCommitStatus[i].isContractFinalized = queryCondition.value;
							}
						}
						doc.markModified('retailers');
						break;
				}
				doc.save(function (err) {
					if (!err) {
						io.sockets.emit('socketIO:finalizeContract', {
							seminar: queryCondition.seminar,
							role: queryCondition.role,
							roleID: queryCondition.roleID,
							period: queryCondition.period
						});
						res.send(200, {
							result: 'success'
						});
					} else {
						res.send(400, {
							result: 'fail'
						});
					}
				})
			} else {
				res.send(404, 'there is no contract');
			}
		})
	}
}

export function  submitFinalDecision = function (io) {
	return function (req, res, next) {
		var queryCondition = {
			seminar: req.body.seminar,
			roleID: req.body.roleID,
			role: req.body.role,
			period: req.body.period,
			value: req.body.value,
		}

		Seminar.findOne({
			seminarCode: queryCondition.seminar
		}, function (err, doc) {
			if (err) {
				return next(new Error(err));
			}
			if (doc) {
				switch (queryCondition.role) {
					case 'Producer':
						for (var i = 0; i < doc.producers[queryCondition.roleID - 1].decisionCommitStatus.length; i++) {
							if (doc.producers[queryCondition.roleID - 1].decisionCommitStatus[i].period == queryCondition.period) {
								doc.producers[queryCondition.roleID - 1].decisionCommitStatus[i].isDecisionCommitted = queryCondition.value;
							}
						}
						doc.markModified('producers');
						break;
					case 'Retailer':
						for (var i = 0; i < doc.retailers[queryCondition.roleID - 1].decisionCommitStatus.length; i++) {
							if (doc.retailers[queryCondition.roleID - 1].decisionCommitStatus[i].period == queryCondition.period) {
								doc.retailers[queryCondition.roleID - 1].decisionCommitStatus[i].isDecisionCommitted = queryCondition.value;
							}
						}
						doc.markModified('retailers');
						break;
				}
				doc.save(function (err) {
					if (!err) {
						io.sockets.emit('socketIO:committeDecision', {
							seminar: queryCondition.seminar,
							role: queryCondition.role,
							roleID: queryCondition.roleID,
							period: queryCondition.period
						});
						res.send(200, {
							result: 'success'
						});
					} else {
						res.send(400, {
							result: 'fail'
						});
					}
				})
			} else {
				res.send(404, 'there is no contract');
			}
		})
	}
}


*/


export function  setCurrentPeriod (io) {
    return function  (req, res, next) {
        var queryCondition = {
            seminar: req.body.seminar,
            period: req.body.period
        }

        Seminar.findOne({
            seminarCode: queryCondition.seminar
        }, function  (err, doc) {
            if (err) {
                return next(new Error(err))
            }
            if (doc) {
                doc.currentPeriod = queryCondition.period;
                doc.save(function  (err) {
                    if (!err) {
                        io.sockets.emit('socketIO:seminarPeriodChanged', {
                            currentPeriod: queryCondition.period,
                            seminarCode: queryCondition.seminar,
                            simulationSpan: doc.simulationSpan
                        });

                        res.status(200).send({
                            result: 'success'
                        });
                    } else {
                        res.status(400).send({
                            result: 'fail'
                        });
                    }
                })
            } else {
                res.status(404).send('there is no such Seminar...');
            }
        })
    }
}

export function  deleteSeminar (req, res, next) {
    console.log('try to remote a seminar:' + req.body.seminarCode);
    Seminar.findOne({
        seminarCode: req.body.seminarCode
    }, function  (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (!doc) {
            res.status(404).send('cannot find matched doc to remove....');
        } else {
            doc.remove(function  (err, doc) {
                if (err) {
                    res.status(400).send('remove seminar failure.');
                } else {


                    PlayerDecision.removePlayersDecisions({
                        seminar: req.body.seminarCode

                    }).then(function  () {
                        res.status(200).send('delete');

                    }, function  (error) { //log the error
                        console.error(error.msg);

                        res.status(400).send('remove decision of seminar failure.');

                    }).done();
                }
            });
        }
    });
}

export function  addSeminars (req, res, next) {
    var values = {
        seminarCode: req.body.seminarCode,
        seminarDescription: req.body.seminarDescription,
        simulationSpan: req.body.simulationSpan,
        playersNb: req.body.playersNb,
        simulationScenarioID: req.body.simulationScenarioID,
        
    };

    var doc = new Seminar(values);

    var playerDoc;

    doc.facilitator.push({
        password: "310",
        facilitatorDescription: ""
    });

    for (var i = 1; i <= values.playersNb; i++) {

        playerDoc = {
            playerID: i,
            
            password: "1" + i + "0",
            decisionCommitStatus: [],
            reportPurchaseStatus: [],
            members: []
        };

        playerDoc.reportPurchaseStatus.push({
            period: 0
        });


        for (var j = 1; j <= values.simulationSpan; j++) {

            playerDoc.decisionCommitStatus.push({
                period: j,
                isDecisionCommitted: false,
                //isPortfolioDecisionCommitted: false,
                //isContractDeal: false,
                //isContractFinalized: false
            });

            playerDoc.reportPurchaseStatus.push({
                period: j,

                //awareness: false,
                //brandPerceptions: false,
                //retailerPerceptions: false,
                //marketShareByConsumerSegment: true,
                //salesByConsumerSegment: true,
                //marketShareByShopperSegment: true,
                //salesByShopperSegment: true,
                //BMRetailerPrices: true,
                //promotionIntensity: true,
                //supplierIntelligence: true,
                //retailerIntelligence: true,
                //forecasts: true,
                //social: true
            });

        };

        doc.players.push(playerDoc);

    };

    doc.save(function  (err) {
        if (!err) {
            res.status(200).send(doc);
        } else {
            res.status(400).send(err);
        }
    });
}

export function  updateSeminar (io) {

    return function  (req, res, next) {
        var queryCondition = {
            seminarCode: req.body.seminarCode,
            currentPeriod: req.body.currentPeriod,
            behaviour: req.body.behaviour,
            /*
			password:edit password(need location ,additionalIdx,value)
			*/
            location: req.body.location,
            additionalIdx: req.body.additionalIdx,
            value: req.body.value
        };

        Seminar.findOne({
            seminarCode: queryCondition.seminarCode
        }, function  (err, doc) {
            if (err) {
                return next(new Error(err));
            }
            if (!doc) {
                res.status(404).send('cannot find matched doc....');
            } else {
                var isUpdate = true;
                switch (queryCondition.behaviour) {
                    case 'updatePassword':
                        doc[queryCondition.location][queryCondition.additionalIdx].password = queryCondition.value;
                        break;
                    case 'updateCurrentPeriod':
                        doc.currentPeriod = queryCondition.value;
                        break;
                    case 'updateSimulationSpan':
                        doc.simulationSpan = queryCondition.value;
                        break;
                    case 'switchTimer':
                        doc.isTimerActived = queryCondition.value;
                        break;
                    case 'updateTimeslotPortfolioDecisionCommitted':
                        doc.timeslotPortfolioDecisionCommitted = queryCondition.value;
                        break;
                    case 'updateTimeslotContractDeal':
                        doc.timeslotContractDeal = queryCondition.value;
                        break;
                    case 'updateTimeslotContractFinalized':
                        doc.timeslotContractFinalized = queryCondition.value;
                        break;
                    case 'updateTimeslotDecisionCommitted':
                        doc.timeslotDecisionCommitted = queryCondition.value;
                        break;
                }
                if (isUpdate) {
                    doc.markModified('facilitator');
                    doc.markModified('players');

                    /*
					doc.markModified('retailers');
					doc.markModified('producers');
					*/

                    doc.save(function  (err, doc, numberAffected) {
                        if (err) {
                            return next(new Error(err));
                        }
                        if (queryCondition.behaviour == "updateCurrentPeriod" || queryCondition.behaviour == "updateSimulationSpan") {
                            io.sockets.emit('socketIO:seminarPeriodChanged', {
                                currentPeriod: doc.currentPeriod,
                                seminarCode: doc.seminarCode,
                                simulationSpan: doc.simulationSpan
                            });
                        }

                        if (queryCondition.behaviour == "switchTimer") {
                            io.sockets.emit('socketIO:timerChanged', {
                                period: doc.currentPeriod,
                                seminar: doc.seminarCode,
                                isTimerActived: queryCondition.value

                            });
                        }

                        res.status(200).send('mission complete!');
                    });
                }

            }
        });

    }
}

export function  submitOrder (io) {
    return function  (req, res, next) {
        var queryCondition = {
            seminarCode: req.body.seminarCode,
            period: req.body.period,
            player: req.body.player,
            playerID: req.body.playerID,
            name: req.body.name,
            value: req.body.value
        };
        Seminar.findOne({
            seminarCode: queryCondition.seminarCode
        }, function  (err, doc) {
            if (err) {
                return next(new Error(err));
            }
            if (!doc) {
                res.status(404).send('cannot find matched doc....');
            } else {
                var isUpdate = true;
                switch (queryCondition.player) {
                    /*
					case 'Producer':
						for (var i = 0; i < doc.producers.length; i++) {
							if (doc.producers[i].producerID == queryCondition.playerID) {
								for (var j = 0; j < doc.producers[i].reportPurchaseStatus.length; j++) {
									if (doc.producers[i].reportPurchaseStatus[j].period == queryCondition.period) {
										doc.producers[i].reportPurchaseStatus[j][queryCondition.name] = queryCondition.value;
									}
								}
							}
						}
						break;
					case 'Retailer':
						for (var i = 0; i < doc.retailers.length; i++) {
							if (doc.retailers[i].retailerID == queryCondition.playerID) {
								for (var j = 0; j < doc.retailers[i].reportPurchaseStatus.length; j++) {
									if (doc.retailers[i].reportPurchaseStatus[j].period == queryCondition.period) {
										doc.retailers[i].reportPurchaseStatus[j][queryCondition.name] = queryCondition.value;
									}
								}
							}
						}
						break;
					*/

                    default: for (var i = 0; i < doc.producers.length; i++) {
                        if (doc.players[i].playerID == queryCondition.playerID) {
                            for (var j = 0; j < doc.players[i].reportPurchaseStatus.length; j++) {
                                if (doc.players[i].reportPurchaseStatus[j].period == queryCondition.period) {
                                    doc.players[i].reportPurchaseStatus[j][queryCondition.name] = queryCondition.value;
                                }
                            }
                        }
                    }
                        break;
                }
                if (isUpdate) {
                    doc.markModified('facilitator');
                    doc.markModified('players');

                    /*
					doc.markModified('retailers');
					doc.markModified('producers');
					*/

                    doc.save(function  (err, doc, numberAffected) {
                        if (err) {
                            return next(new Error(err));
                        }

                        /*if (queryCondition.player == "Producer") {
							io.sockets.emit('socketIO:producerMarketResearchOrdersChanged', {
								period: queryCondition.period,
								seminar: queryCondition.seminarCode,
								producerID: queryCondition.playerID
							});

						} else {
							io.sockets.emit('socketIO:retailerMarketResearchOrdersChanged', {
								period: queryCondition.period,
								seminar: queryCondition.seminarCode,
								retailerID: queryCondition.playerID
							});

						}*/

                        /*
                         * TODO: keep it ?
                         */

                        io.sockets.emit('socketIO:producerMarketResearchOrdersChanged', {
                            period: queryCondition.period,
                            seminar: queryCondition.seminarCode,
                            playerID: queryCondition.playerID
                        });

                        console.log('save updated, number affected!:' + numberAffected);
                        res.status(200).send('mission complete!');
                    });
                }
            }
        })
    }
}

/*
 * TODO: keep it ?
 */

export function  getPlayerReportOrder (req, res, next) {
    Seminar.findOne({
        seminarCode: req.params.seminar
    }, function  (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (doc) {
            /*
			if (req.params.userType == "P") {
				for (var i = 0; i < doc.producers[req.params.playerID - 1].reportPurchaseStatus.length; i++) {
				if (doc.producers[req.params.playerID - 1].reportPurchaseStatus[i].period == req.params.period) {
						res.send(200, doc.producers[req.params.playerID - 1].reportPurchaseStatus[i]);
						break;
					}
				}
			} else {
				for (var i = 0; i < doc.retailers[req.params.playerID - 1].reportPurchaseStatus.length; i++) {
					if (doc.retailers[req.params.playerID - 1].reportPurchaseStatus[i].period == req.params.period) {
						res.send(200, doc.retailers[req.params.playerID - 1].reportPurchaseStatus[i]);
						break;
					}
				}
			}
			*/

            if (req.params.userType == "P") {
                for (var i = 0; i < doc.players[req.params.playerID - 1].reportPurchaseStatus.length; i++) {
                    if (doc.players[req.params.playerID - 1].reportPurchaseStatus[i].period == req.params.period) {
                        res.status(200).send(doc.players[req.params.playerID - 1].reportPurchaseStatus[i]);
                        break;
                    }
                }
            }

        } else {
            res.status(404).send('cannot find matched doc....');
        }
    });
}

export function  getTimerActiveInfo (req, res, next) {
    Seminar.findOne({
        seminarCode: req.params.seminar
    }, function  (err, doc) {
        if (err) {
            return next(new Error(err));
        }
        if (doc) {
            var result = {
                'result': doc.isTimerActived,
                //'timeslotPortfolioDecisionCommitted': doc.timeslotPortfolioDecisionCommitted,
                //'timeslotContractDeal': doc.timeslotContractDeal,
                //'timeslotContractFinalized': doc.timeslotContractFinalized,
                'timeslotDecisionCommitted': doc.timeslotDecisionCommitted
            }
            res.status(200).send(result);
        } else {
            res.status(404).send('cannot find matched doc....');
        }
    })
}

export function  initializeSeminar (options) {
    var deferred = q.defer();

    console.log('initialise Seminar:', options.seminar);

    Seminar.findOne({
        seminarCode: options.seminar
    }, function  (err, doc) {
        if (err) {
            deferred.reject({
                msg: err
            });

            console.log(err);
        }
        if (!doc) {
            deferred.reject({
                msg: 'cannot find matched seminar : ' + options.seminar
            });

            console.log('cannot find matched seminar : ');
            console.info(options);
        }

        doc.simulationSpan = options.simulationSpan;
        doc.traceActive = options.traceActive;
        doc.forceNextDecisionsOverwrite = options.forceNextDecisionsOverwrite;

        doc.isInitialise = true;

        doc.save(function  (err, doc, numberAffected) {
            if (err) {
                deferred.reject({
                    msg: err
                });
            }

            deferred.resolve({
                msg: "success initialise seminar",
                seminar: doc
            });
        });
    });

    return deferred.promise;
}

export function  passiveSeminar (options) {
    var deferred = q.defer();
    Seminar.findOne({
        seminarCode: options.seminar
    }, function  (err, doc) {
        if (err) {
            deferred.reject({
                msg: err
            });
        }
        if (!doc) {
            deferred.reject({
                msg: 'cannot find matched seminar : ' + options.seminar
            });
        }
        var reqOptions = {
            hostname: options.cgiHost,
            port: options.cgiPort,
            path: options.cgiPath + '?seminar=' + doc.seminarCode + '&span=' + doc.simulationSpan + '&isTraceActive=' + doc.traceActive + '&isTraditionalTradeActive=' + doc.traditionalTradeActive + '&isEMallActive=' + doc.EMallActive + '&isVirtualSupplierActive=' + doc.virtualSupplierActive + '&leadingMarket=' + options.leadingMarket + '&supplier4growthpace=' + options.supplier4growthpace + '&supplier4activationgap=' + options.supplier4activationgap + '&isForceNextDecisionsOverwrite=' + doc.forceNextDecisionsOverwrite + '&market1ID=' + doc.market1ID + '&market2ID=' + doc.market2ID + '&category1ID=' + doc.category1ID + '&category2ID=' + doc.category2ID + '&period=' + options.period
        };

        http.get(reqOptions, function  (response) {
            var data = '';
            response.setEncoding('utf8');
            response.on('data', function  (chunk) {
                data += chunk;
            }).on('end', function  () {
                if (response.statusCode === (404 || 500))
                    deferred.reject({
                        msg: data
                    });
                else {
                    deferred.resolve({
                        msg: 'Get passive decision complete:' + data
                    });
                }
            }).on('error', function  (e) {
                deferred.reject({
                    msg: e.message
                });
            });

        });
    });

    return deferred.promise;
};

export function  getSimulationParams (options) {
    var deferred = q.defer();

    Seminar.findOne({
        seminarCode: options.seminar

    }, function  (err, doc) {
        if (err) {
            deferred.reject({
                msg: err
            });
        }

        if (!doc) {
            deferred.reject({
                msg: 'cannot find matched seminar : ' + options.seminar
            });
        }

        var simParams = {
            simulationScenarioID: doc.simulationScenarioID,
            simulationSpan: doc.simulationSpan,
            traceActive: doc.traceActive
        };

        deferred.resolve({
            msg: 'Getting Simulation Params successed:',
            simParams: simParams
        });

    });

    return deferred.promise;
};

export function  kernelSeminar (options) {
    var deferred = q.defer();
    Seminar.findOne({
        seminarCode: options.seminar
    }, function  (err, doc) {
        if (err) {
            deferred.reject({
                msg: err
            });
        }
        if (!doc) {
            deferred.reject({
                msg: 'cannot find matched seminar : ' + options.seminar
            });
        }
        var reqOptions = {
            hostname: options.cgiHost,
            port: options.cgiPort,
            path: options.cgiPath + '?seminar=' + doc.seminarCode + '&span=' + doc.simulationSpan + '&isTraceActive=' + doc.traceActive + '&isTraditionalTradeActive=' + doc.traditionalTradeActive + '&isEMallActive=' + doc.EMallActive + '&isVirtualSupplierActive=' + doc.virtualSupplierActive + '&leadingMarket=' + options.leadingMarket + '&supplier4growthpace=' + options.supplier4growthpace + '&supplier4activationgap=' + options.supplier4activationgap + '&isForceNextDecisionsOverwrite=' + doc.forceNextDecisionsOverwrite + '&market1ID=' + doc.market1ID + '&market2ID=' + doc.market2ID + '&category1ID=' + doc.category1ID + '&category2ID=' + doc.category2ID + '&period=' + options.period

        };
        http.get(reqOptions, function  (response) {
            var data = '';
            response.setEncoding('utf8');
            response.on('data', function  (chunk) {
                data += chunk;
            }).on('end', function  () {
                if (response.statusCode === (404 || 500))
                    deferred.reject({
                        msg: data
                    });
                else {
                    deferred.resolve({
                        msg: 'Run kernel complete:' + data
                    });
                }
            }).on('error', function  (e) {
                deferred.reject({
                    msg: e.message
                });
            });
        })
    });
    return deferred.promise;
}

function  duplicateSeminarDoc(options) {
    var deferred = q.defer();

    Seminar.findOne({
        seminarCode: options.originalSeminarCode
    }, function  (err, doc) {
        if (err) {
            deferred.reject({
                msg: err
            });
        }
        if (doc) {
            deferred.resolve({
                msg: 'duplicate seminar document complete.'
            });
        } else {
            deferred.reject({
                msg: 'cannot find matched seminar : ' + options.originalSeminarCode
            });
        }
    })

    return deferred.promise;
}

export function  duplicateSeminar (req, res, next) {
    var queryCondition = {
        originalSeminarCode: req.body.originalSeminarCode,
        targetSeminarCode: req.body.targetSeminarCode,
        seminarDescription: req.body.seminarDescription
    }

    console.log('query:' + util.inspect(queryCondition));
    duplicateSeminarDoc(queryCondition)
        //deal with promises chain 						
        .then(function  (result) { //log the success info
            io.sockets.emit('AdminProcessLog', {
                msg: result.msg,
                isError: false
            });
            res.send(200, result.msg);
        }, function  (error) { //log the error
            console.log(error.msg);
            io.sockets.emit('AdminProcessLog', {
                msg: error.msg,
                isError: true
            });
            res.send(404, error.msg);
        }, function  (progress) { //log the progress
            io.sockets.emit('AdminProcessLog', {
                msg: progress.msg,
                isError: false
            });
        })
}

function  createNewTimer(seminarCode, countDown, io, timersEvents) {
    let newTimer = setInterval(function  () {
        countDown.pass++;

        /*if (countDown.portfolio > 0) {
			countDown.portfolio--;
		} else if (countDown.contractDeal > 0) {
			countDown.contractDeal--;
		} else if (countDown.contractFinalized > 0) {
			countDown.contractFinalized--;
		} else if (countDown.contractDecisionCommitted > 0) {
			countDown.contractDecisionCommitted--;
		}*/

        if (countDown.contractDecisionCommitted > 0) {
            countDown.contractDecisionCommitted--;
        }

        io.sockets.emit('socketIO:timerWork', {
            'seminar': seminarCode,
            'pass': countDown.pass,
            //'portfolio': countDown.portfolio,
            //'contractDeal': countDown.contractDeal,
            //'contractFinalized': countDown.contractFinalized,
            'contractDecisionCommitted': countDown.contractDecisionCommitted
        });

        /*
		if (countDown.pass == countDown.timersEvent[0]) {
			timersEvents.emit('deadlinePortfolio', seminarCode, io);

		} else if (countDown.pass == countDown.timersEvent[1]) {
			timersEvents.emit('deadlineContractDeal', seminarCode, io);

		} else if (countDown.pass == countDown.timersEvent[2]) {
			timersEvents.emit('deadlineContractFinalized', seminarCode, io);

		} else if (countDown.pass == countDown.timersEvent[3]) {
			timersEvents.emit('deadlineDecisionCommitted', seminarCode, io);
		}
		*/

        if (countDown.pass == countDown.timersEvent[3]) {
            timersEvents.emit('deadlineDecisionCommitted', seminarCode, io);
        }

    }, 1000);

    newTimer["seminarCode"] = seminarCode;
    return newTimer;
}

/*
	第一步删除所有本轮相关的谈判
	删除所有本轮相关谈判细节
	重新生成本轮相关谈判
	重新生成本轮相关谈判细节
		--- 如果上一阶段有 相关细节 拷贝
		--- 否则 重新生成
	修改生产商决策
		--- 如果产品channel为1 修改IsMadeForOnlineBeforeNego
 */

/*
var commitPortfolioDecision = function (seminar, period, producers) {
	var d = q.defer();

	require('./contract.js').removeContractByAdmin(seminar, period, producers)
		.then(function (data) {
			//step 0: Delete all the related contractDetails schema 
			return require('./contract.js').removeContractDetailsByAdmin(seminar, period, producers);
		}).then(function (data) {
			//step 1 2: Add contract schema between current suppliers and retailers 
			return require('./contract.js').addContractByAdmin(seminar, period, producers);
		}).then(function (data) {
			//step 3: Add related contract details for two contact schema
			return require('./contract.js').addContractDetailsByAdmin(seminar, period, producers);
		}).then(function (data) {
			//step 4: after everything related have been inserted into DB, send request to /submitDecision to block input interface
			return require('./producerDecision.js').UpdateIsMadeForOnlineBeforeNegos(seminar, period, producers);
		}).then(function (data) {
			d.resolve('commitPortfolioDecision Dond');
		}).fail(function (data) {
			d.reject(data);
		}).done();
	return d.promise;
}

export function  commitPortfolio = function (io){
	return function (req, res, next) {
		var queryCondition = {
			seminar: '',
			period: 0,
			result: []
		};
		queryCondition.seminar = req.body.seminar;
		queryCondition.period = req.body.period;
		queryCondition.result.push({
			'producerID': req.body.producerID
		});

		Seminar.findOne({
			seminarCode: queryCondition.seminar
		}, function (err, doc) {

			doc.producers[req.body.producerID-1].decisionCommitStatus[queryCondition.period].isPortfolioDecisionCommitted = true;

			commitPortfolioDecision(queryCondition.seminar, queryCondition.period, queryCondition.result).then(function (result) {
				doc.markModified('producers');
				io.sockets.emit('socketIO:committedPortfolio', {
					result: queryCondition.result,
					seminar: doc.seminarCode,
					period: doc.currentPeriod
				});
				return doc.saveQ();
			}).then(function (result) {
				if (result) {
					res.send(200, result);
				} else {
					res.send(200, 'fail');
				}
			}).fail(function (err) {
				res.send(400, 'fail');
			}).done();
		});
	}
}

*/

export function  setTimer (io) {
    var timers = [];
    var timersEvents = new events.EventEmitter();


    /*
	timersEvents.on('deadlinePortfolio', function (seminarCode, io) {
		//set isPortfolioDecisionCommitted = true for all the suppliers 
		//then do all the related io.sockets.emit()...
		console.log('deadlinePortfolio');
		var d = q.defer();

		Seminar.findOne({
			seminarCode: seminarCode
		}, function (err, doc) {
			var result = new Array();
			if (doc) {
				for (var i = 0; i < 3; i++) {
					if (doc.producers[i].decisionCommitStatus[doc.currentPeriod].isPortfolioDecisionCommitted) {} else {
						doc.producers[i].decisionCommitStatus[doc.currentPeriod].isPortfolioDecisionCommitted = true;
						result.push({
							'producerID': i + 1
						});
					}
				}
			}

			commitPortfolioDecision(doc.seminarCode, doc.currentPeriod, result).then(function (result){
				doc.markModified('producers');
				console.log('edit committedPortfolio');
				io.sockets.emit('socketIO:committedPortfolio', {
					result: result,
					seminar: doc.seminarCode,
					period: doc.currentPeriod
				});
				return doc.saveQ();
			}).then(function (result){
				console.log('save:'+result);
			}).fail(function (err){
				return d.reject(err);
			}).done(function (){
				console.log('finish');
			});
		});
		return d.promise;


	}).on('deadlineContractDeal', function (seminarCode) {
		//....
		var d = q.defer();
		console.log('deadlineContractDeal');
		Seminar.findOne({
			seminarCode: seminarCode
		}, function (err, doc) {
			if (doc) {
				doc.producers[0].decisionCommitStatus[doc.currentPeriod].isContractDeal = true;
				doc.producers[1].decisionCommitStatus[doc.currentPeriod].isContractDeal = true;
				doc.producers[2].decisionCommitStatus[doc.currentPeriod].isContractDeal = true;
				doc.producers[3].decisionCommitStatus[doc.currentPeriod].isContractDeal = true;
				doc.retailers[0].decisionCommitStatus[doc.currentPeriod].isContractDeal = true;
				doc.retailers[1].decisionCommitStatus[doc.currentPeriod].isContractDeal = true;
				doc.retailers[2].decisionCommitStatus[doc.currentPeriod].isContractDeal = true;
				doc.retailers[3].decisionCommitStatus[doc.currentPeriod].isContractDeal = true;
			}
			//
			require('./contract.js').dealContractsByAdmin(doc.seminarCode, doc.currentPeriod)
			.then(function (){
				console.log('dealSuccess');
				doc.markModified('producers');
				doc.markModified('retailers');
				io.sockets.emit('socketIO:dealContract', {
					reult: [{
						producerID: 1
					}, {
						producerID: 2
					}, {
						producerID: 3
					}],
					seminar: doc.seminar,
					period: doc.period
				});
				doc.save(function (err,doc,num){
					console.log('deal finish');
				});
			}).fail(function (err){
				return d.reject(err);
			}).done();
		});
		return d.promise;

	}).on('deadlineContractFinalized', function (seminarCode) {
		//....
		console.log('deadlineContractFinalized');
		Seminar.findOne({
			seminarCode: seminarCode
		}, function (err, doc) {
			if (doc) {
				doc.producers[0].decisionCommitStatus[doc.currentPeriod].isContractFinalized = true;
				doc.producers[1].decisionCommitStatus[doc.currentPeriod].isContractFinalized = true;
				doc.producers[2].decisionCommitStatus[doc.currentPeriod].isContractFinalized = true;
				doc.producers[3].decisionCommitStatus[doc.currentPeriod].isContractFinalized = true;
				doc.retailers[0].decisionCommitStatus[doc.currentPeriod].isContractFinalized = true;
				doc.retailers[1].decisionCommitStatus[doc.currentPeriod].isContractFinalized = true;
				doc.retailers[2].decisionCommitStatus[doc.currentPeriod].isContractFinalized = true;
				doc.retailers[3].decisionCommitStatus[doc.currentPeriod].isContractFinalized = true;
			}
			doc.markModified('producers');
			doc.markModified('retailers');

			doc.save(function () {
				io.sockets.emit('socketIO:finalizeContract', {
					'seminarCode': doc.seminarCode,
					'period': doc.currentPeriod
				});
			});
		})


	}).on('deadlineDecisionCommitted', function (seminarCode) {
		//....
		console.log('deadlineDecisionCommitted');

		Seminar.findOne({
			seminarCode: seminarCode
		}, function (err, doc) {
			if (doc) {
				doc.producers[0].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.producers[1].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.producers[2].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.producers[3].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.retailers[0].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.retailers[1].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.retailers[2].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.retailers[3].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
			}
			doc.markModified('producers');
			doc.markModified('retailers');
			doc.save(function () {
				io.sockets.emit('socketIO:committeDecision', {
					'seminarCode': doc.seminarCode,
					'period': doc.currentPeriod
				});
			});
		})

		singleTimer = _.find(timers, function (obj) {
			return obj.seminarCode == seminarCode;
		});

		if (singleTimer) {
			clearInterval(singleTimer);
			console.log('timer is cleared ' + seminarCode + ' from event.');
		}
	});

	*/


    timersEvents.on('deadlineDecisionCommitted', function  (seminarCode) {
        //....
        console.log('deadlineDecisionCommitted');

        Seminar.findOne({
            seminarCode: seminarCode
        }, function  (err, doc) {
            if (doc) {
                /*
				doc.producers[0].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.producers[1].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.producers[2].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.producers[3].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.retailers[0].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.retailers[1].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.retailers[2].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				doc.retailers[3].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
				*/

                var i = 0;
                let playersNb = 8; // ?

                for (; i < playersNb; i++) {
                    doc.players[i].decisionCommitStatus[doc.currentPeriod].isDecisionCommitted = true;
                }
            }

            /*
			doc.markModified('producers');
			doc.markModified('retailers');
			*/
            doc.markModified('players');

            doc.save(function  () {
                io.sockets.emit('socketIO:committeDecision', {
                    'seminarCode': doc.seminarCode,
                    'period': doc.currentPeriod
                });
            });
        })

        let singleTimer = _.find(timers, function  (obj) {
            return obj.seminarCode == seminarCode;
        });

        if (singleTimer) {
            clearInterval(singleTimer);
            console.log('timer is cleared ' + seminarCode + ' from event.');
        }
    });

    return function  (req, res, next) {
        var seminarCode = req.body.seminarCode;
        var countDown = {
            pass: 0,
            //portfolio: parseInt(req.body.portfolio),
            //contractDeal: parseInt(req.body.contractDeal),
            //contractFinalized: parseInt(req.body.contractFinalized),
            contractDecisionCommitted: parseInt(req.body.contractDecisionCommitted),
            //timersEvent: [parseInt(req.body.portfolio), parseInt(req.body.portfolio) + parseInt(req.body.contractDeal), parseInt(req.body.portfolio) + parseInt(req.body.contractDeal) + parseInt(req.body.contractFinalized), parseInt(req.body.portfolio) + parseInt(req.body.contractDeal) + parseInt(req.body.contractFinalized) + parseInt(req.body.contractDecisionCommitted)]
            timersEvent: [0, 0, 0, parseInt(req.body.contractDecisionCommitted)]

        };


        let timer = _.find(timers, function  (obj) {
            return obj.seminarCode == req.body.seminarCode;
        });

        console.log('timers : ' + util.inspect(timers));
        //find existed timer in memory
        console.log((timer == undefined) && (req.body.active == 'switchOn'));
        if (timer) {
            console.log('find timer: ' + util.inspect(timer));

            //user choose to reset
            if (req.body.active == 'switchOn') {
                //remove existed one first 
                clearInterval(timer);
                timers = _.reject(timers, function  (obj) {
                    return obj.seminarCode == timer.seminarCode;
                });
                timers.push(createNewTimer(req.body.seminarCode, countDown, io, timersEvents));
                res.send(200, {
                    'msg': 'reset timer:' + req.body.seminarCode,
                    'seminar': seminarCode,
                    'pass': countDown.pass,
                    //'portfolio': countDown.portfolio,
                    //'contractDeal': countDown.contractDeal,
                    //'contractFinalized': countDown.contractFinalized,
                    'contractDecisionCommitted': countDown.contractDecisionCommitted
                });
                //user choose to stop timer
            } else {
                clearInterval(timer);
                //io.sockets.emit('socketIO:timerStop',{'seminarCode':req.body.seminarCode});
                res.send(200, 'stop timer: ' + timer.seminarCode);
            }

            //create a new timer and push into memory
            //if timer requested is not existed and user choose to start a new one instead of stopping existed one
        } else if ((timer == undefined) && (req.body.active == 'switchOn')) {

            timers.push(createNewTimer(req.body.seminarCode, countDown, io, timersEvents));
            res.send(200, {
                'msg': 'start a new timer:' + req.body.seminarCode,
                'seminar': seminarCode,
                'pass': countDown.pass,
                //'portfolio': countDown.portfolio,
                //'contractDeal': countDown.contractDeal,
                //'contractFinalized': countDown.contractFinalized,
                'contractDecisionCommitted': countDown.contractDecisionCommitted
            });
        } else if ((timer == undefined) && (req.body.active == 'switchOff')) {
            res.send(400, 'cannot stop nonexistent timer: ' + req.body.seminarCode);
        }

    }
};

/*
export function  checkProducerDecisionStatusByAdmin = function (seminarCode, period, producer) {
	var d = q.defer();
	var result = {
		'isPortfolioDecisionCommitted': false,
		'isContractDeal': false,
		'isContractFinalized': false,
		'isDecisionCommitted': false
	};
	Seminar.findOne({
		seminarCode: seminarCode
	}).exec()
		.then(function (doc) {
			if (doc) {

				doc.producers[producer - 1].decisionCommitStatus.forEach(function (singleProducer) {
					if (singleProducer.period == period) {
						result.isPortfolioDecisionCommitted = singleProducer.isPortfolioDecisionCommitted;
						result.isContractDeal = singleProducer.isContractDeal;
						result.isContractFinalized = singleProducer.isContractFinalized;
						result.isDecisionCommitted = singleProducer.isDecisionCommitted;
					}
				})
				d.resolve(result);
			} else {
				d.reject('fail');
			}

		});
	return d.promise;
}
*/

export function  checkPlayerDecisionStatusByAdmin (seminarCode, period, producer) {
    var d = q.defer();
    var result = {
        //'isPortfolioDecisionCommitted': false,
        //'isContractDeal': false,
        //'isContractFinalized': false,
        'isDecisionCommitted': false
    };

    Seminar.findOne({
        seminarCode: seminarCode
    }).exec()
        .then(function  (doc) {
            if (doc) {

                let player;
                let singleProducer;

                doc.players[player - 1].decisionCommitStatus.forEach(function  (singlePlayer) {
                    if (singlePlayer.period == period) {
                        //result.isPortfolioDecisionCommitted = singleProducer.isPortfolioDecisionCommitted;
                        //result.isContractDeal = singleProducer.isContractDeal;
                        //result.isContractFinalized = singleProducer.isContractFinalized;
                        result.isDecisionCommitted = singleProducer.isDecisionCommitted;
                    }
                })

                d.resolve(result);

            } else {
                d.reject('fail');
            }

        });

    return d.promise;
}

/*
 * TODO: keep it ?
 */

/*
export function  getBudgetExtensionAndExceptionalCost = function (req, res, next) {
	var result = {
		producerBudget: {},
		retailerBudget: {},
		producerExceptionalCost:{},
		retailerExceptionalCost:{}
	}
	require('./producerDecision.js').getProducerBudgetExtensionAndExceptionalCost(req.params.seminar).then(function (data) {
		result.producerBudget = data.producerBudget;
		result.producerExceptionalCost = data.producerExceptionalCost;
		return require('./retailerDecision.js').getRetailerBudgetExtensionAndExceptionalCost(req.params.seminar);
	}).then(function (data) {
		result.retailerBudget = data.retailerBudget;
		result.retailerExceptionalCost = data.retailerExceptionalCost;
		res.send(result);
	}, function (data) {
		res.send(400, 'fail');
	});

}
*/