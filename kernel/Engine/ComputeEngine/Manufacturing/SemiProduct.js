"use strict";
const IObject = require('../IObject');
const Warehouse = require('./Warehouse');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class SemiProduct extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "production";
    }
    init(atelier, rawMaterial, subContractor, lastPCommand3MthQ = 0, lastPCommand3MthValue = 0, lastPCommand6MthQ = 0, lastPCommand6MthValue = 0, beforeLastPCommand6MthQ = 0, beforeLastPCommand6MthValue = 0) {
        super.init();
        this.subContracter = subContractor;
        this.params.manufacturingCfg.atelier = atelier;
        this.params.rawMaterialConsoCfg.rawMaterial = rawMaterial;
        let warehouseID = "warehouse" + this.params.id;
        let externalStorageUnitCost = this.params.costs.externalStorageUnitCost;
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
        let componentsWarehouseID = "componentsWarehouse" + this.params.id;
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
    }
    reset() {
        super.reset();
        this.producedNb = 0;
        this.scheduledNb = 0;
        this.rejectedNb = 0;
        this.purchasesValue = 0;
        this.purchasesQ = 0;
        this.lastManufacturingParams = null;
    }
    get isMachined() {
        return this.params.manufacturingCfg.atelier.machinery !== undefined;
    }
    get materialUnitCost() {
        let rmCfg = this.params.rawMaterialConsoCfg;
        let rawMaterialCfg = rmCfg.rawMaterial;
        if (!rawMaterialCfg) {
            return 0;
        }
        let standardMaterialPrice = rawMaterialCfg.inventoryUnitValue;
        let premiumMaterialPrice = rawMaterialCfg.inventoryUnitValueForPremiumQuality;
        let premiumQualityProp = this.lastManufacturingParams && this.lastManufacturingParams[2] || 0;
        let consoUnit = rmCfg.consoUnit;
        let premiumMaterialQ = consoUnit * premiumQualityProp;
        let standardMaterialQ = consoUnit - premiumMaterialQ;
        let cost = (standardMaterialQ * standardMaterialPrice) + (premiumMaterialQ * premiumMaterialPrice);
        return cost;
    }
    get manufacturingUnitCost() {
        let mCfg = this.params.manufacturingCfg;
        let atelier = mCfg.atelier;
        let worker = atelier.worker;
        if (!worker) {
            return 0;
        }
        let manufacturingUnitTime = this.lastManufacturingParams && this.lastManufacturingParams[0];
        if (!manufacturingUnitTime || (manufacturingUnitTime < mCfg.minManufacturingUnitTime)) {
            manufacturingUnitTime = mCfg.minManufacturingUnitTime;
        }
        let cost = worker.timeUnitCost * (manufacturingUnitTime / 60);
        return cost;
    }
    get spaceUsed() {
        let space = Utils.sums(this.warehouse, "spaceUsed", null, null, null, ">", 2);
        space += Utils.sums(this.componentsWarehouse, "spaceUsed", null, null, null, ">", 2);
        return Utils.correctFloat(space);
    }
    // valuation method for components
    get inventoryUnitValue() {
        if (!this.subContracter) {
            return 0;
        }
        let quality = this.lastManufacturingParams && this.lastManufacturingParams[1] || 0;
        let unitValue = this.subContracter._getPrice(quality);
        return unitValue;
    }
    get closingValue() {
        let closingValue = (this.warehouse.closingQ + this.componentsWarehouse.closingQ) * this.inventoryUnitValue;
        return closingValue;
    }
    // helpers
    _calcRejectedUnitsNbOf(quantity) {
        let landa, probability, value = 0, i = 0;
        probability = Math.random() * this.params.rejectedProbability;
        landa = probability * quantity;
        //return Math.round(Utils.getPoisson(landa));
        return 0;
    }
    get availableNb() {
        return this.warehouse.availableQ + this.componentsWarehouse.availableQ;
    }
    get lostNb() {
        return this.warehouse.lostQ + this.componentsWarehouse.lostQ;
    }
    get rawMaterialTotalConsoQ() {
        let value = this.producedNb * this.params.rawMaterialConsoCfg.consoUnit;
        return Utils.round(value, 2);
    }
    get manufacturingTotalHoursNb() {
        let value = this.producedNb * this.manufacturingUnitTime / 60;
        return Utils.round(value, 2);
    }
    getNeededResForProd(quantity, manufacturingUnitTime, premiumQualityProp = 0) {
        if (!Utils.isNumericValid(manufacturingUnitTime)) {
            manufacturingUnitTime = this.params.manufacturingCfg.minManufacturingUnitTime;
        }
        // TODO test if the quality available is ok
        // first of all let diminish outsourced components as they dont need ressources
        let outsourcedQ = this.componentsWarehouse.availableQ;
        if (outsourcedQ > 0) {
            quantity -= outsourcedQ;
        }
        let mCfg = this.params.manufacturingCfg, rmCfg = this.params.rawMaterialConsoCfg, consoUnit = rmCfg.consoUnit;
        let atelierRes;
        manufacturingUnitTime = manufacturingUnitTime < mCfg.minManufacturingUnitTime ? mCfg.minManufacturingUnitTime : manufacturingUnitTime;
        let needed = {};
        if (rmCfg.rawMaterial) {
            needed[rmCfg.rawMaterial.params.id] = quantity * consoUnit * (1 - premiumQualityProp);
            needed["premium_" + rmCfg.rawMaterial.params.id] = quantity * consoUnit * premiumQualityProp;
        }
        if (mCfg.atelier) {
            atelierRes = mCfg.atelier.getNeededTimeForProd(quantity, manufacturingUnitTime);
        }
        Utils.ObjectApply(needed, atelierRes);
        return needed;
    }
    // actions
    manufacture(quantity, manufacturingUnitTime, premiumQualityProp) {
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
        let mCfg = this.params.manufacturingCfg, rmCfg = this.params.rawMaterialConsoCfg, consoUnit = rmCfg.consoUnit, i = 0, done, producedQ = 0;
        let effectiveQ;
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
    }
    deliverTo(quantity, manufacturingUnitTime, premiumQualityProp) {
        if (!this.isInitialised()) {
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('SP Delivery @ Quantity not reel :', arguments);
            return 0;
        }
        // first serve with outsource
        let outSourcedQ = this.componentsWarehouse.moveOut(quantity);
        quantity -= outSourcedQ;
        let reliquatQ = quantity - this.warehouse.availableQ;
        if (reliquatQ > 0) {
            this.manufacture(reliquatQ, manufacturingUnitTime, premiumQualityProp);
        }
        return this.warehouse.moveOut(quantity) + outSourcedQ;
    }
    reject(quantity) {
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Reject SP @ Quantity not reel :', arguments);
            return 0;
        }
        // reject only produced units not outsourced
        this.warehouse.moveOut(quantity);
    }
    subContract(unitsNb, premiumQualityProp = 0) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(unitsNb)) {
            console.warn('Subcontract SP %d @ Quantity not reel :', this.params.subProductID, arguments);
            return false;
        }
        if (!Utils.isInteger(unitsNb)) {
            unitsNb = Math.round(unitsNb);
        }
        let qualityIdx;
        qualityIdx = ENUMS.QUALITY.HQ * premiumQualityProp + ENUMS.QUALITY.MQ;
        this.subContracter.order(unitsNb, qualityIdx);
        return this.supply(unitsNb);
    }
    supply(quantity, value = 0, term = ENUMS.FUTURES.IMMEDIATE) {
        if (!this.isInitialised()) {
            return false;
        }
        this.purchasesValue += value;
        this.purchasesQ += quantity;
        this.componentsWarehouse.moveIn(quantity, value, term);
        return true;
    }
    onFinish() {
        if (this.subContracter) {
            this.CashFlow.addPayment(this.purchasesValue, this.subContracter.params.payments, 'subContracterPurchasesValue');
        }
    }
    get state() {
        return {
            "outsourcedOutQ": this.componentsWarehouse.outQ,
            "outsourcedClosingQ": this.componentsWarehouse.closingQ,
            "outsourcedAvailableNextPQ": this.componentsWarehouse.availableNextPeriodQ
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SemiProduct;
//# sourceMappingURL=SemiProduct.js.map