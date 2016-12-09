import * as IObject from '../IObject';

import Market from './Market';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



interface SalesOfficeParams extends IObject.ObjectParams {
    costs: {
        administrationCostRate: number;
    }

    payments: ENUMS.PaymentArray;

    receipts: ENUMS.PaymentArray;

    recoveryEfficacityBaseRate: number;
}


export default class SalesOffice extends IObject.IObject {
    departmentName = "marketing";

    params: SalesOfficeParams;

    markets: Market[];

    lastTradingReceivables: number;

    constructor(params: SalesOfficeParams) {
        super(params);
    }

    init(markets: Market[], lastTradingReceivables?: number) {
        super.init();

        if (isNaN(lastTradingReceivables)) {
            console.warn("lastTradingReceivables  NaN");

            lastTradingReceivables = 0;
        }

        this.markets = markets;
        this.lastTradingReceivables = lastTradingReceivables;
    }

    get scrapsRevenue(): number {
        let productsNb = this.markets[0] && this.markets[0].subMarkets.length,
            sums = 0,
            product,
            i = 0;

        for (; i < productsNb; i++) {
            product = this.markets[0].subMarkets[i].product;

            sums += product.scrapRevenue;
        }

        return sums;
    }

    // result
    get productsSalesRevenue(): number {
        return Utils.sums(this.markets, "salesRevenue"); //+ Utils.sums(this.markets, "soldOffValue") + this.scrapsRevenue;
    }

    get soldOffRevenue(): number {
        return Utils.sums(this.markets, "soldOffValue");
    }

    get salesRevenue(): number {
        return this.productsSalesRevenue + this.soldOffRevenue + this.scrapsRevenue;
    }

    get ordersValue(): number {
        return Utils.sums(this.markets, "ordersValue");
    }

    // costs 
    get creditControlCost(): number {
        return Utils.sums(this.markets, "creditControlCost");
    }

    get administrationCost(): number {
        return Math.ceil(this.params.costs.administrationCostRate * Math.max(this.salesRevenue, this.ordersValue));
    }


    // TODO develop it f(administrative depense)
    get recoveryEffortsRate(): number {
        let rate: number;

        rate = this.params.recoveryEfficacityBaseRate;

        return rate;
    }


    get recoverySuccessRate(): number {
        let rate: number,
            easyness;

        rate = this.recoveryEffortsRate;

        return rate;
    }

    // cash flows
    get tradingReceipts(): number {
        let total: number;
        let tradingReceiptsFromLastP = Math.round(this.lastTradingReceivables * this.recoverySuccessRate);

        let otherSales = this.soldOffRevenue + this.scrapsRevenue;

        total = Utils.sums(this.markets, "tradingReceipts") + tradingReceiptsFromLastP + otherSales;

        return total; 
    }

    get tradeReceivablesValue(): number {
        return this.lastTradingReceivables + this.salesRevenue - this.tradingReceipts;
    }

    onFinish() {
        this.CashFlow.addPayment(this.administrationCost, this.params.payments, 'administration');
        this.CashFlow.addPayment(this.creditControlCost, this.params.payments, 'creditControl');

        this.CashFlow.addReceipt(this.tradingReceipts, this.params.receipts);
    }

    getEndState(): any {
        let state = {
            "salesRevenue": this.salesRevenue,
            "creditControlCost": this.creditControlCost,
            "salesOfficeCost": this.administrationCost,

            "tradeReceivablesValue": this.tradeReceivablesValue 
        };

        return state;
    }


}