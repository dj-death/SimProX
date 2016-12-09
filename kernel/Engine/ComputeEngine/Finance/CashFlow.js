"use strict";
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
const Q = require('q');
class CashFlow {
    get Proto() {
        return CashFlow.prototype;
    }
    init(bankAccount, periodDaysNb, initialCashFlowBalance = 0, lastPayables = 0, lastTradeReceivables = 0) {
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
    }
    reset() {
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
    }
    cover(companyObjs) {
        let self = this;
        for (let key in companyObjs) {
            if (!companyObjs.hasOwnProperty(key)) {
                continue;
            }
            let obj = companyObjs[key];
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
    }
    addPayment(total, paymentParams, libelle = '', activityType = ENUMS.ACTIVITY.OPERATING) {
        if (!Utils.isNumericValid(total)) {
            console.warn('adding payment of null or not reel total :', arguments);
            return;
        }
        let activity;
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
        for (let key in paymentParams) {
            if (!paymentParams.hasOwnProperty(key)) {
                continue;
            }
            let item = paymentParams[key];
            let part = item.part;
            if (isNaN(part)) {
                part = 0;
            }
            let amount = Math.ceil(total * part);
            let credit = item.credit;
            let currPeriodPaymentsRatio;
            let currPeriodPayments;
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
    }
    addReceipt(total, paymentParams, activityType = ENUMS.ACTIVITY.OPERATING) {
        if (!Utils.isNumericValid(total)) {
            console.warn('adding receipt of null or not reel total:', arguments);
            return;
        }
        let activity;
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
        for (let key in paymentParams) {
            if (!paymentParams.hasOwnProperty(key)) {
                continue;
            }
            let item = paymentParams[key];
            let part = item.part;
            if (isNaN(part)) {
                part = 0;
            }
            let amount = total * part;
            let credit = item.credit;
            let currPeriodRatio;
            let currPeriodReceipts;
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
    }
    get tradingReceipts() {
        return this.operating.periodReceipts;
    }
    get tradingPayments() {
        return this.operating.periodPayments + this.lastPayables;
    }
    get tradePayablesValue() {
        return this.operating.periodPayables;
    }
    get assetsSales() {
        return this.investing.periodReceipts;
    }
    get assetsPurchases() {
        return this.investing.periodPayments;
    }
    get operatingNetCashFlow() {
        return this.operating.periodReceipts - this.tradingPayments;
    }
    get financingNetCashFlow() {
        return this.financing.periodReceipts - this.financing.periodPayments;
    }
    get investingNetCashFlow() {
        return this.investing.periodReceipts - this.investing.periodPayments;
    }
    get netCashFlow() {
        return this.operatingNetCashFlow + this.investingNetCashFlow + this.financingNetCashFlow;
    }
    get cashFlowBalance() {
        return this.netCashFlow + this.initialCashFlowBalance;
    }
    get previousBalance() {
        return this.initialCashFlowBalance;
    }
    getEndState(prefix) {
        let deferred = Q.defer();
        let endState = {};
        let value;
        let that = this;
        setImmediate(function () {
            for (let key in that) {
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
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CashFlow;
//# sourceMappingURL=CashFlow.js.map