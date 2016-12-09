import { Factory } from '../../engine/ComputeEngine/Manufacturing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');



let cashPayments: ENUMS.PaymentArray = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};

export default function create(): Factory[] {

    let factory = new Factory({
        id: "factory1",
        factoryID: "0",

        landID: "0",

        label: "Usine",
        maxSpaceUse: 0.75,
        depreciationRate: 0,
        isValuationAtMarket: false,
        costs: {
            fixedExpensesPerSquare: 20,
            CO2OffsettingPerTonneRate: 40
        },
        payments: {
            acquisition: cashPayments,
            miscellaneous: cashPayments
        },
        CO2Footprint: {
            kwh: 50,
            weight: 9.5
        }
    });

    return [factory];
}