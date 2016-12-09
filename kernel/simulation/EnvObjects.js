"use strict";
const economies = require('./environnement/Economies');
const centralBanks = require('./environnement/CentralBanks');
const stockMarkets = require('./environnement/StockMarkets');
const banks = require('./environnement/Banks');
const materialsMarkets = require('./environnement/MaterialsMarkets');
const currencies = require('./environnement/Currencies');
const stakeholders = require('./environnement/Stakeholders');
const labourPools = require('./environnement/LabourPools');
let objects = {
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