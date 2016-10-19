"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');
var categorySchema = new Schema({
    name: String,
    questions: [{ title: String, answer: String }]
});
var faqSchema = new Schema({
    reportName: String,
    language: String,
    categories: [categorySchema]
});
var FAQ = mongoose.model("FAQ", faqSchema);
function insert(faq) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    FAQ.create(faq, function (err, result) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(result);
    });
    return deferred.promise;
}
exports.insert = insert;
;
function findByReportName(reportName) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    FAQ.find({
        reportName: reportName
    }, function (err, result) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
}
exports.findByReportName = findByReportName;
;
function remove(query) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    FAQ.remove(query, function (err, result) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(result);
    });
    return deferred.promise;
}
exports.remove = remove;
;
//# sourceMappingURL=Faq.js.map