import { SalesForce }  from '../../engine/ComputeEngine/Marketing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');



var salesForceDefaultCostsParams = {
    minSupportPerAgent: 5000,
    
    dismissal: 5000,
    recruitment: 7500,
    training: 0
};

var defaultPayments: ENUMS.PaymentArray = {
    "CASH": {
        credit: ENUMS.CREDIT.CASH,
        part: 1
    }
};

export default function create(): SalesForce[] {

    var euroAgents = new SalesForce({
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

    var naftaDistributors = new SalesForce({
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

    var internetDistributor = new SalesForce({
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

