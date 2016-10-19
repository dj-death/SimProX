"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Supplier = require('./Supplier');
var ENUMS = require('../ENUMS');
var Utils = require('../../../utils/Utils');
var SubContracter = (function (_super) {
    __extends(SubContracter, _super);
    function SubContracter(subContracorParams) {
        _super.call(this, subContracorParams);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
        this.params = subContracorParams;
    }
    SubContracter.prototype.init = function (semiProduct, rawMaterialMarket, economy, rawMaterialSupplier) {
        _super.prototype.init.call(this, semiProduct, null, economy);
        this.material = semiProduct;
        this.rawMaterialMarket = rawMaterialMarket;
        this.rawMaterialSupplier = rawMaterialSupplier;
    };
    // helpers
    SubContracter.prototype._getPrice = function (premiumQualityProp) {
        if (premiumQualityProp === void 0) { premiumQualityProp = 0; }
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
    };
    return SubContracter;
}(Supplier.Supplier));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SubContracter;
//# sourceMappingURL=SubContracter.js.map