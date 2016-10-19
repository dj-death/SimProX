"use strict";
var Manufacturing_1 = require('../../engine/ComputeEngine/Manufacturing');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var cashPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
var maintenancePayments = {
    "THREE_MONTH": {
        credit: ENUMS.CREDIT.THREE_MONTH,
        part: 1
    }
};
var machinesParams = [
    {
        id: "machine1",
        label: "Machine 1",
        machineID: "0",
        spaceNeeded: 25,
        CO2Footprint: {
            kwh: 6,
            weight: 3.12
        },
        acquisitionPrice: 300000,
        deliveryTime: ENUMS.DELIVERY.NEXT_PERIOD,
        depreciationRate: 2.5 / 100,
        usefulLife: 20,
        residualValue: 0,
        machineCapacityByShift: [576, 1068, 1602],
        maxMachineHoursforWeekDay: [420, 420, 420],
        machineOperatorsNeededNb: [4, 8, 12],
        breakdownProba: 0.0031,
        costs: {
            runningHour: 8
        }
    }
];
function create() {
    var atelier1Machinery = new Manufacturing_1.Machinery({
        id: "machinery1",
        machineryID: "0",
        atelierID: "0",
        label: "Robots",
        costs: {
            decommissioning: 60000,
            maintenanceHourlyCost: 85,
            overContractedMaintenanceHourlyCost: 175,
            overheads: 3500,
            supervisionPerShift: 12500,
            CO2OffsettingPerTonneRate: 40
        },
        payments: {
            acquisitions: cashPayments,
            disposals: cashPayments,
            running: cashPayments,
            decommissioning: cashPayments,
            maintenance: maintenancePayments
        },
        decommissioningTime: ENUMS.DELIVERY.IMMEDIATE
    }, machinesParams);
    return [atelier1Machinery];
}
exports.create = create;
var atelier1MachineryStates = [
    {
        type: 0,
        age: 19,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 19,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 13,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 13,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 13,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 13,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 12,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 12,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 11,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 7,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    },
    {
        type: 0,
        age: 6,
        runningHoursNb: 10000,
        efficiency: 0.931,
        nextUse: Number.POSITIVE_INFINITY
    }
];
exports.machinesStates = [atelier1MachineryStates];
//# sourceMappingURL=Machineries.js.map