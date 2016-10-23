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
var Collections = require('../../../utils/Collections');
var Space = (function (_super) {
    __extends(Space, _super);
    function Space(params) {
        _super.call(this, params);
        this.departmentName = "production";
        this.lastNetValue = 0;
        this.requests = new Collections.Queue();
    }
    Object.defineProperty(Space.prototype, "extensionSquareMetreCost", {
        get: function () {
            return this.contractor.buildingSquareMetreCost;
        },
        enumerable: true,
        configurable: true
    });
    Space.prototype.init = function (initialSize, peripherySpace, lastNetValue, economy, contractor, creditWorthiness) {
        if (contractor === void 0) { contractor = null; }
        if (creditWorthiness === void 0) { creditWorthiness = Infinity; }
        _super.prototype.init.call(this);
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
    };
    Space.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.isReady = false;
        this.effectiveExtension = 0;
        this.usedSpace = 0;
        this.spaceUsages = {};
        this.requests.clear();
    };
    Object.defineProperty(Space.prototype, "availableSpaceNextPeriod", {
        get: function () {
            return this.availableSpaceAtStart + this.effectiveExtension;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "unusedSpace", {
        get: function () {
            return this.maxUsedSpace - this.usedSpace;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "maxUsedSpace", {
        get: function () {
            return Math.ceil(this.availableSpace * this.params.maxSpaceUse);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "reservedSpace", {
        get: function () {
            return Math.ceil(this.availableSpace * (1 - this.params.maxSpaceUse));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "maxExtension", {
        get: function () {
            return this.peripherySpace && this.peripherySpace.unusedSpace || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "CO2PrimaryFootprintHeat", {
        get: function () {
            return this.params.CO2Footprint.kwh * this.availableSpace;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "CO2PrimaryFootprintWeight", {
        get: function () {
            return this.CO2PrimaryFootprintHeat * 0.00019;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "CO2PrimaryFootprintOffsettingCost", {
        get: function () {
            return Utils.round(this.CO2PrimaryFootprintWeight * this.params.costs.CO2OffsettingPerTonneRate, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "extensionCost", {
        // cost
        get: function () {
            if (!this.contractor) {
                return 0;
            }
            return this.effectiveExtension * this.contractor.buildingSquareMetreCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "fixedCost", {
        get: function () {
            var inflationImpact = this.economy.PPIOverheads;
            var fixedExpensesPerSquare = Math.round(this.params.costs.fixedExpensesPerSquare * inflationImpact);
            return Math.ceil(this.availableSpace * fixedExpensesPerSquare);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "rawValue", {
        get: function () {
            return this.lastNetValue + this.extensionCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "depreciation", {
        get: function () {
            var depreciation = Math.ceil(this.rawValue * this.params.depreciationRate);
            return depreciation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "netValue", {
        get: function () {
            if (this.params.isValuationAtMarket) {
                return this.availableSpaceNextPeriod * this.extensionSquareMetreCost;
            }
            var netValue = this.rawValue - this.depreciation;
            return netValue;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Space.prototype.useSpace = function (spaceNeed, usage) {
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
    };
    Space.prototype.freeSpace = function (space, usage) {
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
    };
    Space.prototype.extend = function (extension) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isNumericValid(extension)) {
            console.warn("Not valid extension: %d", extension);
            return false;
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
    };
    Space.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.CO2PrimaryFootprintOffsettingCost, this.params.payments.miscellaneous, 'CO2PrimaryFootprintOffsetting');
        this.CashFlow.addPayment(this.fixedCost, this.params.payments.miscellaneous, 'fixed');
        this.CashFlow.addPayment(this.extensionCost, this.params.payments.acquisition, 'extension', ENUMS.ACTIVITY.INVESTING);
    };
    Space.prototype.onSpaceFree = function () {
        var req = this.requests.peek();
        if (!req) {
            return;
        }
        var isRemaining = req.callback.apply(req.scope, []);
        if (!isRemaining) {
            this.requests.dequeue();
            this.onSpaceFree();
        }
        console.silly("Space free event fired");
    };
    Space.prototype.requestSpace = function (callback, scope) {
        console.silly("Space free request added");
        return this.requests.enqueue({
            callback: callback,
            scope: scope || null
        });
    };
    Space.EPSILON = 0.0001;
    return Space;
}(IObject.IObject));
exports.Space = Space;
//# sourceMappingURL=Space.js.map