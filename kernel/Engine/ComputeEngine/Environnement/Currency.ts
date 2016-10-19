import * as IObject from '../IObject';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');

import Game = require('../../../simulation/Games');

interface CurrencyParams extends IObject.ObjectParams {
    currencyID?: string;

    economyID: string;

    sign: string;

    // to see if the base
    isLocal: boolean;

    baseRate?: number;
    currencyRateStats?: number[];

    isStable: boolean;
}



export default class Currency extends IObject.IObject {
    departmentName = "environnement";
    protected isPersistedObject: boolean = true;

    public params: CurrencyParams;

    // last one not at reel time
    initialExchangeRate: number;

    _quotedExchangeRate: number;

    constructor(params: CurrencyParams) {
        super(params);
    }

    init(lastExchangeRate?: number) {
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
    simulate(currPeriod: number) {
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

        } else {
            // TODO: develop
            this._quotedExchangeRate = params.baseRate || this.initialExchangeRate;
        }
    }

    get state(): any {
        return {
            "exchangeRatePerCent": this.quotedExchangeRate * 100 // regression
        };
    }
}
