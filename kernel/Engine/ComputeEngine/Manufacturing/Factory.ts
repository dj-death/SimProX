import * as Space from './Space';

import AbstractObject = require('./AbstractObject');

import Atelier from './Atelier';
import * as Warehouse from './Warehouse';
import SemiProduct from './SemiProduct';
import Land from './Land';

import { BuildingContractor, Economy } from '../Environnement';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface FactoryParams extends Space.SpaceParams {
    factoryID?: string;
    landID: string;
}

export default class Factory extends Space.Space  {
    departmentName = "production";

    public params: FactoryParams;


    constructor(params: FactoryParams) {
        super(params);
    }

    init(initialSize: number, land: Land, lastFactoryNetValue: number, economy: Economy, contractor: BuildingContractor = null, lastCreditWorthiness: number = Infinity) {
        super.init(initialSize, land, lastFactoryNetValue, economy, contractor);
    }

    get machiningSpaceUsed(): number {
        let total = this.spaceUsages[ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.MACHINES]];

        return Math.ceil(total);
    }

    get workersSpaceUsed(): number {
        let total = this.spaceUsages[ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.WORKERS]];

        return Math.ceil(total);
    }

    get stocksSpaceUsed(): number {
        let total = this.spaceUsages[ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.STOCKS]]

        return Math.ceil(total);
    }


    get circulationAndAccessSpace(): number {
        return this.reservedSpace;
    }


    get state(): any {
        return {
            "availableSpace": this.availableSpace,
            "machiningSpaceUsed": this.machiningSpaceUsed,
            "workersSpaceUsed": this.workersSpaceUsed,
            "stocksSpaceUsed": this.stocksSpaceUsed,
        };

    }

}