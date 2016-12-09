"use strict";
const IObject = require('../IObject');
const Utils = require('../../../utils/Utils');
class Currency extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    init(lastExchangeRate) {
        super.init();
        this.initialExchangeRate = this.params.isLocal ? 1 : lastExchangeRate;
    }
    reset() {
        super.reset();
        this._quotedExchangeRate = null;
        this.initialExchangeRate = null;
    }
    // result
    get quotedExchangeRate() {
        return this._quotedExchangeRate;
    }
    // action
    simulate(currPeriod) {
        let params = this.params;
        if (params.isLocal) {
            this._quotedExchangeRate = 1;
            return;
        }
        if (params.isStable) {
            this._quotedExchangeRate = this.initialExchangeRate;
            return;
        }
        let stats = params.currencyRateStats;
        if (stats && stats.length) {
            this._quotedExchangeRate = Utils.getStat(stats, currPeriod);
        }
        else {
            // TODO: develop
            this._quotedExchangeRate = params.baseRate || this.initialExchangeRate;
        }
    }
    get state() {
        return {
            "exchangeRatePerCent": this.quotedExchangeRate * 100 // regression
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Currency;
//# sourceMappingURL=Currency.js.map