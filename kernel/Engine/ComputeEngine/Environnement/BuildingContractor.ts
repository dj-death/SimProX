import * as IObject from '../IObject';

import { Economy }  from './Economy';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface BuildingContractorParams extends IObject.ObjectParams {
    BuildingContractorID?: string;

    checkClientCreditWorthiness: boolean;

    minWorksDuration: ENUMS.FUTURES;

    areCostsStable: boolean;

    economyID: string;

    pricesStats?: number[];
    basePrice?: number;
}

interface BuildingResult {
    duration: ENUMS.FUTURES;
    squaresNb: number;
}

export default class BuildingContractor extends IObject.IObject {
    departmentName = "environnement";
    protected isPersistedObject: boolean = true;

    public params: BuildingContractorParams;

    private economy: Economy;

    // last one not at reel time
    private initialBuildingSquareMetreCost: number;

    private _buildingSquareMetreCost: number;

    constructor(params: BuildingContractorParams) {
        super(params);
    }

    init(economy: Economy, lastBuildingSquareMetreCost: number) {
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
    
    

    build(requiredBuildingSquaresNb: number, client_creditWorthiness?: number): BuildingResult {
        var worksDuration = this.params.minWorksDuration;

        if (!this.params.checkClientCreditWorthiness) {
            return {
                squaresNb: requiredBuildingSquaresNb,
                duration: worksDuration
            }
        }

        var effectiveBuildingSquaresNb;
        var plannedBuildingTotalCost = requiredBuildingSquaresNb * this.initialBuildingSquareMetreCost;

        if (client_creditWorthiness > 0) {
            if (plannedBuildingTotalCost <= client_creditWorthiness) {
                effectiveBuildingSquaresNb = requiredBuildingSquaresNb;
            } else {
                // Verifiy
                effectiveBuildingSquaresNb = Math.floor(client_creditWorthiness / this.initialBuildingSquareMetreCost);
            }
        } else {
            effectiveBuildingSquaresNb = 0;
        }

        return {
            duration: worksDuration,
            squaresNb: effectiveBuildingSquaresNb
        };
    }


    simulate(currPeriod: number) {

        let params = this.params;

        if (params.areCostsStable) {
            this._buildingSquareMetreCost = this.initialBuildingSquareMetreCost;
            return;
        }

        let stats = params.pricesStats;

        if (stats && stats.length) {

            this._buildingSquareMetreCost = Utils.getStat(stats, currPeriod)

        } else {

            this._buildingSquareMetreCost = params.basePrice * this.economy.PPICommodity;
        }

    }


    get state(): any {
        var state = {
            "buildingCost": this._buildingSquareMetreCost
        };

        return state;
    }

}