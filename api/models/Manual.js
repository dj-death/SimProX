"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');
var submenuSchema = mongoose.Schema({
    subMenuName: String
});
var menuSchema = mongoose.Schema({
    menuName: String,
    subMenu: [submenuSchema]
});
var manualSchema = new Schema({
    language: String,
    content: String,
    menu: [menuSchema]
});
var Manual = mongoose.model("Manual", manualSchema);
function addOne(manual) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    Manual.create(manual, function (err, result) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(result);
    });
    return deferred.promise;
}
exports.addOne = addOne;
function findByLanguage(language) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    Manual.findOne({
        language: language
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
exports.findByLanguage = findByLanguage;
//# sourceMappingURL=Manual.js.map