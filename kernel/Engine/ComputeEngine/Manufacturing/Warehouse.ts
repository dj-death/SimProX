/// <reference path="SemiProduct.ts" />
import * as IObject from '../IObject';

import * as Space from './Space';

import { Insurance, CashFlow} from '../Finance';
import { Economy } from '../Environnement';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface WarehouseParams extends IObject.ObjectParams {
    warehouseID?: string;

    lostProbability: number;

    costs: {
        storageUnitCost: number;
        externalStorageUnitCost: number;
        fixedAdministrativeCost: number;
    }

    payments?: ENUMS.PaymentArray;

}

interface StockedItem {
    params: {
        id: string;
        spaceNeeded: number;
        spoilProbability: number;
    }

    inventoryUnitValue?: number;

    CashFlow: CashFlow;

    economy?: Economy;
}

export class Warehouse extends IObject.IObject {
    departmentName = "production";

    public params: WarehouseParams;

    private _stockedItem: StockedItem & IObject.IObject;

    set stockedItem(item: StockedItem & IObject.IObject) {
        if (typeof item !== "object") {
            console.warn("Trying to affect as stocked item a simple value", item);

            return;
        }

        this._stockedItem = item;
    }

    get stockedItem(): StockedItem & IObject.IObject {
        return this._stockedItem;
    }

    space: Space.Space;



    constructor(params: WarehouseParams, stockedItem: StockedItem & IObject.IObject = null) {
        super(params);

        this.stockedItem = stockedItem;
    }

    // TODO: implement
    _calcMaterialLostUnitsOfThis(quantity: number): number {
        var lostQ: number,
            vars: number[];

        // variable X binomial 
        lostQ = Utils.getPoisson(quantity * this.params.lostProbability);

        // TEST
        if (Utils.NODE_ENV() === "dev") {
            return this.params.id === "warehouse_market1_product2" ? 1 : lostQ;
        }

        return lostQ;
    }

    simulateLoss(quantity: number): number {
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
    }

    _calcMaterialSpoiledUnitsOfThis(quantity: number): number {
        var spoiledQ: number,
            vars: number[],
            probability = (this.stockedItem && this.stockedItem.params && this.stockedItem.params.spoilProbability) || 0;

        // variable X binomial 
        spoiledQ = Utils.getPoisson(quantity * probability);

        return spoiledQ;
    }

    simulateSpoil(quantity: number): number {
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Warehouse @ Spoiled Quantity not reel :', this, quantity);
            return 0;
        }

        var spoiledQ = this._calcMaterialSpoiledUnitsOfThis(quantity);

        if (spoiledQ > this.availableQ ) {
            console.warn("something strange with warehouse spoil");

            return 0;
        }

        // reduce the quantity of stock
        this.availableQ -= spoiledQ;

        return spoiledQ;
    }

    init(openingQ: number, openingValue: number = 0,
                            beforeLastPCommand6MthQ: number = 0, beforeLastPCommand6MthValue: number = 0,
                            lastPCommand3MthQ: number = 0, lastPCommand3MthValue: number = 0,
                            lastPCommand6MthQ: number = 0, lastPCommand6MthValue: number = 0, space: Space.Space = null) {
        super.init();

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

    // result
    availableQ;

    openingQ;
    openingValue;

    externalOpeningQ: number;
    externalAvailableQ: number;
    externalWarehouseUsesNb: number;


    outQ;

    inQ;
    inValue;

    waitNextPeriodQ;
    waitAfterNextPeriodQ;

    presentDeliveryBoughtLastPQ: number;
    presentDeliveryBoughtLastPValue: number;

    presentDeliveryBoughtBeforeLastPQ: number;
    presentDeliveryBoughtBeforeLastPValue: number;

    deliveryNextPBoughtBeforeLastPQ: number;
    deliveryNextPBoughtBeforeLastPValue: number;

    deliveryNextPQ: number;
    deliveryNextPValue: number;

    deliveryAfterNextPQ;
    deliveryAfterNextPValue;

    // rupture de stock
    shortfallQ;

    lostQ;
    spoiledQ;

    onBeforeReady() { };

    get closingQ(): number {
        var allInQ = this.openingQ + this.inQ;
        var allOutQ = this.outQ + this.lostQ + this.spoiledQ;

        if (allInQ < allOutQ) {
            console.warn("something strange with closingQ as we have in %d vs. out %d", allInQ, allOutQ);
        }

        return allInQ - allOutQ;
    }


    get spaceUsed(): number {
        return this.closingQ * (this.stockedItem && this.stockedItem.params.spaceNeeded || 0);
    }


    get unitValue(): number {

        if (this.stockedItem && this.stockedItem.inventoryUnitValue) {
            return this.stockedItem.inventoryUnitValue;
        }

        var cmup = (this.openingValue + this.inValue) / (this.openingQ + this.inQ);

        return cmup;
    }

    get closingValue(): number {
        return this.closingQ * this.unitValue;
    }

    get internalStocksOpeningQ(): number {
        return this.openingQ - this.externalOpeningQ;
    }

    get internalStocksClosingQ(): number {
        return this.closingQ - this.externalAvailableQ;
    }

    get externalStocksAvgQ(): number {
        return Math.ceil((this.externalOpeningQ + this.externalAvailableQ) / 2);
    }

    get internalStocksAvgQ(): number {
        return Math.ceil((this.internalStocksOpeningQ + this.internalStocksClosingQ) / 2);
    }

    get averageStockQ(): number {
        return Math.ceil((this.openingQ + this.closingQ) / 2);
    }

    get storageCost(): number {
        var storageUnitCost = this.params.costs.storageUnitCost;

        if (this.stockedItem.economy) {
            let inflationImpact = this.stockedItem.economy.PPIOverheads;

            storageUnitCost = Math.round(storageUnitCost * inflationImpact);
        }

        return this.internalStocksAvgQ * storageUnitCost;
    }

    get externalStorageCost(): number {
        return this.externalStocksAvgQ  * this.params.costs.externalStorageUnitCost;
    }

    get administrativeCost(): number {
        var fixedAdministrativeCost = this.params.costs.fixedAdministrativeCost;

        if (this.stockedItem.economy) {
            let inflationImpact = this.stockedItem.economy.PPIOverheads;

            fixedAdministrativeCost = Math.round(fixedAdministrativeCost * inflationImpact);
        }

        return fixedAdministrativeCost;
    }

    get warehousingCost(): number {
        return this.administrativeCost + this.storageCost + this.externalStorageCost;
    }

    get availableNextPeriodQ(): number {
        return this.closingQ + this.deliveryNextPQ;
    }



    // actions
    moveOut(quantity: number, acceptCommandWhateverHappens: boolean = true): number { // the returned value it's what we could give u
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

            if (! acceptCommandWhateverHappens) {
                return 0;

            } else {
                // give you what we have
                quantity = this.availableQ;
            }

        }

        this.outQ += quantity;
        this.availableQ = Utils.correctFloat(this.availableQ - quantity);

        var fromInternalStocksQ: number = quantity - this.externalAvailableQ;
        this.externalAvailableQ = Utils.correctFloat(this.externalAvailableQ - (quantity - fromInternalStocksQ));

        if (this.space) {
            var spaceUsed = (this.stockedItem && this.stockedItem.params.spaceNeeded || 0) * fromInternalStocksQ;

            this.space.freeSpace(spaceUsed, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.STOCKS]);

        }

        // we responde 100 % of your quantity requested
        return quantity;
    }
    

    // return installed units nb

    protected store(unitsNb: number, spaceNeededByUnit?: number): number {
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

        var isSpaceAvailable: boolean;
        var count = 0;

        for (let i = 0; i < unitsQ; i++) {
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
    }

    releaseExternalStocks(): boolean {
        var externalStocksAvailableQ = this.externalAvailableQ;

        var storedUnitsNb = this.store(externalStocksAvailableQ);
        this.externalAvailableQ = Utils.correctFloat(this.externalAvailableQ  - storedUnitsNb);

        return this.externalAvailableQ > 0;
    }

    moveIn(quantity: number, value: number = 0, term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE): number {
        if (!this.isInitialised()) {
            return 0;
        }

        if (!Utils.isNumericValid(quantity)) {
            console.warn('Warehouse @ Quantity IN not reel :', this.stockedItem, arguments);
            return 0;
        }

        var storedUnitsNb,
            spaceNeededByUnit;
            

        switch (term) {
            case ENUMS.FUTURES.IMMEDIATE:
                this.inQ = Utils.correctFloat(this.inQ + quantity);
                this.availableQ = Utils.correctFloat(this.availableQ + quantity);

                this.inValue += value;

                if (this.space) {
                    spaceNeededByUnit = this.stockedItem && this.stockedItem.params.spaceNeeded || 0;

                    storedUnitsNb = this.store(quantity, spaceNeededByUnit);
                }

                this.simulateSpoil(storedUnitsNb ||quantity)
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


interface RMWarehouseParams extends WarehouseParams {
    materialID: string;
    factoryID: string;
}


export class RMWarehouse extends Warehouse {
    public params: RMWarehouseParams;

    insurance: Insurance = null;

    constructor(rmWarehouseParams: RMWarehouseParams, stockedItem: StockedItem & IObject.IObject = null) {
        super(rmWarehouseParams, stockedItem);
    }

    onFinish() {
        super.onFinish();

        var losses = (this.spoiledQ + this.lostQ) * this.stockedItem.inventoryUnitValue;

        this.insurance && this.insurance.claims(losses);
    }

}
