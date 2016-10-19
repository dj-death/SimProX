import BankAccount from './BankAccount';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');

import Q = require('q');


interface flow {
    [index: string]: number;
}

interface Activity {
    payments: flow;
    receipts: flow;

    periodPayments: number;
    periodPayables: number;

    periodReceipts: number;
}

export default class CashFlow {

    get Proto(): CashFlow {
        return CashFlow.prototype;
    }

    private operating: Activity;
    private financing: Activity;
    private investing: Activity;

    private bankAccount: BankAccount;

    private initialCashFlowBalance: number;

    private periodPayments: number;
    private periodReceipts: number;

    lastPayables: number;
    lastTradeReceivables: number;

    periodDaysNb: number;

    init(bankAccount: BankAccount, periodDaysNb: number, initialCashFlowBalance: number = 0, lastPayables: number = 0, lastTradeReceivables: number = 0) {
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


    cover(companyObjs: Object) {
        var self = this;

        for (let key in companyObjs) {

            if (! companyObjs.hasOwnProperty(key)) {
                continue;
            }

            let obj = companyObjs[key];

            if (typeof obj !== "object") {
                continue;
            }


            if (obj.length) {
                obj.forEach(function  (item) {

                    if (typeof item !== "object") {
                        return;
                    }

                    try {
                        item.CashFlow = self;

                    } catch (e) {
                        console.error(e.msg, "error @ cashflow of type %s", typeof item, item);
                    }
                });

            } else {
                try {
                    obj.CashFlow = self;

                } catch (e) {
                    console.error(e.msg, "error @ cashflow of type %s", typeof obj, obj);
                }
            }

        }
    }

    addPayment(total: number, paymentParams: ENUMS.PaymentArray, libelle: string = '', activityType: ENUMS.ACTIVITY = ENUMS.ACTIVITY.OPERATING) {
        if (!Utils.isNumericValid(total)) {
            console.warn('adding payment of null or not reel total :', arguments);
            return;
        }

        var activity: Activity;

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

            } else if (credit >= this.periodDaysNb) {
                currPeriodPaymentsRatio = 0;

            } else {
                currPeriodPaymentsRatio = 1 - credit / this.periodDaysNb;                
            }

            currPeriodPayments = Math.ceil(amount * currPeriodPaymentsRatio);
            activity.periodPayments += currPeriodPayments;

            activity.periodPayables += (amount - currPeriodPayments);

            // now pay
            this.bankAccount.withdraw(currPeriodPayments);

        }
        
    }

    addReceipt(total: number, paymentParams: ENUMS.PaymentArray, activityType: ENUMS.ACTIVITY = ENUMS.ACTIVITY.OPERATING) {
        if (! Utils.isNumericValid(total)) {
            console.warn('adding receipt of null or not reel total:', arguments);
            return;
        }

        var activity;

        switch (activityType) {
            case ENUMS.ACTIVITY.INVESTING:
                activity = this.investing
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

            } else if (credit >= this.periodDaysNb) {
                currPeriodRatio = 0;

            } else {
                currPeriodRatio = 1 - credit / this.periodDaysNb;
            }

            currPeriodReceipts = Math.ceil(amount * currPeriodRatio);
            activity.periodReceipts += currPeriodReceipts;

            // now receive money
            this.bankAccount.payIn(currPeriodReceipts);
        }
    }

    get tradingReceipts(): number {
        return this.operating.periodReceipts;
    }

    get tradingPayments(): number {
        return this.operating.periodPayments + this.lastPayables;
    }



    get tradePayablesValue(): number {
        return this.operating.periodPayables;
    }

    get assetsSales(): number {
        return this.investing.periodReceipts;
    }

    get assetsPurchases(): number {
        return this.investing.periodPayments;
    }

    get operatingNetCashFlow(): number {
        return this.operating.periodReceipts - this.tradingPayments;
    }

    get financingNetCashFlow(): number {
        return this.financing.periodReceipts - this.financing.periodPayments;
    }

    get investingNetCashFlow(): number {
        return this.investing.periodReceipts - this.investing.periodPayments;
    }

    get netCashFlow(): number {
        return this.operatingNetCashFlow + this.investingNetCashFlow + this.financingNetCashFlow;
    }

    get cashFlowBalance(): number {
        return this.netCashFlow + this.initialCashFlowBalance;
    }

    get previousBalance(): number {
        return this.initialCashFlowBalance;
    }


    getEndState(prefix?: string): Q.Promise<any> {
        let deferred = Q.defer();

        var endState = {};
        var value;

        let that: Object = this;

        setImmediate(function  () {
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

    }
}




