"use strict";
const IObject = require('../IObject');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class CentralBank extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    init(lastInterestBaseRate) {
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
    get treasuryBondsInterestRate() {
        return this._treasuryBondsInterestRate;
    }
    // action
    simulate(currPeriod) {
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
        }
        else {
            // TODO develop
            this._interestBaseRate = params.baseInterestBaseRate / 100;
        }
        // treasury
        if (tbStats && tbStats.length) {
            this._treasuryBondsInterestRate = Utils.getStat(tbStats, currPeriod) / 100;
        }
        else {
            // TODO develop
            this._treasuryBondsInterestRate = params.baseTreasuryBondsInterestRate / 100;
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CentralBank;
//# sourceMappingURL=CentralBank.js.map