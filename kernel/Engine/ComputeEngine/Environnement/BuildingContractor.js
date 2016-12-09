"use strict";
const IObject = require('../IObject');
const Utils = require('../../../utils/Utils');
class BuildingContractor extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    init(economy, lastBuildingSquareMetreCost) {
        super.init();
        this.economy = economy;
        this.initialBuildingSquareMetreCost = lastBuildingSquareMetreCost;
    }
    reset() {
        super.reset();
        this._buildingSquareMetreCost = null;
        this.initialBuildingSquareMetreCost = null;
    }
    // result
    get buildingSquareMetreCost() {
        let initialExchangeRate = this.economy.currency.initialExchangeRate;
        let unitCost = this.initialBuildingSquareMetreCost * initialExchangeRate;
        return Math.round(unitCost);
    }
    get reelTimeBuildingSquareMetreCost() {
        let quotedExchangeRate = this.economy.currency.quotedExchangeRate;
        let unitCost = this._buildingSquareMetreCost * quotedExchangeRate;
        return Math.round(unitCost);
    }
    // helper
    build(requiredBuildingSquaresNb, client_creditWorthiness) {
        let worksDuration = this.params.minWorksDuration;
        if (!this.params.checkClientCreditWorthiness) {
            return {
                squaresNb: requiredBuildingSquaresNb,
                duration: worksDuration
            };
        }
        let effectiveBuildingSquaresNb;
        let plannedBuildingTotalCost = requiredBuildingSquaresNb * this.initialBuildingSquareMetreCost;
        if (client_creditWorthiness > 0) {
            if (plannedBuildingTotalCost <= client_creditWorthiness) {
                effectiveBuildingSquaresNb = requiredBuildingSquaresNb;
            }
            else {
                // Verifiy
                effectiveBuildingSquaresNb = Math.floor(client_creditWorthiness / this.initialBuildingSquareMetreCost);
            }
        }
        else {
            effectiveBuildingSquaresNb = 0;
        }
        return {
            duration: worksDuration,
            squaresNb: effectiveBuildingSquaresNb
        };
    }
    simulate(currPeriod) {
        let params = this.params;
        if (params.areCostsStable) {
            this._buildingSquareMetreCost = this.initialBuildingSquareMetreCost;
            return;
        }
        let stats = params.pricesStats;
        if (stats && stats.length) {
            this._buildingSquareMetreCost = Utils.getStat(stats, currPeriod);
        }
        else {
            this._buildingSquareMetreCost = params.basePrice * this.economy.PPICommodity;
        }
    }
    get state() {
        let state = {
            "buildingCost": this._buildingSquareMetreCost
        };
        return state;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BuildingContractor;
//# sourceMappingURL=BuildingContractor.js.map