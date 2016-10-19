"use strict";
var console = require('./../../utils/logger');
var Utils = require('./../../utils/Utils');
var Q = require('q');
var IDepartment = (function () {
    function IDepartment() {
    }
    IDepartment.prototype.init = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i - 0] = arguments[_i];
        }
    };
    IDepartment.prototype.register = function (objects) {
    };
    Object.defineProperty(IDepartment.prototype, "Proto", {
        get: function () {
            return IDepartment.prototype;
        },
        enumerable: true,
        configurable: true
    });
    IDepartment.prototype.getEndState = function (prefix) {
        var deferred = Q.defer();
        var endState = {};
        var that = this;
        var Proto = this.Proto;
        var deptName = this.departmentName;
        console.warn("Proto", Proto);
        setImmediate(function () {
            for (var key in that) {
                console.silly("GES @ %s of %s", key, deptName);
                if (Proto.hasOwnProperty(key) || key === "departmentName") {
                    continue;
                }
                try {
                    var value = that[key];
                    if (!Utils.isBasicType(value)) {
                        continue;
                    }
                    if (isNaN(value)) {
                        console.warn("GES @ %s : %s is NaN", deptName, key);
                    }
                    key = prefix ? (prefix + key) : key;
                    endState[key] = value;
                }
                catch (e) {
                    console.error(e, "exception @ Fin");
                    deferred.reject(e);
                }
            }
            deferred.resolve(endState);
        });
        return deferred.promise;
    };
    return IDepartment;
}());
module.exports = IDepartment;
//# sourceMappingURL=IDepartment.js.map