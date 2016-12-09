import { RawMaterial } from '../../engine/ComputeEngine/Manufacturing';
import { Supplier } from '../../engine/ComputeEngine/Environnement';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


export default function create(): Supplier<RawMaterial>[] {

    let supplierA1 = new Supplier<RawMaterial>({
        supplierID: "0",
        id: "Supplier1",
        label: "Supplier1",

        name: "Supplier",

        materialID: "0",
        materialMarketID: "0",

        availableFutures: {
            "IMMEDIATE": { term: ENUMS.FUTURES.IMMEDIATE },
            "THREE_MONTH": { term: ENUMS.FUTURES.THREE_MONTH },
            "SIX_MONTH": { term: ENUMS.FUTURES.SIX_MONTH }
        },
        availableQualities: {
            "MQ": { index: 100, premium: 0 },
            "HQ": { index: 200, premium: 0.5 }
        },
        payments: {
            "CASH": { credit: ENUMS.CREDIT.CASH, part: 0.5 },
            "THREE_MONTH": { credit: ENUMS.CREDIT.THREE_MONTH, part: 0.5 }
        },
        deliveryDelai: ENUMS.DELIVERY.IMMEDIATE,
        discountRate: 0,
        interestRate: 0,
        rebateRate: 0,
        canUnplannedMaterialPurchases: true,
        unplannedPurchasesPremium: 0.1
    });

    return [supplierA1];
}