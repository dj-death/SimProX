import { Warehouse } from '../Manufacturing';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


class Pool extends Warehouse {
    static counter: number = 0;
    
    constructor() {
        ++ Pool.counter;
        var ID = "pool" + Pool.counter;

        var defaultParams = {
            id: ID,
            label: ID,
            lostProbability: 0,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 0
            }
        };

        super(defaultParams);

        this.isPersistedObject = true;
    }

    reset() {
        super.reset();

        Pool.counter = 0;
    }

    employ(quantity: number): number {
        return this.moveOut(quantity);
    }

    train(quantity: number) {
        return this.moveOut(quantity);
    }

    // remember to see if we need to set future
    free(quantity: number) {
        this.moveIn(quantity);
    }
}

export default class LabourPool {

    private unemployedUnskilledPool: Pool;

    private unemployedSkilledPool: Pool;
    private employedSkilledPool: Pool;

    constructor() {
        this.unemployedSkilledPool = new Pool();
        this.unemployedUnskilledPool = new Pool();
        this.employedSkilledPool = new Pool();
    }

    init(unemployedSkilledNb: number, unemployedUnskilledNb: number, employedSkilledNb: number) {
        this.unemployedSkilledPool.init(unemployedSkilledNb);

        this.unemployedUnskilledPool.init(unemployedUnskilledNb);

        this.employedSkilledPool.init(employedSkilledNb);
    }


    employ(quantity: number, isUnskilled: boolean): number {
        var effectiveQ: number,
            restQ: number;

        if (isUnskilled) {
            effectiveQ = this.unemployedUnskilledPool.employ(quantity);

        } else {

            effectiveQ = this.unemployedSkilledPool.employ(quantity);
            restQ = quantity - effectiveQ;

            if (restQ > 0) {
                effectiveQ += this.employedSkilledPool.employ(quantity);
            }
        }

        return effectiveQ;
    }

    train(quantity: number, lookForUnskilled: boolean = true): number {
        var effectiveQ: number;

        if (lookForUnskilled) {
            effectiveQ = this.unemployedUnskilledPool.train(quantity);

        } else {

            effectiveQ = this.unemployedSkilledPool.train(quantity);
        }

        return effectiveQ;
    }

}