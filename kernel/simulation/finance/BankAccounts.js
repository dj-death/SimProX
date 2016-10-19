"use strict";
var Finance_1 = require('../../engine/ComputeEngine/Finance');
var game = require('../Games');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var defaultPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
function create() {
    var eurobankAccount = new Finance_1.BankAccount({
        id: "bankAccount1",
        label: "bankAccount1",
        bankAccountID: "0",
        bankID: "0",
        periodDaysNb: game.daysNbByPeriod,
        payments: defaultPayments
    });
    return [eurobankAccount];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=BankAccounts.js.map