import * as IObject from '../IObject';

import { Economy }  from './Economy';

import Game = require('../../../simulation/Games');


import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface CentralBankParams extends IObject.ObjectParams {
    centralBankID?: string;

    isMoneyMarketStable: boolean;

    economyID: string;

    interestBaseRateStats?: number[];
    baseInterestBaseRate?: number;

    treasuryBondsInterestRateStats?: number[];
    baseTreasuryBondsInterestRate?: number;
}



export default class CentralBank extends IObject.IObject {
    departmentName = "environnement";
    protected isPersistedObject: boolean = true;

    public params: CentralBankParams;

    economy: Economy;

    initialInterestBaseRate: number;

    private _interestBaseRate: number;
    private _treasuryBondsInterestRate: number;

    constructor(params: CentralBankParams) {
        super(params);
    }

    init(lastInterestBaseRate: number) {
        super.init();

        if (isNaN(lastInterestBaseRate)) {
            console.warn("lastInterestBaseRate NaN");

            lastInterestBaseRate = this.params.baseInterestBaseRate;
        }

        this.initialInterestBaseRate = lastInterestBaseRate;
    }

    reset() {
        super.reset();

        this.initialInterestBaseRate = null;
        this._interestBaseRate = null;

        this._treasuryBondsInterestRate = null;
    }

    // result
    get interestBaseRate() {
        return this._interestBaseRate;
    }

    // à maturité 10 ans 
    get treasuryBondsInterestRate(): number {
        return this._treasuryBondsInterestRate;
    }

    // action
    simulate(currPeriod: number) {
        let params = this.params;

        let interestStats = params.interestBaseRateStats;
        let tbStats = params.treasuryBondsInterestRateStats;

        if (params.isMoneyMarketStable) {
            this._interestBaseRate = this.initialInterestBaseRate;
            this._treasuryBondsInterestRate = params.baseTreasuryBondsInterestRate / 100;

            return;
        }
        

        // interestStats
        if (interestStats && interestStats.length) {
            //let periodDuration_quartersNb = Math.ceil(Game.daysNbByPeriod / 90);

            this._interestBaseRate = Utils.getStat(interestStats, currPeriod) / 100;

        } else {

            // TODO develop
            this._interestBaseRate = params.baseInterestBaseRate / 100;
        }


        // treasury
        if (tbStats && tbStats.length) {

            this._treasuryBondsInterestRate = Utils.getStat(tbStats, currPeriod) / 100;

        } else {

            // TODO develop
            this._treasuryBondsInterestRate = params.baseTreasuryBondsInterestRate / 100;
        }

    }
}