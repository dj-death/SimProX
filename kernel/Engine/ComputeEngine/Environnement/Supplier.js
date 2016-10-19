"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Supplier = (function (_super) {
    __extends(Supplier, _super);
    function Supplier(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    Supplier.prototype.init = function (material, materialMarket, economy) {
        _super.prototype.init.call(this);
        this.material = material;
        this.market = materialMarket;
        this.economy = economy;
    };
    // helpers
    Supplier.prototype._getPrice = function (quality, term /*, credit: ENUMS.CREDIT*/) {
        var price, basePrice = this.market.getPrice(term) / this.market.params.standardLotQuantity, qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;
        price = basePrice * (1 + qualityPremium);
        return Utils.round(price, 3);
    };
    Supplier.prototype._getReelTimePrice = function (quality, term /*, credit: ENUMS.CREDIT*/) {
        var price, basePrice = this.market.getQuotedPrice(term) / this.market.params.standardLotQuantity, qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;
        price = basePrice * (1 + qualityPremium);
        return Utils.round(price, 3);
    };
    // actions
    Supplier.prototype.order = function (quantity, quality, term, isUnplannedPurchases) {
        if (quality === void 0) { quality = ENUMS.QUALITY.MQ; }
        if (term === void 0) { term = ENUMS.FUTURES.IMMEDIATE; }
        if (isUnplannedPurchases === void 0) { isUnplannedPurchases = false; }
        if (!this.initialised) {
            console.warn('not initialised');
            return false;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Supplier %d @ order Quantity not reel', this.params.supplierID);
            return;
        }
        if (quantity === 0) {
            return;
        }
        if (!this.params.canUnplannedMaterialPurchases) {
            return false;
        }
        var orderValue, price;
        // 9di bli moujoud matmchich blach
        quality = this.params.availableQualities[ENUMS.QUALITY[quality]] !== undefined ? quality : ENUMS.QUALITY[Object.keys(this.params.availableQualities)[0]];
        term = this.params.availableFutures[ENUMS.FUTURES[term]] !== undefined ? term : ENUMS.FUTURES[Object.keys(this.params.availableFutures)[0]];
        if (isUnplannedPurchases) {
            price = this._getReelTimePrice(quality, term) * (1 + this.params.unplannedPurchasesPremium);
        }
        else {
            price = this._getPrice(quality, term);
        }
        orderValue = Utils.ceil(price * quantity);
        this.material.supply(quantity, orderValue, term, isUnplannedPurchases);
        return true;
    };
    return Supplier;
}(IObject.IObject));
exports.Supplier = Supplier;
//# sourceMappingURL=Supplier.js.map