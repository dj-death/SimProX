"use strict";
const ObjectsManager_1 = require('./ObjectsManager');
const console = require('../../utils/logger');
const Utils = require('../../utils/Utils');
class IObject {
    constructor(params) {
        this.isPersistedObject = false;
        this.params = params;
    }
    init() {
        this.reset();
        this.initialised = true;
        ObjectsManager_1.default.register(this, this.departmentName, this.isPersistedObject);
    }
    reset() {
        this.initialised = false;
        this.onReady = function () { };
        this.onBeforeReady = function () { };
    }
    get className() {
        let funcNameRegex = /function (.{1,})\(/;
        let results = (funcNameRegex).exec(this.constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }
    isInitialised() {
        if (!this.initialised) {
            console.warn('Call for %d wich is an instance of %d : but is not yet initialised', (this.params.id || this.params.label), this.className);
            if (this.className === "") {
                console.info(this);
            }
            return false;
        }
        return true;
    }
    on(eventName, callback, scope) {
        if (!eventName) {
            console.warn("trying to add a listener with empty event name");
            return false;
        }
        let self = this;
        let previousListeners = typeof this["on" + eventName] === "function" ? this["on" + eventName] : function () { };
        // cumumative
        this["on" + eventName] = function () {
            previousListeners();
            callback.apply(scope || this, [self]);
        };
    }
    onBeforeReady() { }
    onReady() { }
    onFinish() { }
    get state() {
        return null;
    }
    getEndState() {
        let result = {};
        let me = this.params.label || this.params.id;
        try {
            let state = this.state;
            for (let key in state) {
                console.silly("GES @ %s of %s", key, me);
                if (!state.hasOwnProperty(key)) {
                    continue;
                }
                let value = state[key];
                if (!Utils.isBasicType(value) && key !== "stats") {
                    continue;
                }
                if (isNaN(value)) {
                    console.warn("GES @ %s : %s is NaN", me, key);
                }
                let prop = this.params.id + "_" + key;
                result[prop] = value;
            }
        }
        catch (e) {
            console.error(e, "exception @ GES of %s", me);
        }
        return result;
    }
}
exports.IObject = IObject;
//# sourceMappingURL=IObject.js.map