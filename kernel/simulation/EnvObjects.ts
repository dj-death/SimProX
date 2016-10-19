import economies = require('./environnement/Economies');
import centralBanks = require('./environnement/CentralBanks');
import stockMarkets = require('./environnement/StockMarkets');
import banks = require('./environnement/Banks');
import materialsMarkets = require('./environnement/MaterialsMarkets');
import currencies = require('./environnement/Currencies');
import stakeholders = require('./environnement/Stakeholders');
import labourPools = require('./environnement/LabourPools');



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


export = objects;