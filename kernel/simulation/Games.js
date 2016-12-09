"use strict";
const Game_1 = require('../engine/Game');
const ENUMS = require('../engine/ComputeEngine/ENUMS');
var GMCGame = new Game_1.default({
    index100Value: 1000,
    stage: {
        nb: 5,
        duration: ENUMS.PERIODS.QUARTER
    },
    historicPeriodsNb: 5,
    // residual
    /*
        should be between 0.1 and 0.9, inclusive.
        A small value is suggested for a game simulating weekly (or shorter) decisions,
        whereas a large value is suggested for a game simulating annual (or longer) decisions.
    */
    demandFactors: {
        maxIndustryRatio: 1,
        maxRefRatio: 0.98,
        incomingElasticity: 2,
        renewalElasticity: 1,
        directAds: {
            adsInvestmentCumulativeEffect: 0.3,
            competitorsInfluence: 0.5
        },
        corporateAds: {
            adsInvestmentCumulativeEffect: 0.6,
            competitorsInfluence: 0.5
        },
        salesForce: {
            staffResidualEffect: 0.3,
            commissionResidualEffect: 0.3,
            supportResidualEffect: 0.3,
            commissionWeight: 0.5,
            staffWeight: 0.3,
            supportWeight: 0.2,
            competitorsInfluence: 0.5
        },
        customerCredit: {
            residualEffect: 0,
            competitorsInfluence: 0
        },
        quality: {
            minValue: 0,
            maxValue: 5,
            residualEffect: 0,
            competitorsInfluence: 0
        },
        price: {
            residualEffect: 0.1
        },
        eCommerce: {
            residualEffect: 0.6,
            competitorsInfluence: 0.5
        }
    }
});
module.exports = GMCGame;
//# sourceMappingURL=Games.js.map