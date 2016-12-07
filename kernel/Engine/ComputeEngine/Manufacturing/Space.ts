import * as IObject from '../IObject';

import { BuildingContractor } from '../Environnement';

import { Economy } from '../Environnement';


import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');

import Collections = require('../../../utils/Collections');


export interface SpaceParams extends IObject.ObjectParams {

    maxSpaceUse: number;

    depreciationRate: number;

    isValuationAtMarket: boolean;

    CO2Footprint: ENUMS.CO2Footprint;

    costs: {
        fixedExpensesPerSquare: number;
        CO2OffsettingPerTonneRate: number;
    };

    payments: {
        acquisition: ENUMS.PaymentArray;
        miscellaneous: ENUMS.PaymentArray;
    };
}

interface SpaceUsages {
    [index: string]: number;
}


interface Request {
    callback: Function;
    scope?: any;
}


export class Space extends IObject.IObject {
    departmentName = "production";

    peripherySpace: Space;

    params: SpaceParams;

    static EPSILON = 0.0001;

    protected spaceUsages: SpaceUsages;

    protected requests: Collections.Queue<Request>;


    creditWorthiness: number;

    constructor(params: SpaceParams) {
        super(params);

        this.requests = new Collections.Queue<Request>();
    }

    protected availableSpaceAtStart: number;

    protected get extensionSquareMetreCost(): number {
        return this.contractor.buildingSquareMetreCost;
    }

    protected lastNetValue: number = 0;

    protected contractor: BuildingContractor;

    protected economy: Economy;

    init(initialSize: number, peripherySpace: Space, lastNetValue: number, economy: Economy, contractor: BuildingContractor = null, creditWorthiness: number = Infinity) {
        super.init();


        if (isNaN(initialSize)) {
            console.warn("initialSize NaN");

            initialSize = 0;
        }

        if (isNaN(lastNetValue)) {
            console.warn("lastNetValue NaN");

            lastNetValue = 0;
        }



        this.peripherySpace = peripherySpace;

        this.availableSpaceAtStart = initialSize;
        this.availableSpace = initialSize;

        this.lastNetValue = lastNetValue;

        this.contractor = contractor;

        this.creditWorthiness = creditWorthiness;

        this.economy = economy;
    }

    reset() {
        super.reset();

        this.isReady = false;

        this.effectiveExtension = 0;
        this.usedSpace = 0;

        this.spaceUsages = {};

        this.requests.clear();
    }


    // decision
    extensionSquareMetreNb: number;

    // results
    availableSpace: number;
    effectiveExtension: number;

    get availableSpaceNextPeriod(): number {
        return this.availableSpaceAtStart + this.effectiveExtension;
    }

    get unusedSpace(): number {
        return this.maxUsedSpace - this.usedSpace;
    }

    get maxUsedSpace(): number {
        return Math.ceil(this.availableSpace * this.params.maxSpaceUse);
    }

    get reservedSpace(): number {
        return Math.ceil(this.availableSpace * (1 - this.params.maxSpaceUse));
    }

    get maxExtension(): number {
        return this.peripherySpace && this.peripherySpace.unusedSpace || 0;
    }

    usedSpace: number;

    get CO2PrimaryFootprintHeat(): number {
        return this.params.CO2Footprint.kwh * this.availableSpace;
    }

    get CO2PrimaryFootprintWeight(): number {
        return this.CO2PrimaryFootprintHeat * 0.00019;
    }

   
    get CO2PrimaryFootprintOffsettingCost(): number {
        return Utils.round(this.CO2PrimaryFootprintWeight * this.params.costs.CO2OffsettingPerTonneRate, 2);
    }

    // cost
    get extensionCost(): number {
        if (!this.contractor) {
            return 0;
        }

        return this.effectiveExtension * this.contractor.buildingSquareMetreCost;
    }

    get fixedCost(): number {
        let inflationImpact = this.economy.PPIOverheads;

        let fixedExpensesPerSquare = Math.round(this.params.costs.fixedExpensesPerSquare * inflationImpact);

        return Math.ceil(this.availableSpace * fixedExpensesPerSquare);
    }

    get rawValue(): number {
        return this.lastNetValue + this.extensionCost;
    }

    get depreciation(): number {
        var depreciation = Math.ceil(this.rawValue * this.params.depreciationRate);

        return depreciation;
    }

    get netValue(): number {

        if (this.params.isValuationAtMarket) {
            return this.availableSpaceNextPeriod * this.extensionSquareMetreCost;
        }

        var netValue = this.rawValue - this.depreciation;

        return netValue;
    }


    // actions
    useSpace(spaceNeed: number, usage: string): boolean {
        if (!this.isInitialised()) {
            return false;
        }

        if (! Utils.isNumericValid(spaceNeed)) {
            return false;
        }

        if (Utils.compare(this.unusedSpace, "<<", spaceNeed, Space.EPSILON)) {
            console.debug("All space is used");
            return false;
        }

        // no use space before extension
        if (!this.isReady) {
            console.warn("Trying to use space before readiness by %s", usage);
            return false;
        }

        this.usedSpace = Utils.correctFloat(this.usedSpace + spaceNeed);

        this.spaceUsages[usage] = Utils.isNumericValid(this.spaceUsages[usage]) ? Utils.correctFloat(this.spaceUsages[usage] + spaceNeed) : spaceNeed;

        return true;
    }

    freeSpace(space: number, usage: string) {
        if (!this.isInitialised()) {
            return false;
        }

        if (!Utils.isNumericValid(space)) {
            console.warn("Trying to free not reel space by %s", usage);
            return false;
        }

        // no free space before extension
        if (!this.isReady) {
            console.warn("Trying to free space before readiness  by %s", usage);
            return false;
        }

        if (! usage || !this.spaceUsages.hasOwnProperty(usage)) {
            console.warn("Trying to free space for unknown usage");
            return false;
        }

        if (Utils.compare(space, ">>", this.spaceUsages[usage], Space.EPSILON)) {
            console.warn("Trying to free space greather than what is affected by %s", usage);
            return false;
        }

        this.usedSpace = Utils.correctFloat(this.usedSpace - space);
        this.spaceUsages[usage] = Utils.correctFloat(this.spaceUsages[usage] - space);

        this.onSpaceFree();

        return true;
    }

    protected isReady: boolean;


    extend(extension: number) {
        if (!this.isInitialised()) {
            return false;
        }

        if (!Utils.isNumericValid(extension)) {
            console.warn("Not valid extension: %d", extension);
            return false;
        }

        if (!Number.isInteger(extension)) {
            extension = Math.round(extension);
        }


        if (!this.peripherySpace) {
            console.debug('unable to extend');
            return false;
        }

        var possibleExtension = extension > this.unusedSpace ? this.unusedSpace : extension;

        var extensionRes = this.contractor.build(possibleExtension, this.creditWorthiness);

        var effectiveExtension = extensionRes.squaresNb;
        var extensionDuration = extensionRes.duration;

        if (this === this.peripherySpace && this.params.id === this.peripherySpace.params.id) {

        } else {

            this.peripherySpace.useSpace(effectiveExtension, "extension");

        }

        this.effectiveExtension = effectiveExtension;

        if (extensionDuration === ENUMS.FUTURES.IMMEDIATE) {
            this.availableSpace += this.effectiveExtension;
        }

        this.isReady = true;

        this.onReady();
    }

    onFinish() {
        this.CashFlow.addPayment(this.CO2PrimaryFootprintOffsettingCost, this.params.payments.miscellaneous, 'CO2PrimaryFootprintOffsetting');
        this.CashFlow.addPayment(this.fixedCost, this.params.payments.miscellaneous, 'fixed');

        this.CashFlow.addPayment(this.extensionCost, this.params.payments.acquisition, 'extension', ENUMS.ACTIVITY.INVESTING);
    }

    onSpaceFree() {
        var req: Request = this.requests.peek();

        if (!req) {
            return;
        }

        var isRemaining = req.callback.apply(req.scope, []);

        if (!isRemaining) {
            this.requests.dequeue();

            this.onSpaceFree();
        }

        console.silly("Space free event fired");
    }

    requestSpace(callback: Function, scope?: any): boolean {
        console.silly("Space free request added");

        return this.requests.enqueue({
            callback: callback,
            scope: scope || null
        });
    }

}