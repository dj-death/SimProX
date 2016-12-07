import * as IObject from '../IObject';

import RawMaterial from './RawMaterial';
import Warehouse = require('./Warehouse');
import Atelier from './Atelier';

import { SubContracter } from '../Environnement';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface RawMaterialConsumptionCfg {
    rawMaterial?: RawMaterial;
    consoUnit: number;
}

interface ManufacturingCfg {
    atelier?: Atelier;
    minManufacturingUnitTime: number;
}

interface SemiProductParams extends IObject.ObjectParams {
    subProductID?: string;

    // params
    spaceNeeded: number;

    lostProbability: number;
    rejectedProbability: number;
    spoilProbability: number;

    costs: {
        inspectionUnit: number;
        planningUnit: number;
        externalStorageUnitCost: number;
    }

    rawMaterialConsoCfg: RawMaterialConsumptionCfg;
    manufacturingCfg: ManufacturingCfg;


    materialsIDs: string[];

    atelierID: string;
}

export default class SemiProduct extends IObject.IObject {
    departmentName = "production";

    public params: SemiProductParams;

    manufacturingUnitTime: number;

    private warehouse: Warehouse.Warehouse;
    private componentsWarehouse: Warehouse.Warehouse;

    subContracter: SubContracter;

    constructor(params: SemiProductParams) {
        super(params);
    }

    init(atelier: Atelier, rawMaterial: RawMaterial, subContractor: SubContracter, lastPCommand3MthQ = 0, lastPCommand3MthValue = 0, lastPCommand6MthQ = 0, lastPCommand6MthValue = 0,
        beforeLastPCommand6MthQ = 0, beforeLastPCommand6MthValue = 0) {

        super.init();

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

        this.componentsWarehouse.init(0, 0, lastPCommand3MthQ, lastPCommand3MthValue, lastPCommand6MthQ, lastPCommand6MthValue,
            beforeLastPCommand6MthQ, beforeLastPCommand6MthValue, atelier.factory);

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

    get isMachined(): boolean {
        return this.params.manufacturingCfg.atelier.machinery !== undefined;
    }

    purchasesValue: number;
    purchasesQ: number;

    get materialUnitCost(): number {
        var rmCfg = this.params.rawMaterialConsoCfg;

        var rawMaterialCfg = rmCfg.rawMaterial;

        if (! rawMaterialCfg) {
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
    }

    get manufacturingUnitCost(): number {
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
    }


    get spaceUsed(): number {
        var space = Utils.sums(this.warehouse, "spaceUsed", null, null, null, ">", 2);
        space += Utils.sums(this.componentsWarehouse, "spaceUsed", null, null, null, ">", 2);

        return Utils.correctFloat(space);
    }

    // valuation method for components
    get inventoryUnitValue(): number {
        if (!this.subContracter) {
            return 0;
        }

        var quality = this.lastManufacturingParams && this.lastManufacturingParams[1] || 0;
        var unitValue = this.subContracter._getPrice(quality);

        return unitValue;
    }

    get closingValue(): number {
        var closingValue = (this.warehouse.closingQ + this.componentsWarehouse.closingQ) * this.inventoryUnitValue;

        return closingValue;
    }

    // helpers
    _calcRejectedUnitsNbOf(quantity: number): number {
        var landa: number,
            probability: number,
            value = 0,
            i = 0;

        probability = Math.random() * this.params.rejectedProbability;

        landa = probability * quantity;

        //return Math.round(Utils.getPoisson(landa));

        return 0;
    }

    lastManufacturingParams: number[];

    // results
    producedNb: number;
    scheduledNb: number;

    get availableNb(): number {
        return this.warehouse.availableQ + this.componentsWarehouse.availableQ;
    }

    rejectedNb: number;

    get lostNb(): number {
        return this.warehouse.lostQ + this.componentsWarehouse.lostQ;
    }

    get rawMaterialTotalConsoQ(): number {
        var value = this.producedNb * this.params.rawMaterialConsoCfg.consoUnit;

        return Utils.round(value, 2);
    }

    get manufacturingTotalHoursNb(): number {
        var value = this.producedNb * this.manufacturingUnitTime / 60;

        return Utils.round(value, 2);
    }

    getNeededResForProd(quantity: number, manufacturingUnitTime: number, premiumQualityProp: number = 0): any {
        if (! Utils.isNumericValid(manufacturingUnitTime)) {
            manufacturingUnitTime = this.params.manufacturingCfg.minManufacturingUnitTime;
        }


        // TODO test if the quality available is ok
        // first of all let diminish outsourced components as they dont need ressources
        var outsourcedQ = this.componentsWarehouse.availableQ;

        if (outsourcedQ > 0) {
            quantity -= outsourcedQ;
        }

        var mCfg = this.params.manufacturingCfg,
            rmCfg = this.params.rawMaterialConsoCfg,
            consoUnit = rmCfg.consoUnit;

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
    }


    // actions
    manufacture(quantity: number, manufacturingUnitTime: number, premiumQualityProp: number): number {
        if (!this.isInitialised()) {
            return 0;
        }

        if (! Utils.isNumericValid(quantity)) {
            console.warn('SemiPdt @ Quantity not reel', arguments);
            return 0;
        }

        if (! Utils.isNumericValid(manufacturingUnitTime)) {
            manufacturingUnitTime = this.lastManufacturingParams && this.lastManufacturingParams[0] || this.params.manufacturingCfg.minManufacturingUnitTime;
        }

        if (! Utils.isNumericValid(premiumQualityProp)) {
            premiumQualityProp = this.lastManufacturingParams && this.lastManufacturingParams[1] || 0;
        }

        this.lastManufacturingParams = [manufacturingUnitTime, premiumQualityProp];

        var mCfg = this.params.manufacturingCfg,
            rmCfg = this.params.rawMaterialConsoCfg,
            consoUnit = rmCfg.consoUnit,

            i = 0,
            done: boolean,

            producedQ = 0;

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
                mCfg.atelier && mCfg.atelier.work(- manufacturingUnitTime);
                break;
            }

            // finally everything is ok
            producedQ++;
        }

        this.producedNb += producedQ;

        return this.warehouse.moveIn(producedQ);

    }

    deliverTo(quantity: number, manufacturingUnitTime: number, premiumQualityProp: number): number {
        if (!this.isInitialised()) {
            return 0;
        }

        if (! Utils.isNumericValid(quantity)) {
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
    }

    
    reject(quantity) {
        if ( ! Utils.isNumericValid(quantity)) {
            console.warn('Reject SP @ Quantity not reel :', arguments);
            return 0;
        }

        // reject only produced units not outsourced
        this.warehouse.moveOut(quantity);
    }

    subContract(unitsNb: number, premiumQualityProp: number = 0): boolean {
        if (!this.isInitialised()) {
            return false;
        }

        if (! Utils.isNumericValid(unitsNb)) {
            console.warn('Subcontract SP %d @ Quantity not reel :', this.params.subProductID, arguments);
            return false;
        }

        if (!Number.isInteger(unitsNb)) {
            unitsNb = Math.round(unitsNb);
        }

        var qualityIdx: number;

        qualityIdx = ENUMS.QUALITY.HQ * premiumQualityProp + ENUMS.QUALITY.MQ;

        this.subContracter.order(unitsNb, qualityIdx);

        return this.supply(unitsNb);
    }

    supply(quantity: number, value: number = 0, term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE): boolean {
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

    get state(): any {

        return {
            "outsourcedOutQ": this.componentsWarehouse.outQ,
            "outsourcedClosingQ": this.componentsWarehouse.closingQ,
            "outsourcedAvailableNextPQ": this.componentsWarehouse.availableNextPeriodQ
        };

    }

}
