import { Transport }  from '../../engine/ComputeEngine/Marketing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');



let defaultPayments: ENUMS.PaymentArray = {
    "THREE_MONTH": {
        credit: ENUMS.CREDIT.THREE_MONTH,
        part: 1
    }
};

export default function create(): Transport[] {


    let europeTrs = new Transport({
        id: "market1_transport",
        label: "market1_transport",

        transportID: "0",

        marketID: "0",

        shipmentDistance: 717,
        distanceLimit: 400,
        mixedLoads: true,
        costs: {
            containerDailyHireCost: 650,
            containerShipmentCost: 0,
            productStorageCost: 3.50
        },
        payments: defaultPayments
    });

    let naftaTrs = new Transport({
        id: "market2_transport",
        label: "market2_transport",
        transportID: "1",

        marketID: "1",


        shipmentDistance: 250,
        distanceLimit: 400,
        mixedLoads: true,
        costs: {
            containerDailyHireCost: 650,
            containerShipmentCost: 8000,
            productStorageCost: 4
        },
        payments: defaultPayments
    });

    let internetTrs = new Transport({
        id: "market3_transport",
        label: "market3_transport",

        transportID: "2",

        marketID: "2",

        shipmentDistance: 150,
        distanceLimit: 400,
        mixedLoads: true,
        costs: {
            containerDailyHireCost: 650,
            containerShipmentCost: 0,
            productStorageCost: 3.50
        },

        payments: defaultPayments
    });


    return [europeTrs, naftaTrs, internetTrs];
}
