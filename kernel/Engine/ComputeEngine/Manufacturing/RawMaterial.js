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
var RawMaterial = (function (_super) {
    __extends(RawMaterial, _super);
    function RawMaterial(params) {
        _super.call(this, params);
        this.departmentName = "production";
    }
    RawMaterial.prototype.init = function (suppliers, warehouse) {
        _super.prototype.init.call(this);
        this.suppliers = suppliers;
        // attach suppliers to this rawMateriel
        /*for (var i = 0, len = suppliers.length; i < len; i++) {
            this.suppliers[i].init(this);
        }*/
        this.warehouse = warehouse;
        this.warehouse.stockedItem = this;
    };
    RawMaterial.prototype.reset = function () {
        this.purchasesValue = 0;
        this.purchasesQ = 0;
        this.unplannedPurchasesQ = 0;
        this.initialised = false;
    };
    Object.defineProperty(RawMaterial.prototype, "inventoryUnitValue", {
        // set valuation method
        get: function () {
            var spotPrice = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE);
            var mth3Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.THREE_MONTH);
            var mth6Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.SIX_MONTH);
            var unitValue = Math.min(spotPrice, mth3Price, mth6Price);
            return unitValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RawMaterial.prototype, "inventoryUnitValueForPremiumQuality", {
        get: function () {
            var unitValue = this.inventoryUnitValue;
            var qualityPremium = this.suppliers[0].params.unplannedPurchasesPremium;
            return unitValue * (1 + qualityPremium);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RawMaterial.prototype, "closingValue", {
        // 90% of the lowest of the spot, 3-month and 6- month prices quoted last quarter (converted into euros), 
        // times the number of units in stock and on order
        get: function () {
            var quantity = this.warehouse.availableNextPeriodQ + this.warehouse.deliveryAfterNextPQ;
            var calculatedValue = quantity * this.inventoryUnitValue;
            var reelValue = calculatedValue * (1 - this.params.diffReelAndCalculatedValue);
            return Math.ceil(reelValue);
        },
        enumerable: true,
        configurable: true
    });
    // actions
    RawMaterial.prototype.supply = function (quantity, value, term, isUnplanned) {
        if (isUnplanned === void 0) { isUnplanned = false; }
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
    };
    RawMaterial.prototype.consume = function (quantity, premiumQualityProp) {
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
        var deliveredQ, standardMaterialQ, premiumMaterialQ, urgentOrderQ;
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
    };
    RawMaterial.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.purchasesValue, this.suppliers[0].params.payments, 'purchasesValue');
    };
    Object.defineProperty(RawMaterial.prototype, "state", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    return RawMaterial;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RawMaterial;
//# sourceMappingURL=RawMaterial.js.map