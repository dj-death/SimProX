"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Space = require('./Space');
var ENUMS = require('../ENUMS');
var Factory = (function (_super) {
    __extends(Factory, _super);
    function Factory(params) {
        _super.call(this, params);
        this.departmentName = "production";
    }
    Factory.prototype.init = function (initialSize, land, lastFactoryNetValue, economy, contractor, lastCreditWorthiness) {
        if (contractor === void 0) { contractor = null; }
        if (lastCreditWorthiness === void 0) { lastCreditWorthiness = Infinity; }
        _super.prototype.init.call(this, initialSize, land, lastFactoryNetValue, economy, contractor);
    };
    Object.defineProperty(Factory.prototype, "machiningSpaceUsed", {
        get: function () {
            var total = this.spaceUsages[ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.MACHINES]];
            return Math.ceil(total);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Factory.prototype, "workersSpaceUsed", {
        get: function () {
            var total = this.spaceUsages[ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.WORKERS]];
            return Math.ceil(total);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Factory.prototype, "stocksSpaceUsed", {
        get: function () {
            var total = this.spaceUsages[ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.STOCKS]];
            return Math.ceil(total);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Factory.prototype, "circulationAndAccessSpace", {
        get: function () {
            return this.reservedSpace;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Factory.prototype, "state", {
        get: function () {
            return {
                "availableSpace": this.availableSpace,
                "machiningSpaceUsed": this.machiningSpaceUsed,
                "workersSpaceUsed": this.workersSpaceUsed,
                "stocksSpaceUsed": this.stocksSpaceUsed,
            };
        },
        enumerable: true,
        configurable: true
    });
    return Factory;
}(Space.Space));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Factory;
//# sourceMappingURL=Factory.js.map