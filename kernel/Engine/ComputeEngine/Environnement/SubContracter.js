"use strict";
const Supplier = require('./Supplier');
const ENUMS = require('../ENUMS');
const Utils = require('../../../utils/Utils');
class SubContracter extends Supplier.Supplier {
    constructor(subContracorParams) {
        super(subContracorParams);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
        this.params = subContracorParams;
    }
    init(semiProduct, rawMaterialMarket, economy, rawMaterialSupplier) {
        super.init(semiProduct, null, economy);
        this.material = semiProduct;
        this.rawMaterialMarket = rawMaterialMarket;
        this.rawMaterialSupplier = rawMaterialSupplier;
    }
    // helpers
    _getPrice(premiumQualityProp = 0) {
        let rawMaterial_spotPrice = this.rawMaterialSupplier._getPrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE);
        let rawMaterial_spotHQPrice = this.rawMaterialSupplier._getPrice(ENUMS.QUALITY.HQ, ENUMS.FUTURES.IMMEDIATE);
        let component_materialConsoUnit = this.material.params.rawMaterialConsoCfg.consoUnit;
        let component_standardPrice = rawMaterial_spotPrice * component_materialConsoUnit + this.params.manufacturingUnitCost;
        let component_HQPrice = rawMaterial_spotHQPrice * component_materialConsoUnit + this.params.manufacturingUnitCost;
        // linear interpolation
        let price = component_standardPrice + ((premiumQualityProp - ENUMS.QUALITY.MQ) * (component_HQPrice - component_standardPrice)) / (ENUMS.QUALITY.HQ - ENUMS.QUALITY.MQ);
        // inflation
        price *= (this.economy.producerPriceBase100Index / 100);
        return Utils.ceil(price, 2);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SubContracter;
//# sourceMappingURL=SubContracter.js.map