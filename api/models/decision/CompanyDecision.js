"use strict";
let mongoose = require('mongoose');
let Q = require('q');
let util = require('util');
const console = require('../../../kernel/utils/logger');
const tDecisionSchema = require('./CompanyDecSchema');
//let spendingDetailsAssembler = require('../../dataAssemblers/spendingDetails.js');
//let consts = require('../../consts.js');
let CompanyDecision = mongoose.model('CompanyDecision', tDecisionSchema);
exports.query = CompanyDecision;
/*
tDecisionSchema.pre('save', true, function (next, done) {

    let self = this;

    let validateAction = {
        'd_RequestedAdditionalBudget': function (field) { validateAdditionalBudget(field, self, done); },
        'd_InvestmentInEfficiency': function (field) { validateAvailableBudget(field, self, done); },
        'd_InvestmentInTechnology': function (field) { validateAvailableBudget(field, self, done); },
        'd_InvestmentInServicing': function (field) { validateAvailableBudget(field, self, done); },
        'skip': function (field) { process.nextTick(done); }
    }

    function doValidate(field) {
        /*if (typeof validateAction[field] != 'function') {
            let validateErr = new Error('Cannot find validate action for ' + field);
            validateErr.message = 'Cannot find validate action for ' + field;
            validateErr.modifiedField = field;
            return done(validateErr);
        }

        validateAction[field](field);
    }

    if (!this.modifiedField) { this.modifiedField = 'skip'; }
    //doValidate(this.modifiedField);

    next();
});
*/
/*
function validateAdditionalBudget(field, curCompanyDecisionInput, done) {

    Q.spread([
        spendingDetailsAssembler.getSpendingDetails(curCompanyDecisionInput.seminarId, curCompanyDecisionInput.period, curCompanyDecisionInput.d_CID),
        export function findOne(curCompanyDecisionInput.seminarId, curCompanyDecisionInput.period, curCompanyDecisionInput.d_CID),
        export function findOne(curCompanyDecisionInput.seminarId, curCompanyDecisionInput.period - 1, curCompanyDecisionInput.d_CID)
    ], function (spendingDetails, preCompanyDecisionInput, prePeriodCompanyDecision) {

        let budgetLeft = parseFloat(spendingDetails.companyData.availableBudget);
        let err, lowerLimits = [], upperLimits = [];

        if (preCompanyDecisionInput.bs_BlockBudgetApplication) {
            let err = new Error('You cannot applied budget more than twice.');
            done(err);
        } else {
            lowerLimits.push({ value: 0, message: 'Cannot accept negative number.' });
            upperLimits.push({ value: parseFloat(spendingDetails.companyData.averageBudgetPerPeriod), message: 'Cannot accept number bigger than ' + spendingDetails.companyData.averageBudgetPerPeriod });
            err = rangeCheck(curCompanyDecisionInput[field], lowerLimits, upperLimits);
            if (err != undefined) {
                err.modifiedField = field;
                done(err);
            } else {
                //if user want to cancel application this period, reset counter make it = last period input
                if (curCompanyDecisionInput.d_RequestedAdditionalBudget == 0) {
                    curCompanyDecisionInput.d_IsAdditionalBudgetAccepted = false;
                    if (prePeriodCompanyDecision.bs_AdditionalBudgetApplicationCounter != preCompanyDecisionInput.bs_AdditionalBudgetApplicationCounter) {
                        curCompanyDecisionInput.bs_AdditionalBudgetApplicationCounter = prePeriodCompanyDecision.bs_AdditionalBudgetApplicationCounter;
                    }
                    //if user input != 0 and counter hasn't been increased this period, do it
                } else if (prePeriodCompanyDecision.bs_AdditionalBudgetApplicationCounter == preCompanyDecisionInput.bs_AdditionalBudgetApplicationCounter) {
                    curCompanyDecisionInput.bs_AdditionalBudgetApplicationCounter = curCompanyDecisionInput.bs_AdditionalBudgetApplicationCounter + 1;
                    curCompanyDecisionInput.d_IsAdditionalBudgetAccepted = true;
                }

                done();
            }

        }
    }).done();
}

function validateAvailableBudget(field, curCompanyDecisionInput, done) {
    Q.spread([
        spendingDetailsAssembler.getSpendingDetails(curCompanyDecisionInput.seminarId, curCompanyDecisionInput.period, curCompanyDecisionInput.d_CID),
        export function findOne(curCompanyDecisionInput.seminarId, curCompanyDecisionInput.period, curCompanyDecisionInput.d_CID)
    ], function (spendingDetails, preCompanyDecisionInput) {
        let budgetLeft = parseFloat(spendingDetails.companyData.availableBudget);
        let err, lowerLimits = [], upperLimits = [];

        lowerLimits.push({ value: 0, message: 'Cannot accept negative number.' });
        upperLimits.push({ value: budgetLeft + preCompanyDecisionInput[field], message: 'Budget Left is not enough.' });
        err = rangeCheck(curCompanyDecisionInput[field], lowerLimits, upperLimits);
        if (err != undefined) {
            err.modifiedField = field;
            done(err);
        } else {
            done();
        }
    }).done();
}

//...Limits : [{message : 'budgetLeft', value : 200}, {message : 'para', value: 3000}]
function rangeCheck(input, lowerLimits, upperLimits) {
    let maxOfLower = { value: 0 };
    let minOfUpper = { value: Infinity };
    lowerLimits.forEach(function (limit) {
        if (limit.value > maxOfLower.value) {
            maxOfLower.value = limit.value, maxOfLower.message = limit.message
        };
    });

    upperLimits.forEach(function (limit) {
        if (limit.value < minOfUpper.value) {
            minOfUpper.value = limit.value, minOfUpper.message = limit.message
        };
    })

    if (input < maxOfLower.value) {
        let err = new Error('Input is out of range');
        err.message = maxOfLower.message;
        err.lower = maxOfLower.value;
        err.upper = minOfUpper.value;
        return err;
    } else if (input > minOfUpper.value) {
        let err = new Error('Input is out of range');
        err.message = minOfUpper.message;
        err.lower = maxOfLower.value;
        err.upper = minOfUpper.value;
        return err;
    } else {
        return undefined;
    }
}
*/
function remove(seminarId, companyId) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    if (!seminarId) {
        deferred.reject(new Error("Invalid argument seminarId"));
    }
    else {
        CompanyDecision.remove({
            seminarId: seminarId,
            d_CID: companyId
        }, function (err) {
            if (err) {
                return deferred.reject(err);
            }
            else {
                return deferred.resolve(null);
            }
        });
    }
    return deferred.promise;
}
exports.remove = remove;
function removeAll(seminarId) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    if (!seminarId) {
        deferred.reject(new Error("Invalid argument seminarId"));
    }
    else {
        CompanyDecision.remove({ seminarId: seminarId }, function (err) {
            if (err) {
                return deferred.reject(err);
            }
            else {
                return deferred.resolve(null);
            }
        });
    }
    return deferred.promise;
}
exports.removeAll = removeAll;
function save(decision) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    if (!decision) {
        deferred.resolve();
    }
    else {
        let decisionResult = new CompanyDecision(decision);
        CompanyDecision.remove({
            seminarId: decisionResult.seminarId,
            period: decisionResult.period,
            d_CID: decisionResult.d_CID
        }, function (err, numberRemoved) {
            if (err) {
                return deferred.reject(err);
            }
            if (numberRemoved.result.n === 0 && decision.reRunLastRound) {
                return deferred.reject(new Error('There are no Company decisions deleted when create Company Decisions'));
            }
            decisionResult.save(function (err, saveDecision, numAffected) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(saveDecision);
                }
            });
        });
    }
    return deferred.promise;
}
exports.save = save;
function findOne(seminarId, period, companyId) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    if (!seminarId) {
        deferred.reject(new Error("Invalid argument seminarId"));
    }
    else if (period === undefined) {
        deferred.reject(new Error("Invalid argument period."));
    }
    else {
        CompanyDecision.findOne({
            seminarId: seminarId,
            period: period,
            d_CID: companyId
        }, function (err, result) {
            if (err) {
                return deferred.reject(err);
            }
            else {
                return deferred.resolve(result);
            }
        });
    }
    return deferred.promise;
}
exports.findOne = findOne;
function updateCompanyDecision(seminarId, period, companyId, decision) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    if (!seminarId) {
        deferred.reject(new Error("Invalid argument seminarId."));
    }
    else if (period === undefined) {
        deferred.reject(new Error("Invalid argument period."));
    }
    else if (!companyId) {
        deferred.reject(new Error("Invalid argument companyId."));
    }
    else if (!decision) {
        deferred.reject(new Error("Invalid argument companyDecision."));
    }
    else {
        CompanyDecision.findOne({
            seminarId: seminarId,
            period: period,
            d_CID: companyId
        }, function (err, doc) {
            if (err) {
                return deferred.reject(err);
            }
            if (!doc) {
                let validateErr = new Error('Cannot find company Decision not found.');
                return deferred.reject(validateErr);
            }
            /*let fields = ['d_RequestedAdditionalBudget',
                'd_InvestmentInEfficiency',
                'd_InvestmentInTechnology',
                'd_InvestmentInServicing'];

            fields.forEach(function (field) {
                if (companyDecision[field] !== undefined) {
                    doc.modifiedField = field;
                    doc[field] = companyDecision[field];
                }
            });*/
            console.warn(decision);
            doc.decision = decision;
            doc.markModified('decision');
            doc.save(function (err, doc) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    return deferred.resolve(doc);
                }
            });
        });
    }
    return deferred.promise;
}
exports.updateCompanyDecision = updateCompanyDecision;
function findAllInPeriod(seminarId, period) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    CompanyDecision.find({
        seminarId: seminarId,
        period: period
    }, function (err, result) {
        if (err)
            return deferred.reject(err);
        return deferred.resolve(result);
    });
    return deferred.promise;
}
exports.findAllInPeriod = findAllInPeriod;
function findAllBeforePeriod(seminarId, period) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    CompanyDecision.aggregate([{
            $match: {
                period: {
                    $lte: period
                },
                seminarId: seminarId
            }
        },
        {
            $group: {
                _id: '$d_CID',
                decisions: {
                    $push: "$$ROOT"
                }
            }
        },
        {
            $sort: {
                period: 1 // asc
            }
        }], function (err, docs) {
        if (err) {
            deferred.reject(err);
        }
        if (!docs) {
            deferred.reject({
                msg: 'Export to json, cannot find matched doc.' + '/seminar:' + seminarId + '/period:' + period
            });
        }
        else {
            deferred.resolve(docs);
        }
    });
    return deferred.promise;
}
exports.findAllBeforePeriod = findAllBeforePeriod;
/**
 * Insert empty company decisions for all companies in the next period
 */
function insertEmptyCompanyDecision(seminarId, period) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    //find all company decisions in the last period
    return findAllInPeriod(seminarId, period - 1)
        .then(function (allCompanyDecisions) {
        let p = Q();
        allCompanyDecisions.forEach(function (companyDecision) {
            p = p.then(function () {
                return save({
                    seminarId: seminarId,
                    period: period,
                    d_CID: companyDecision.d_CID,
                    d_CompanyName: companyDecision.d_CompanyName,
                    d_BrandsDecisions: companyDecision.d_BrandsDecisions
                });
            });
        });
        return p;
    });
}
exports.insertEmptyCompanyDecision = insertEmptyCompanyDecision;
//# sourceMappingURL=CompanyDecision.js.map