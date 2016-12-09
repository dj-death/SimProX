"use strict";
const Space = require('./Space');
const ENUMS = require('../ENUMS');
class Factory extends Space.Space {
    constructor(params) {
        super(params);
        this.departmentName = "production";
    }
    init(initialSize, land, lastFactoryNetValue, economy, contractor = null, lastCreditWorthiness = Infinity) {
        super.init(initialSize, land, lastFactoryNetValue, economy, contractor);
    }
    get machiningSpaceUsed() {
        let total = this.spaceUsages[ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.MACHINES]];
        return Math.ceil(total);
    }
    get workersSpaceUsed() {
        let total = this.spaceUsages[ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.WORKERS]];
        return Math.ceil(total);
    }
    get stocksSpaceUsed() {
        let total = this.spaceUsages[ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.STOCKS]];
        return Math.ceil(total);
    }
    get circulationAndAccessSpace() {
        return this.reservedSpace;
    }
    get state() {
        return {
            "availableSpace": this.availableSpace,
            "machiningSpaceUsed": this.machiningSpaceUsed,
            "workersSpaceUsed": this.workersSpaceUsed,
            "stocksSpaceUsed": this.stocksSpaceUsed,
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Factory;
//# sourceMappingURL=Factory.js.map