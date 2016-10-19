"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');
var chartSchema = new Schema({
    seminarId: String,
    charts: []
});
var Chart = mongoose.model("Chart", chartSchema);
function remove(seminarId) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    Chart.remove({ seminarId: seminarId }, function (err) {
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
function insert(chart) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    Chart.create(chart, function (err) {
        if (err) {
            return deferred.reject(err);
        }
        else {
            return deferred.resolve();
        }
    });
    return deferred.promise;
}
exports.insert = insert;
function update(seminarId, chart) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    Chart.update({
        seminarId: seminarId
    }, chart, function (err, numAffected) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(numAffected);
    });
    return deferred.promise;
}
exports.update = update;
function findOne(seminarId) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    Chart.findOne({
        seminarId: seminarId
    }, function (err, result) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(result);
    });
    return deferred.promise;
}
exports.findOne = findOne;
//# sourceMappingURL=Chart.js.map