"use strict";
var Env = require('./');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Q = require('q');
var Environnement = (function () {
    function Environnement() {
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
    Environnement.init = function () {
        if (Environnement._instance) {
            delete Environnement._instance;
        }
        Environnement._instance = new Environnement();
    };
    Environnement.getInstance = function () {
        if (Environnement._instance === null) {
            Environnement._instance = new Environnement();
        }
        return Environnement._instance;
    };
    Environnement.register = function (object) {
        var that = this.getInstance();
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
    };
    Environnement.getEndState = function (prefix) {
        var deferred = Q.defer();
        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};
        if (proto === undefined) {
            var err = new Error("Getting endstate of an empty dept");
            console.error(err);
            deferred.reject(err);
            return deferred.promise;
        }
        setImmediate(function () {
            for (var key in proto) {
                console.silly("env GES @ %s of %s", key);
                if (!proto.hasOwnProperty(key)) {
                    continue;
                }
                try {
                    var value = proto[key];
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
    };
    Environnement._instance = null;
    return Environnement;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Environnement;
//# sourceMappingURL=Environnement.js.map