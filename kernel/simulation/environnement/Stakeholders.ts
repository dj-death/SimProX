import { BuildingContractor } from '../../engine/ComputeEngine/Environnement';
import ENUMS = require('../../engine/ComputeEngine/ENUMS');

var buildingContractor = new BuildingContractor({
    id: "buildingContractor1",
    label: "buildingContractor1",

    BuildingContractorID: "0",

    checkClientCreditWorthiness: true,
    minWorksDuration: ENUMS.FUTURES.THREE_MONTH,
    areCostsStable: false,

    economyID: "0", // europe

    basePrice: 500
});

export = {
    buildingContractors: [buildingContractor]
};

