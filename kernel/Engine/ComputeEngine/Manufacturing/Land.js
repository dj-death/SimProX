"use strict";
const Space = require('./Space');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class Land extends Space.Space {
    constructor(params) {
        super(params);
        this.departmentName = "production";
    }
    init(initialSize, peripherySpace, lastLandNetValue, economy, contractor = null, creditWorthiness = Infinity, factories) {
        super.init(initialSize, peripherySpace, lastLandNetValue, economy, contractor, creditWorthiness);
        if (isNaN(lastLandNetValue)) {
            console.warn("lastLandNetValue NaN");
            lastLandNetValue = 0;
        }
        this.factories = factories;
        this.lastLandNetValue = lastLandNetValue;
        this.usedSpace = this.factoriesInitialSpace;
    }
    get accessAndParkingSpace() {
        return this.reservedSpace;
    }
    get factoriesInitialSpace() {
        return Utils.sums(this.factories, "availableSpaceAtStart");
    }
    get factoriesSpace() {
        return Utils.sums(this.factories, "availableSpace");
    }
    get state() {
        return {
            "availableSpace": this.availableSpace
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Land;
//# sourceMappingURL=Land.js.map