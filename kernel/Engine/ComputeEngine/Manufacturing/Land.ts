import * as Space from './Space';

import { BuildingContractor, Economy } from '../Environnement';

import Factory from './Factory';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface LandParams extends Space.SpaceParams {
    landID?: string;
}

export default class Land extends Space.Space {
    departmentName = "production";

    factories: Factory[];
    lastLandNetValue: number;

    public params: LandParams;

    constructor(params: LandParams) {
        super(params);
    }

    init(initialSize: number, peripherySpace: Space.Space, lastLandNetValue: number, economy: Economy, contractor: BuildingContractor = null, factories?: Factory[]) {
        super.init(initialSize, peripherySpace, lastLandNetValue, economy, contractor);


        if (isNaN(lastLandNetValue)) {
            console.warn("lastLandNetValue NaN");

            lastLandNetValue = 0;
        }


        this.factories = factories;
        this.lastLandNetValue = lastLandNetValue;

        this.usedSpace = this.factoriesInitialSpace;
    }

    get accessAndParkingSpace(): number {
        return this.reservedSpace;
    }

    get factoriesInitialSpace(): number {
        return Utils.sums(this.factories, "availableSpaceAtStart");
    }

    get factoriesSpace(): number {
        return Utils.sums(this.factories, "availableSpace");
    }

    get state(): any {

        return {
            "availableSpace": this.availableSpace
        };

    }

}