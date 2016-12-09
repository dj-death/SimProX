"use strict";
const Marketing_1 = require('../../engine/ComputeEngine/Marketing');
const ENUMS = require('../../engine/ComputeEngine/ENUMS');
let cashPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
function create() {
    let salesOffice = new Marketing_1.SalesOffice({
        id: "salesOffice1",
        label: "salesOffice1",
        costs: {
            administrationCostRate: 0.01
        },
        payments: cashPayments,
        receipts: cashPayments,
        recoveryEfficacityBaseRate: 1 - 0.0929
    });
    return salesOffice;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=SalesOffice.js.map