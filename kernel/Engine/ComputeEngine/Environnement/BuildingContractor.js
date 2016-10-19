"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Utils = require('../../../utils/Utils');
var BuildingContractor = (function (_super) {
    __extends(BuildingContractor, _super);
    function BuildingContractor(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    BuildingContractor.prototype.init = function (economy, lastBuildingSquareMetreCost) {
        _super.prototype.init.call(this);
        this.economy = economy;
        this.initialBuildingSquareMetreCost = lastBuildingSquareMetreCost;
    };
    BuildingContractor.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this._buildingSquareMetreCost = null;
        this.initialBuildingSquareMetreCost = null;
    };
    Object.defineProperty(BuildingContractor.prototype, "buildingSquareMetreCost", {
        // result
        get: function () {
            var initialExchangeRate = this.economy.currency.initialExchangeRate;
            var unitCost = this.initialBuildingSquareMetreCost * initialExchangeRate;
            return Math.round(unitCost);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BuildingContractor.prototype, "reelTimeBuildingSquareMetreCost", {
        get: function () {
            var quotedExchangeRate = this.economy.currency.quotedExchangeRate;
            var unitCost = this._buildingSquareMetreCost * quotedExchangeRate;
            return Math.round(unitCost);
        },
        enumerable: true,
        configurable: true
    });
    // helper
    BuildingContractor.prototype.build = function (requiredBuildingSquaresNb, client_creditWorthiness) {
        var worksDuration = this.params.minWorksDuration;
        if (!this.params.checkClientCreditWorthiness) {
            return {
                squaresNb: requiredBuildingSquaresNb,
                duration: worksDuration
            };
        }
        var effectiveBuildingSquaresNb;
        var plannedBuildingTotalCost = requiredBuildingSquaresNb * this.initialBuildingSquareMetreCost;
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
    };
    BuildingContractor.prototype.simulate = function (currPeriod) {
        var params = this.params;
        if (params.areCostsStable) {
            this._buildingSquareMetreCost = this.initialBuildingSquareMetreCost;
            return;
        }
        var stats = params.pricesStats;
        if (stats && stats.length) {
            this._buildingSquareMetreCost = Utils.getStat(stats, currPeriod);
        }
        else {
            this._buildingSquareMetreCost = params.basePrice * this.economy.PPICommodity;
        }
    };
    Object.defineProperty(BuildingContractor.prototype, "state", {
        get: function () {
            var state = {
                "buildingCost": this._buildingSquareMetreCost
            };
            return state;
        },
        enumerable: true,
        configurable: true
    });
    return BuildingContractor;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BuildingContractor;
//# sourceMappingURL=BuildingContractor.js.map