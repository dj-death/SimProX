"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Warehouse = require('./Warehouse');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var SemiProduct = (function (_super) {
    __extends(SemiProduct, _super);
    function SemiProduct(params) {
        _super.call(this, params);
        this.departmentName = "production";
    }
    SemiProduct.prototype.init = function (atelier, rawMaterial, subContractor, lastPCommand3MthQ, lastPCommand3MthValue, lastPCommand6MthQ, lastPCommand6MthValue, beforeLastPCommand6MthQ, beforeLastPCommand6MthValue) {
        if (lastPCommand3MthQ === void 0) { lastPCommand3MthQ = 0; }
        if (lastPCommand3MthValue === void 0) { lastPCommand3MthValue = 0; }
        if (lastPCommand6MthQ === void 0) { lastPCommand6MthQ = 0; }
        if (lastPCommand6MthValue === void 0) { lastPCommand6MthValue = 0; }
        if (beforeLastPCommand6MthQ === void 0) { beforeLastPCommand6MthQ = 0; }
        if (beforeLastPCommand6MthValue === void 0) { beforeLastPCommand6MthValue = 0; }
        _super.prototype.init.call(this);
        this.subContracter = subContractor;
        this.params.manufacturingCfg.atelier = atelier;
        this.params.rawMaterialConsoCfg.rawMaterial = rawMaterial;
        var warehouseID = "warehouse" + this.params.id;
        var externalStorageUnitCost = this.params.costs.externalStorageUnitCost;
        this.warehouse = new Warehouse.Warehouse({
            id: warehouseID,
            label: warehouseID,
            lostProbability: this.params.lostProbability,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 0
            }
        }, this);
        this.warehouse.stockedItem = this;
        this.warehouse.init(0, 0, 0, 0, 0, 0, 0, 0, atelier.factory); // There is no command
        this.warehouse.CashFlow = this.CashFlow;
        // outsourced subproducts
        var componentsWarehouseID = "componentsWarehouse" + this.params.id;
        this.componentsWarehouse = new Warehouse.Warehouse({
            id: componentsWarehouseID,
            label: componentsWarehouseID,
            lostProbability: this.params.lostProbability,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: externalStorageUnitCost
            }
        }, this);
        this.componentsWarehouse.stockedItem = this;
        this.componentsWarehouse.init(0, 0, lastPCommand3MthQ, lastPCommand3MthValue, lastPCommand6MthQ, lastPCommand6MthValue, beforeLastPCommand6MthQ, beforeLastPCommand6MthValue, atelier.factory);
    };
    SemiProduct.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.producedNb = 0;
        this.scheduledNb = 0;
        this.rejectedNb = 0;
        this.purchasesValue = 0;
        this.purchasesQ = 0;
        this.lastManufacturingParams = null;
    };
    Object.defineProperty(SemiProduct.prototype, "isMachined", {
        get: function () {
            return this.params.manufacturingCfg.atelier.machinery !== undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "materialUnitCost", {
        get: function () {
            var rmCfg = this.params.rawMaterialConsoCfg;
            var rawMaterialCfg = rmCfg.rawMaterial;
            if (!rawMaterialCfg) {
                return 0;
            }
            var standardMaterialPrice = rawMaterialCfg.inventoryUnitValue;
            var premiumMaterialPrice = rawMaterialCfg.inventoryUnitValueForPremiumQuality;
            var premiumQualityProp = this.lastManufacturingParams && this.lastManufacturingParams[2] || 0;
            var consoUnit = rmCfg.consoUnit;
            var premiumMaterialQ = consoUnit * premiumQualityProp;
            var standardMaterialQ = consoUnit - premiumMaterialQ;
            var cost = (standardMaterialQ * standardMaterialPrice) + (premiumMaterialQ * premiumMaterialPrice);
            return cost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "manufacturingUnitCost", {
        get: function () {
            var mCfg = this.params.manufacturingCfg;
            var atelier = mCfg.atelier;
            var worker = atelier.worker;
            if (!worker) {
                return 0;
            }
            var manufacturingUnitTime = this.lastManufacturingParams && this.lastManufacturingParams[0];
            if (!manufacturingUnitTime || (manufacturingUnitTime < mCfg.minManufacturingUnitTime)) {
                manufacturingUnitTime = mCfg.minManufacturingUnitTime;
            }
            var cost = worker.timeUnitCost * (manufacturingUnitTime / 60);
            return cost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "spaceUsed", {
        get: function () {
            var space = Utils.sums(this.warehouse, "spaceUsed", null, null, null, ">", 2);
            space += Utils.sums(this.componentsWarehouse, "spaceUsed", null, null, null, ">", 2);
            return Utils.correctFloat(space);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "inventoryUnitValue", {
        // valuation method for components
        get: function () {
            if (!this.subContracter) {
                return 0;
            }
            var quality = this.lastManufacturingParams && this.lastManufacturingParams[1] || 0;
            var unitValue = this.subContracter._getPrice(quality);
            return unitValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "closingValue", {
        get: function () {
            var closingValue = (this.warehouse.closingQ + this.componentsWarehouse.closingQ) * this.inventoryUnitValue;
            return closingValue;
        },
        enumerable: true,
        configurable: true
    });
    // helpers
    SemiProduct.prototype._calcRejectedUnitsNbOf = function (quantity) {
        var landa, probability, value = 0, i = 0;
        probability = Math.random() * this.params.rejectedProbability;
        landa = probability * quantity;
        //return Math.round(Utils.getPoisson(landa));
        return 0;
    };
    Object.defineProperty(SemiProduct.prototype, "availableNb", {
        get: function () {
            return this.warehouse.availableQ + this.componentsWarehouse.availableQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "lostNb", {
        get: function () {
            return this.warehouse.lostQ + this.componentsWarehouse.lostQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "rawMaterialTotalConsoQ", {
        get: function () {
            var value = this.producedNb * this.params.rawMaterialConsoCfg.consoUnit;
            return Utils.round(value, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemiProduct.prototype, "manufacturingTotalHoursNb", {
        get: function () {
            var value = this.producedNb * this.manufacturingUnitTime / 60;
            return Utils.round(value, 2);
        },
        enumerable: true,
        configurable: true
    });
    SemiProduct.prototype.getNeededResForProd = function (quantity, manufacturingUnitTime, premiumQualityProp) {
        if (premiumQualityProp === void 0) { premiumQualityProp = 0; }
        if (!Utils.isNumericValid(manufacturingUnitTime)) {
            manufacturingUnitTime = this.params.manufacturingCfg.minManufacturingUnitTime;
        }
        // TODO test if the quality available is ok
        // first of all let diminish outsourced components as they dont need ressources
        var outsourcedQ = this.componentsWarehouse.availableQ;
        if (outsourcedQ > 0) {
            quantity -= outsourcedQ;
        }
        var mCfg = this.params.manufacturingCfg, rmCfg = this.params.rawMaterialConsoCfg, consoUnit = rmCfg.consoUnit;
        var atelierRes;
        manufacturingUnitTime = manufacturingUnitTime < mCfg.minManufacturingUnitTime ? mCfg.minManufacturingUnitTime : manufacturingUnitTime;
        var needed = {};
        if (rmCfg.rawMaterial) {
            needed[rmCfg.rawMaterial.params.id] = quantity * consoUnit * (1 - premiumQualityProp);
            needed["premium_" + rmCfg.rawMaterial.params.id] = quantity * consoUnit * premiumQualityProp;
        }
        if (mCfg.atelier) {
            atelierRes = mCfg.atelier.getNeededTimeForProd(quantity, manufacturingUnitTime);
        }
        Utils.ObjectApply(needed, atelierRes);
        return needed;
    };
    // actions
    SemiProduct.prototype.manufacture = function (quantity, manufacturingUnitTime, premiumQualityProp) {
        if (!this.isInitialised()) {
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('SemiPdt @ Quantity not reel', arguments);
            return 0;
        }
        if (!Utils.isNumericValid(manufacturingUnitTime)) {
            manufacturingUnitTime = this.lastManufacturingParams && this.lastManufacturingParams[0] || this.params.manufacturingCfg.minManufacturingUnitTime;
        }
        if (!Utils.isNumericValid(premiumQualityProp)) {
            premiumQualityProp = this.lastManufacturingParams && this.lastManufacturingParams[1] || 0;
        }
        this.lastManufacturingParams = [manufacturingUnitTime, premiumQualityProp];
        var mCfg = this.params.manufacturingCfg, rmCfg = this.params.rawMaterialConsoCfg, consoUnit = rmCfg.consoUnit, i = 0, done, producedQ = 0;
        var effectiveQ;
        this.scheduledNb += quantity;
        manufacturingUnitTime = manufacturingUnitTime < mCfg.minManufacturingUnitTime ? mCfg.minManufacturingUnitTime : manufacturingUnitTime;
        this.manufacturingUnitTime = manufacturingUnitTime;
        for (; i < quantity; i++) {
            done = mCfg.atelier && mCfg.atelier.work(manufacturingUnitTime);
            if (!done && mCfg.atelier) {
                break;
            }
            done = rmCfg.rawMaterial && rmCfg.rawMaterial.consume(consoUnit, premiumQualityProp);
            // if we have materiel but we didn'h have sufficient quantity then break;
            if (!done && rmCfg.rawMaterial) {
                // redo
                console.debug("Atelier @ Redo ");
                mCfg.atelier && mCfg.atelier.work(-manufacturingUnitTime);
                break;
            }
            // finally everything is ok
            producedQ++;
        }
        this.producedNb += producedQ;
        return this.warehouse.moveIn(producedQ);
    };
    SemiProduct.prototype.deliverTo = function (quantity, manufacturingUnitTime, premiumQualityProp) {
        if (!this.isInitialised()) {
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('SP Delivery @ Quantity not reel :', arguments);
            return 0;
        }
        // first serve with outsource
        var outSourcedQ = this.componentsWarehouse.moveOut(quantity);
        quantity -= outSourcedQ;
        var reliquatQ = quantity - this.warehouse.availableQ;
        if (reliquatQ > 0) {
            this.manufacture(reliquatQ, manufacturingUnitTime, premiumQualityProp);
        }
        return this.warehouse.moveOut(quantity) + outSourcedQ;
    };
    SemiProduct.prototype.reject = function (quantity) {
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Reject SP @ Quantity not reel :', arguments);
            return 0;
        }
        // reject only produced units not outsourced
        this.warehouse.moveOut(quantity);
    };
    SemiProduct.prototype.subContract = function (unitsNb, premiumQualityProp) {
        if (premiumQualityProp === void 0) { premiumQualityProp = 0; }
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(unitsNb)) {
            console.warn('Subcontract SP %d @ Quantity not reel :', this.params.subProductID, arguments);
            return false;
        }
        var qualityIdx;
        qualityIdx = ENUMS.QUALITY.HQ * premiumQualityProp + ENUMS.QUALITY.MQ;
        this.subContracter.order(unitsNb, qualityIdx);
        return this.supply(unitsNb);
    };
    SemiProduct.prototype.supply = function (quantity, value, term) {
        if (value === void 0) { value = 0; }
        if (term === void 0) { term = ENUMS.FUTURES.IMMEDIATE; }
        if (!this.isInitialised()) {
            return false;
        }
        this.purchasesValue += value;
        this.purchasesQ += quantity;
        this.componentsWarehouse.moveIn(quantity, value, term);
        return true;
    };
    SemiProduct.prototype.onFinish = function () {
        if (this.subContracter) {
            this.CashFlow.addPayment(this.purchasesValue, this.subContracter.params.payments, 'subContracterPurchasesValue');
        }
    };
    Object.defineProperty(SemiProduct.prototype, "state", {
        get: function () {
            return {
                "outsourcedOutQ": this.componentsWarehouse.outQ,
                "outsourcedClosingQ": this.componentsWarehouse.closingQ,
                "outsourcedAvailableNextPQ": this.componentsWarehouse.availableNextPeriodQ
            };
        },
        enumerable: true,
        configurable: true
    });
    return SemiProduct;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SemiProduct;
//# sourceMappingURL=SemiProduct.js.map