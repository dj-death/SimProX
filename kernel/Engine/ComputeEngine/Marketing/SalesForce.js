"use strict";
const Personnel_1 = require('../Personnel');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class SalesForce extends Personnel_1.Employee {
    constructor(params) {
        super(params);
        this.departmentName = "marketing";
    }
    // helpers
    restoreLastState(lastResults, lastDecs) {
        let i = 0;
        let len = Math.max(lastResults.length, lastDecs.length);
        this.lastCommissionRates = [];
        this.lastStaffs = [];
        this.lastSupports = [];
        for (; i < len; i++) {
            let lastPDec = lastDecs[i];
            let lastPRes = lastResults[i];
            if (isNaN(lastPDec.commissionRate)) {
                console.warn("lastPDec.commissionRate NaN @ period %d", i);
                lastPDec.commissionRate = 0;
            }
            if (isNaN(lastPDec.support)) {
                console.warn("lastPDec.support  NaN @ period %d", i);
                lastPDec.support = 0;
            }
            this.lastCommissionRates.push(lastPDec.commissionRate / 100);
            this.lastSupports.push(lastPDec.support * 1000);
            let staff = this.params.isECommerceDistributor ? this.availablesAtStartNb : lastPRes.effectiveAppointedNb;
            if (isNaN(staff)) {
                console.warn("staff  NaN @ period %d", i);
                staff = 0;
            }
            this.lastStaffs.push(staff);
        }
    }
    // optionnal params are force due to the heritage
    // first param is due to regression
    init(lastEmployeesNb, labourPool, economy, market, lastResults, lastDecs) {
        super.init(lastEmployeesNb, labourPool, economy);
        this.market = market;
        this.restoreLastState(lastResults, lastDecs);
    }
    // result
    // costs
    get supportCost() {
        return this.supportPerAgent * this.employeesNb;
    }
    get totalCost() {
        return this.supportCost + this.commissionsCost + this.personnelCost;
    }
    get commissionsCost() {
        let commissionsBase, salesRevenue, ordersValue, commissions;
        salesRevenue = this.market.salesRevenue;
        ordersValue = this.market.ordersValue;
        commissionsBase = this.params.isCommissionsBasedOnOrders ? ordersValue : salesRevenue;
        commissions = Math.ceil(commissionsBase * this.commissionRate);
        return commissions;
    }
    // actions
    appoint(appointedNb, supportPerAgent, commissionRate) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isInteger(appointedNb)) {
            appointedNb = Math.round(appointedNb);
        }
        this.appointedNb = appointedNb;
        this.commissionRate = commissionRate;
        this.supportPerAgent = supportPerAgent < this.params.costs.minSupportPerAgent ? this.params.costs.minSupportPerAgent : supportPerAgent;
        if (this.employeesNb < appointedNb) {
            this.recruit(appointedNb - this.employeesNb);
        }
        if (this.employeesNb > appointedNb) {
            this.dismiss(this.employeesNb - appointedNb);
        }
        return true;
    }
    onFinish() {
        this.CashFlow.addPayment(this.totalCost, this.params.payments, 'salesForce');
    }
    get state() {
        return {
            "effectiveAppointedNb": this.appointedNb,
            "resignedNb": this.resignedNb,
            "availablesNextPeriodNb": this.availablesNextPeriodNb
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SalesForce;
//# sourceMappingURL=SalesForce.js.map