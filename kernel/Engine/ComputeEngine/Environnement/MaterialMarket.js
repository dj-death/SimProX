"use strict";
const IObject = require('../IObject');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class MaterialMarket extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    init(economy, lastQuotedPrices) {
        super.init();
        this.economy = economy;
        // we begin at the end of last so is the price of first day of period
        this.initialQuotedPrices = lastQuotedPrices;
    }
    reset() {
        super.reset();
        this.initialQuotedPrices = [];
        this._spotPrice = undefined;
        this._threeMthPrice = undefined;
        this._sixMthPrice = undefined;
    }
    // result
    // initial prices at local currency for standard lot
    getPrice(term = ENUMS.FUTURES.IMMEDIATE) {
        if (!this.initialised) {
            return 0;
        }
        let price;
        let initialExchangeRate = this.economy.currency.initialExchangeRate;
        switch (term) {
            case ENUMS.FUTURES.SIX_MONTH:
                price = this.initialQuotedPrices[2] * initialExchangeRate;
                break;
            case ENUMS.FUTURES.THREE_MONTH:
                price = this.initialQuotedPrices[1] * initialExchangeRate;
                break;
            default:
                price = this.initialQuotedPrices[0] * initialExchangeRate;
        }
        return Utils.round(price);
    }
    // at reel time (for this period) at local currency for standard lot
    getQuotedPrice(term = ENUMS.FUTURES.IMMEDIATE) {
        if (!this.initialised) {
            console.warn('MaterialMarket not initialised');
            return 0;
        }
        let price;
        let quotedExchangeRate = this.economy.currency.quotedExchangeRate;
        switch (term) {
            case ENUMS.FUTURES.SIX_MONTH:
                price = this._sixMthPrice * quotedExchangeRate;
                break;
            case ENUMS.FUTURES.THREE_MONTH:
                price = this._threeMthPrice * quotedExchangeRate;
                break;
            default:
                price = this._spotPrice * quotedExchangeRate;
        }
        return Utils.round(price);
    }
    // TODO: develop it
    // action
    simulate(currPeriod) {
        let params = this.params;
        if (params.arePricesStable) {
            this._spotPrice = this.initialQuotedPrices[0];
            this._threeMthPrice = this.initialQuotedPrices[1];
            this._sixMthPrice = this.initialQuotedPrices[2];
            return;
        }
        let stats = params.quotedPricesStats;
        if (stats && stats.length) {
            this._spotPrice = Utils.getStat(stats[0], currPeriod);
            this._threeMthPrice = Utils.getStat(stats[1], currPeriod);
            this._sixMthPrice = Utils.getStat(stats[2], currPeriod);
        }
        else {
            // TODO: develop
            let baseQuotedPrices = params.baseQuotedPrices;
            this._spotPrice = baseQuotedPrices[0];
            this._threeMthPrice = baseQuotedPrices[1];
            this._sixMthPrice = baseQuotedPrices[2];
        }
    }
    get state() {
        return {
            "spotPrice": this._spotPrice,
            "threeMthPrice": this._threeMthPrice,
            "sixMthPrice": this._sixMthPrice
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MaterialMarket;
//# sourceMappingURL=MaterialMarket.js.map