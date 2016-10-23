let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Q = require('q');

import console = require('../../../kernel/utils/logger');


let simulationResultSchema = require('./ResultSchema');

var SimulationResult = mongoose.model("SimulationResult", simulationResultSchema);


export function insert(simulationResult) {
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

export function findAll (seminarId) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }

    let deferred = Q.defer();

    SimulationResult.find({ seminarId: seminarId })
        .sort({ period: 'asc' })
        .exec(function (err, result) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(result);
            }
        });

    return deferred.promise;
}



export function findAllBefore(seminarId, period) {
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
        } else {
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}
      

export function removeAll(seminarId) {

    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }

    let deferred = Q.defer();

    SimulationResult.remove({ seminarId: seminarId }, function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

export function findOne (seminarId, period) {
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
        } else {
            //console.log(result);
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

export function remove (query) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }

    let deferred = Q.defer();

    SimulationResult.remove(query, function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}