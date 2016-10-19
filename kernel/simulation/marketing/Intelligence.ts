import { Intelligence }  from '../../engine/ComputeEngine/Marketing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


export default function create(): Intelligence {

    var BI = new Intelligence({
        id: "BI",
        label: "BI",

        costs: {
            competitorsInfoCost: 7500,
            marketSharesInfoCost: 5000
        },

        payments: {
            "CASH": {
                credit: ENUMS.CREDIT.CASH,
                part: 1
            }
        }
    });

    return BI;

}
