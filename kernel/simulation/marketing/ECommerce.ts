import { ECommerce }  from '../../engine/ComputeEngine/Marketing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');

export default function create(): ECommerce[] {

    let eCommerce = new ECommerce({
        id: "eCommerce1",
        label: "eCommerce1",

        eCommerceID: "0",

        agentID: "2",
        marketID: "2",

        distributorsNb: 1,
        capacityChangeEffectiveness: ENUMS.FUTURES.THREE_MONTH,

        costs: {
            initialJoiningFees: 7500,
            closingDownFees: 5000,
            serviceCostRate: 0.03,
            websiteOnePortOperating: 1000
        },

        payments: {
            ISP: {
                "CASH": {
                    credit: ENUMS.CREDIT.CASH,
                    part: 1
                }
            },

            websiteDev: {
                "THREE_MONTH": {
                    credit: ENUMS.CREDIT.THREE_MONTH,
                    part: 1
                }
            }
        },

        initialVisitsNb: 50000,
        attendanceRate: 0.85,

        websiteLevelRange: {
            threshold: 1,
            mediane: 4,
            wearout: 6
        }

    });

    return [eCommerce];

}