"use strict";
const IObject = require('../IObject');
class Transport extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "marketing";
    }
    init(market, economy) {
        super.init();
        this.market = market;
        this.economy = economy;
    }
    reset() {
        super.reset();
        this.totalContainersNb = 0;
    }
    get containerDaysNb() {
        return Math.ceil(this.journeyLength / this.params.distanceLimit) * this.loadsNb;
    }
    // results
    get loadsNb() {
        return Math.ceil(this.totalContainersNb);
    }
    get journeyLength() {
        return this.params.shipmentDistance * 2;
    }
    // cost
    get hiredTransportCost() {
        let inflationImpact = this.economy.PPIServices;
        let containerDailyHireCost = Math.round(this.params.costs.containerShipmentCost * inflationImpact);
        let containerShipmentCost = Math.round(this.params.costs.containerShipmentCost * inflationImpact);
        let cost = 0;
        cost += this.containerDaysNb * containerDailyHireCost;
        cost += this.loadsNb * containerShipmentCost;
        return cost;
    }
    load(containersNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!this.params.mixedLoads) {
            containersNb = Math.ceil(containersNb); // forget me 0.5 container no just integral containers
        }
        this.totalContainersNb += containersNb;
    }
    onFinish() {
        this.CashFlow.addPayment(this.hiredTransportCost, this.params.payments, 'hiredTransport');
    }
    get state() {
        return {
            "journeyLength": this.journeyLength,
            "loadsNb": this.loadsNb
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transport;
//# sourceMappingURL=Transport.js.map