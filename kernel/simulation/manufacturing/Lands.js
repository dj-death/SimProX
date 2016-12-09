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
    let land = new Manufacturing_1.Land({
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Lands.js.map