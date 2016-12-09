"use strict";
const IObject = require('../IObject');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class Supplier extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    init(material, materialMarket, economy) {
        super.init();
        this.material = material;
        this.market = materialMarket;
        this.economy = economy;
    }
    // helpers
    _getPrice(quality, term /*, credit: ENUMS.CREDIT*/) {
        let price, basePrice = this.market.getPrice(term) / this.market.params.standardLotQuantity, qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;
        price = basePrice * (1 + qualityPremium);
        return Utils.round(price, 3);
    }
    _getReelTimePrice(quality, term /*, credit: ENUMS.CREDIT*/) {
        let price, basePrice = this.market.getQuotedPrice(term) / this.market.params.standardLotQuantity, qualityPremium = this.params.availableQualities[ENUMS.QUALITY[quality]].premium;
        price = basePrice * (1 + qualityPremium);
        return Utils.round(price, 3);
    }
    // actions
    order(quantity, quality = ENUMS.QUALITY.MQ, term = ENUMS.FUTURES.IMMEDIATE, isUnplannedPurchases = false) {
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
        let orderValue, price;
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
    }
}
exports.Supplier = Supplier;
//# sourceMappingURL=Supplier.js.map