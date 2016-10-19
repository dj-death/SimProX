"use strict";
var ObjectsManager_1 = require('./ObjectsManager');
var console = require('../../utils/logger');
var Utils = require('../../utils/Utils');
var IObject = (function () {
    function IObject(params) {
        this.isPersistedObject = false;
        this.params = params;
    }
    IObject.prototype.init = function () {
        this.reset();
        this.initialised = true;
        ObjectsManager_1.default.register(this, this.departmentName, this.isPersistedObject);
    };
    IObject.prototype.reset = function () {
        this.initialised = false;
        this.onReady = function () { };
        this.onBeforeReady = function () { };
    };
    Object.defineProperty(IObject.prototype, "className", {
        get: function () {
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec(this.constructor.toString());
            return (results && results.length > 1) ? results[1] : "";
        },
        enumerable: true,
        configurable: true
    });
    IObject.prototype.isInitialised = function () {
        if (!this.initialised) {
            console.warn('Call for %d wich is an instance of %d : but is not yet initialised', (this.params.id || this.params.label), this.className);
            if (this.className === "") {
                console.info(this);
            }
            return false;
        }
        return true;
    };
    IObject.prototype.on = function (eventName, callback, scope) {
        if (!eventName) {
            console.warn("trying to add a listener with empty event name");
            return false;
        }
        var self = this;
        var previousListeners = typeof this["on" + eventName] === "function" ? this["on" + eventName] : function () { };
        // cumumative
        this["on" + eventName] = function () {
            previousListeners();
            callback.apply(scope || this, [self]);
        };
    };
    IObject.prototype.onBeforeReady = function () { };
    IObject.prototype.onReady = function () { };
    IObject.prototype.onFinish = function () { };
    Object.defineProperty(IObject.prototype, "state", {
        get: function () {
            return null;
        },
        enumerable: true,
        configurable: true
    });
    IObject.prototype.getEndState = function () {
        var result = {};
        var me = this.params.label || this.params.id;
        try {
            var state = this.state;
            for (var key in state) {
                console.silly("GES @ %s of %s", key, me);
                if (!state.hasOwnProperty(key)) {
                    continue;
                }
                var value = state[key];
                if (!Utils.isBasicType(value) && key !== "stats") {
                    continue;
                }
                if (isNaN(value)) {
                    console.warn("GES @ %s : %s is NaN", me, key);
                }
                var prop = this.params.id + "_" + key;
                result[prop] = value;
            }
        }
        catch (e) {
            console.error(e, "exception @ GES of %s", me);
        }
        return result;
    };
    return IObject;
}());
exports.IObject = IObject;
//# sourceMappingURL=IObject.js.map