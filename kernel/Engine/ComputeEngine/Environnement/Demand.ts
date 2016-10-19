import * as IObject from '../IObject';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


interface CustomerPreferences {
    pricePrefs: {
        priceFloor: number;
        priceNormal: number;
        priceCeiling: number;
    }
}

interface DemandParams extends IObject.ObjectParams {
    customerPreferences: CustomerPreferences;
}

export default class Demand extends IObject.IObject {
    departmentName = "environnement";
    protected isPersistedObject: boolean = true;

    public params: DemandParams;

    constructor(params: DemandParams) {
        super(params);
    }

    init() {
        super.init();
    }

    // actions
    order(quantity: number) {

    }
    
}
