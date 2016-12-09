"use strict";
const Finance_1 = require('../../engine/ComputeEngine/Finance');
const ENUMS = require('../../engine/ComputeEngine/ENUMS');
let defaultPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
function create() {
    let alphaInsurance = new Finance_1.Insurance({
        id: "insurance1",
        label: "insurance1",
        insuranceID: "0",
        plans: {
            "0": {
                primaryRiskRate: 100 / 100,
                premiumRate: 0
            },
            "1": {
                primaryRiskRate: 0.1 / 100,
                premiumRate: 0.6 / 100
            },
            "2": {
                primaryRiskRate: 0.2 / 100,
                premiumRate: 0.35 / 100
            },
            "3": {
                primaryRiskRate: 0.3 / 100,
                premiumRate: 0.20 / 100
            },
            "4": {
                primaryRiskRate: 0.4 / 100,
                premiumRate: 0.10 / 100
            }
        },
        forceMajeureSequence: [0, 600, 51900, 0, 0],
        optimalManagementBudget: 200000,
        normalManagementBudget: 115000,
        payments: defaultPayments
    });
    return [alphaInsurance];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Insurances.js.map