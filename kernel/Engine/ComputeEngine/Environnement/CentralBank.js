"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var CentralBank = (function (_super) {
    __extends(CentralBank, _super);
    function CentralBank(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    CentralBank.prototype.init = function (lastInterestBaseRate) {
        _super.prototype.init.call(this);
        if (isNaN(lastInterestBaseRate)) {
            console.warn("lastInterestBaseRate NaN");
            lastInterestBaseRate = this.params.baseInterestBaseRate;
        }
        this.initialInterestBaseRate = lastInterestBaseRate;
    };
    CentralBank.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.initialInterestBaseRate = null;
        this._interestBaseRate = null;
        this._treasuryBondsInterestRate = null;
    };
    Object.defineProperty(CentralBank.prototype, "interestBaseRate", {
        // result
        get: function () {
            return this._interestBaseRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CentralBank.prototype, "treasuryBondsInterestRate", {
        // à maturité 10 ans 
        get: function () {
            return this._treasuryBondsInterestRate;
        },
        enumerable: true,
        configurable: true
    });
    // action
    CentralBank.prototype.simulate = function (currPeriod) {
        var params = this.params;
        var interestStats = params.interestBaseRateStats;
        var tbStats = params.treasuryBondsInterestRateStats;
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
    };
    return CentralBank;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CentralBank;
//# sourceMappingURL=CentralBank.js.map