"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="SemiProduct.ts" />
var IObject = require('../IObject');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Warehouse = (function (_super) {
    __extends(Warehouse, _super);
    function Warehouse(params, stockedItem) {
        if (stockedItem === void 0) { stockedItem = null; }
        _super.call(this, params);
        this.departmentName = "production";
        this.stockedItem = stockedItem;
    }
    Object.defineProperty(Warehouse.prototype, "stockedItem", {
        get: function () {
            return this._stockedItem;
        },
        set: function (item) {
            if (typeof item !== "object") {
                console.warn("Trying to affect as stocked item a simple value", item);
                return;
            }
            this._stockedItem = item;
        },
        enumerable: true,
        configurable: true
    });
    // TODO: implement
    Warehouse.prototype._calcMaterialLostUnitsOfThis = function (quantity) {
        var lostQ, vars;
        // variable X binomial 
        lostQ = Utils.getPoisson(quantity * this.params.lostProbability);
        // TEST
        if (Utils.NODE_ENV() === "dev") {
            return this.params.id === "warehouse_market1_product2" ? 1 : lostQ;
        }
        return lostQ;
    };
    Warehouse.prototype.simulateLoss = function (quantity) {
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Warehouse @ Lost Quantity not reel :', this, quantity);
            return 0;
        }
        var lostQ = this._calcMaterialLostUnitsOfThis(quantity);
        if (lostQ > this.availableQ) {
            console.warn("something strange with warehouse %s loss %d / %d", this.params.id, lostQ, this.availableQ);
            return 0;
        }
        // reduce the quantity of stock
        this.availableQ -= lostQ;
        return lostQ;
    };
    Warehouse.prototype._calcMaterialSpoiledUnitsOfThis = function (quantity) {
        var spoiledQ, vars, probability = (this.stockedItem && this.stockedItem.params && this.stockedItem.params.spoilProbability) || 0;
        // variable X binomial 
        spoiledQ = Utils.getPoisson(quantity * probability);
        return spoiledQ;
    };
    Warehouse.prototype.simulateSpoil = function (quantity) {
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Warehouse @ Spoiled Quantity not reel :', this, quantity);
            return 0;
        }
        var spoiledQ = this._calcMaterialSpoiledUnitsOfThis(quantity);
        if (spoiledQ > this.availableQ) {
            console.warn("something strange with warehouse spoil");
            return 0;
        }
        // reduce the quantity of stock
        this.availableQ -= spoiledQ;
        return spoiledQ;
    };
    Warehouse.prototype.init = function (openingQ, openingValue, beforeLastPCommand6MthQ, beforeLastPCommand6MthValue, lastPCommand3MthQ, lastPCommand3MthValue, lastPCommand6MthQ, lastPCommand6MthValue, space) {
        if (openingValue === void 0) { openingValue = 0; }
        if (beforeLastPCommand6MthQ === void 0) { beforeLastPCommand6MthQ = 0; }
        if (beforeLastPCommand6MthValue === void 0) { beforeLastPCommand6MthValue = 0; }
        if (lastPCommand3MthQ === void 0) { lastPCommand3MthQ = 0; }
        if (lastPCommand3MthValue === void 0) { lastPCommand3MthValue = 0; }
        if (lastPCommand6MthQ === void 0) { lastPCommand6MthQ = 0; }
        if (lastPCommand6MthValue === void 0) { lastPCommand6MthValue = 0; }
        if (space === void 0) { space = null; }
        _super.prototype.init.call(this);
        this.openingQ = openingQ;
        this.openingValue = openingValue;
        this.availableQ = openingQ;
        this.space = space;
        var self = this;
        this.space && this.space.on("Ready", function () {
            console.silly("space ready fired");
            var spaceNeededByUnit = self.stockedItem && self.stockedItem.params.spaceNeeded || 0;
            var storedUnitsNb = self.store(openingQ, spaceNeededByUnit);
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
    };
    Warehouse.prototype.reset = function () {
        _super.prototype.reset.call(this);
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
    };
    Warehouse.prototype.onBeforeReady = function () { };
    ;
    Object.defineProperty(Warehouse.prototype, "closingQ", {
        get: function () {
            var allInQ = this.openingQ + this.inQ;
            var allOutQ = this.outQ + this.lostQ + this.spoiledQ;
            if (allInQ < allOutQ) {
                console.warn("something strange with closingQ as we have in %d vs. out %d", allInQ, allOutQ);
            }
            return allInQ - allOutQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "spaceUsed", {
        get: function () {
            return this.closingQ * (this.stockedItem && this.stockedItem.params.spaceNeeded || 0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "unitValue", {
        get: function () {
            if (this.stockedItem && this.stockedItem.inventoryUnitValue) {
                return this.stockedItem.inventoryUnitValue;
            }
            var cmup = (this.openingValue + this.inValue) / (this.openingQ + this.inQ);
            return cmup;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "closingValue", {
        get: function () {
            return this.closingQ * this.unitValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "internalStocksOpeningQ", {
        get: function () {
            return this.openingQ - this.externalOpeningQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "internalStocksClosingQ", {
        get: function () {
            return this.closingQ - this.externalAvailableQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "externalStocksAvgQ", {
        get: function () {
            return Math.ceil((this.externalOpeningQ + this.externalAvailableQ) / 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "internalStocksAvgQ", {
        get: function () {
            return Math.ceil((this.internalStocksOpeningQ + this.internalStocksClosingQ) / 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "averageStockQ", {
        get: function () {
            return Math.ceil((this.openingQ + this.closingQ) / 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "storageCost", {
        get: function () {
            var storageUnitCost = this.params.costs.storageUnitCost;
            if (this.stockedItem.economy) {
                var inflationImpact = this.stockedItem.economy.PPIOverheads;
                storageUnitCost = Math.round(storageUnitCost * inflationImpact);
            }
            return this.internalStocksAvgQ * storageUnitCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "externalStorageCost", {
        get: function () {
            return this.externalStocksAvgQ * this.params.costs.externalStorageUnitCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "administrativeCost", {
        get: function () {
            var fixedAdministrativeCost = this.params.costs.fixedAdministrativeCost;
            if (this.stockedItem.economy) {
                var inflationImpact = this.stockedItem.economy.PPIOverheads;
                fixedAdministrativeCost = Math.round(fixedAdministrativeCost * inflationImpact);
            }
            return fixedAdministrativeCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "warehousingCost", {
        get: function () {
            return this.administrativeCost + this.storageCost + this.externalStorageCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Warehouse.prototype, "availableNextPeriodQ", {
        get: function () {
            return this.closingQ + this.deliveryNextPQ;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Warehouse.prototype.moveOut = function (quantity, acceptCommandWhateverHappens) {
        if (acceptCommandWhateverHappens === void 0) { acceptCommandWhateverHappens = true; }
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
        var fromInternalStocksQ = quantity - this.externalAvailableQ;
        this.externalAvailableQ = Utils.correctFloat(this.externalAvailableQ - (quantity - fromInternalStocksQ));
        if (this.space) {
            var spaceUsed = (this.stockedItem && this.stockedItem.params.spaceNeeded || 0) * fromInternalStocksQ;
            this.space.freeSpace(spaceUsed, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.STOCKS]);
        }
        // we responde 100 % of your quantity requested
        return quantity;
    };
    // return installed units nb
    Warehouse.prototype.store = function (unitsNb, spaceNeededByUnit) {
        if (!this.space) {
            return 0;
        }
        unitsNb = Utils.correctFloat(unitsNb);
        spaceNeededByUnit = isNaN(spaceNeededByUnit) ? this.stockedItem.params.spaceNeeded : spaceNeededByUnit;
        // to use diminutif unité 0.01 m => 1 cm
        var decimalsNb = Utils.getDecimalPart(unitsNb);
        var base = Math.pow(10, decimalsNb);
        var unitsQ = Math.floor(unitsNb * base);
        var spaceNeededByQ = spaceNeededByUnit / base;
        var isSpaceAvailable;
        var count = 0;
        for (var i = 0; i < unitsQ; i++) {
            isSpaceAvailable = this.space.useSpace(spaceNeededByQ, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.STOCKS]);
            if (!isSpaceAvailable) {
                break;
            }
            ++count;
        }
        var storedUnitsNb = count / base;
        var externalStoredUnitsNb = unitsNb - storedUnitsNb;
        if (externalStoredUnitsNb > 0) {
            this.externalAvailableQ = Utils.correctFloat(this.externalAvailableQ + externalStoredUnitsNb);
            this.space.requestSpace(this.releaseExternalStocks, this);
        }
        return storedUnitsNb;
    };
    Warehouse.prototype.releaseExternalStocks = function () {
        var externalStocksAvailableQ = this.externalAvailableQ;
        var storedUnitsNb = this.store(externalStocksAvailableQ);
        this.externalAvailableQ = Utils.correctFloat(this.externalAvailableQ - storedUnitsNb);
        return this.externalAvailableQ > 0;
    };
    Warehouse.prototype.moveIn = function (quantity, value, term) {
        if (value === void 0) { value = 0; }
        if (term === void 0) { term = ENUMS.FUTURES.IMMEDIATE; }
        if (!this.isInitialised()) {
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Warehouse @ Quantity IN not reel :', this.stockedItem, arguments);
            return 0;
        }
        var storedUnitsNb, spaceNeededByUnit;
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
    };
    Warehouse.prototype.onFinish = function () {
        if (!this.params.payments) {
            this.params.payments = {
                "THREE_MONTH": {
                    credit: ENUMS.CREDIT.THREE_MONTH,
                    part: 1
                }
            };
        }
        var CashFlow = this.CashFlow || (this.stockedItem && this.stockedItem.CashFlow);
        CashFlow && CashFlow.addPayment(this.warehousingCost, this.params.payments, 'warehousing');
    };
    return Warehouse;
}(IObject.IObject));
exports.Warehouse = Warehouse;
var RMWarehouse = (function (_super) {
    __extends(RMWarehouse, _super);
    function RMWarehouse(rmWarehouseParams, stockedItem) {
        if (stockedItem === void 0) { stockedItem = null; }
        _super.call(this, rmWarehouseParams, stockedItem);
        this.insurance = null;
    }
    RMWarehouse.prototype.onFinish = function () {
        _super.prototype.onFinish.call(this);
        var losses = (this.spoiledQ + this.lostQ) * this.stockedItem.inventoryUnitValue;
        this.insurance && this.insurance.claims(losses);
    };
    return RMWarehouse;
}(Warehouse));
exports.RMWarehouse = RMWarehouse;
//# sourceMappingURL=Warehouse.js.map