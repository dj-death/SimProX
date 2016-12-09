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
    let alphaA = new Manufacturing_1.SemiProduct({
        id: "subProduct1",
        subProductID: "0",
        atelierID: "0",
        materialsIDs: ["0"],
        label: "encours alpha Produit A",
        spaceNeeded: 0.25,
        manufacturingCfg: {
            minManufacturingUnitTime: 60
        },
        lostProbability: 0,
        rejectedProbability: 0,
        spoilProbability: 0,
        rawMaterialConsoCfg: {
            consoUnit: 1
        },
        costs: {
            inspectionUnit: 0,
            planningUnit: 0,
            externalStorageUnitCost: 3
        }
    });
    let betaA = new Manufacturing_1.SemiProduct({
        id: "subProduct2",
        subProductID: "1",
        atelierID: "1",
        materialsIDs: [],
        label: "encours beta Produit A",
        spaceNeeded: 0,
        manufacturingCfg: {
            minManufacturingUnitTime: 100
        },
        rawMaterialConsoCfg: {
            consoUnit: 0
        },
        lostProbability: 0,
        rejectedProbability: 0,
        spoilProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0,
            externalStorageUnitCost: 0
        }
    });
    let alphaB = new Manufacturing_1.SemiProduct({
        id: "subProduct3",
        subProductID: "2",
        atelierID: "0",
        materialsIDs: ["0"],
        label: "encours alpha Produit B",
        spaceNeeded: 0.5,
        manufacturingCfg: {
            minManufacturingUnitTime: 75
        },
        rawMaterialConsoCfg: {
            consoUnit: 2
        },
        lostProbability: 0,
        rejectedProbability: 0,
        spoilProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0,
            externalStorageUnitCost: 3
        }
    });
    let betaB = new Manufacturing_1.SemiProduct({
        id: "subProduct4",
        subProductID: "3",
        atelierID: "1",
        materialsIDs: [],
        label: "encours beta Produit B",
        spaceNeeded: 0,
        manufacturingCfg: {
            minManufacturingUnitTime: 150
        },
        rawMaterialConsoCfg: {
            consoUnit: 0
        },
        lostProbability: 0,
        rejectedProbability: 0,
        spoilProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0,
            externalStorageUnitCost: 0
        }
    });
    let alphaC = new Manufacturing_1.SemiProduct({
        id: "subProduct5",
        subProductID: "4",
        atelierID: "0",
        materialsIDs: ["0"],
        label: "encours alpha Produit C",
        spaceNeeded: 1,
        manufacturingCfg: {
            minManufacturingUnitTime: 120
        },
        rawMaterialConsoCfg: {
            consoUnit: 3
        },
        lostProbability: 0,
        rejectedProbability: 0,
        spoilProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0,
            externalStorageUnitCost: 3
        }
    });
    let betaC = new Manufacturing_1.SemiProduct({
        id: "subProduct6",
        subProductID: "5",
        atelierID: "1",
        materialsIDs: [],
        label: "encours alpha Produit A",
        spaceNeeded: 0,
        manufacturingCfg: {
            minManufacturingUnitTime: 300
        },
        rawMaterialConsoCfg: {
            consoUnit: 0
        },
        lostProbability: 0,
        rejectedProbability: 0,
        spoilProbability: 0,
        costs: {
            inspectionUnit: 0,
            planningUnit: 0,
            externalStorageUnitCost: 0
        }
    });
    return [
        alphaA, betaA, alphaB, betaB, alphaC, betaC
    ];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=SemiProducts.js.map