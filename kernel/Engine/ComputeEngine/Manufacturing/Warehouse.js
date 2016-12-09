"use strict";
/// <reference path="SemiProduct.ts" />
const IObject = require('../IObject');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class Warehouse extends IObject.IObject {
    constructor(params, stockedItem = null) {
        super(params);
        this.departmentName = "production";
        this.stockedItem = stockedItem;
    }
    set stockedItem(item) {
        if (typeof item !== "object") {
            console.warn("Trying to affect as stocked item a simple value", item);
            return;
        }
        this._stockedItem = item;
    }
    get stockedItem() {
        return this._stockedItem;
    }
    // TODO: implement
    _calcMaterialLostUnitsOfThis(quantity) {
        let lostQ, vars;
        // variable X binomial 
        lostQ = Utils.getPoisson(quantity * this.params.lostProbability);
        // TEST
        if (Utils.NODE_ENV() === "dev") {
            return this.params.id === "warehouse_market1_product2" ? 1 : lostQ;
        }
        return lostQ;
    }
    simulateLoss(quantity) {
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Warehouse @ Lost Quantity not reel :', this, quantity);
            return 0;
        }
        let lostQ = this._calcMaterialLostUnitsOfThis(quantity);
        if (lostQ > this.availableQ) {
            console.warn("something strange with warehouse %s loss %d / %d", this.params.id, lostQ, this.availableQ);
            return 0;
        }
        // reduce the quantity of stock
        this.availableQ -= lostQ;
        return lostQ;
    }
    _calcMaterialSpoiledUnitsOfThis(quantity) {
        let spoiledQ, vars, probability = (this.stockedItem && this.stockedItem.params && this.stockedItem.params.spoilProbability) || 0;
        // variable X binomial 
        spoiledQ = Utils.getPoisson(quantity * probability);
        return spoiledQ;
    }
    simulateSpoil(quantity) {
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Warehouse @ Spoiled Quantity not reel :', this, quantity);
            return 0;
        }
        let spoiledQ = this._calcMaterialSpoiledUnitsOfThis(quantity);
        if (spoiledQ > this.availableQ) {
            console.warn("something strange with warehouse spoil");
            return 0;
        }
        // reduce the quantity of stock
        this.availableQ -= spoiledQ;
        return spoiledQ;
    }
    init(openingQ, openingValue = 0, beforeLastPCommand6MthQ = 0, beforeLastPCommand6MthValue = 0, lastPCommand3MthQ = 0, lastPCommand3MthValue = 0, lastPCommand6MthQ = 0, lastPCommand6MthValue = 0, space = null) {
        super.init();
        this.openingQ = openingQ;
        this.openingValue = openingValue;
        this.availableQ = openingQ;
        this.space = space;
        let self = this;
        this.space && this.space.on("Ready", function () {
            console.silly("space ready fired");
            let spaceNeededByUnit = self.stockedItem && self.stockedItem.params.spaceNeeded || 0;
            let storedUnitsNb = self.store(openingQ, spaceNeededByUnit);
            self.externalOpeningQ = openingQ - storedUnitsNb;
            self.externalAvailableQ = openingQ - storedUnitsNb;
        }, self);
        // the delivery from the last period comes so add it
        this.presentDeliveryBoughtLastPQ = lastPCommand3MthQ;
        this.presentDeliveryBoughtLastPValue = lastPCommand3MthValue;
        this.moveIn(this.presentDeliveryBoughtLastPQ, this.presentDeliveryBoughtLastPValue, ENUMS.FUTURES.IMMEDIATE);
        // the delivery from before last period comes so add it
        this.presentDeliveryBoughtBeforeLastPQ = beforeLastPCommand6MthQ;
        this.presentDeliveryBoughtBeforeLastPValue = beforeLastPCommand6MthValue;
        this.moveIn(this.presentDeliveryBoughtBeforeLastPQ, this.presentDeliveryBoughtBeforeLastPValue, ENUMS.FUTURES.IMMEDIATE);
        this.deliveryNextPBoughtBeforeLastPQ = lastPCommand6MthQ;
        this.deliveryNextPBoughtBeforeLastPValue = lastPCommand6MthValue;
        this.deliveryNextPQ = this.deliveryNextPBoughtBeforeLastPQ;
        this.deliveryNextPValue = this.deliveryNextPBoughtBeforeLastPValue;
    }
    reset() {
        super.reset();
        this.outQ = 0;
        this.inQ = 0;
        this.inValue = 0;
        this.waitNextPeriodQ = 0;
        this.waitAfterNextPeriodQ = 0;
        this.deliveryAfterNextPQ = 0;
        this.deliveryAfterNextPValue = 0;
        this.shortfallQ = 0;
        this.lostQ = 0;
        this.spoiledQ = 0;
        this.space = null;
        this.onBeforeReady = function () { };
        this.externalAvailableQ = 0;
        this.externalOpeningQ = 0;
    }
    onBeforeReady() { }
    ;
    get closingQ() {
        let allInQ = this.openingQ + this.inQ;
        let allOutQ = this.outQ + this.lostQ + this.spoiledQ;
        if (allInQ < allOutQ) {
            console.warn("something strange with closingQ as we have in %d vs. out %d", allInQ, allOutQ);
        }
        return allInQ - allOutQ;
    }
    get spaceUsed() {
        return this.closingQ * (this.stockedItem && this.stockedItem.params.spaceNeeded || 0);
    }
    get unitValue() {
        if (this.stockedItem && this.stockedItem.inventoryUnitValue) {
            return this.stockedItem.inventoryUnitValue;
        }
        let cmup = (this.openingValue + this.inValue) / (this.openingQ + this.inQ);
        return cmup;
    }
    get closingValue() {
        return this.closingQ * this.unitValue;
    }
    get internalStocksOpeningQ() {
        return this.openingQ - this.externalOpeningQ;
    }
    get internalStocksClosingQ() {
        return this.closingQ - this.externalAvailableQ;
    }
    get externalStocksAvgQ() {
        return Math.ceil((this.externalOpeningQ + this.externalAvailableQ) / 2);
    }
    get internalStocksAvgQ() {
        return Math.ceil((this.internalStocksOpeningQ + this.internalStocksClosingQ) / 2);
    }
    get averageStockQ() {
        return Math.ceil((this.openingQ + this.closingQ) / 2);
    }
    get storageCost() {
        let storageUnitCost = this.params.costs.storageUnitCost;
        if (this.stockedItem.economy) {
            let inflationImpact = this.stockedItem.economy.PPIOverheads;
            storageUnitCost = Math.round(storageUnitCost * inflationImpact);
        }
        return this.internalStocksAvgQ * storageUnitCost;
    }
    get externalStorageCost() {
        return this.externalStocksAvgQ * this.params.costs.externalStorageUnitCost;
    }
    get administrativeCost() {
        let fixedAdministrativeCost = this.params.costs.fixedAdministrativeCost;
        if (this.stockedItem.economy) {
            let inflationImpact = this.stockedItem.economy.PPIOverheads;
            fixedAdministrativeCost = Math.round(fixedAdministrativeCost * inflationImpact);
        }
        return fixedAdministrativeCost;
    }
    get warehousingCost() {
        return this.administrativeCost + this.storageCost + this.externalStorageCost;
    }
    get availableNextPeriodQ() {
        return this.closingQ + this.deliveryNextPQ;
    }
    // actions
    moveOut(quantity, acceptCommandWhateverHappens = true) {
        if (!this.isInitialised()) {
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Warehouse @ Quantity Out not reel : %d', quantity, this.stockedItem);
            return 0;
        }
        if (Utils.compare(quantity, ">>", this.availableQ)) {
            console.debug("on ne peut pas satisfaire toute votre demande de %d alors qu'on a %d", quantity, this.availableQ);
            this.shortfallQ += (quantity - this.availableQ);
            if (!acceptCommandWhateverHappens) {
                return 0;
            }
            else {
                // give you what we have
                quantity = this.availableQ;
            }
        }
        this.outQ += quantity;
        this.availableQ = Utils.correctFloat(this.availableQ - quantity);
        let fromInternalStocksQ = quantity - this.externalAvailableQ;
        this.externalAvailableQ = Utils.correctFloat(this.externalAvailableQ - (quantity - fromInternalStocksQ));
        if (this.space) {
            let spaceUsed = (this.stockedItem && this.stockedItem.params.spaceNeeded || 0) * fromInternalStocksQ;
            this.space.freeSpace(spaceUsed, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.STOCKS]);
        }
        // we responde 100 % of your quantity requested
        return quantity;
    }
    // return installed units nb
    store(unitsNb, spaceNeededByUnit) {
        if (!this.space) {
            return 0;
        }
        unitsNb = Utils.correctFloat(unitsNb);
        spaceNeededByUnit = isNaN(spaceNeededByUnit) ? this.stockedItem.params.spaceNeeded : spaceNeededByUnit;
        // to use diminutif unité 0.01 m => 1 cm
        let decimalsNb = Utils.getDecimalPart(unitsNb);
        let base = Math.pow(10, decimalsNb);
        let unitsQ = Math.floor(unitsNb * base);
        let spaceNeededByQ = spaceNeededByUnit / base;
        let isSpaceAvailable;
        let count = 0;
        for (let i = 0; i < unitsQ; i++) {
            isSpaceAvailable = this.space.useSpace(spaceNeededByQ, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.STOCKS]);
            if (!isSpaceAvailable) {
                break;
            }
            ++count;
        }
        let storedUnitsNb = count / base;
        let externalStoredUnitsNb = unitsNb - storedUnitsNb;
        if (externalStoredUnitsNb > 0) {
            this.externalAvailableQ = Utils.correctFloat(this.externalAvailableQ + externalStoredUnitsNb);
            this.space.requestSpace(this.releaseExternalStocks, this);
        }
        return storedUnitsNb;
    }
    releaseExternalStocks() {
        let externalStocksAvailableQ = this.externalAvailableQ;
        let storedUnitsNb = this.store(externalStocksAvailableQ);
        this.externalAvailableQ = Utils.correctFloat(this.externalAvailableQ - storedUnitsNb);
        return this.externalAvailableQ > 0;
    }
    moveIn(quantity, value = 0, term = ENUMS.FUTURES.IMMEDIATE) {
        if (!this.isInitialised()) {
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Warehouse @ Quantity IN not reel :', this.stockedItem, arguments);
            return 0;
        }
        let storedUnitsNb, spaceNeededByUnit;
        switch (term) {
            case ENUMS.FUTURES.IMMEDIATE:
                this.inQ = Utils.correctFloat(this.inQ + quantity);
                this.availableQ = Utils.correctFloat(this.availableQ + quantity);
                this.inValue += value;
                if (this.space) {
                    spaceNeededByUnit = this.stockedItem && this.stockedItem.params.spaceNeeded || 0;
                    storedUnitsNb = this.store(quantity, spaceNeededByUnit);
                }
                this.simulateSpoil(storedUnitsNb || quantity);
                this.simulateLoss(storedUnitsNb || quantity);
                break;
            case ENUMS.FUTURES.THREE_MONTH:
                this.deliveryNextPQ += quantity;
                this.deliveryNextPValue += value;
                break;
            case ENUMS.FUTURES.SIX_MONTH:
                this.deliveryAfterNextPQ += quantity;
                this.deliveryAfterNextPValue += value;
                break;
        }
        return quantity;
    }
    onFinish() {
        if (!this.params.payments) {
            this.params.payments = {
                "THREE_MONTH": {
                    credit: ENUMS.CREDIT.THREE_MONTH,
                    part: 1
                }
            };
        }
        let CashFlow = this.CashFlow || (this.stockedItem && this.stockedItem.CashFlow);
        CashFlow && CashFlow.addPayment(this.warehousingCost, this.params.payments, 'warehousing');
    }
}
exports.Warehouse = Warehouse;
class RMWarehouse extends Warehouse {
    constructor(rmWarehouseParams, stockedItem = null) {
        super(rmWarehouseParams, stockedItem);
        this.insurance = null;
    }
    onFinish() {
        super.onFinish();
        let losses = (this.spoiledQ + this.lostQ) * this.stockedItem.inventoryUnitValue;
        this.insurance && this.insurance.claims(losses);
    }
}
exports.RMWarehouse = RMWarehouse;
//# sourceMappingURL=Warehouse.js.map