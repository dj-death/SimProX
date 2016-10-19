"use strict";
var console = require('../../utils/logger');
var Utils = require('../../utils/Utils');
var Q = require('q');
function _finish(objects) {
    var deferred = Q.defer();
    var deptObj;
    if (typeof objects !== "object") {
        var err = new Error("No IObjects");
        console.error(err);
        deferred.reject(err);
        return deferred.promise;
    }
    for (var dept in objects) {
        if (!objects.hasOwnProperty(dept)) {
            continue;
        }
        deptObj = objects[dept];
        var i = 0, len = deptObj.length;
        var item;
        for (; i < len; i++) {
            try {
                item = deptObj[i];
                item.onFinish && item.onFinish();
            }
            catch (e) {
                console.error(e, "Trigger finish @", item);
                deferred.reject(e);
            }
        }
    }
    deferred.resolve();
    return deferred.promise;
}
function _getEndState(objects, result) {
    if (result === void 0) { result = {}; }
    var defered = Q.defer();
    var deptObj;
    if (typeof objects !== "object") {
        var err = new Error("No IObjects");
        console.error(err);
        defered.reject(err);
        return defered.promise;
    }
    setImmediate(function () {
        try {
            for (var dept in objects) {
                if (!objects.hasOwnProperty(dept)) {
                    continue;
                }
                deptObj = objects[dept];
                var i = 0, len = deptObj.length;
                if (!len) {
                    continue;
                }
                for (; i < len; i++) {
                    try {
                        var item = deptObj[i];
                        if (typeof item.getEndState !== "function") {
                            continue;
                        }
                        var endState = item.getEndState();
                        Utils.ObjectApply(result, endState);
                    }
                    catch (e) {
                        console.error(e);
                        defered.reject(e);
                    }
                }
            }
            defered.resolve(result);
        }
        catch (e) {
            console.error(e);
            defered.reject(e);
        }
    });
    return defered.promise;
}
var ObjectsManager = (function () {
    function ObjectsManager() {
        this.objects = {};
        if (ObjectsManager._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        ObjectsManager._instance = this;
    }
    ObjectsManager.init = function (doRestorePersistents) {
        if (doRestorePersistents === void 0) { doRestorePersistents = true; }
        var that = this.getInstance();
        var persistents = ObjectsManager.persistents;
        if (ObjectsManager._instance) {
            delete ObjectsManager._instance;
        }
        ObjectsManager._instance = new ObjectsManager();
        // restore
        if (!doRestorePersistents) {
            this.persistentsEndState = null;
        }
    };
    ObjectsManager.setCurrentPlayer = function (currPlayerID) {
        this.currPlayerID = currPlayerID;
    };
    ObjectsManager.getInstance = function () {
        if (ObjectsManager._instance === null) {
            ObjectsManager._instance = new ObjectsManager();
        }
        return ObjectsManager._instance;
    };
    ObjectsManager.register = function (object, department, persistent) {
        if (persistent === void 0) { persistent = false; }
        var that = this.getInstance();
        var currPlayerID = this.currPlayerID;
        if (currPlayerID === undefined && !persistent) {
            console.warn('trying to register object without player init');
            return false;
        }
        if (!department) {
            console.warn('trying to register object with dept empty');
            return false;
        }
        if (object === null || typeof object !== "object") {
            console.warn('trying to register not reel object');
            return false;
        }
        if (persistent) {
            if (ObjectsManager.persistents[department] === undefined) {
                ObjectsManager.persistents[department] = [];
            }
            ObjectsManager.persistents[department].push(object);
        }
        else {
            if (that.objects[currPlayerID] === undefined) {
                that.objects[currPlayerID] = {};
            }
            if (that.objects[currPlayerID][department] === undefined) {
                that.objects[currPlayerID][department] = [];
            }
            that.objects[currPlayerID][department].push(object);
        }
    };
    ObjectsManager.retrieve = function (currPlayerID, department, isPersistent) {
        if (isPersistent === void 0) { isPersistent = false; }
        if (isPersistent) {
            return ObjectsManager.persistents[department];
        }
        return ObjectsManager._instance.objects[currPlayerID][department];
    };
    ObjectsManager.clean = function (currPlayerID) {
        var that = this;
        var deferred = Q.defer();
        setImmediate(function () {
            if (currPlayerID === undefined) {
                delete that.getInstance().objects;
            }
            else {
                that.getInstance().objects[currPlayerID] = undefined;
            }
            deferred.resolve();
        });
        return deferred.promise;
    };
    ObjectsManager.finish = function (currPlayerID) {
        var that = this;
        var self = that.getInstance();
        var objects = self.objects[currPlayerID];
        var deferred = Q.defer();
        Q.fcall(function () {
            if (!that.persistentsEndState) {
                return _finish(that.persistents);
            }
            return;
        }).then(function () {
            return _finish(objects);
        }).done(function () {
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    ObjectsManager.getObjectsEndState = function (currPlayerID) {
        var that = this;
        var self = that.getInstance();
        var objects = self.objects && self.objects[currPlayerID];
        var deferred = Q.defer();
        Q(undefined).then(function () {
            if (!that.persistentsEndState && that.persistents) {
                return _getEndState(that.persistents);
            }
            return {};
        }).then(function (result) {
            if (objects) {
                return _getEndState(objects, result);
            }
            var msg = "no objects @ OM of player " + currPlayerID;
            console.warn(msg);
            var err = new Error(msg);
            deferred.reject(err);
            return {};
        }).done(function (result) {
            deferred.resolve(result);
        }, function (err) {
            console.error(err);
            deferred.reject(err);
        });
        return deferred.promise;
    };
    ObjectsManager._instance = null;
    ObjectsManager.persistents = {};
    return ObjectsManager;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ObjectsManager;
//# sourceMappingURL=ObjectsManager.js.map