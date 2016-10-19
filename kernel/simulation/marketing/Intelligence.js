"use strict";
var Marketing_1 = require('../../engine/ComputeEngine/Marketing');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
function create() {
    var BI = new Marketing_1.Intelligence({
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Intelligence.js.map