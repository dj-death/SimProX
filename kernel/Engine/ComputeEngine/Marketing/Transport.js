"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Transport = (function (_super) {
    __extends(Transport, _super);
    function Transport(params) {
        _super.call(this, params);
        this.departmentName = "marketing";
    }
    Transport.prototype.init = function (market, economy) {
        _super.prototype.init.call(this);
        this.market = market;
        this.economy = economy;
    };
    Transport.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.totalContainersNb = 0;
    };
    Object.defineProperty(Transport.prototype, "containerDaysNb", {
        get: function () {
            return Math.ceil(this.journeyLength / this.params.distanceLimit) * this.loadsNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "loadsNb", {
        // results
        get: function () {
            return Math.ceil(this.totalContainersNb);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "journeyLength", {
        get: function () {
            return this.params.shipmentDistance * 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "hiredTransportCost", {
        // cost
        get: function () {
            var inflationImpact = this.economy.PPIServices;
            var containerDailyHireCost = Math.round(this.params.costs.containerShipmentCost * inflationImpact);
            var containerShipmentCost = Math.round(this.params.costs.containerShipmentCost * inflationImpact);
            var cost = 0;
            cost += this.containerDaysNb * containerDailyHireCost;
            cost += this.loadsNb * containerShipmentCost;
            return cost;
        },
        enumerable: true,
        configurable: true
    });
    Transport.prototype.load = function (containersNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!this.params.mixedLoads) {
            containersNb = Math.ceil(containersNb); // forget me 0.5 container no just integral containers
        }
        this.totalContainersNb += containersNb;
    };
    Transport.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.hiredTransportCost, this.params.payments, 'hiredTransport');
    };
    Object.defineProperty(Transport.prototype, "state", {
        get: function () {
            return {
                "journeyLength": this.journeyLength,
                "loadsNb": this.loadsNb
            };
        },
        enumerable: true,
        configurable: true
    });
    return Transport;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transport;
//# sourceMappingURL=Transport.js.map