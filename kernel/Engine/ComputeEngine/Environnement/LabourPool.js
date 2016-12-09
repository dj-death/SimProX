"use strict";
const Manufacturing_1 = require('../Manufacturing');
class Pool extends Manufacturing_1.Warehouse {
    constructor() {
        ++Pool.counter;
        let ID = "pool" + Pool.counter;
        let defaultParams = {
            id: ID,
            label: ID,
            lostProbability: 0,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 0
            }
        };
        super(defaultParams);
        this.isPersistedObject = true;
    }
    reset() {
        super.reset();
        Pool.counter = 0;
    }
    employ(quantity) {
        return this.moveOut(quantity);
    }
    train(quantity) {
        return this.moveOut(quantity);
    }
    // remember to see if we need to set future
    free(quantity) {
        this.moveIn(quantity);
    }
}
Pool.counter = 0;
class LabourPool {
    constructor() {
        this.unemployedSkilledPool = new Pool();
        this.unemployedUnskilledPool = new Pool();
        this.employedSkilledPool = new Pool();
    }
    init(unemployedSkilledNb, unemployedUnskilledNb, employedSkilledNb) {
        this.unemployedSkilledPool.init(unemployedSkilledNb);
        this.unemployedUnskilledPool.init(unemployedUnskilledNb);
        this.employedSkilledPool.init(employedSkilledNb);
    }
    employ(quantity, isUnskilled) {
        let effectiveQ, restQ;
        if (isUnskilled) {
            effectiveQ = this.unemployedUnskilledPool.employ(quantity);
        }
        else {
            effectiveQ = this.unemployedSkilledPool.employ(quantity);
            restQ = quantity - effectiveQ;
            if (restQ > 0) {
                effectiveQ += this.employedSkilledPool.employ(quantity);
            }
        }
        return effectiveQ;
    }
    train(quantity, lookForUnskilled = true) {
        let effectiveQ;
        if (lookForUnskilled) {
            effectiveQ = this.unemployedUnskilledPool.train(quantity);
        }
        else {
            effectiveQ = this.unemployedSkilledPool.train(quantity);
        }
        return effectiveQ;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LabourPool;
//# sourceMappingURL=LabourPool.js.map