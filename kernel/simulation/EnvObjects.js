"use strict";
var economies = require('./environnement/Economies');
var centralBanks = require('./environnement/CentralBanks');
var stockMarkets = require('./environnement/StockMarkets');
var banks = require('./environnement/Banks');
var materialsMarkets = require('./environnement/MaterialsMarkets');
var currencies = require('./environnement/Currencies');
var stakeholders = require('./environnement/Stakeholders');
var labourPools = require('./environnement/LabourPools');
var objects = {
    world: economies.world,
    economies: economies.economies,
    currencies: currencies,
    centralBanks: centralBanks,
    banks: banks,
    labourPools: labourPools,
    materialsMarkets: materialsMarkets,
    buildingContractors: stakeholders.buildingContractors,
    stockMarkets: stockMarkets
};
module.exports = objects;
//# sourceMappingURL=EnvObjects.js.map