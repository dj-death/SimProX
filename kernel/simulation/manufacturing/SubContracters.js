"use strict";
var Environnement_1 = require('../../engine/ComputeEngine/Environnement');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var Utils = require('../../utils/Utils');
var subContracterDefaultParams, alphaASubContracterParams, alphaBSubContracterParams, alphaCSubContracterParams;
subContracterDefaultParams = {
    name: "Sous-Traitant",
    availableFutures: {
        "IMMEDIATE": { term: ENUMS.FUTURES.IMMEDIATE },
    },
    availableQualities: {
        "MQ": { index: 100, premium: 0 },
        "HQ": { index: 200, premium: 0.5 }
    },
    payments: {
        "CASH": { credit: ENUMS.CREDIT.CASH, part: 0.5 },
        "THREE_MONTH": { credit: ENUMS.CREDIT.THREE_MONTH, part: 0.5 }
    },
    deliveryDelai: ENUMS.DELIVERY.AFTERNEXT_PERIOD,
    discountRate: 0,
    interestRate: 0,
    rebateRate: 0,
    canUnplannedMaterialPurchases: false,
    unplannedPurchasesPremium: 0,
    supplierID: "0"
};
alphaASubContracterParams = Utils.ObjectApply({}, subContracterDefaultParams, { manufacturingUnitCost: 60, offeredSubProductsIDs: ["0"] });
alphaBSubContracterParams = Utils.ObjectApply({}, subContracterDefaultParams, { manufacturingUnitCost: 75, offeredSubProductsIDs: ["2"] });
alphaCSubContracterParams = Utils.ObjectApply({}, subContracterDefaultParams, { manufacturingUnitCost: 120, offeredSubProductsIDs: ["4"] });
var cashPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
var threeMonthsPayments = {
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
    var alphaASubContracter = new Environnement_1.SubContracter(alphaASubContracterParams);
    var alphaBSubContracter = new Environnement_1.SubContracter(alphaBSubContracterParams);
    var alphaCSubContracter = new Environnement_1.SubContracter(alphaCSubContracterParams);
    return [alphaASubContracter, alphaBSubContracter, alphaCSubContracter];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=SubContracters.js.map