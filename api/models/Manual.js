"use strict";
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Q = require('q');
let submenuSchema = mongoose.Schema({
    subMenuName: String
});
let menuSchema = mongoose.Schema({
    menuName: String,
    subMenu: [submenuSchema]
});
let manualSchema = new Schema({
    language: String,
    content: String,
    menu: [menuSchema]
});
let Manual = mongoose.model("Manual", manualSchema);
function addOne(manual) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    let deferred = Q.defer();
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
    let deferred = Q.defer();
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