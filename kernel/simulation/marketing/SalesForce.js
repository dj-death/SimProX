"use strict";
const Marketing_1 = require('../../engine/ComputeEngine/Marketing');
const ENUMS = require('../../engine/ComputeEngine/ENUMS');
let salesForceDefaultCostsParams = {
    minSupportPerAgent: 5000,
    dismissal: 5000,
    recruitment: 7500,
    training: 0
};
let defaultPayments = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};
function create() {
    let euroAgents = new Marketing_1.SalesForce({
        id: "agent1",
        label: "agent1",
        agentID: "0",
        marketID: "0",
        labourPoolID: "0",
        category: "Agents Commerciaux",
        isECommerceDistributor: false,
        isUnskilled: false,
        recruitedAvailability: ENUMS.FUTURES.THREE_MONTH,
        dismissedUnvailability: ENUMS.FUTURES.THREE_MONTH,
        maxTrainedNb: 0,
        isCommissionsBasedOnOrders: true,
        costs: salesForceDefaultCostsParams,
        payments: defaultPayments,
        attritionBaseRate: 0
    });
    let naftaDistributors = new Marketing_1.SalesForce({
        id: "agent2",
        label: "agent2",
        agentID: "1",
        marketID: "1",
        labourPoolID: "1",
        category: "Distributeurs Nafta",
        isECommerceDistributor: false,
        isUnskilled: false,
        recruitedAvailability: ENUMS.FUTURES.THREE_MONTH,
        dismissedUnvailability: ENUMS.FUTURES.THREE_MONTH,
        maxTrainedNb: 0,
        isCommissionsBasedOnOrders: false,
        costs: salesForceDefaultCostsParams,
        payments: defaultPayments,
        attritionBaseRate: 0
    });
    let internetDistributor = new Marketing_1.SalesForce({
        id: "agent3",
        label: "agent3",
        agentID: "2",
        marketID: "2",
        labourPoolID: "0",
        category: "Distributeur Internet",
        isECommerceDistributor: true,
        isUnskilled: false,
        recruitedAvailability: ENUMS.FUTURES.THREE_MONTH,
        dismissedUnvailability: ENUMS.FUTURES.THREE_MONTH,
        maxTrainedNb: 0,
        isCommissionsBasedOnOrders: false,
        costs: salesForceDefaultCostsParams,
        payments: defaultPayments,
        attritionBaseRate: 0
    });
    return [euroAgents, naftaDistributors, internetDistributor];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=SalesForce.js.map