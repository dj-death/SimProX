import { Land } from '../../engine/ComputeEngine/Manufacturing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');



let cashPayments: ENUMS.PaymentArray = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};

export default function create(): Land[] {

    let land = new Land({
        id: "land1",
        landID: "0",

        label: "Terrain",
        maxSpaceUse: 0.8,
        depreciationRate: 0,
        isValuationAtMarket: false,
        costs: {
            fixedExpensesPerSquare: 0,
            CO2OffsettingPerTonneRate: 0
        },
        payments: {
            acquisition: cashPayments,
            miscellaneous: cashPayments
        },
        CO2Footprint: {
            kwh: 0,
            weight: 0
        }
    });


    return [land];

}