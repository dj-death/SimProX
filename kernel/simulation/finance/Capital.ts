import { Capital } from '../../engine/ComputeEngine/Finance';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


export default function create(): Capital {

    let capital = new Capital({
        id: "capital",
        label: "capital",

        shareNominalValue: 100,
        initialSharesNb: 27500,

        restrictions: {
            capitalAnnualVariationLimitRate: 0.1,

            minSharePriceToIssueShares: 1,
            minSharePriceToRepurchaseShares: 1
        },

        payments: {
            "CASH": {
                credit: ENUMS.CREDIT.CASH,
                part: 1
            }
        }
    });

    return capital;
}