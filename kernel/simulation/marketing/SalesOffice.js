"use strict";
var Marketing_1 = require('../../engine/ComputeEngine/Marketing');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var cashPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
function create() {
    var salesOffice = new Marketing_1.SalesOffice({
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