"use strict";
const Env = require('./');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
const Q = require('q');
class Environnement {
    constructor() {
        this.departmentName = "Environnement";
        this.economies = [];
        this.currencies = [];
        this.materialsMarkets = [];
        this.buildingContractors = [];
        if (Environnement._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Environnement._instance = this;
    }
    static init() {
        if (Environnement._instance) {
            delete Environnement._instance;
        }
        Environnement._instance = new Environnement();
    }
    static getInstance() {
        if (Environnement._instance === null) {
            Environnement._instance = new Environnement();
        }
        return Environnement._instance;
    }
    static register(object) {
        let that = this.getInstance();
        if (object instanceof Env.Economy) {
            that.economies.push(object);
        }
        else if (object instanceof Env.Currency) {
            that.currencies.push(object);
        }
        else if (object instanceof Env.MaterialMarket) {
            that.materialsMarkets.push(object);
        }
        else if (object instanceof Env.BuildingContractor) {
            that.buildingContractors.push(object);
        }
    }
    static getEndState(prefix) {
        let deferred = Q.defer();
        let that = this.getInstance();
        let proto = this.prototype;
        let endState = {};
        if (proto === undefined) {
            let err = new Error("Getting endstate of an empty dept");
            console.error(err);
            deferred.reject(err);
            return deferred.promise;
        }
        setImmediate(function () {
            for (let key in proto) {
                console.silly("env GES @ %s of %s", key);
                if (!proto.hasOwnProperty(key)) {
                    continue;
                }
                try {
                    let value = proto[key];
                    if (!Utils.isBasicType(value)) {
                        continue;
                    }
                    key = prefix ? (prefix + key) : key;
                    endState[key] = value;
                }
                catch (e) {
                    console.error(e, "exception @ MKG");
                }
            }
            deferred.resolve(endState);
        });
        return deferred.promise;
    }
}
Environnement._instance = null;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Environnement;
//# sourceMappingURL=Environnement.js.map