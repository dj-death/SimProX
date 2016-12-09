import { RMWarehouse } from '../../engine/ComputeEngine/Manufacturing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


export default function create(): RMWarehouse[] {


    let rmWarehouse = new RMWarehouse({
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