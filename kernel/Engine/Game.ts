/**
* Paramètres Générales
*
*
* Copyright 2015 DIDI Mohamed, Inc.
*/

import ENUMS = require('./ComputeEngine/ENUMS');
import console = require('../utils/logger');
import Utils = require('../utils/Utils');



interface Stage {
    nb: number;
    duration: ENUMS.PERIODS; // in months
}

interface Configs {
    stage: Stage;
    index100Value: number;

    historicPeriodsNb: number;

    demandFactors: {
        maxRefRatio: number;
        maxIndustryRatio: number;

        renewalElasticity: number;
        incomingElasticity: number;

        directAds: {
            // effect of previous investments continues to act in the current period. 
            adsInvestmentCumulativeEffect: number; // 
            competitorsInfluence: number;
        };

        corporateAds: {
            adsInvestmentCumulativeEffect: number;
            competitorsInfluence: number;
        };

        salesForce: {
            staffResidualEffect: number;
            staffWeight: number;

            commissionResidualEffect: number;
            commissionWeight: number;

            supportResidualEffect: number;
            supportWeight: number;

            competitorsInfluence: number;
        };

        customerCredit: {
            residualEffect: number;
            competitorsInfluence: number;
        };

        quality: {
            competitorsInfluence: number;

            minValue: number;
            maxValue: number;
            residualEffect: number;
        };

        price: {
            residualEffect: number;
        };

        eCommerce: {
            competitorsInfluence: number;
            residualEffect: number;
        };
    }
}

export default class Game {
    private initialised: boolean = false;

    configs: Configs;

    constructor(configs: Configs) {
        this.configs = configs;
    }

    init() {
        // let's begin
        this.initialised = true;
        
    }

    get weeksNbByPeriod(): number {
        let monthWeeksNb = 4;

        return this.configs.stage.duration * monthWeeksNb;
    }

    get daysNbByPeriod(): number {
        let monthDaysNb = 30;

        return this.configs.stage.duration * monthDaysNb;
    }
}