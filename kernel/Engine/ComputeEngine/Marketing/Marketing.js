"use strict";
var Mkg = require('./');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Q = require('q');
var Marketing = (function () {
    function Marketing() {
        this.departmentName = "Marketing";
    }
    Object.defineProperty(Marketing.prototype, "Proto", {
        get: function () {
            return Marketing.prototype;
        },
        enumerable: true,
        configurable: true
    });
    Marketing.prototype.init = function () {
        this.markets = [];
        this.transports = [];
        this.salesForces = [];
        this.eCommerces = [];
        this.intelligence = null;
        this.salesOffice = null;
    };
    Marketing.prototype.register = function (objects) {
        var i = 0, len = objects.length, object;
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
    };
    Object.defineProperty(Marketing.prototype, "advertisingCost", {
        // results
        get: function () {
            return Utils.sums(this.markets, "advertisingCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "productsInventoriesValue", {
        get: function () {
            return Utils.sums(this.markets, "stockValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "hiredTransportCost", {
        get: function () {
            return Utils.sums(this.transports, "hiredTransportCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "salesForceCost", {
        get: function () {
            return Utils.sums(this.salesForces, "totalCost", "params.isECommerceDistributor", false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "websiteDevelopmentCost", {
        get: function () {
            return Utils.sums(this.eCommerces, "websiteDevelopmentCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "internetDistributionCost", {
        get: function () {
            return Utils.sums(this.eCommerces, "internetDistributionCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "ISPCost", {
        get: function () {
            return Utils.sums(this.eCommerces, "ISPCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "salesForceNb", {
        get: function () {
            return Utils.sums(this.salesForces, "employeesNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "_globalIndustryTotalSoldQ", {
        get: function () {
            return Utils.sums(this.markets, "industryTotalSoldQ");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "_globalIndustryTotalSalesRevenue", {
        get: function () {
            return Utils.sums(this.markets, "industryTotalSalesRevenue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "_globalFirmTotalSoldQ", {
        get: function () {
            return Utils.sums(this.markets, "firmTotalSoldQ");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "_marketVolumeShareOfSales", {
        get: function () {
            var share = this._globalFirmTotalSoldQ / this._globalIndustryTotalSoldQ;
            return Utils.round(share, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "_marketValueShareOfSales", {
        get: function () {
            var share = this.salesOffice.salesRevenue / this._globalIndustryTotalSalesRevenue;
            return Utils.round(share, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "_shortfallQ", {
        get: function () {
            return Utils.sums(this.markets, "shortfallQ");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marketing.prototype, "_shortfallRate", {
        get: function () {
            return Utils.sums(this.markets, "shortfallRate");
        },
        enumerable: true,
        configurable: true
    });
    Marketing.prototype.getEndState = function (prefix) {
        var deferred = Q.defer();
        var endState = {};
        var that = this;
        var deptName = this.departmentName;
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
                    var value = that[key];
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
    };
    return Marketing;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Marketing;
//# sourceMappingURL=Marketing.js.map