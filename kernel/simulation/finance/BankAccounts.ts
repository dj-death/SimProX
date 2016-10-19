import { BankAccount } from '../../engine/ComputeEngine/Finance';

import game = require('../Games');

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


var defaultPayments: ENUMS.PaymentArray = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};

export default function create(): BankAccount[] {

    let eurobankAccount = new BankAccount({
        id: "bankAccount1",
        label: "bankAccount1",

        bankAccountID: "0",

        bankID: "0",


        periodDaysNb: game.daysNbByPeriod,
        payments: defaultPayments
    });

    return [eurobankAccount];
}