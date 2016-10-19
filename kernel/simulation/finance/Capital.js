"use strict";
var Finance_1 = require('../../engine/ComputeEngine/Finance');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
function create() {
    var capital = new Finance_1.Capital({
        id: "capital",
        label: "capital",
        shareNominalValue: 100,
        initialSharesNb: 27500,
        restrictions: {
            capitalAnnualVariationLimitRate: 0.1,
            minSharePriceToIssueShares: 1,
            minSharePriceToRepurchaseShares: 1
        },
        payments: {
            "CASH": {
                credit: ENUMS.CREDIT.CASH,
                part: 1
            }
        }
    });
    return capital;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Capital.js.map