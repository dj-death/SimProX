import * as IObject from '../IObject';

import { Economy }  from './Economy';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface MaterialMarketParams extends IObject.ObjectParams {
    materialMarketID?: string;

    standardLotQuantity: number;

    arePricesStable: boolean;

    materialID: string;
    economyID: string;

    baseQuotedPrices?: number[];
    quotedPricesStats?: Array<number[]>;
}

export default class MaterialMarket extends IObject.IObject {
    departmentName = "environnement";
    protected isPersistedObject: boolean = true;

    public params: MaterialMarketParams;

    economy: Economy;

    private initialQuotedPrices: number[];

    constructor(params: MaterialMarketParams) {
        super(params);
    }

    init(economy: Economy, lastQuotedPrices: number[]) {
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

    private _spotPrice: number;
    private _threeMthPrice: number;
    private _sixMthPrice: number;

    // result
    // initial prices at local currency for standard lot
    getPrice(term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE): number {
        if (!this.initialised) {
            return 0;
        }

        let price: number;

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
    getQuotedPrice(term: ENUMS.FUTURES = ENUMS.FUTURES.IMMEDIATE): number {
        if (!this.initialised) {
            console.warn('MaterialMarket not initialised');
            return 0;
        }

        let price: number;

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
    simulate(currPeriod: number) {
        let params = this.params;

        if (params.arePricesStable) {
            this._spotPrice = this.initialQuotedPrices[0];
            this._threeMthPrice = this.initialQuotedPrices[1];
            this._sixMthPrice = this.initialQuotedPrices[2];

            return;
        }

        let stats = params.quotedPricesStats;

        if (stats && stats.length) {

            this._spotPrice = Utils.getStat(stats[0], currPeriod)
            this._threeMthPrice = Utils.getStat(stats[1], currPeriod)
            this._sixMthPrice = Utils.getStat(stats[2], currPeriod)

        } else {

            // TODO: develop
            let baseQuotedPrices = params.baseQuotedPrices;

            this._spotPrice = baseQuotedPrices[0];
            this._threeMthPrice = baseQuotedPrices[1];
            this._sixMthPrice = baseQuotedPrices[2];
        }

    }

    get state(): any {
        return {
            "spotPrice": this._spotPrice,
            "threeMthPrice": this._threeMthPrice,
            "sixMthPrice": this._sixMthPrice
        };
    }
}