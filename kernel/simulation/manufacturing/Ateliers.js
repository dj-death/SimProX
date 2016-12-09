"use strict";
const Manufacturing_1 = require('../../engine/ComputeEngine/Manufacturing');
function create() {
    let atelierMoulage = new Manufacturing_1.Atelier({
        id: "atelier1",
        atelierID: "0",
        label: "Atelier de Moulage",
        factoryID: "0",
        spaceNeeded: 0,
        unity: 0,
        costs: {
            fixedExpenses: 0,
            maintenance: 0,
            power: 0
        }
    });
    let atelierFinition = new Manufacturing_1.Atelier({
        id: "atelier2",
        atelierID: "1",
        label: "Atelier de Finition",
        factoryID: "0",
        spaceNeeded: 0,
        unity: 0,
        costs: {
            fixedExpenses: 0,
            maintenance: 0,
            power: 0
        }
    });
    return [atelierMoulage, atelierFinition];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Ateliers.js.map