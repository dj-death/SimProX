import ObjectsManager from './ObjectsManager';

import CashFlow from './Finance/CashFlow';

import ENUMS = require('./ENUMS');
import console = require('../../utils/logger');
import Utils = require('../../utils/Utils');



export interface ObjectParams {
    id: string;
    label: string;
}

export class IObject {
    protected initialised: boolean;

    departmentName: string;

    protected isPersistedObject: boolean = false;


    public params: ObjectParams;

    CashFlow: CashFlow;

    constructor(params: ObjectParams) {
        this.params = params;
    }

    init(...args);
    init() {
        this.reset();

        this.initialised = true;

        ObjectsManager.register(this, this.departmentName, this.isPersistedObject);
    }

    reset() {
        this.initialised = false;

        this.onReady = function () { };
        this.onBeforeReady = function () { };
    }

    get className(): string {
        let funcNameRegex = /function (.{1,})\(/;
        let results = (funcNameRegex).exec((<any>this).constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }

    isInitialised(): boolean {
        if (!this.initialised) {
            console.warn('Call for %d wich is an instance of %d : but is not yet initialised', (this.params.id || this.params.label), this.className);

            if (this.className === "") {
                console.info(this);
            }

            return false;
        }

        return true;
    }

    on(eventName: string, callback: Function, scope?) {
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

    get state(): any {
        return null;
    }

    getEndState(): any {
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

                if (!Utils.isBasicType(value) && key !== "stats") { // exception for machines
                    continue;
                }

                if (isNaN(value)) {
                    console.warn("GES @ %s : %s is NaN", me, key);
                }

                let prop = this.params.id + "_" + key;
                result[prop] = value;
            }

        } catch (e) {
            console.error(e, "exception @ GES of %s", me);
        }

        return result;
    }
}
