"use strict";
const Manufacturing_1 = require('../../engine/ComputeEngine/Manufacturing');
function create() {
    let rmWarehouse = new Manufacturing_1.RMWarehouse({
        id: "rmWarehouse1",
        label: "rmWarehouse1",
        warehouseID: "0",
        materialID: "0",
        factoryID: "0",
        lostProbability: 0,
        costs: {
            storageUnitCost: 0,
            externalStorageUnitCost: 2.5,
            fixedAdministrativeCost: 7500
        }
    });
    return [rmWarehouse];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=RMWarehouses.js.map