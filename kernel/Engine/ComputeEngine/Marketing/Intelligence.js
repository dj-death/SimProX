"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Intelligence = (function (_super) {
    __extends(Intelligence, _super);
    function Intelligence(params) {
        _super.call(this, params);
        this.departmentName = "marketing";
    }
    Intelligence.prototype.init = function (economy) {
        _super.prototype.init.call(this);
        this.economy = economy;
    };
    Object.defineProperty(Intelligence.prototype, "BusinessIntelligenceCost", {
        // results
        get: function () {
            var totalCost = 0;
            var inflationImpact = this.economy.PPIServices;
            var marketSharesInfoCost = Math.round(this.params.costs.marketSharesInfoCost * inflationImpact);
            var competitorsInfoCost = Math.round(this.params.costs.competitorsInfoCost * inflationImpact);
            if (this.isMarketSharesInfoCommissioned) {
                totalCost += marketSharesInfoCost;
            }
            if (this.isCompetitorsInfoCommissioned) {
                totalCost += competitorsInfoCost;
            }
            return totalCost;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Intelligence.prototype.commissionMarketSharesInfo = function (isCommissioned) {
        this.isMarketSharesInfoCommissioned = isCommissioned;
    };
    Intelligence.prototype.commissionCompetitorsInfo = function (isCommissioned) {
        this.isCompetitorsInfoCommissioned = isCommissioned;
    };
    Intelligence.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.BusinessIntelligenceCost, this.params.payments, 'BusinessIntelligence');
    };
    Object.defineProperty(Intelligence.prototype, "state", {
        get: function () {
            return {
                "BusinessIntelligenceCost": this.BusinessIntelligenceCost
            };
        },
        enumerable: true,
        configurable: true
    });
    return Intelligence;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Intelligence;
//# sourceMappingURL=Intelligence.js.map