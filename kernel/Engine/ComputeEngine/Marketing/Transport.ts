import * as IObject from '../IObject';

import Market from './Market';

import { Economy } from '../Environnement';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



interface TransportParams extends IObject.ObjectParams {
    transportID?: string;

    shipmentDistance: number;
    distanceLimit: number;

    mixedLoads: boolean;

    costs: {
        containerDailyHireCost: number;
        containerShipmentCost: number;
        productStorageCost: number;
    };

    payments: ENUMS.PaymentArray;

    marketID: string;
}



export default class Transport extends IObject.IObject {
    departmentName = "marketing";

    public params: TransportParams;

    market: Market;

    economy: Economy;

    constructor(params: TransportParams) {
        super(params);
    }

    init(market: Market, economy: Economy) {
        super.init()

        this.market = market;
        this.economy = economy;
    }

    reset() {
        super.reset();

        this.totalContainersNb = 0;
    }

    totalContainersNb: number;

    get containerDaysNb(): number {
        return Math.ceil(this.journeyLength / this.params.distanceLimit) * this.loadsNb;
    }

    // results
    get loadsNb(): number {
        return Math.ceil(this.totalContainersNb);
    }

    get journeyLength(): number {
        return this.params.shipmentDistance * 2;
    }

    // cost
    get hiredTransportCost(): number {
        let inflationImpact = this.economy.PPIServices;

        let containerDailyHireCost = Math.round(this.params.costs.containerShipmentCost * inflationImpact);
        let containerShipmentCost = Math.round(this.params.costs.containerShipmentCost * inflationImpact);

        let cost = 0;

        cost += this.containerDaysNb * containerDailyHireCost;
        cost += this.loadsNb * containerShipmentCost;

        return cost;
    }


    load(containersNb: number) {
        if (!this.isInitialised()) {
            return false;
        }

        if (! this.params.mixedLoads) {
            containersNb = Math.ceil(containersNb); // forget me 0.5 container no just integral containers
        }

        this.totalContainersNb += containersNb;
    }

    onFinish() {
        this.CashFlow.addPayment(this.hiredTransportCost, this.params.payments, 'hiredTransport');
    }

    get state(): any {

        return {
            "journeyLength": this.journeyLength,
            "loadsNb": this.loadsNb
        };

    }
}