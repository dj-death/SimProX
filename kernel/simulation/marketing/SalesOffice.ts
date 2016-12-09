import { SalesOffice }  from '../../engine/ComputeEngine/Marketing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


let cashPayments: ENUMS.PaymentArray = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};


export default function create(): SalesOffice {

    let salesOffice = new SalesOffice({
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