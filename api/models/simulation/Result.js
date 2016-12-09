"use strict";
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Q = require('q');
let simulationResultSchema = require('./ResultSchema');
let SimulationResult = mongoose.model("SimulationResult", simulationResultSchema);
function insert(simulationResult) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    SimulationResult.create(simulationResult, function (err, result) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(result);
    });
    return deferred.promise;
}
exports.insert = insert;
function findAll(seminarId) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    SimulationResult.find({ seminarId: seminarId })
        .sort({ period: 'asc' })
        .exec(function (err, result) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
}
exports.findAll = findAll;
function findAllBefore(seminarId, period) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    SimulationResult.find({
        seminarId: seminarId,
        period: { $lte: period }
    })
        .sort({ period: 'asc' })
        .exec(function (err, result) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
}
exports.findAllBefore = findAllBefore;
function removeAll(seminarId) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    SimulationResult.remove({ seminarId: seminarId }, function (err) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve();
        }
    });
    return deferred.promise;
}
exports.removeAll = removeAll;
function findOne(seminarId, period) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    // SimulationResult.find({
    //     seminarId: seminarId,
    //     period: period
    // }).lean().exec(function(err, result){
    //     if(err){
    //         deferred.reject(err);
    //     }else{
    //         //console.log(result);
    //         deferred.resolve(result);
    //     }        
    // });
    SimulationResult.findOne({
        seminarId: seminarId,
        period: period
    }, function (err, result) {
        if (err) {
            deferred.reject(err);
        }
        else {
            //console.log(result);
            deferred.resolve(result);
        }
    });
    return deferred.promise;
}
exports.findOne = findOne;
function remove(query) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
    SimulationResult.remove(query, function (err) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve();
        }
    });
    return deferred.promise;
}
exports.remove = remove;
//# sourceMappingURL=Result.js.map