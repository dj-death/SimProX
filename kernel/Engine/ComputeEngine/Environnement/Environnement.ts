import * as Env from './';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');

import Q = require('q');


export default class Environnement {
    public departmentName = "Environnement";

    private static _instance: Environnement = null;

    private economies: Env.Economy[] = [];
    private currencies: Env.Currency[] = [];
    private materialsMarkets: Env.MaterialMarket[] = [];
    private buildingContractors: Env.BuildingContractor[] = [];

    public static init() {
        if (Environnement._instance) {
            delete Environnement._instance;
        }

        Environnement._instance = new Environnement();
    }


    constructor() {
        if (Environnement._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        Environnement._instance = this;
    }

    public static getInstance(): Environnement {
        if (Environnement._instance === null) {
            Environnement._instance = new Environnement();
        }
        return Environnement._instance;
    }

    public static register(object) {

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

    }
   

    public static getEndState(prefix?: string): Q.Promise<any> {

        let deferred = Q.defer();


        var that = this.getInstance();
        var proto = this.prototype;
        var endState = {};

        if (proto === undefined) {
            let err = new Error("Getting endstate of an empty dept");

            console.error(err);

            deferred.reject(err);

            return deferred.promise;
        }


        setImmediate(function  () {

            for (var key in proto) {
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

                } catch (e) {
                    console.error(e, "exception @ MKG");
                }
            }

            deferred.resolve(endState);

        });

        return deferred.promise;

    }
}