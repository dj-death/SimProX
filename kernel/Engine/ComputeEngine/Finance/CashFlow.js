"use strict";
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Q = require('q');
var CashFlow = (function () {
    function CashFlow() {
    }
    Object.defineProperty(CashFlow.prototype, "Proto", {
        get: function () {
            return CashFlow.prototype;
        },
        enumerable: true,
        configurable: true
    });
    CashFlow.prototype.init = function (bankAccount, periodDaysNb, initialCashFlowBalance, lastPayables, lastTradeReceivables) {
        if (initialCashFlowBalance === void 0) { initialCashFlowBalance = 0; }
        if (lastPayables === void 0) { lastPayables = 0; }
        if (lastTradeReceivables === void 0) { lastTradeReceivables = 0; }
        this.reset();
        if (isNaN(lastPayables)) {
            console.warn("lastPayables NaN");
            lastPayables = 0;
        }
        if (isNaN(initialCashFlowBalance)) {
            console.warn("initialCashFlowBalance NaN");
            initialCashFlowBalance = 0;
        }
        if (isNaN(lastTradeReceivables)) {
            console.warn("lastTradeReceivables NaN");
            lastTradeReceivables = 0;
        }
        this.bankAccount = bankAccount;
        this.lastPayables = lastPayables;
        this.initialCashFlowBalance = initialCashFlowBalance;
        this.lastTradeReceivables = lastTradeReceivables;
        this.periodDaysNb = periodDaysNb;
        // now pay payables of last period
        this.bankAccount.withdraw(lastPayables);
    };
    CashFlow.prototype.reset = function () {
        this.operating = {
            payments: {},
            receipts: {},
            periodPayables: 0,
            periodPayments: 0,
            periodReceipts: 0
        };
        this.financing = {
            payments: {},
            receipts: {},
            periodPayables: 0,
            periodPayments: 0,
            periodReceipts: 0
        };
        this.investing = {
            payments: {},
            receipts: {},
            periodPayables: 0,
            periodPayments: 0,
            periodReceipts: 0
        };
        this.periodPayments = 0;
        this.periodReceipts = 0;
    };
    CashFlow.prototype.cover = function (companyObjs) {
        var self = this;
        for (var key in companyObjs) {
            if (!companyObjs.hasOwnProperty(key)) {
                continue;
            }
            var obj = companyObjs[key];
            if (typeof obj !== "object") {
                continue;
            }
            if (obj.length) {
                obj.forEach(function (item) {
                    if (typeof item !== "object") {
                        return;
                    }
                    try {
                        item.CashFlow = self;
                    }
                    catch (e) {
                        console.error(e.msg, "error @ cashflow of type %s", typeof item, item);
                    }
                });
            }
            else {
                try {
                    obj.CashFlow = self;
                }
                catch (e) {
                    console.error(e.msg, "error @ cashflow of type %s", typeof obj, obj);
                }
            }
        }
    };
    CashFlow.prototype.addPayment = function (total, paymentParams, libelle, activityType) {
        if (libelle === void 0) { libelle = ''; }
        if (activityType === void 0) { activityType = ENUMS.ACTIVITY.OPERATING; }
        if (!Utils.isNumericValid(total)) {
            console.warn('adding payment of null or not reel total :', arguments);
            return;
        }
        var activity;
        switch (activityType) {
            case ENUMS.ACTIVITY.INVESTING:
                activity = this.investing;
                break;
            case ENUMS.ACTIVITY.FINANCING:
                activity = this.financing;
                break;
            case ENUMS.ACTIVITY.OPERATING:
                activity = this.operating;
                break;
            default:
                activity = this.operating;
                break;
        }
        for (var key in paymentParams) {
            if (!paymentParams.hasOwnProperty(key)) {
                continue;
            }
            var item = paymentParams[key];
            var part = item.part;
            if (isNaN(part)) {
                part = 0;
            }
            var amount = Math.ceil(total * part);
            var credit = item.credit;
            var currPeriodPaymentsRatio;
            var currPeriodPayments;
            if (activity.payments[ENUMS.CREDIT[credit]] === undefined) {
                activity.payments[ENUMS.CREDIT[credit]] = 0;
            }
            activity.payments[ENUMS.CREDIT[credit]] += amount;
            if (credit === ENUMS.CREDIT.CASH) {
                currPeriodPaymentsRatio = 1;
            }
            else if (credit >= this.periodDaysNb) {
                currPeriodPaymentsRatio = 0;
            }
            else {
                currPeriodPaymentsRatio = 1 - credit / this.periodDaysNb;
            }
            currPeriodPayments = Math.ceil(amount * currPeriodPaymentsRatio);
            activity.periodPayments += currPeriodPayments;
            activity.periodPayables += (amount - currPeriodPayments);
            // now pay
            this.bankAccount.withdraw(currPeriodPayments);
        }
    };
    CashFlow.prototype.addReceipt = function (total, paymentParams, activityType) {
        if (activityType === void 0) { activityType = ENUMS.ACTIVITY.OPERATING; }
        if (!Utils.isNumericValid(total)) {
            console.warn('adding receipt of null or not reel total:', arguments);
            return;
        }
        var activity;
        switch (activityType) {
            case ENUMS.ACTIVITY.INVESTING:
                activity = this.investing;
                break;
            case ENUMS.ACTIVITY.FINANCING:
                activity = this.financing;
                break;
            case ENUMS.ACTIVITY.OPERATING:
                activity = this.operating;
                break;
            default:
                activity = this.operating;
                break;
        }
        for (var key in paymentParams) {
            if (!paymentParams.hasOwnProperty(key)) {
                continue;
            }
            var item = paymentParams[key];
            var part = item.part;
            if (isNaN(part)) {
                part = 0;
            }
            var amount = total * part;
            var credit = item.credit;
            var currPeriodRatio;
            var currPeriodReceipts;
            if (activity.receipts[ENUMS.CREDIT[credit]] === undefined) {
                activity.receipts[ENUMS.CREDIT[credit]] = 0;
            }
            activity.receipts[ENUMS.CREDIT[credit]] += amount;
            if (credit === ENUMS.CREDIT.CASH) {
                currPeriodRatio = 1;
            }
            else if (credit >= this.periodDaysNb) {
                currPeriodRatio = 0;
            }
            else {
                currPeriodRatio = 1 - credit / this.periodDaysNb;
            }
            currPeriodReceipts = Math.ceil(amount * currPeriodRatio);
            activity.periodReceipts += currPeriodReceipts;
            // now receive money
            this.bankAccount.payIn(currPeriodReceipts);
        }
    };
    Object.defineProperty(CashFlow.prototype, "tradingReceipts", {
        get: function () {
            return this.operating.periodReceipts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "tradingPayments", {
        get: function () {
            return this.operating.periodPayments + this.lastPayables;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "tradePayablesValue", {
        get: function () {
            return this.operating.periodPayables;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "assetsSales", {
        get: function () {
            return this.investing.periodReceipts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "assetsPurchases", {
        get: function () {
            return this.investing.periodPayments;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "operatingNetCashFlow", {
        get: function () {
            return this.operating.periodReceipts - this.tradingPayments;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "financingNetCashFlow", {
        get: function () {
            return this.financing.periodReceipts - this.financing.periodPayments;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "investingNetCashFlow", {
        get: function () {
            return this.investing.periodReceipts - this.investing.periodPayments;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "netCashFlow", {
        get: function () {
            return this.operatingNetCashFlow + this.investingNetCashFlow + this.financingNetCashFlow;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "cashFlowBalance", {
        get: function () {
            return this.netCashFlow + this.initialCashFlowBalance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CashFlow.prototype, "previousBalance", {
        get: function () {
            return this.initialCashFlowBalance;
        },
        enumerable: true,
        configurable: true
    });
    CashFlow.prototype.getEndState = function (prefix) {
        var deferred = Q.defer();
        var endState = {};
        var value;
        var that = this;
        setImmediate(function () {
            for (var key in that) {
                console.silly("cf GES @ of %s", key);
                if (!CashFlow.prototype.hasOwnProperty(key)) {
                    continue;
                }
                value = that[key];
                if (!Utils.isBasicType(value)) {
                    continue;
                }
                if (isNaN(value)) {
                    console.warn("GES @ Cash: %s is NaN", key);
                }
                key = prefix ? (prefix + key) : key;
                endState[key] = value;
            }
            deferred.resolve(endState);
        });
        return deferred.promise;
    };
    return CashFlow;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CashFlow;
//# sourceMappingURL=CashFlow.js.map