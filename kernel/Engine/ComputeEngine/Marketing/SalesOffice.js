"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var SalesOffice = (function (_super) {
    __extends(SalesOffice, _super);
    function SalesOffice(params) {
        _super.call(this, params);
        this.departmentName = "marketing";
    }
    SalesOffice.prototype.init = function (markets, lastTradingReceivables) {
        _super.prototype.init.call(this);
        if (isNaN(lastTradingReceivables)) {
            console.warn("lastTradingReceivables  NaN");
            lastTradingReceivables = 0;
        }
        this.markets = markets;
        this.lastTradingReceivables = lastTradingReceivables;
    };
    Object.defineProperty(SalesOffice.prototype, "scrapsRevenue", {
        get: function () {
            var productsNb = this.markets[0] && this.markets[0].subMarkets.length, sums = 0, product, i = 0;
            for (; i < productsNb; i++) {
                product = this.markets[0].subMarkets[i].product;
                sums += product.scrapRevenue;
            }
            return sums;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "productsSalesRevenue", {
        // result
        get: function () {
            return Utils.sums(this.markets, "salesRevenue"); //+ Utils.sums(this.markets, "soldOffValue") + this.scrapsRevenue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "soldOffRevenue", {
        get: function () {
            return Utils.sums(this.markets, "soldOffValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "salesRevenue", {
        get: function () {
            return this.productsSalesRevenue + this.soldOffRevenue + this.scrapsRevenue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "ordersValue", {
        get: function () {
            return Utils.sums(this.markets, "ordersValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "creditControlCost", {
        // costs 
        get: function () {
            return Utils.sums(this.markets, "creditControlCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "administrationCost", {
        get: function () {
            return Math.ceil(this.params.costs.administrationCostRate * Math.max(this.salesRevenue, this.ordersValue));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "recoveryEffortsRate", {
        // TODO develop it f(administrative depense)
        get: function () {
            var rate;
            rate = this.params.recoveryEfficacityBaseRate;
            return rate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "recoverySuccessRate", {
        get: function () {
            var rate, easyness;
            rate = this.recoveryEffortsRate;
            return rate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "tradingReceipts", {
        // cash flows
        get: function () {
            var total;
            var tradingReceiptsFromLastP = Math.round(this.lastTradingReceivables * this.recoverySuccessRate);
            var otherSales = this.soldOffRevenue + this.scrapsRevenue;
            total = Utils.sums(this.markets, "tradingReceipts") + tradingReceiptsFromLastP + otherSales;
            return total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesOffice.prototype, "tradeReceivablesValue", {
        get: function () {
            return this.lastTradingReceivables + this.salesRevenue - this.tradingReceipts;
        },
        enumerable: true,
        configurable: true
    });
    SalesOffice.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.administrationCost, this.params.payments, 'administration');
        this.CashFlow.addPayment(this.creditControlCost, this.params.payments, 'creditControl');
        this.CashFlow.addReceipt(this.tradingReceipts, this.params.receipts);
    };
    SalesOffice.prototype.getEndState = function () {
        var state = {
            "salesRevenue": this.salesRevenue,
            "creditControlCost": this.creditControlCost,
            "salesOfficeCost": this.administrationCost,
            "tradeReceivablesValue": this.tradeReceivablesValue
        };
        return state;
    };
    return SalesOffice;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SalesOffice;
//# sourceMappingURL=SalesOffice.js.map