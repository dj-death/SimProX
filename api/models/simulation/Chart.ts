﻿let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Q = require('q');

let chartSchema = new Schema({
    seminarId: String,
    charts: []
});

let Chart = mongoose.model("Chart", chartSchema);

export function remove (seminarId){
    if(!mongoose.connection.readyState){
        throw new Error("mongoose is not connected.");
    }
    
    let deferred = Q.defer();
    Chart.remove({seminarId: seminarId}, function(err){
        if(err){
            deferred.reject(err);
        }else{
            deferred.resolve();
        }
    })
    return deferred.promise;
}

export function insert (chart){
    if(!mongoose.connection.readyState){
        throw new Error("mongoose is not connected.");
    }

    let deferred = Q.defer();

    Chart.create(chart, function(err){
        if(err){
            return deferred.reject(err);
        }else{
            return deferred.resolve();
        }
    })

    return deferred.promise;
}

export function update (seminarId, chart){
    if(!mongoose.connection.readyState){
        throw new Error("mongoose is not connected.");
    }

    let deferred = Q.defer();

    Chart.update({
        seminarId: seminarId
    },
    chart,
    function(err, numAffected){
        if(err){
            return deferred.reject(err);
        }
        return deferred.resolve(numAffected);
    })

    return deferred.promise;
}

export function findOne (seminarId){
    if(!mongoose.connection.readyState){
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();

    Chart.findOne({
        seminarId: seminarId
    },
    function(err, result){
        if(err){
            return deferred.reject(err);
        }
        return deferred.resolve(result);
    })
    return deferred.promise;
}