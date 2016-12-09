"use strict";
const IObject = require('../IObject');
class Intelligence extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "marketing";
    }
    init(economy) {
        super.init();
        this.economy = economy;
    }
    // results
    get BusinessIntelligenceCost() {
        let totalCost = 0;
        let inflationImpact = this.economy.PPIServices;
        let marketSharesInfoCost = Math.round(this.params.costs.marketSharesInfoCost * inflationImpact);
        let competitorsInfoCost = Math.round(this.params.costs.competitorsInfoCost * inflationImpact);
        if (this.isMarketSharesInfoCommissioned) {
            totalCost += marketSharesInfoCost;
        }
        if (this.isCompetitorsInfoCommissioned) {
            totalCost += competitorsInfoCost;
        }
        return totalCost;
    }
    // actions
    commissionMarketSharesInfo(isCommissioned) {
        this.isMarketSharesInfoCommissioned = isCommissioned;
    }
    commissionCompetitorsInfo(isCommissioned) {
        this.isCompetitorsInfoCommissioned = isCommissioned;
    }
    onFinish() {
        this.CashFlow.addPayment(this.BusinessIntelligenceCost, this.params.payments, 'BusinessIntelligence');
    }
    get state() {
        return {
            "BusinessIntelligenceCost": this.BusinessIntelligenceCost
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Intelligence;
//# sourceMappingURL=Intelligence.js.map