"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Utils = require('../../../utils/Utils');
var Currency = (function (_super) {
    __extends(Currency, _super);
    function Currency(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    Currency.prototype.init = function (lastExchangeRate) {
        _super.prototype.init.call(this);
        this.initialExchangeRate = this.params.isLocal ? 1 : lastExchangeRate;
    };
    Currency.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this._quotedExchangeRate = null;
        this.initialExchangeRate = null;
    };
    Object.defineProperty(Currency.prototype, "quotedExchangeRate", {
        // result
        get: function () {
            return this._quotedExchangeRate;
        },
        enumerable: true,
        configurable: true
    });
    // action
    Currency.prototype.simulate = function (currPeriod) {
        var params = this.params;
        if (params.isLocal) {
            this._quotedExchangeRate = 1;
            return;
        }
        if (params.isStable) {
            this._quotedExchangeRate = this.initialExchangeRate;
            return;
        }
        var stats = params.currencyRateStats;
        if (stats && stats.length) {
            this._quotedExchangeRate = Utils.getStat(stats, currPeriod);
        }
        else {
            // TODO: develop
            this._quotedExchangeRate = params.baseRate || this.initialExchangeRate;
        }
    };
    Object.defineProperty(Currency.prototype, "state", {
        get: function () {
            return {
                "exchangeRatePerCent": this.quotedExchangeRate * 100 // regression
            };
        },
        enumerable: true,
        configurable: true
    });
    return Currency;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Currency;
//# sourceMappingURL=Currency.js.map