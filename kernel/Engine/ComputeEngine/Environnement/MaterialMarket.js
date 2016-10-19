"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var MaterialMarket = (function (_super) {
    __extends(MaterialMarket, _super);
    function MaterialMarket(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    MaterialMarket.prototype.init = function (economy, lastQuotedPrices) {
        _super.prototype.init.call(this);
        this.economy = economy;
        // we begin at the end of last so is the price of first day of period
        this.initialQuotedPrices = lastQuotedPrices;
    };
    MaterialMarket.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.initialQuotedPrices = [];
        this._spotPrice = undefined;
        this._threeMthPrice = undefined;
        this._sixMthPrice = undefined;
    };
    // result
    // initial prices at local currency for standard lot
    MaterialMarket.prototype.getPrice = function (term) {
        if (term === void 0) { term = ENUMS.FUTURES.IMMEDIATE; }
        if (!this.initialised) {
            return 0;
        }
        var price;
        var initialExchangeRate = this.economy.currency.initialExchangeRate;
        switch (term) {
            case ENUMS.FUTURES.SIX_MONTH:
                price = this.initialQuotedPrices[2] * initialExchangeRate;
                break;
            case ENUMS.FUTURES.THREE_MONTH:
                price = this.initialQuotedPrices[1] * initialExchangeRate;
                break;
            default:
                price = this.initialQuotedPrices[0] * initialExchangeRate;
        }
        return Utils.round(price);
    };
    // at reel time (for this period) at local currency for standard lot
    MaterialMarket.prototype.getQuotedPrice = function (term) {
        if (term === void 0) { term = ENUMS.FUTURES.IMMEDIATE; }
        if (!this.initialised) {
            console.warn('MaterialMarket not initialised');
            return 0;
        }
        var price;
        var quotedExchangeRate = this.economy.currency.quotedExchangeRate;
        switch (term) {
            case ENUMS.FUTURES.SIX_MONTH:
                price = this._sixMthPrice * quotedExchangeRate;
                break;
            case ENUMS.FUTURES.THREE_MONTH:
                price = this._threeMthPrice * quotedExchangeRate;
                break;
            default:
                price = this._spotPrice * quotedExchangeRate;
        }
        return Utils.round(price);
    };
    // TODO: develop it
    // action
    MaterialMarket.prototype.simulate = function (currPeriod) {
        var params = this.params;
        if (params.arePricesStable) {
            this._spotPrice = this.initialQuotedPrices[0];
            this._threeMthPrice = this.initialQuotedPrices[1];
            this._sixMthPrice = this.initialQuotedPrices[2];
            return;
        }
        var stats = params.quotedPricesStats;
        if (stats && stats.length) {
            this._spotPrice = Utils.getStat(stats[0], currPeriod);
            this._threeMthPrice = Utils.getStat(stats[1], currPeriod);
            this._sixMthPrice = Utils.getStat(stats[2], currPeriod);
        }
        else {
            // TODO: develop
            var baseQuotedPrices = params.baseQuotedPrices;
            this._spotPrice = baseQuotedPrices[0];
            this._threeMthPrice = baseQuotedPrices[1];
            this._sixMthPrice = baseQuotedPrices[2];
        }
    };
    Object.defineProperty(MaterialMarket.prototype, "state", {
        get: function () {
            return {
                "spotPrice": this._spotPrice,
                "threeMthPrice": this._threeMthPrice,
                "sixMthPrice": this._sixMthPrice
            };
        },
        enumerable: true,
        configurable: true
    });
    return MaterialMarket;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MaterialMarket;
//# sourceMappingURL=MaterialMarket.js.map