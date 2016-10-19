import * as IObject from '../IObject';

import Warehouse = require('./Warehouse');

import { Supplier } from '../Environnement';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface RawMaterialParams extends IObject.ObjectParams {
    materialID?: string;

    spaceNeeded: number;

    diffReelAndCalculatedValue: number;

    spoilProbability: number;
}

export default class RawMaterial extends IObject.IObject {
    departmentName = "production";

    params: RawMaterialParams;

    private suppliers: Supplier<RawMaterial>[];
    private warehouse: Warehouse.Warehouse;

    constructor(params: RawMaterialParams) {
        super(params);
    }

    init(suppliers: Supplier<RawMaterial>[], warehouse: Warehouse.Warehouse) {
        super.init();

        this.suppliers = suppliers;

        // attach suppliers to this rawMateriel
        /*for (var i = 0, len = suppliers.length; i < len; i++) {
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

    purchasesValue: number;
    purchasesQ: number;

    unplannedPurchasesQ: number;

    // set valuation method
    get inventoryUnitValue(): number {
        var spotPrice = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.IMMEDIATE);
        var mth3Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.THREE_MONTH);
        var mth6Price = this.suppliers[0]._getReelTimePrice(ENUMS.QUALITY.MQ, ENUMS.FUTURES.SIX_MONTH);

        var unitValue = Math.min(spotPrice, mth3Price, mth6Price);

        return unitValue;
    }

    get inventoryUnitValueForPremiumQuality(): number {
        var unitValue = this.inventoryUnitValue;
        var qualityPremium = this.suppliers[0].params.unplannedPurchasesPremium;

        return unitValue * (1 + qualityPremium);
    }

    // 90% of the lowest of the spot, 3-month and 6- month prices quoted last quarter (converted into euros), 
    // times the number of units in stock and on order
    get closingValue(): number {
        var quantity = this.warehouse.availableNextPeriodQ + this.warehouse.deliveryAfterNextPQ;

        var calculatedValue = quantity * this.inventoryUnitValue;
        var reelValue = calculatedValue * (1 - this.params.diffReelAndCalculatedValue);

        return Math.ceil(reelValue);
    }

    // actions

    supply(quantity: number, value: number, term: ENUMS.FUTURES, isUnplanned: boolean = false): boolean {
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
        
    consume(quantity: number, premiumQualityProp: number): boolean {
        if (!this.isInitialised()) {
            return false;
        }

        if (! Utils.isNumericValid(quantity)) {
            console.warn('Material consume@ Quantity not reel :', arguments);
            return false;
        }

        if (! Utils.isNumericValid(premiumQualityProp) || premiumQualityProp > 1) {
            console.warn('Material @ premium Quality not reel :', premiumQualityProp);
            return false;
        }

        var deliveredQ: number,
            standardMaterialQ: number,
            premiumMaterialQ: number,
            urgentOrderQ: number;

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

    get state(): any {

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