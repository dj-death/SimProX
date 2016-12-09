"use strict";
const console = require('../../utils/logger');
const Utils = require('../../utils/Utils');
const Q = require('q');
function _finish(objects) {
    let deferred = Q.defer();
    let deptObj;
    if (typeof objects !== "object") {
        let err = new Error("No IObjects");
        console.error(err);
        deferred.reject(err);
        return deferred.promise;
    }
    for (let dept in objects) {
        if (!objects.hasOwnProperty(dept)) {
            continue;
        }
        deptObj = objects[dept];
        let i = 0, len = deptObj.length;
        let item;
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
function _getEndState(objects, result = {}) {
    let defered = Q.defer();
    let deptObj;
    if (typeof objects !== "object") {
        let err = new Error("No IObjects");
        console.error(err);
        defered.reject(err);
        return defered.promise;
    }
    setImmediate(function () {
        try {
            for (let dept in objects) {
                if (!objects.hasOwnProperty(dept)) {
                    continue;
                }
                deptObj = objects[dept];
                let i = 0, len = deptObj.length;
                if (!len) {
                    continue;
                }
                for (; i < len; i++) {
                    try {
                        let item = deptObj[i];
                        if (typeof item.getEndState !== "function") {
                            continue;
                        }
                        let endState = item.getEndState();
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
class ObjectsManager {
    constructor() {
        this.objects = {};
        if (ObjectsManager._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        ObjectsManager._instance = this;
    }
    static init(doRestorePersistents = true) {
        let that = this.getInstance();
        let persistents = ObjectsManager.persistents;
        if (ObjectsManager._instance) {
            delete ObjectsManager._instance;
        }
        ObjectsManager._instance = new ObjectsManager();
        // restore
        if (!doRestorePersistents) {
            this.persistentsEndState = null;
        }
    }
    static setCurrentPlayer(currPlayerID) {
        this.currPlayerID = currPlayerID;
    }
    static getInstance() {
        if (ObjectsManager._instance === null) {
            ObjectsManager._instance = new ObjectsManager();
        }
        return ObjectsManager._instance;
    }
    static register(object, department, persistent = false) {
        let that = this.getInstance();
        let currPlayerID = this.currPlayerID;
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
    }
    static retrieve(currPlayerID, department, isPersistent = false) {
        if (isPersistent) {
            return ObjectsManager.persistents[department];
        }
        return ObjectsManager._instance.objects[currPlayerID][department];
    }
    static clean(currPlayerID) {
        let that = this;
        let deferred = Q.defer();
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
    }
    static finish(currPlayerID) {
        let that = this;
        let self = that.getInstance();
        let objects = self.objects[currPlayerID];
        let deferred = Q.defer();
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
    }
    static getObjectsEndState(currPlayerID) {
        let that = this;
        let self = that.getInstance();
        let objects = self.objects && self.objects[currPlayerID];
        let deferred = Q.defer();
        Q(undefined).then(function () {
            if (!that.persistentsEndState && that.persistents) {
                return _getEndState(that.persistents);
            }
            return {};
        }).then(function (result) {
            if (objects) {
                return _getEndState(objects, result);
            }
            let msg = "no objects @ OM of player " + currPlayerID;
            console.warn(msg);
            let err = new Error(msg);
            deferred.reject(err);
            return {};
        }).done(function (result) {
            deferred.resolve(result);
        }, function (err) {
            console.error(err);
            deferred.reject(err);
        });
        return deferred.promise;
    }
    static getPersistedObjectsEndState() {
        let that = this;
        let self = that.getInstance();
        let deferred = Q.defer();
        Q(null).then(function () {
            if (!that.persistentsEndState && that.persistents) {
                return _getEndState(that.persistents);
            }
            return {};
        }).done(function (result) {
            deferred.resolve(result);
        }, function (err) {
            console.error(err);
            deferred.reject(err);
        });
        return deferred.promise;
    }
}
ObjectsManager._instance = null;
ObjectsManager.persistents = {};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ObjectsManager;
//# sourceMappingURL=ObjectsManager.js.map