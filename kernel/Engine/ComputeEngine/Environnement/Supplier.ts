import * as IObject from '../IObject';

import MaterialMarket  from './MaterialMarket';

import { Economy }  from './Economy';

import { RawMaterial } from '../Manufacturing';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



interface Quality {
    index: ENUMS.QUALITY;
    // will be fixed by market so we don't need to hard code it
    premium?: number;
}

interface QualitiesArray {
    [index: string]: Quality;
}

interface Payment {
    credit: ENUMS.CREDIT;
    part: number;
}

interface PaymentArray {
    [index: string]: Payment;
}


export interface SupplierParams extends IObject.ObjectParams {
    name: string;
    supplierID?: string;

    availableQualities: QualitiesArray;
    availableFutures: ENUMS.FuturesArray;
    payments: PaymentArray;

    interestRate: number;
    rebateRate: number;
    discountRate: number;

    deliveryDelai: ENUMS.DELIVERY;

    canUnplannedMaterialPurchases: boolean;
    unplannedPurchasesPremium: number;

    materialMarketID?: string;
    materialID?: string;

}

interface Material {
    supply: (quantity: number, value: number, term: ENUMS.FUTURES, isUnplannedPurchases: boolean) => boolean;
}

export class Supplier<T extends Material> extends IObject.IObject {
    departmentName = "environnement";
    protected isPersistedObject: boolean = true;

    public params: SupplierParams;

    material: T;

    market: MaterialMarket;

    economy: Economy;

    constructor(params: SupplierParams) {
        super(params);
    }

    init(material: T, materialMarket: MaterialMarket, economy: Economy) {
        super.init();

        this.material = material;
        this.market = materialMarket;

        this.economy = economy;
    }


    // helpers
    _getPrice(quality: ENUMS.QUALITY, term: ENUMS.FUTURES/*, credit: ENUMS.CREDIT*/): number {
        var price: number,
            basePrice = this.market.getPrice(term) / this.market.params.standardLotQuantity,
            qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;

        price = basePrice * (1 + qualityPremium);

        return Utils.round(price, 3);
    }


    _getReelTimePrice(quality: ENUMS.QUALITY, term: ENUMS.FUTURES/*, credit: ENUMS.CREDIT*/): number {
        var price,
            basePrice = this.market.getQuotedPrice(term) / this.market.params.standardLotQuantity,
            qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;

        price = basePrice * (1 + qualityPremium);

        return Utils.round(price, 3);
    }

    // actions

    order(quantity: number, quality: ENUMS.QUALITY = ENUMS.QUALITY.MQ, term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE, isUnplannedPurchases: boolean = false): boolean {
        if (!this.initialised) {
            console.warn('not initialised');
            return false;
        }

        if (! Utils.isNumericValid(quantity)) {
            console.warn('Supplier %d @ order Quantity not reel', this.params.supplierID);

            return;
        }

        if (quantity === 0) {
            return;
        }

        if (!this.params.canUnplannedMaterialPurchases) {
            return false;
        }

        var orderValue: number,
            price: number;

        // 9di bli moujoud matmchich blach
        quality = this.params.availableQualities[ENUMS.QUALITY[quality]] !== undefined ? quality : ENUMS.QUALITY[Object.keys(this.params.availableQualities)[0]];
        term = this.params.availableFutures[ENUMS.FUTURES[term]] !== undefined ? term : ENUMS.FUTURES[Object.keys(this.params.availableFutures)[0]];

        if (isUnplannedPurchases) {
            price = this._getReelTimePrice(quality, term) * (1 + this.params.unplannedPurchasesPremium);

        } else {
            price = this._getPrice(quality, term);
        }

        orderValue = Utils.ceil(price * quantity);

        this.material.supply(quantity, orderValue, term, isUnplannedPurchases);

        return true;
    }
}
