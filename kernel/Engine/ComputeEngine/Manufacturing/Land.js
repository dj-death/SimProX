"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Space = require('./Space');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Land = (function (_super) {
    __extends(Land, _super);
    function Land(params) {
        _super.call(this, params);
        this.departmentName = "production";
    }
    Land.prototype.init = function (initialSize, peripherySpace, lastLandNetValue, economy, contractor, factories) {
        if (contractor === void 0) { contractor = null; }
        _super.prototype.init.call(this, initialSize, peripherySpace, lastLandNetValue, economy, contractor);
        if (isNaN(lastLandNetValue)) {
            console.warn("lastLandNetValue NaN");
            lastLandNetValue = 0;
        }
        this.factories = factories;
        this.lastLandNetValue = lastLandNetValue;
        this.usedSpace = this.factoriesInitialSpace;
    };
    Object.defineProperty(Land.prototype, "accessAndParkingSpace", {
        get: function () {
            return this.reservedSpace;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Land.prototype, "factoriesInitialSpace", {
        get: function () {
            return Utils.sums(this.factories, "availableSpaceAtStart");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Land.prototype, "factoriesSpace", {
        get: function () {
            return Utils.sums(this.factories, "availableSpace");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Land.prototype, "state", {
        get: function () {
            return {
                "availableSpace": this.availableSpace
            };
        },
        enumerable: true,
        configurable: true
    });
    return Land;
}(Space.Space));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Land;
//# sourceMappingURL=Land.js.map