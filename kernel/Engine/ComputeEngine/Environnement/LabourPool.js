"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Manufacturing_1 = require('../Manufacturing');
var Pool = (function (_super) {
    __extends(Pool, _super);
    function Pool() {
        ++Pool.counter;
        var ID = "pool" + Pool.counter;
        var defaultParams = {
            id: ID,
            label: ID,
            lostProbability: 0,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 0
            }
        };
        _super.call(this, defaultParams);
        this.isPersistedObject = true;
    }
    Pool.prototype.reset = function () {
        _super.prototype.reset.call(this);
        Pool.counter = 0;
    };
    Pool.prototype.employ = function (quantity) {
        return this.moveOut(quantity);
    };
    Pool.prototype.train = function (quantity) {
        return this.moveOut(quantity);
    };
    // remember to see if we need to set future
    Pool.prototype.free = function (quantity) {
        this.moveIn(quantity);
    };
    Pool.counter = 0;
    return Pool;
}(Manufacturing_1.Warehouse));
var LabourPool = (function () {
    function LabourPool() {
        this.unemployedSkilledPool = new Pool();
        this.unemployedUnskilledPool = new Pool();
        this.employedSkilledPool = new Pool();
    }
    LabourPool.prototype.init = function (unemployedSkilledNb, unemployedUnskilledNb, employedSkilledNb) {
        this.unemployedSkilledPool.init(unemployedSkilledNb);
        this.unemployedUnskilledPool.init(unemployedUnskilledNb);
        this.employedSkilledPool.init(employedSkilledNb);
    };
    LabourPool.prototype.employ = function (quantity, isUnskilled) {
        var effectiveQ, restQ;
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
    };
    LabourPool.prototype.train = function (quantity, lookForUnskilled) {
        if (lookForUnskilled === void 0) { lookForUnskilled = true; }
        var effectiveQ;
        if (lookForUnskilled) {
            effectiveQ = this.unemployedUnskilledPool.train(quantity);
        }
        else {
            effectiveQ = this.unemployedSkilledPool.train(quantity);
        }
        return effectiveQ;
    };
    return LabourPool;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LabourPool;
//# sourceMappingURL=LabourPool.js.map