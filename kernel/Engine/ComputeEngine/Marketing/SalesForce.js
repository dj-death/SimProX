"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Personnel_1 = require('../Personnel');
var console = require('../../../utils/logger');
var SalesForce = (function (_super) {
    __extends(SalesForce, _super);
    function SalesForce(params) {
        _super.call(this, params);
        this.departmentName = "marketing";
    }
    // helpers
    SalesForce.prototype.restoreLastState = function (lastResults, lastDecs) {
        var i = 0;
        var len = Math.max(lastResults.length, lastDecs.length);
        this.lastCommissionRates = [];
        this.lastStaffs = [];
        this.lastSupports = [];
        for (; i < len; i++) {
            var lastPDec = lastDecs[i];
            var lastPRes = lastResults[i];
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
            var staff = this.params.isECommerceDistributor ? this.availablesAtStartNb : lastPRes.effectiveAppointedNb;
            if (isNaN(staff)) {
                console.warn("staff  NaN @ period %d", i);
                staff = 0;
            }
            this.lastStaffs.push(staff);
        }
    };
    // optionnal params are force due to the heritage
    // first param is due to regression
    SalesForce.prototype.init = function (lastEmployeesNb, labourPool, economy, market, lastResults, lastDecs) {
        _super.prototype.init.call(this, lastEmployeesNb, labourPool, economy);
        this.market = market;
        this.restoreLastState(lastResults, lastDecs);
    };
    Object.defineProperty(SalesForce.prototype, "supportCost", {
        // result
        // costs
        get: function () {
            return this.supportPerAgent * this.employeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesForce.prototype, "totalCost", {
        get: function () {
            return this.supportCost + this.commissionsCost + this.personnelCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SalesForce.prototype, "commissionsCost", {
        get: function () {
            var commissionsBase, salesRevenue, ordersValue, commissions;
            salesRevenue = this.market.salesRevenue;
            ordersValue = this.market.ordersValue;
            commissionsBase = this.params.isCommissionsBasedOnOrders ? ordersValue : salesRevenue;
            commissions = Math.ceil(commissionsBase * this.commissionRate);
            return commissions;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    SalesForce.prototype.appoint = function (appointedNb, supportPerAgent, commissionRate) {
        if (!this.isInitialised()) {
            return false;
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
    };
    SalesForce.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.totalCost, this.params.payments, 'salesForce');
    };
    Object.defineProperty(SalesForce.prototype, "state", {
        get: function () {
            return {
                "effectiveAppointedNb": this.appointedNb,
                "resignedNb": this.resignedNb,
                "availablesNextPeriodNb": this.availablesNextPeriodNb
            };
        },
        enumerable: true,
        configurable: true
    });
    return SalesForce;
}(Personnel_1.Employee));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SalesForce;
//# sourceMappingURL=SalesForce.js.map