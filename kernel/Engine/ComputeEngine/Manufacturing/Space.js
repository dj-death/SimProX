"use strict";
const IObject = require('../IObject');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
const Collections = require('../../../utils/Collections');
class Space extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "production";
        this.lastNetValue = 0;
        this.requests = new Collections.Queue();
    }
    get extensionSquareMetreCost() {
        return this.contractor.buildingSquareMetreCost;
    }
    init(initialSize, peripherySpace, lastNetValue, economy, contractor = null, creditWorthiness = Infinity) {
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
    get availableSpaceNextPeriod() {
        return this.availableSpaceAtStart + this.effectiveExtension;
    }
    get unusedSpace() {
        return this.maxUsedSpace - this.usedSpace;
    }
    get maxUsedSpace() {
        return Math.ceil(this.availableSpace * this.params.maxSpaceUse);
    }
    get reservedSpace() {
        return Math.ceil(this.availableSpace * (1 - this.params.maxSpaceUse));
    }
    get maxExtension() {
        return this.peripherySpace && this.peripherySpace.unusedSpace || 0;
    }
    get CO2PrimaryFootprintHeat() {
        return this.params.CO2Footprint.kwh * this.availableSpace;
    }
    get CO2PrimaryFootprintWeight() {
        return this.CO2PrimaryFootprintHeat * 0.00019;
    }
    get CO2PrimaryFootprintOffsettingCost() {
        return Utils.round(this.CO2PrimaryFootprintWeight * this.params.costs.CO2OffsettingPerTonneRate, 2);
    }
    // cost
    get extensionCost() {
        if (!this.contractor) {
            return 0;
        }
        return this.effectiveExtension * this.contractor.buildingSquareMetreCost;
    }
    get fixedCost() {
        let inflationImpact = this.economy.PPIOverheads;
        let fixedExpensesPerSquare = Math.round(this.params.costs.fixedExpensesPerSquare * inflationImpact);
        return Math.ceil(this.availableSpace * fixedExpensesPerSquare);
    }
    get rawValue() {
        return this.lastNetValue + this.extensionCost;
    }
    get depreciation() {
        let depreciation = Math.ceil(this.rawValue * this.params.depreciationRate);
        return depreciation;
    }
    get netValue() {
        if (this.params.isValuationAtMarket) {
            return this.availableSpaceNextPeriod * this.extensionSquareMetreCost;
        }
        let netValue = this.rawValue - this.depreciation;
        return netValue;
    }
    // actions
    useSpace(spaceNeed, usage) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(spaceNeed)) {
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
    freeSpace(space, usage) {
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
        if (!usage || !this.spaceUsages.hasOwnProperty(usage)) {
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
    extend(extension) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(extension)) {
            console.warn("Not valid extension: %d", extension);
            return false;
        }
        if (!Utils.isInteger(extension)) {
            extension = Math.round(extension);
        }
        if (!this.peripherySpace) {
            console.debug('unable to extend');
            return false;
        }
        let possibleExtension = extension > this.unusedSpace ? this.unusedSpace : extension;
        let extensionRes = this.contractor.build(possibleExtension, this.creditWorthiness);
        let effectiveExtension = extensionRes.squaresNb;
        let extensionDuration = extensionRes.duration;
        if (this === this.peripherySpace && this.params.id === this.peripherySpace.params.id) {
        }
        else {
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
        let req = this.requests.peek();
        if (!req) {
            return;
        }
        let isRemaining = req.callback.apply(req.scope, []);
        if (!isRemaining) {
            this.requests.dequeue();
            this.onSpaceFree();
        }
        console.silly("Space free event fired");
    }
    requestSpace(callback, scope) {
        console.silly("Space free request added");
        return this.requests.enqueue({
            callback: callback,
            scope: scope || null
        });
    }
}
Space.EPSILON = 0.0001;
exports.Space = Space;
//# sourceMappingURL=Space.js.map