"use strict";
const Manufacturing_1 = require('../../engine/ComputeEngine/Manufacturing');
const ENUMS = require('../../engine/ComputeEngine/ENUMS');
let cashPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
let threeMonthsPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 0
    },
    "THREE_MONTH": {
        credit: ENUMS.CREDIT.THREE_MONTH,
        part: 1
    }
};
function create() {
    let productA = new Manufacturing_1.Product({
        id: "product1",
        productID: "0",
        subProductsIDs: ["0", "1"],
        code: 0,
        label: "Produit A",
        spaceNeeded: 0,
        CO2Footprint: {
            kwh: 0,
            weight: 0
        },
        rejectedProbability: 0.0358,
        lostProbability: 0,
        spoilProbability: 0,
        minEffectiveDevBudget: 35000,
        minRnDProjectMaturity: 1,
        containerCapacityUnitsNb: 500,
        costs: {
            scrapValue: 40,
            guaranteeServicingCharge: 60,
            inspectionUnit: 1,
            planningUnit: 1,
            externalStorageUnitCost: 0
        },
        payments: {
            guaranteeServicing: threeMonthsPayments,
            qualityControl: cashPayments,
            development: cashPayments,
            prodPlanning: cashPayments
        }
    });
    let productB = new Manufacturing_1.Product({
        id: "product2",
        productID: "1",
        subProductsIDs: ["2", "3"],
        code: 1,
        label: "Produit B",
        spaceNeeded: 0,
        CO2Footprint: {
            kwh: 0,
            weight: 0
        },
        rejectedProbability: 0.0373,
        lostProbability: 0.0007,
        spoilProbability: 0,
        minEffectiveDevBudget: 35000,
        minRnDProjectMaturity: 1,
        containerCapacityUnitsNb: 250,
        costs: {
            scrapValue: 80,
            guaranteeServicingCharge: 150,
            inspectionUnit: 1,
            planningUnit: 1,
            externalStorageUnitCost: 0
        },
        payments: {
            guaranteeServicing: threeMonthsPayments,
            qualityControl: cashPayments,
            development: cashPayments,
            prodPlanning: cashPayments
        }
    });
    let productC = new Manufacturing_1.Product({
        id: "product3",
        productID: "2",
        subProductsIDs: ["4", "5"],
        code: 2,
        label: "Produit C",
        spaceNeeded: 0,
        CO2Footprint: {
            kwh: 0,
            weight: 0
        },
        rejectedProbability: 0.0375,
        lostProbability: 0,
        spoilProbability: 0,
        minEffectiveDevBudget: 35000,
        minRnDProjectMaturity: 1,
        containerCapacityUnitsNb: 125,
        costs: {
            scrapValue: 120,
            guaranteeServicingCharge: 250,
            inspectionUnit: 1,
            planningUnit: 1,
            externalStorageUnitCost: 0
        },
        payments: {
            guaranteeServicing: threeMonthsPayments,
            qualityControl: cashPayments,
            development: cashPayments,
            prodPlanning: cashPayments
        }
    });
    return [productA, productB, productC];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Products.js.map