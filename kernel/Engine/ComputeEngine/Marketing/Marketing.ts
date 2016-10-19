import IDepartment = require('../IDepartment');


import * as Mkg from './';

import * as IObject from '../IObject';

import { Economy } from '../Environnement';


import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');

import Q = require('q');


export default class Marketing {
    public departmentName = "Marketing";

    get Proto(): Marketing {
        return Marketing.prototype;
    }

    markets: Mkg.Market[];
    
    transports: Mkg.Transport[];
    salesForces: Mkg.SalesForce[];
    eCommerces: Mkg.ECommerce[];

    intelligence: Mkg.Intelligence;
    salesOffice: Mkg.SalesOffice;

    init() {
        this.markets = [];

        this.transports = [];
        this.salesForces = [];
        this.eCommerces = [];

        this.intelligence = null;
        this.salesOffice = null;
    }


    register(objects: IObject.IObject[]) {

        var i = 0,
            len = objects.length,
            object;

        for (; i < len; i++) {
            object = objects[i];
            

            if (object instanceof Mkg.Market) {
                this.markets.push(object);

            }

            else if (object instanceof Mkg.Intelligence) {
                this.intelligence = object;
            }

            else if (object instanceof Mkg.ECommerce) {
                this.eCommerces.push(object);
            }

            else if (object instanceof Mkg.Transport) {
                this.transports.push(object);
            }

            else if (object instanceof Mkg.SalesOffice) {
                this.salesOffice = object;
            }

            else if (object instanceof Mkg.SalesForce) {
                this.salesForces.push(object);
            }
        }
    }


    // results
    get advertisingCost(): number {
        return Utils.sums(this.markets, "advertisingCost");
    }

    get productsInventoriesValue(): number {
        return Utils.sums(this.markets, "stockValue");
    }

    get hiredTransportCost(): number {
        return Utils.sums(this.transports, "hiredTransportCost");
    }

    get salesForceCost(): number {
        return Utils.sums(this.salesForces, "totalCost", "params.isECommerceDistributor", false);
    }

    get websiteDevelopmentCost(): number {
        return Utils.sums(this.eCommerces, "websiteDevelopmentCost");
    }

    get internetDistributionCost(): number {
        return Utils.sums(this.eCommerces, "internetDistributionCost");
    }

    get ISPCost(): number {
        return Utils.sums(this.eCommerces, "ISPCost");
    }

    get salesForceNb(): number {
        return Utils.sums(this.salesForces, "employeesNb");
    }


    get _globalIndustryTotalSoldQ(): number {
        return Utils.sums(this.markets, "industryTotalSoldQ");
    }

    get _globalIndustryTotalSalesRevenue(): number {
        return Utils.sums(this.markets, "industryTotalSalesRevenue");
    }

    get _globalFirmTotalSoldQ(): number {
        return Utils.sums(this.markets, "firmTotalSoldQ");
    }


    get _marketVolumeShareOfSales(): number {
        let share = this._globalFirmTotalSoldQ / this._globalIndustryTotalSoldQ;

        return Utils.round(share, 4);
    }

    get _marketValueShareOfSales(): number {
        let share = this.salesOffice.salesRevenue / this._globalIndustryTotalSalesRevenue;

        return Utils.round(share, 4);
    }

    get _shortfallQ(): number {
        return Utils.sums(this.markets, "shortfallQ");
    }

    get _shortfallRate(): number {
        return Utils.sums(this.markets, "shortfallRate");
    }

    getEndState(prefix?: string): Q.Promise<any> {
        let deferred = Q.defer();

        let endState = {};

        let that: Object = this;

        let deptName = this.departmentName;

        setImmediate(function () {

            for (var key in that) {
                if (!Marketing.prototype.hasOwnProperty(key)) {
                    continue;
                }

                if (key[0] === '_') {
                    continue;
                }

                console.silly("mkg GES @ %s of %s", deptName, key);

                try {
                    let value = that[key];

                    if (!Utils.isBasicType(value)) {
                        continue;
                    }

                    if (isNaN(value)) {
                        console.warn("GES @ %s: %s is NaN", deptName, key);
                    }

                    key = prefix ? (prefix + key) : key;
                    endState[key] = value;

                } catch (e) {
                    console.error(e, "exception @ %s", deptName);
                    deferred.reject(e);
                }
            }

            deferred.resolve(endState);
        });

        return deferred.promise;

    }
}