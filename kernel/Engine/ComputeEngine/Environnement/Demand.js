"use strict";
const IObject = require('../IObject');
class Demand extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    init() {
        super.init();
    }
    // actions
    order(quantity) {
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Demand;
//# sourceMappingURL=Demand.js.map