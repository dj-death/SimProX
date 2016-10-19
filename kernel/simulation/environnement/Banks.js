"use strict";
var Environnement_1 = require('../../engine/ComputeEngine/Environnement');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var eurobank = new Environnement_1.Bank({
    id: "bank1",
    label: "bank1",
    bankID: "0",
    centralBankID: "0",
    termloansFixedAnnualInterestRate: 0.1,
    authorisedOverdraftPremiumRate: 0.04,
    unAuthorisedOverdraftPremiumRate: 0.1,
    termDepositMaturity: ENUMS.FUTURES.THREE_MONTH,
    termDepositPremiumRate: 0,
    canTermLoansToBeRepaidDuringGame: false,
    termLoansAvailability: ENUMS.FUTURES.IMMEDIATE
});
module.exports = [eurobank];
//# sourceMappingURL=Banks.js.map