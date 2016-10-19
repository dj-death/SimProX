"use strict";
var Marketing_1 = require('../../engine/ComputeEngine/Marketing');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var defaultPayments = {
    "THREE_MONTH": {
        credit: ENUMS.CREDIT.THREE_MONTH,
        part: 1
    }
};
function create() {
    var europeTrs = new Marketing_1.Transport({
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
    var naftaTrs = new Marketing_1.Transport({
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
    var internetTrs = new Marketing_1.Transport({
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Transport.js.map