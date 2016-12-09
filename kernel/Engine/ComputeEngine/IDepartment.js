"use strict";
const console = require('./../../utils/logger');
const Utils = require('./../../utils/Utils');
const Q = require('q');
class IDepartment {
    init(...params) {
    }
    register(objects) {
    }
    get Proto() {
        return IDepartment.prototype;
    }
    getEndState(prefix) {
        let deferred = Q.defer();
        let endState = {};
        let that = this;
        let Proto = this.Proto;
        let deptName = this.departmentName;
        console.warn("Proto", Proto);
        setImmediate(function () {
            for (let key in that) {
                console.silly("GES @ %s of %s", key, deptName);
                if (Proto.hasOwnProperty(key) || key === "departmentName") {
                    continue;
                }
                try {
                    let value = that[key];
                    if (!Utils.isBasicType(value)) {
                        continue;
                    }
                    if (isNaN(value)) {
                        console.warn("GES @ %s : %s is NaN", deptName, key);
                    }
                    let newKey = prefix ? (prefix + key) : key;
                    endState[newKey] = value;
                }
                catch (e) {
                    console.error(e, "exception @ Fin");
                    deferred.reject(e);
                }
            }
            deferred.resolve(endState);
        });
        return deferred.promise;
    }
}
module.exports = IDepartment;
//# sourceMappingURL=IDepartment.js.map