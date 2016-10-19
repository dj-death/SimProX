"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Demand = (function (_super) {
    __extends(Demand, _super);
    function Demand(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    Demand.prototype.init = function () {
        _super.prototype.init.call(this);
    };
    // actions
    Demand.prototype.order = function (quantity) {
    };
    return Demand;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Demand;
//# sourceMappingURL=Demand.js.map