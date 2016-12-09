"use strict";
const IObject = require('../IObject');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class RawMaterial extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "production";
    }
    init(suppliers, warehouse) {
        super.init();
        this.suppliers = suppliers;
        // attach suppliers to this rawMateriel
        /*for (let i = 0, len = suppliers.length; i < len; i++) {
            this.suppliers[i].init(this);
        }*/
        this.warehouse = warehouse;
        this.warehouse.stockedItem = this;
    }
    reset() {
        this.purchasesValue = 0;
        this.purchasesQ = 0;
        this.unplannedPurchasesQ = 0;
        this.initialised = false;
    }
    // set valuation method
    get inventoryUnitValue() {
        let spotPrice = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE);
        let mth3Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.THREE_MONTH);
        let mth6Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.SIX_MONTH);
        let unitValue = Math.min(spotPrice, mth3Price, mth6Price);
        return unitValue;
    }
    get inventoryUnitValueForPremiumQuality() {
        let unitValue = this.inventoryUnitValue;
        let qualityPremium = this.suppliers[0].params.unplannedPurchasesPremium;
        return unitValue * (1 + qualityPremium);
    }
    // 90% of the lowest of the spot, 3-month and 6- month prices quoted last quarter (converted into euros), 
    // times the number of units in stock and on order
    get closingValue() {
        let quantity = this.warehouse.availableNextPeriodQ + this.warehouse.deliveryAfterNextPQ;
        let calculatedValue = quantity * this.inventoryUnitValue;
        let reelValue = calculatedValue * (1 - this.params.diffReelAndCalculatedValue);
        return Math.ceil(reelValue);
    }
    // actions
    supply(quantity, value, term, isUnplanned = false) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(quantity) || !Utils.isNumericValid(value)) {
            console.warn('Material Supply Quantity or Value not reel', arguments);
            return;
        }
        this.purchasesValue += value;
        this.purchasesQ += quantity;
        if (isUnplanned) {
            this.unplannedPurchasesQ += quantity;
        }
        return this.warehouse.moveIn(quantity, value, term) > 0;
    }
    consume(quantity, premiumQualityProp) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Material consume@ Quantity not reel :', arguments);
            return false;
        }
        if (!Utils.isNumericValid(premiumQualityProp) || premiumQualityProp > 1) {
            console.warn('Material @ premium Quality not reel :', premiumQualityProp);
            return false;
        }
        let deliveredQ, standardMaterialQ, premiumMaterialQ, urgentOrderQ;
        standardMaterialQ = Utils.ceil(quantity * (1 - premiumQualityProp), 2);
        premiumMaterialQ = Utils.ceil(quantity - standardMaterialQ, 2);
        // premium materiel work in JIT
        if (premiumMaterialQ > 0) {
            this.suppliers[0].order(premiumMaterialQ, ENUMS.QUALITY.HQ, ENUMS.FUTURES.IMMEDIATE);
        }
        // normal material from stock
        deliveredQ = this.warehouse.moveOut(standardMaterialQ);
        urgentOrderQ = standardMaterialQ - deliveredQ;
        if (urgentOrderQ > 0) {
            this.suppliers[0].order(standardMaterialQ - deliveredQ, ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE, true);
        }
        return true;
    }
    onFinish() {
        this.CashFlow.addPayment(this.purchasesValue, this.suppliers[0].params.payments, 'purchasesValue');
    }
    get state() {
        return {
            "openingQ": this.warehouse.openingQ,
            //"premiumMaterialPurchasesQ": this.suppliers[0].premiumMaterialPurchasesQ,
            "unplannedPurchasesQ": this.unplannedPurchasesQ,
            "spoiledQ": this.warehouse.spoiledQ,
            "lostQ": this.warehouse.lostQ,
            "outQ": this.warehouse.outQ,
            "closingQ": this.warehouse.closingQ,
            "deliveryNextPBoughtBeforeLastPQ": this.warehouse.deliveryNextPBoughtBeforeLastPQ
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RawMaterial;
//# sourceMappingURL=RawMaterial.js.map