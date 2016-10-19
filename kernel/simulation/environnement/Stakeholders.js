"use strict";
var Environnement_1 = require('../../engine/ComputeEngine/Environnement');
var ENUMS = require('../../engine/ComputeEngine/ENUMS');
var buildingContractor = new Environnement_1.BuildingContractor({
    id: "buildingContractor1",
    label: "buildingContractor1",
    BuildingContractorID: "0",
    checkClientCreditWorthiness: true,
    minWorksDuration: ENUMS.FUTURES.THREE_MONTH,
    areCostsStable: false,
    economyID: "0",
    basePrice: 500
});
module.exports = {
    buildingContractors: [buildingContractor]
};
//# sourceMappingURL=Stakeholders.js.map