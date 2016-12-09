﻿import { Bank } from '../../engine/ComputeEngine/Environnement';
import ENUMS = require('../../engine/ComputeEngine/ENUMS');

let eurobank = new Bank({
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

export = [eurobank];