"use strict";
const Mkg = require('./');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
const Q = require('q');
class Marketing {
    constructor() {
        this.departmentName = "Marketing";
    }
    get Proto() {
        return Marketing.prototype;
    }
    init() {
        this.markets = [];
        this.transports = [];
        this.salesForces = [];
        this.eCommerces = [];
        this.intelligence = null;
        this.salesOffice = null;
    }
    register(objects) {
        let i = 0, len = objects.length, object;
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
    get advertisingCost() {
        return Utils.sums(this.markets, "advertisingCost");
    }
    get productsInventoriesValue() {
        return Utils.sums(this.markets, "stockValue");
    }
    get hiredTransportCost() {
        return Utils.sums(this.transports, "hiredTransportCost");
    }
    get salesForceCost() {
        return Utils.sums(this.salesForces, "totalCost", "params.isECommerceDistributor", false);
    }
    get websiteDevelopmentCost() {
        return Utils.sums(this.eCommerces, "websiteDevelopmentCost");
    }
    get internetDistributionCost() {
        return Utils.sums(this.eCommerces, "internetDistributionCost");
    }
    get ISPCost() {
        return Utils.sums(this.eCommerces, "ISPCost");
    }
    get salesForceNb() {
        return Utils.sums(this.salesForces, "employeesNb");
    }
    get _globalIndustryTotalSoldQ() {
        return Utils.sums(this.markets, "industryTotalSoldQ");
    }
    get _globalIndustryTotalSalesRevenue() {
        return Utils.sums(this.markets, "industryTotalSalesRevenue");
    }
    get _globalFirmTotalSoldQ() {
        return Utils.sums(this.markets, "firmTotalSoldQ");
    }
    get _marketVolumeShareOfSales() {
        let share = this._globalFirmTotalSoldQ / this._globalIndustryTotalSoldQ;
        return Utils.round(share, 4);
    }
    get _marketValueShareOfSales() {
        let share = this.salesOffice.salesRevenue / this._globalIndustryTotalSalesRevenue;
        return Utils.round(share, 4);
    }
    get _shortfallQ() {
        return Utils.sums(this.markets, "shortfallQ");
    }
    get _shortfallRate() {
        return Utils.sums(this.markets, "shortfallRate");
    }
    getEndState(prefix) {
        let deferred = Q.defer();
        let endState = {};
        let that = this;
        let deptName = this.departmentName;
        setImmediate(function () {
            for (let key in that) {
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
                }
                catch (e) {
                    console.error(e, "exception @ %s", deptName);
                    deferred.reject(e);
                }
            }
            deferred.resolve(endState);
        });
        return deferred.promise;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Marketing;
//# sourceMappingURL=Marketing.js.map