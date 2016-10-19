import * as IObject from '../IObject';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');

import { Economy } from '../Environnement';


interface IntelligenceParam extends IObject.ObjectParams {
    costs: {
        marketSharesInfoCost: number;
        competitorsInfoCost: number;
    }

    payments: ENUMS.PaymentArray;
}

export default class Intelligence extends IObject.IObject {
    departmentName = "marketing";


    params: IntelligenceParam;

    economy: Economy;

    constructor(params: IntelligenceParam) {
        super(params);
    }

    init(economy: Economy) {
        super.init();

        this.economy = economy;
    }

    // helpers

    // decisions
    isMarketSharesInfoCommissioned: boolean;
    isCompetitorsInfoCommissioned: boolean;


    // results
    get BusinessIntelligenceCost(): number {
        let totalCost = 0

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
    commissionMarketSharesInfo(isCommissioned: boolean) {
        this.isMarketSharesInfoCommissioned = isCommissioned;
    }

    commissionCompetitorsInfo(isCommissioned: boolean) {
        this.isCompetitorsInfoCommissioned = isCommissioned;
    }

    onFinish() {
        this.CashFlow.addPayment(this.BusinessIntelligenceCost, this.params.payments, 'BusinessIntelligence');

    }

    get state(): any {

        return {
            "BusinessIntelligenceCost": this.BusinessIntelligenceCost
        };

    }
}