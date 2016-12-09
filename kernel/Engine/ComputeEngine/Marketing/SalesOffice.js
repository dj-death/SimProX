"use strict";
const IObject = require('../IObject');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class SalesOffice extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "marketing";
    }
    init(markets, lastTradingReceivables) {
        super.init();
        if (isNaN(lastTradingReceivables)) {
            console.warn("lastTradingReceivables  NaN");
            lastTradingReceivables = 0;
        }
        this.markets = markets;
        this.lastTradingReceivables = lastTradingReceivables;
    }
    get scrapsRevenue() {
        let productsNb = this.markets[0] && this.markets[0].subMarkets.length, sums = 0, product, i = 0;
        for (; i < productsNb; i++) {
            product = this.markets[0].subMarkets[i].product;
            sums += product.scrapRevenue;
        }
        return sums;
    }
    // result
    get productsSalesRevenue() {
        return Utils.sums(this.markets, "salesRevenue"); //+ Utils.sums(this.markets, "soldOffValue") + this.scrapsRevenue;
    }
    get soldOffRevenue() {
        return Utils.sums(this.markets, "soldOffValue");
    }
    get salesRevenue() {
        return this.productsSalesRevenue + this.soldOffRevenue + this.scrapsRevenue;
    }
    get ordersValue() {
        return Utils.sums(this.markets, "ordersValue");
    }
    // costs 
    get creditControlCost() {
        return Utils.sums(this.markets, "creditControlCost");
    }
    get administrationCost() {
        return Math.ceil(this.params.costs.administrationCostRate * Math.max(this.salesRevenue, this.ordersValue));
    }
    // TODO develop it f(administrative depense)
    get recoveryEffortsRate() {
        let rate;
        rate = this.params.recoveryEfficacityBaseRate;
        return rate;
    }
    get recoverySuccessRate() {
        let rate, easyness;
        rate = this.recoveryEffortsRate;
        return rate;
    }
    // cash flows
    get tradingReceipts() {
        let total;
        let tradingReceiptsFromLastP = Math.round(this.lastTradingReceivables * this.recoverySuccessRate);
        let otherSales = this.soldOffRevenue + this.scrapsRevenue;
        total = Utils.sums(this.markets, "tradingReceipts") + tradingReceiptsFromLastP + otherSales;
        return total;
    }
    get tradeReceivablesValue() {
        return this.lastTradingReceivables + this.salesRevenue - this.tradingReceipts;
    }
    onFinish() {
        this.CashFlow.addPayment(this.administrationCost, this.params.payments, 'administration');
        this.CashFlow.addPayment(this.creditControlCost, this.params.payments, 'creditControl');
        this.CashFlow.addReceipt(this.tradingReceipts, this.params.receipts);
    }
    getEndState() {
        let state = {
            "salesRevenue": this.salesRevenue,
            "creditControlCost": this.creditControlCost,
            "salesOfficeCost": this.administrationCost,
            "tradeReceivablesValue": this.tradeReceivablesValue
        };
        return state;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SalesOffice;
//# sourceMappingURL=SalesOffice.js.map