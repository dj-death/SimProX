"use strict";
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Q = require('q');
let categorySchema = new Schema({
    name: String,
    questions: [{ title: String, answer: String }]
});
let faqSchema = new Schema({
    reportName: String,
    language: String,
    categories: [categorySchema]
});
let FAQ = mongoose.model("FAQ", faqSchema);
function insert(faq) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
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
    let deferred = Q.defer();
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
    let deferred = Q.defer();
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