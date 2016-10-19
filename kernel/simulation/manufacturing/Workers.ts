﻿import { Worker } from '../../engine/ComputeEngine/Manufacturing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');

import game = require('../Games');
var weeksNbByPeriod = game.weeksNbByPeriod;




var cashPayments: ENUMS.PaymentArray = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};

var single: ENUMS.Shift,
    double: ENUMS.Shift,
    treble: ENUMS.Shift,

    noShift: ENUMS.Shift;

noShift = {
    level: ENUMS.SHIFT_LEVEL.SINGLE,

    workersNeededNb: 1,

    maxHoursWeekDays: 420,
    maxHoursOvertimeSaturday: 84,
    maxHoursOvertimeSunday: 72,

    maxHoursPerPeriod: 420 + 84 + 72,

    shiftPremium: 0,

    weeksWorkedByPeriod: weeksNbByPeriod
};

single = {
    level: ENUMS.SHIFT_LEVEL.SINGLE,

    workersNeededNb: 4,

    maxHoursWeekDays: 420,
    maxHoursOvertimeSaturday: 84,
    maxHoursOvertimeSunday: 72,

    maxHoursPerPeriod: 420 + 84 + 72,

    shiftPremium: 0,

    weeksWorkedByPeriod: weeksNbByPeriod
};

double = {
    level: ENUMS.SHIFT_LEVEL.DOUBLE,

    workersNeededNb: 8,

    maxHoursWeekDays: 420,
    maxHoursOvertimeSaturday: 42,
    maxHoursOvertimeSunday: 72,
    maxHoursPerPeriod: 420 + 42 + 72,

    shiftPremium: 1 / 3,

    weeksWorkedByPeriod: weeksNbByPeriod
};

treble = {
    level: ENUMS.SHIFT_LEVEL.TREBLE,

    workersNeededNb: 12,

    maxHoursWeekDays: 420,
    maxHoursOvertimeSaturday: 42,
    maxHoursOvertimeSunday: 72,
    maxHoursPerPeriod: 420 + 42 + 72,

    shiftPremium: 2 / 3,

    weeksWorkedByPeriod: weeksNbByPeriod
};

export default function create(): Worker[] {


    var machinist = new Worker({
        id: "worker2",
        workerID: "1",


        machineryID: "0",
        atelierID: "0",
        labourPoolID: "0",


        isUnskilled: true,
        surplusMaxDismissedPercent: 0.5,
        recruitedAvailability: ENUMS.FUTURES.IMMEDIATE,
        dismissedUnvailability: ENUMS.FUTURES.IMMEDIATE,
        trainedAvailability: ENUMS.FUTURES.THREE_MONTH,
        maxTrainedNb: 0,
        category: "machinist",
        label: "Opérateur de Machine",
        spaceNeeded: 0,

        CO2Footprint: {
            kwh: 0,
            weight: 0
        },

        strikeHoursPerWeek: 0,
        strikeHoursPerWeekDays: 0,
        strikeHoursPerSaturday: 0,
        strikeHoursPerSunday: 0,
        absenteeismProba: 0,
        absenteeismNormalHoursNb: 0,
        tradeUnionSensibility: 0,
        minHourlyWageRate: 9 * 0.65,
        minHoursWork: 0,
        minPaidHours: 360,
        isPaidUnderMaintenance: false,
        isPaidUnderRepairs: true,
        isPaidUnderSickness: false,
        canBringExternalWorkers: false,
        externalWorkersPremium: 0,
        skilledRateOfPay: 0.65,
        overtimeSatPremium: 0.5,
        overtimeSunPremium: 1,
        costs: {
            recruitment: 1000,
            dismissal: 2000,
            training: 0,

            CO2OffsettingPerTonneRate: 40
        },
        payments: cashPayments,
        defaultRecruit: true,
        availablesShifts: [single, double, treble],


        attritionBaseRate: 0
    });

    var assemblyWorker = new Worker({
        id: "worker1",
        workerID: "0",


        machineryID: "",
        atelierID: "1",
        labourPoolID: "0",


        surplusMaxDismissedPercent: 1,
        isUnskilled: false,
        category: "assemblyWorker",
        label: "Assembleur",
        recruitedAvailability: ENUMS.FUTURES.THREE_MONTH,
        dismissedUnvailability: ENUMS.FUTURES.THREE_MONTH,
        trainedAvailability: ENUMS.FUTURES.THREE_MONTH,
        maxTrainedNb: 9,
        spaceNeeded: 10,
        CO2Footprint: {
            kwh: 1,
            weight: 0.52
        },
        strikeHoursPerWeek: 48,
        strikeHoursPerWeekDays: 35,
        strikeHoursPerSaturday: 7,
        strikeHoursPerSunday: 6,
        tradeUnionSensibility: 0.01,
        absenteeismProba: 0.0005,
        absenteeismNormalHoursNb: 7,
        minHourlyWageRate: 9,
        minHoursWork: 0,
        minPaidHours: 0,
        isPaidUnderMaintenance: false,
        isPaidUnderRepairs: false,
        isPaidUnderSickness: false,
        canBringExternalWorkers: true,
        externalWorkersPremium: 1,
        skilledRateOfPay: 1,
        overtimeSatPremium: 0.5,
        overtimeSunPremium: 1,
        costs: {
            recruitment: 2000,
            dismissal: 5000,
            training: 8500,

            CO2OffsettingPerTonneRate: 40
        },
        payments: cashPayments,
        defaultRecruit: false,
        availablesShifts: [noShift],

        attritionBaseRate: 0
    });

    return [assemblyWorker, machinist];
}