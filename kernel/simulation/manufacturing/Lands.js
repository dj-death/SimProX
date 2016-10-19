"use strict";
var Manufacturing_1 = require('../../engine/ComputeEngine/Manufacturing');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var cashPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
function create() {
    var land = new Manufacturing_1.Land({
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