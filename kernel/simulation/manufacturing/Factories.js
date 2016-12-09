"use strict";
const Manufacturing_1 = require('../../engine/ComputeEngine/Manufacturing');
const ENUMS = require('../../engine/ComputeEngine/ENUMS');
let cashPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
function create() {
    let factory = new Manufacturing_1.Factory({
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Factories.js.map