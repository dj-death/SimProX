import * as Supplier from './Supplier';
import MaterialMarket from './MaterialMarket';

import { Economy }  from './Economy';

import { RawMaterial, SemiProduct } from '../Manufacturing';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface SubContracterParams extends Supplier.SupplierParams {
    subContracterID?: string; 
    manufacturingUnitCost: number;

    supplierID: string;
    offeredSubProductsIDs: string[];
}



export default class SubContracter extends Supplier.Supplier<SemiProduct> {
    departmentName = "environnement";
    protected isPersistedObject: boolean = true;

    public params: SubContracterParams;

    private rawMaterialSupplier: Supplier.Supplier<RawMaterial>;
    private rawMaterialMarket: MaterialMarket;

    constructor(subContracorParams: SubContracterParams) {
        super(subContracorParams);

        this.params = subContracorParams;
    }

    init(semiProduct: SemiProduct, rawMaterialMarket: MaterialMarket, economy: Economy, rawMaterialSupplier?: Supplier.Supplier<RawMaterial>) {
        super.init(semiProduct, null, economy);

        this.material = semiProduct;

        this.rawMaterialMarket = rawMaterialMarket;
        this.rawMaterialSupplier = rawMaterialSupplier;
    }

    // helpers
    _getPrice(premiumQualityProp: number = 0): number {
        var rawMaterial_spotPrice = this.rawMaterialSupplier._getPrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE);
        var rawMaterial_spotHQPrice = this.rawMaterialSupplier._getPrice(ENUMS.QUALITY.HQ, ENUMS.FUTURES.IMMEDIATE);

        var component_materialConsoUnit = this.material.params.rawMaterialConsoCfg.consoUnit;

        var component_standardPrice = rawMaterial_spotPrice * component_materialConsoUnit + this.params.manufacturingUnitCost;
        var component_HQPrice = rawMaterial_spotHQPrice * component_materialConsoUnit + this.params.manufacturingUnitCost;
        
        // linear interpolation
        var price = component_standardPrice + ((premiumQualityProp - ENUMS.QUALITY.MQ) * (component_HQPrice - component_standardPrice)) / (ENUMS.QUALITY.HQ - ENUMS.QUALITY.MQ);

        // inflation
        price *= (this.economy.producerPriceBase100Index / 100);

        return Utils.ceil(price, 2);
    }

}