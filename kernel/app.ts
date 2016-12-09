import * as Scenario from './Engine/Scenario';

import ObjectsManager from './engine/ComputeEngine/ObjectsManager';
import { Factory as ObjectsFactory, GameObjects } from './engine/ComputeEngine/ObjectsFactory';


import { Marketplace } from './engine/ScoringEngine';



import ENUMS = require('./Engine/ComputeEngine/ENUMS');
import Utils = require('./utils/Utils');
import console = require('./utils/logger');

import Q = require('q');

import DataHelpers from './utils/DataHelpers';

import $jStat = require("jstat");

let jStat = $jStat.jStat;

/*
let redis = require("redis");

let resultsPublisher = redis.createClient();
let decisionsSubscriber = redis.createClient();


decisionsSubscriber.subscribe('sim:decisions');

decisionsSubscriber.on('message', function (channel, data) {
    let data = JSON.parse(data);

    let decision = data.decision;
    let playerAllLastStates = data.playerAllLastStates;
    let playerID = data.playerID

    setDecisions(decision, playerAllLastStates, playerID);

    resultsPublisher.publish('decisionSet', result);
});


subscriber.on('subscribe', function () { process.send('ok') }) 

*/

import * as Prod from './Engine/ComputeEngine/Manufacturing';
import * as Mkg from './Engine/ComputeEngine/Marketing';
import * as Env from './Engine/ComputeEngine/Environnement';
import * as Fin from './Engine/ComputeEngine/Finance';
import * as Rh from './Engine/ComputeEngine/Personnel';

import { Environnement } from './engine/ComputeEngine/Environnement';


import envObj = require('./simulation/EnvObjects');

let exchangeRateEurosPerDollar;


// for const purpose
import * as machineries from './simulation/manufacturing/Machineries';

let CONSTS = {
    assemblyWorker_shiftLevel: 1,
    assemblyMaterial: 0,

    machinists_strikeNextPeriodWeeksNb: 0,

    alphaA_consoUnit: 1,
    alphaB_consoUnit: 2,
    alphaC_consoUnit: 3,

    HQMaterials_premium: 0.5,

    // minutes
    machiningTimes: [
        60,
        75,
        120
    ],

    minAssemblyTimes: [
        100,
        150,
        300
    ],

    p1_unitValue: 98.85,
    p2_unitValue: 157.18,
    p3_unitValue: 254.74,

    unitValues: [98.85, 157.18, 254.74],

    internet_agents_appointedNb: 1,

    machinesStats: machineries.machinesStates
};





function getImprovementType(str: string) {
    return ENUMS.IMPROVEMENT_TYPE[str.toUpperCase()];
}


export function _getEnvObjects(): any {
    envObj["Envrionnement"] = Environnement;

    return envObj;
}

export function getObjects(playerID: string | number): GameObjects {
    return ObjectsFactory.getObjects(playerID);
}

export function _getOM(): any {
    return ObjectsManager;
}

export function _getMarketplace(): any {
    return Marketplace;
}

export function _getOF(): any {
    return ObjectsFactory;
}

export function launchSim() {
    ObjectsFactory.init();
    ObjectsManager.init(false);
}

export function initEnvironnemet(currPeriod: number, lastEnvResults: Scenario.Results[]) {
    let playerLastPeriodRes = lastEnvResults[lastEnvResults.length - 1];

    envObj.currencies.forEach(function (oCurrency: Env.Currency, idx: number) {
        if (!oCurrency || !oCurrency.params) {
            return;
        }

        let economyID = oCurrency.params.economyID || idx;
        let economyLastRes = playerLastPeriodRes.economies[economyID];
        let exchangeRate = economyLastRes.exchangeRatePerCent / 100;

        oCurrency.init(exchangeRate);
    });

    console.silly("currency ok");


    envObj.stockMarkets.forEach(function (oStockMarket: Env.StockMarket, idx: number) {
        if (!oStockMarket || !oStockMarket.params) {
            return;
        }


        oStockMarket.init();
    });

    console.silly("Stock market ok");


    envObj.centralBanks.forEach(function (oCBank: Env.CentralBank, idx: number) {
        if (!oCBank || !oCBank.params) {
            return;
        }

        let economyID = oCBank.params.economyID || idx;
        let economyLastRes = playerLastPeriodRes.economies[economyID];
        let interestBaseRatePerThousand = economyLastRes.interestBaseRatePerThousand;

        oCBank.init(interestBaseRatePerThousand / 1000);
    });

    console.silly("Cbank ok");

    // banks
    envObj.banks.forEach(function (oBank: Env.Bank, idx: number) {
        if (!oBank || !oBank.params) {
            return;
        }

        let centralBankID = oBank.params.centralBankID || idx;
        let oCentralBank = envObj.centralBanks[idx];

        oBank.init(oCentralBank);
    });

    console.silly("banks ok");

    // init economics
    envObj.economies.forEach(function (oEconomy: Env.Economy, idx: number) {
        if (!oEconomy || !oEconomy.params) {
            return;
        }

        let currencyID = oEconomy.params.currencyID || idx;
        let oCurrency: Env.Currency = envObj.currencies[currencyID];


        let centralBankID = oEconomy.params.centralBankID || idx;
        let oCentralBank: Env.CentralBank = envObj.centralBanks[centralBankID];

        let labourPoolID = oEconomy.params.labourPoolID || idx;
        let oLabourPool: Env.LabourPool = envObj.labourPools[labourPoolID];

        let stockMarketID = oEconomy.params.stockMarketID || idx;
        let oStockMarket: Env.StockMarket = envObj.stockMarkets[stockMarketID];

        console.silly("now let init economies");

        let economicLastPRes = playerLastPeriodRes.economies[idx];

        oEconomy.init(oCurrency, oLabourPool, oCentralBank, oStockMarket, economicLastPRes);
    });



    let oWorld = envObj.world;
    let oWorldCurrency: Env.Currency = envObj.currencies[oWorld.params.currencyID];

    oWorld.init(oWorldCurrency);



    console.silly("economies ok");

    // init materials market
    envObj.materialsMarkets.forEach(function (oMaterialMarket: Env.MaterialMarket, idx: number) { // each material type markets
        if (!oMaterialMarket || !oMaterialMarket.params) {
            return;
        }

        let economyID = oMaterialMarket.params.economyID || idx;
        let materialID = oMaterialMarket.params.materialID;

        let oEconomy: Env.Economy = envObj.economies[economyID];

        // TODO hard code
        let lastMaterialMarketRes = playerLastPeriodRes.materialMarkets[idx];
        let lastPrices = [lastMaterialMarketRes.spotPrice, lastMaterialMarketRes.threeMthPrice, lastMaterialMarketRes.sixMthPrice];

        oMaterialMarket.init(oEconomy, lastPrices);
    });

    console.silly("material markets ok");

    envObj.buildingContractors.forEach(function (oBuildContractor: Env.BuildingContractor, idx: number) {
        if (!oBuildContractor || !oBuildContractor.params) {
            return;
        }

        let economyID = oBuildContractor.params.economyID || idx;
        let oEconomy: Env.Economy = envObj.economies[economyID];

        let buildContractorLastRes = playerLastPeriodRes.buildingContractors[idx];
        let lastBuildingCost = buildContractorLastRes.buildingCost;

        oBuildContractor.init(oEconomy, lastBuildingCost);
    });

    console.silly("bulding contractors ok");


    Environnement.init();
    Environnement.register(ObjectsManager.retrieve(null, "environnement", true));

    Marketplace.init();
}

export function simulateEnv(currPeriod: number) {

    envObj.economies.forEach(function (oEconomy: Env.Economy, idx: number) {
        if (!oEconomy || !oEconomy.params) {
            return;
        }

        oEconomy.simulate(currPeriod);
    });

    envObj.materialsMarkets.forEach(function (oMaterialMarket: Env.MaterialMarket, idx: number) { // each material type markets
        if (!oMaterialMarket || !oMaterialMarket.params) {
            return;
        }

        oMaterialMarket.simulate(currPeriod);
    });

    envObj.buildingContractors.forEach(function (oBuildingContractor: Env.BuildingContractor, idx: number) {
        if (!oBuildingContractor || !oBuildingContractor.params) {
            return;
        }

        oBuildingContractor.simulate(currPeriod);
    });


    envObj.centralBanks.forEach(function (oCBank: Env.CentralBank, idx: number) {
        if (!oCBank || !oCBank.params) {
            return;
        }

        oCBank.simulate(currPeriod);
    });

}


function setCurrentPlayer(playerID: number | string): GameObjects {
    ObjectsManager.setCurrentPlayer(playerID);

    console.silly("current player " + playerID);

    return ObjectsFactory.getObjects(playerID);
}



export function initialize(playerID: string | number, currPeriod: number, lastDecisions: Scenario.Decision[], lastPeriodsResults: Scenario.Results[], envLastStates: Scenario.Results[]) {

    let lastPeriod = currPeriod - 1;

    let lastPeriodIdx = lastPeriodsResults.length - 1,
        lastDec = lastDecisions[lastPeriodIdx], // last one is for the current period
        lastResults = lastPeriodsResults[lastPeriodIdx],
        envLastState = envLastStates[lastPeriodIdx];

    let statesByCollection = DataHelpers(lastDecisions, lastPeriodsResults);

    let corporateLastRes = envLastState.BI.corporates[Number(playerID) - 1];

    let lastCreditWorthiness = !isNaN(lastResults.creditWorthiness) ? lastResults.creditWorthiness : (lastResults.nextPBorrowingPower + lastResults.cashValue);


    global.debug_data.corporateLastRes = corporateLastRes;
    global.debug_data.envLastStateMY = envLastState;
    global.debug_data.playerID = playerID;


    let o = setCurrentPlayer(playerID);

    if (!o) {
        console.error("Players objects not yet created");
        return;
    }



    console.silly('begin OM initialisation succes');




    console.silly('begin Game initialisation succes');
    // init the game
    o.game.init();


    // init as many of objects depend on it
    console.silly('Finance initialisation succes');

    let oLocalEconomy: Env.Economy = envObj.economies.filter(function (oEconomy) {
        return oEconomy.params.isLocal;
    })[0];

    let initialCashFlowBalance = !isNaN(lastResults.cashFlowBalance) ? lastResults.cashFlowBalance : ((lastResults.netCashFlow + lastResults.previousBalance) || (lastResults.cashValue - lastResults.banksOverdraft));
    let lastTradePayablesValue = lastResults.tradePayablesValue;
    let lastTradeReceivablesValue = lastResults.tradeReceivablesValue;
    let lastTaxableProfitLoss = lastResults.taxableProfitLoss;

    // TODO multi account
    o.CashFlow.init(o.bankAccounts[0], o.game.daysNbByPeriod, initialCashFlowBalance, lastTradePayablesValue, lastTradeReceivablesValue);

    o.CashFlow.cover(o);

    console.silly('Cash initialisation succes');


    console.silly('begin Fac initialisation succes');

    o.suppliers.forEach(function (oSupplier: Env.Supplier<Prod.RawMaterial>, idx: number) {
        if (!oSupplier || !oSupplier.params) {
            return;
        }

        let materialID = oSupplier.params.materialID || idx;
        let materialMarketID = oSupplier.params.materialMarketID || idx;

        let oMaterial: Prod.RawMaterial = o.materials[materialID];
        let oMaterialMarket: Env.MaterialMarket = envObj.materialsMarkets[materialMarketID];

        oSupplier.init(oMaterial, oMaterialMarket, oLocalEconomy);

    });

    console.silly("suppliers ok");

    o.subContracters.forEach(function (oSubContracter: Env.SubContracter, idx: number) {
        if (!oSubContracter || !oSubContracter.params) {
            return;
        }

        let supplierID = oSubContracter.params.supplierID || 0;
        let oSupplier: Env.Supplier<Prod.RawMaterial> = o.suppliers[supplierID];

        let oSubProducts = o.subProducts.filter(function (oSubProduct, idz) {
            let subProductID = oSubProduct.params.subProductID || idz.toString();

            return oSubContracter.params.offeredSubProductsIDs.indexOf(subProductID) !== -1;
        });

        // TODO: multi subpdt by one subcontracter
        oSubContracter.init(oSubProducts[0], null, oLocalEconomy, oSupplier);
    });

    console.silly("subcontracters ok");


    // init
    o.factories.forEach(function (oFactory: Prod.Factory, idx: number) {
        if (!oFactory || !oFactory.params) {
            return;
        }

        let factoryID = oFactory.params.factoryID || idx.toString();

        let landID = oFactory.params.landID;
        let oLand: Prod.Land = o.lands[landID];

        let oBuildContractor: Env.BuildingContractor = envObj.buildingContractors[0];

        let oAteliers = o.ateliers.filter(function (oAtelier: Prod.Atelier) {
            return oAtelier.params.factoryID === factoryID;
        });

        let factoryLastRes = lastResults.factories[idx];
        let lastAvailableSpace = factoryLastRes.availableSpace;
        let lastNetValue = Utils.isNumericValid(factoryLastRes.netValue) ? factoryLastRes.netValue : lastResults.buildingsNetValue;

        // accept multy contractors
        oFactory.init(lastAvailableSpace, oLand, lastNetValue, oLocalEconomy, oBuildContractor, lastCreditWorthiness);
        console.silly('factory initialisation %d ', oFactory.isInitialised());
    });



    o.lands.forEach(function (oLand: Prod.Land, idx: number) {
        if (!oLand || !oLand.params) {
            return;
        }

        let landID = oLand.params.landID || idx;

        let oBuildContractor: Env.BuildingContractor = envObj.buildingContractors[0];

        let oFactories = o.factories.filter(function (oFactory: Prod.Factory) {
            return oFactory.params.landID === landID;
        });

        let landLastRes = lastResults.lands[idx];
        let lastAvailableSpace = landLastRes.availableSpace;
        let lastNetValue = Utils.isNumericValid(landLastRes.netValue) ? landLastRes.netValue : lastResults.landNetValue;

        oLand.init(lastAvailableSpace, oLand, lastNetValue, oLocalEconomy, oBuildContractor, lastCreditWorthiness, oFactories);
    });

    console.silly('land initialisation succes');



    // machines
    o.machineries.forEach(function (oMachinery: Prod.Machinery, idx: number) {
        if (!oMachinery || !oMachinery.params) {
            return;
        }

        let machineryLastRes = lastResults.machineries[idx];
        let lastAvailablesNextPeriodNb = machineryLastRes.availablesNextPeriodNb;

        let lastMachineryNetValue = Utils.isNumericValid(machineryLastRes.machineryNetValue) ? machineryLastRes.machineryNetValue : lastResults.machineryNetValue;
        let lastMachinesStats = machineryLastRes.stats;

        if (!lastMachinesStats || !lastMachinesStats.length) {
            lastMachinesStats = [];
            for (let i = 0; i < lastAvailablesNextPeriodNb; i++) {
                let state = CONSTS.machinesStats[idx][i] || lastMachinesStats[idx][i]; // see if i - 1 it right
                lastMachinesStats.push(state);
            }
        }


        oMachinery.init(lastMachinesStats, lastMachineryNetValue, oLocalEconomy);
    });

    console.silly('machine initialisation succes');

    // materials
    o.rmWarehouses.forEach(function (oRmWarehouse: Prod.RMWarehouse, idx: number) {
        if (!oRmWarehouse || !oRmWarehouse.params) {
            return;
        }

        let materialID = oRmWarehouse.params.materialID || idx;
        let materialLastRes = lastResults.materials[materialID];
        let materialLastDec = lastDec.materials[materialID];


        let oMaterialaMarket = envObj.materialsMarkets.filter(function (oMaterialMarket: Env.MaterialMarket) {
            return oMaterialMarket.params.materialID === materialID;
        })[0];

        let lastMaterialMarket = envLastState.materialMarkets[oMaterialaMarket.params.materialMarketID];

        let lastClosingQ = materialLastRes.closingQ;
        let lastClosingValue = Utils.isNumericValid(materialLastRes.closingValue) ? materialLastRes.closingValue : lastResults.materialsInventoriesValue;
        let lastDeliveryNextPBoughtBeforeLastPQ = materialLastRes.deliveryNextPBoughtBeforeLastPQ;
        let lastDeliveryNextPBoughtBeforeLastPValue = materialLastRes.deliveryNextPBoughtBeforeLastPValue;

        let lastPurchases_3mthQ = materialLastDec.purchases[1].quantity;
        let lastPurchases_3mthValue = materialLastDec.purchases[1].quantity * lastMaterialMarket.price3mth;
        let lastPurchases_6mthQ = materialLastDec.purchases[2].quantity;
        let lastPurchases_6mthValue = materialLastDec.purchases[2].quantity * lastMaterialMarket.price6mth;

        let oFactory = o.factories.filter(function (oFac: Prod.Factory) {
            return oFac.params.factoryID === oRmWarehouse.params.factoryID;
        })[0];

        console.silly('alll rm good');

        oRmWarehouse.init(lastClosingQ, lastClosingValue,
            lastDeliveryNextPBoughtBeforeLastPQ, lastDeliveryNextPBoughtBeforeLastPValue,
            lastPurchases_3mthQ, lastPurchases_3mthValue,
            lastPurchases_6mthQ, lastPurchases_6mthValue,
            oFactory);
    });

    console.silly('rmw initialisation succes');

    o.materials.forEach(function (oMaterial: Prod.RawMaterial, idx: number) {
        if (!oMaterial || !oMaterial.params) {
            return;
        }

        let materialID = oMaterial.params.materialID || idx.toString();

        let oSuppliers = o.suppliers.filter(function (oSupplier: Env.Supplier<Prod.RawMaterial>) {
            return oSupplier.params.materialID === materialID;
        });

        let oRmWarehouse: Prod.RMWarehouse = o.rmWarehouses[idx];

        // TODO multi suppliers
        oMaterial.init(oSuppliers, oRmWarehouse);
    });

    console.silly('mat initialisation succes');

    // workers
    o.workers.forEach(function (oWorker: Prod.Worker, idx: number) {
        if (!oWorker || !oWorker.params) {
            return;
        }

        let labourPoolID = oWorker.params.labourPoolID || 0;
        let oLabourPool = envObj.labourPools[0];

        let machineryID = oWorker.params.machineryID;
        let oMachinery: Prod.Machinery = machineryID ? o.machineries[machineryID] : null;

        let workerLastRes = lastResults.workers[idx];
        let lastAvailablesNextPeriodNb = workerLastRes.availablesNextPeriodNb;

        oWorker.init(lastAvailablesNextPeriodNb, oLabourPool, oLocalEconomy, CONSTS.machinists_strikeNextPeriodWeeksNb, oMachinery);
    });

    console.silly('worker initialisation succes');

    // ateliers
    o.ateliers.forEach(function (oAtelier: Prod.Atelier, idx: number) {
        if (!oAtelier || !oAtelier.params) {
            return;
        }

        let atelierID = oAtelier.params.atelierID || idx.toString();
        let factoryID = oAtelier.params.factoryID;

        let oMachineries = o.machineries.filter(function (oMachinery: Prod.Machinery, idz) {
            return oMachinery.params.atelierID === atelierID;
        });

        let oWorkers = o.workers.filter(function (oWorker: Prod.Worker) {
            return oWorker.params.atelierID === atelierID;
        });

        let oFactory = o.factories.filter(function (oFac: Prod.Factory) {
            return oFac.params.factoryID === factoryID;
        });

        // TODO: multi machs
        oAtelier.init(oWorkers[0], oMachineries[0], oFactory[0]);
    });

    console.silly('atelier initialisation succes');

    // init products and their semiProducts
    o.subProducts.forEach(function (oSubProduct: Prod.SemiProduct, idx: number) {
        if (!oSubProduct || !oSubProduct.params) {
            return;
        }

        let subProductID = oSubProduct.params.subProductID || idx.toString();

        let subProductLastRes = lastResults.subProducts[idx];

        let atelierID = oSubProduct.params.atelierID;
        let oAtelier: Prod.Atelier = o.ateliers[atelierID];

        let oMaterials = o.materials.filter(function (oMaterial: Prod.RawMaterial, idz) {
            let materialID = oMaterial.params.materialID || idz.toString();

            return oSubProduct.params.materialsIDs.indexOf(materialID) !== -1;
        });

        let oSubContracters = o.subContracters.filter(function (oSubContracter: Env.SubContracter) {
            return oSubContracter.params.offeredSubProductsIDs.indexOf(subProductID) !== -1;
        });

        let lastAvailableNextPQ = subProductLastRes && subProductLastRes.outsourcedAvailableNextPQ || 0;
        let lastAvailableNextPValue = subProductLastRes && subProductLastRes.outsourcedAvailableNextPValue || 0;

        // TODO multi materials, multi subcontracter
        oSubProduct.init(oAtelier, oMaterials[0], oSubContracters[0], lastAvailableNextPQ, lastAvailableNextPValue);
    });

    console.silly('sub Pdt initialisation succes');

    o.products.forEach(function (oProduct: Prod.Product, idx: number) {
        if (!oProduct || !oProduct.params) {
            return;
        }

        let oSubProducts = o.subProducts.filter(function (oSubProduct: Prod.SemiProduct, idz) {
            let subProductID = oSubProduct.params.subProductID || idz.toString();

            return oProduct.params.subProductsIDs.indexOf(subProductID) !== -1;
        });

        let lastPdtStates = statesByCollection["products"][idx];
        let lastPdtResults = lastPdtStates.results;
        let lastPdtDecs = lastPdtStates.decisions;

        oProduct.init(oSubProducts, oLocalEconomy, lastPdtResults, lastPdtDecs);
    });

    console.silly('pdt initialisation succes');

    // internet website
    o.eCommerces.forEach(function (oECommerce: Mkg.ECommerce, idx: number) {
        if (!oECommerce || !oECommerce.params) {
            return;
        }

        let eCommerceID = oECommerce.params.eCommerceID || idx.toString();
        let agentID = oECommerce.params.agentID;

        let marketID = oECommerce.params.marketID;
        let oMarket: Mkg.Market = o.markets[marketID];

        let oECommerceAgent = o.agents.filter(function (oAgent: Mkg.SalesForce, idz) {
            if (!oAgent.params.isECommerceDistributor) {
                return false;
            }

            let currAgentID = oAgent.params.agentID || idz.toString();

            return oAgent.params.eCommerceID === eCommerceID || currAgentID === agentID;
        })[0];

        let eCommerceLastRes = lastResults.eCommerces[idx];
        let lastActiveWebsitePortsNb = eCommerceLastRes.activeWebsitePortsNb;

        let lastStates = statesByCollection["eCommerces"][idx];
        let lastRes: Scenario.eCommerceRes[] = lastStates.results;
        let lastDecs: Scenario.eCommerce[] = lastStates.decisions;

        // multi agents ? maybe
        oECommerce.init(lastActiveWebsitePortsNb, oMarket, oECommerceAgent, oLocalEconomy, lastRes, lastDecs);
    });

    console.silly('ECommerce initialisation succes');

    // init agents
    o.agents.forEach(function (oAgent: Mkg.SalesForce, idx: number) {
        if (!oAgent || !oAgent.params) {
            return;
        }

        let agentID = oAgent.params.agentID || idx.toString();

        let labourPoolID = oAgent.params.labourPoolID;
        let oLabourPool: Env.LabourPool = envObj.labourPools[labourPoolID];

        let agentLastRes = lastResults.agents[agentID];
        let lastAvailablesNextPeriodNb = agentLastRes && agentLastRes.availablesNextPeriodNb || 0;

        let lastAgentStates = statesByCollection["agents"][idx];
        let lastAgentResults: Scenario.agentRes[] = lastAgentStates.results;
        let lastAgentDecs: Scenario.agent[] = lastAgentStates.decisions;

        // TODO see how to correct agent 3 fazlse res
        // special case of ecommerce agents
        if (oAgent.params.isECommerceDistributor) {
            let eCommerceID = oAgent.params.eCommerceID || "0";
            let oECommerce: Mkg.ECommerce = o.eCommerces[eCommerceID];

            let eCommerceLastRes = lastResults.eCommerces[eCommerceID];
            let lastWantedWebsitePortsNb = eCommerceLastRes.wantedWebsitePortsNb;

            // initial recruitment
            lastAvailablesNextPeriodNb = lastWantedWebsitePortsNb > 0 ? oECommerce.params.distributorsNb : 0;
        }

        oAgent.init(lastAvailablesNextPeriodNb, oLabourPool, oLocalEconomy, null, lastAgentResults, lastAgentDecs);
    });

    console.silly('Agents initialisation succes');

    o.markets.forEach(function (oMarket: Mkg.Market, idx: number) {
        if (!oMarket || !oMarket.params) {
            return;
        }

        let marketID = oMarket.params.marketID || idx.toString();

        let economyID = oMarket.params.economyID;
        let oEconomy: Env.Economy = envObj.economies[economyID] || envObj.world;

        let oTransports = o.transports.filter(function (oTrs: Mkg.Transport, idz) {
            return oTrs.params.marketID === marketID;
        });

        let oAgents = o.agents.filter(function (oAgent: Mkg.SalesForce) {
            return oAgent.params.marketID === marketID;
        });

        let oProducts: Prod.Product[] = o.products;


        let lastMarketStates = statesByCollection["markets"][idx];
        let lastMarketResults: Scenario.marketRes[] = lastMarketStates.results;
        let lastMarketDecs: Scenario.market[] = lastMarketStates.decisions;

        let lastTradingReceivables = lastResults.tradeReceivablesValue;

        oTransports[0].init(oMarket, oLocalEconomy);

        // TODO: multi agents type
        oMarket.init(oEconomy, oProducts, oAgents[0], oTransports[0], lastMarketResults, lastMarketDecs, lastTradingReceivables, currPeriod);
    });

    console.silly('Markets initialisation succes');

    let oMarkets: Mkg.Market[] = o.markets;

    o.salesOffice.init(oMarkets, lastTradeReceivablesValue);

    console.silly('sales office initialisation succes');

    o.BusinessIntelligence.init(oLocalEconomy);

    console.silly('BI initialisation succes');

    let lastManagementBudget = lastDec.managementBudget;
    let oEmployees = o.workers;

    o.Management.init(lastManagementBudget, oEmployees, oLocalEconomy);

    console.silly('Management initialisation succes');

    // finance
    o.insurances.forEach(function (oInsurance: Fin.Insurance) {
        if (!oInsurance || !oInsurance.params) {
            return;
        }

        // TODO control what is insured so we calculate base on the premium

        let premiumsBase = 0;
        premiumsBase += Number(lastResults.landNetValue) || 0;
        premiumsBase += Number(lastResults.buildingsNetValue) || 0;
        premiumsBase += Number(lastResults.machineryNetValue) || 0;
        premiumsBase += Number(lastResults.inventoriesClosingValue) || 0;

        oInsurance.init(premiumsBase, currPeriod, o.Management, oLocalEconomy);
    });

    console.silly('insurrance initialisation succes');

    o.bankAccounts.forEach(function (oBankAccount: Fin.BankAccount, idx: number) {
        if (!oBankAccount || !oBankAccount.params) {
            return;
        }

        let bankID = oBankAccount.params.bankID || idx;
        let oBank: Env.Bank = envObj.banks[bankID];

        let bkAccountLastRes = lastResults.bankAccounts && lastResults.bankAccounts[idx];

        let lastBalance = bkAccountLastRes && !isNaN(bkAccountLastRes.balance) ? bkAccountLastRes.balance : lastResults.cashValue;
        let lastBanksOverdraft = bkAccountLastRes && !isNaN(bkAccountLastRes.banksOverdraft) ? bkAccountLastRes.banksOverdraft : lastResults.banksOverdraft;
        let lastNextPOverdraftLimit = bkAccountLastRes && !isNaN(bkAccountLastRes.nextPOverdraftLimit) ? bkAccountLastRes.nextPOverdraftLimit : lastResults.nextPOverdraftLimit;
        let lastTermDeposit = bkAccountLastRes && !isNaN(bkAccountLastRes.termDeposit) ? bkAccountLastRes.termDeposit : lastResults.termDeposit;
        let lastTermLoansValue = bkAccountLastRes && !isNaN(bkAccountLastRes.termLoansValue) ? bkAccountLastRes.termLoansValue : lastResults.termLoansValue;


        oBankAccount.init(oBank, lastBalance, lastTermDeposit, lastTermLoansValue, lastBanksOverdraft, lastNextPOverdraftLimit);
    });

    console.silly('Bk accounts initialisation succes');

    let capitalLastRes = lastResults.capital;

    global.debug_data.corporateLastRes = corporateLastRes;

    let shareCapital = capitalLastRes.shareCapital;
    let openingSharePrice = !isNaN(lastResults.sharePrice) ? lastResults.sharePrice : (corporateLastRes.sharePriceByTenThousand / 10000);
    let marketValuation = !isNaN(lastResults.marketValuation) ? lastResults.marketValuation : corporateLastRes.marketValuation;
    let sharesNb = !isNaN(capitalLastRes.sharesNb) ? capitalLastRes.sharesNb : Math.round(marketValuation / openingSharePrice);
    let sharesNbAtStartOfYear = !isNaN(capitalLastRes.sharesNbAtStartOfYear) ? capitalLastRes.sharesNbAtStartOfYear : sharesNb;

    let lastRetainedEarnings = !isNaN(lastResults.retainedEarnings) ? lastResults.retainedEarnings : corporateLastRes.retainedEarnings;

    let lastQuarter = lastPeriod;
    let currQuarter = lastQuarter < 4 ? lastQuarter + 1 : 1;


    o.capital.init(shareCapital, sharesNb, openingSharePrice, marketValuation, lastRetainedEarnings, sharesNbAtStartOfYear, currQuarter);

    console.silly('capital initialisation succes');


    // insurance covers
    o.insurances[0].cover(o.rmWarehouses, o.products, o.machineries);


    // now registring responsability centers
    o.Production.init(lastResults.inventoriesClosingValue, lastResults.productsInventoriesValue, lastResults.materialsInventoriesValue);
    o.Production.register(ObjectsManager.retrieve(playerID, "production"));

    console.silly('Production initialisation succes');

    o.Marketing.init();
    o.Marketing.register(ObjectsManager.retrieve(playerID, "marketing"));

    console.silly('Marketing initialisation succes');

    o.Finance.init();
    o.Finance.register(ObjectsManager.retrieve(playerID, "finance"));

    console.silly('Fin initialisation succes');


    o.Company.init(o.CompanyParams, oLocalEconomy, o.Production, o.Marketing, o.Finance, o.CashFlow, o.Management, currQuarter, lastDecisions, lastPeriodsResults);

    console.silly('Company initialisation succes');
}


export function setDecisions(playerID: string | number, currPeriod: number, dec: Scenario.Decision) {
    console.silly("begin setting decisions ");


    let o = setCurrentPlayer(playerID);

    if (!o) {
        console.error("Players objects not yet created");
        return;
    }



    let lastPeriod = currPeriod - 1;

    let machineriesDec = dec.machineries;
    let materialsDec = dec.materials;
    let marketsDec = dec.markets;
    let eCommercesDec = dec.eCommerces;
    let productsDec = dec.products;
    let subProductsDec = dec.subProducts;
    let workersDec = dec.workers;
    let agentsDec = dec.agents;

    let factoriesDec = dec.factories;
    let insurancesDec = dec.insurances;
    let bankAccountsDec = dec.bankAccounts;

    let delivery = {};
    let effDeliveries = {};

    // regression
    let p1_assemblyTimeDec = productsDec[0].assemblyTime;
    let p2_assemblyTimeDec = productsDec[1].assemblyTime;
    let p3_assemblyTimeDec = productsDec[2].assemblyTime;


    console.silly('begin dec succes');

    o.lands.forEach(function (oLand: Prod.Land, idx: number) {
        oLand.extend(0);
    });

    // factories 
    factoriesDec.forEach(function (factoryDec: Scenario.factory, idx: number) {
        let oFactory: Prod.Factory = o.factories[idx];

        // at last
        oFactory.extend(factoryDec.extension);
    });

    console.silly('factory dec succes');


    marketsDec.forEach(function (marketDec: Scenario.market, idy) {
        let subMarketsDec = marketDec.products;

        subMarketsDec.forEach(function (subMDec: Scenario.subMarket, idx: number) {
            let key = 'm' + (idy + 1) + '_p' + (idx + 1);

            delivery[key + '_deliveredQ'] = subMDec.deliveredQ;
            effDeliveries[key + '_Q'] = subMDec.deliveredQ;
        });

    });

    console.silly('markets dec succes');

    // MUST: machines decisions before workers decision 
    machineriesDec.forEach(function (machDec: Scenario.machinery, idx: number) {
        let oMachinery: Prod.Machinery = o.machineries[idx];
        let machinesTypesDec = machDec.types;


        machinesTypesDec.forEach(function (machTypeDec, type) {
            oMachinery.buy(machTypeDec.boughtNb, type);
            oMachinery.sell(machTypeDec.soldNb, type);
        });

        oMachinery.doMaintenance(machDec.maintenanceHours);

        oMachinery.setShiftLevel(dec.shiftLevel);

        // keep this decision at last
        o.workers[1].setShift(dec.shiftLevel); // regression
    });

    console.silly('mach dec succes');

    // materials purchases
    materialsDec.forEach(function (matDec: Scenario.material, idx: number) {
        let oSupplier: Env.Supplier<Prod.RawMaterial> = o.suppliers[idx];

        let purchases = matDec.purchases;

        purchases.forEach(function (purchasesTerm: Scenario.futures, idx: number) {
            let term = ENUMS.FUTURES[purchasesTerm.term];
            let quantity = purchasesTerm.quantity * 1000;

            oSupplier.order(quantity, ENUMS.QUALITY.MQ, ENUMS.FUTURES[term]);
        });
    });

    console.silly('materials dec succes');


    // SubContracting
    subProductsDec.forEach(function (subPdtDec: Scenario.subProduct, idx: number) {
        let oSubProduct: Prod.SemiProduct = o.subProducts[idx];
        let subProductID = oSubProduct.params.subProductID;

        if (!oSubProduct.subContracter) {
            return true;
        }

        let pdtPremMatProp;
        let maxPdtPremMatProp = 0;

        o.products.forEach(function (oPdt: Prod.Product, idz) {
            if (oPdt.params.subProductsIDs.indexOf(subProductID) !== -1) {
                pdtPremMatProp = productsDec[idz].premiumMaterialPropertion;
                maxPdtPremMatProp = pdtPremMatProp > maxPdtPremMatProp ? pdtPremMatProp : maxPdtPremMatProp;
            }
        });

        let premMatProp = subPdtDec.premiumMaterialPropertion || maxPdtPremMatProp;

        oSubProduct.subContract(subPdtDec.subcontractQ, premMatProp);
    });

    console.silly('SP dec succes');

    // Personnel
    workersDec.forEach(function (workerDec: Scenario.worker, idx: number) {
        let oWorker: Prod.Worker = o.workers[idx];

        let recruitedNb = workerDec.hire > 0 ? workerDec.hire : 0;
        let dismissedNb = workerDec.hire < 0 ? Math.abs(workerDec.hire) : 0;

        // regression
        let shiftLevel = idx === 0 ? CONSTS.assemblyWorker_shiftLevel : dec.shiftLevel;

        oWorker.recruit(recruitedNb);
        oWorker.dismiss(dismissedNb);
        oWorker.train(workerDec.trainedNb);
        oWorker.pay(workerDec.hourlyWageRate / 100);

        // regression
        o.workers[1].pay(workerDec.hourlyWageRate / 100);

        // keep this decision at last
        oWorker.setShift(shiftLevel);
    });

    console.silly('workers dec succes');

    // Management
    o.Management.allocateBudget(dec.managementBudget * 1000);
    o.Management.train(dec.staffTrainingDays);

    console.silly('management dec succes');

    // TODO hard coded
    function tryProgram(quantities) {
        let prod_Res = [];

        let totalQ = 0;
        quantities.forEach(function (v) {
            totalQ += v;
        });

        o.products.forEach(function (oPdt: Prod.Product, idx: number) {
            let pdtDec: Scenario.product = productsDec[idx];

            let quantity = quantities[idx];

            let machiningTime = CONSTS.machiningTimes[idx];
            let premMaterialProp = pdtDec.premiumMaterialPropertion / 100;
            let assemblyTimeDec = pdtDec.assemblyTime;
            let assemblyMaterial = CONSTS.assemblyMaterial;

            console.silly("ok 0");

            let pdtRes = oPdt.getNeededResForProd(quantity, machiningTime, premMaterialProp, assemblyTimeDec, assemblyMaterial);

            prod_Res.push(pdtRes);
        });

        console.silly("getNeededResForProd");

        let neededMachiningTime = Utils.sums(prod_Res, "worker2", null, null, null, ">", 2);
        let neededAssemblyTime = Utils.sums(prod_Res, "worker1", null, null, null, ">", 2);

        let diffMachiningTime = neededMachiningTime - o.workers[1].effectiveAvailableTotalHoursNb;
        let diffAssemblyTime = neededAssemblyTime - o.workers[0].effectiveAvailableTotalHoursNb;
        let diffBase;
        let consoUnitA, consoUnitB, consoUnitC;

        console.silly("ok 1");

        if (diffAssemblyTime > 0 || diffMachiningTime > 0) {
            console.silly("Needs exceed Capacity");
            diffBase = Math.max(diffAssemblyTime, diffMachiningTime);

            let ratioA = quantities[0] / totalQ;
            let ratioB = quantities[1] / totalQ;
            let ratioC = quantities[2] / totalQ;

            if (diffBase === diffAssemblyTime) {
                diffBase *= 60;
                consoUnitA = p1_assemblyTimeDec < CONSTS.minAssemblyTimes[0] ? CONSTS.minAssemblyTimes[0] : p1_assemblyTimeDec;
                consoUnitB = p2_assemblyTimeDec < CONSTS.minAssemblyTimes[1] ? CONSTS.minAssemblyTimes[1] : p2_assemblyTimeDec;
                consoUnitC = p3_assemblyTimeDec < CONSTS.minAssemblyTimes[2] ? CONSTS.minAssemblyTimes[2] : p3_assemblyTimeDec;
            }
            if (diffBase === diffMachiningTime) {
                consoUnitA = prod_Res[0].machinists / quantities[0];
                consoUnitB = prod_Res[1].machinists / quantities[1];
                consoUnitC = prod_Res[2].machinists / quantities[2];
            }
            let P_minus = Math.round(diffBase / (ratioA * consoUnitA + ratioB * consoUnitB + ratioC * consoUnitC));
            let p1_Minus = Math.round(P_minus * ratioA);
            let p2_Minus = Math.round(P_minus * ratioB);
            let p3_Minus = Math.round(P_minus * ratioC);
            console.silly('il reste ', diffBase - (p1_Minus * consoUnitA) - (p2_Minus * consoUnitB) - (p3_Minus * consoUnitC));
            return [p1_Minus, p2_Minus, p3_Minus];
        }
        console.silly("Good");
        return [0, 0, 0];
    }

    let m1_p1_Q = delivery["m1_p1_deliveredQ"];
    let m2_p1_Q = delivery["m2_p1_deliveredQ"];
    let m3_p1_Q = delivery["m3_p1_deliveredQ"];
    let m1_p2_Q = delivery["m1_p2_deliveredQ"];
    let m2_p2_Q = delivery["m2_p2_deliveredQ"];
    let m3_p2_Q = delivery["m3_p2_deliveredQ"];
    let m1_p3_Q = delivery["m1_p3_deliveredQ"];
    let m2_p3_Q = delivery["m2_p3_deliveredQ"];
    let m3_p3_Q = delivery["m3_p3_deliveredQ"];

    let scheduledQs = [m1_p1_Q + m2_p1_Q + m3_p1_Q, m1_p2_Q + m2_p2_Q + m3_p2_Q, m1_p3_Q + m2_p3_Q + m3_p3_Q];

    let totalWantedP1 = scheduledQs[0];
    let totalWantedP2 = scheduledQs[1]
    let totalWantedP3 = scheduledQs[2];

    let minusQs;
    let successProgram;

    let _tries = 0;

    do {
        if (_tries > 100) {
            console.warn("something strange with product schedule loop");
            break;
        }

        minusQs = tryProgram(scheduledQs);

        scheduledQs.forEach(function (scheduledQ, idx: number) {
            scheduledQs[idx] = scheduledQ - minusQs[idx];
        });

        effDeliveries["m1_p1_Q"] -= Math.ceil(minusQs[0] * (m1_p1_Q / totalWantedP1));
        effDeliveries["m2_p1_Q"] -= Math.ceil(minusQs[0] * (m2_p1_Q / totalWantedP1));
        effDeliveries["m3_p1_Q"] = scheduledQs[0] - effDeliveries["m1_p1_Q"] - effDeliveries["m2_p1_Q"];

        effDeliveries["m1_p2_Q"] -= Math.ceil(minusQs[1] * (m1_p2_Q / totalWantedP2));
        effDeliveries["m2_p2_Q"] -= Math.ceil(minusQs[1] * (m2_p2_Q / totalWantedP2));
        effDeliveries["m3_p2_Q"] = scheduledQs[1] - effDeliveries["m1_p2_Q"] - effDeliveries["m2_p2_Q"];

        effDeliveries["m1_p3_Q"] -= Math.ceil(minusQs[2] * (m1_p3_Q / totalWantedP3));
        effDeliveries["m2_p3_Q"] -= Math.ceil(minusQs[2] * (m2_p3_Q / totalWantedP3));
        effDeliveries["m3_p3_Q"] = scheduledQs[2] - effDeliveries["m1_p3_Q"] - effDeliveries["m2_p3_Q"];

        successProgram = (minusQs[0] + minusQs[1] + minusQs[2]) === 0;

        _tries++;

    } while (!successProgram);

    productsDec.forEach(function (pdtDec: Scenario.product, idx: number) {
        let pdtID = "p" + (idx + 1);

        let oProduct: Prod.Product = o.products[idx];

        let scheduledQ = scheduledQs[idx];
        let machiningTime = CONSTS.machiningTimes[idx];

        console.silly('scheduledQ', scheduledQ);
        console.silly('machiningTime', machiningTime);

        oProduct.produce(scheduledQ, machiningTime, pdtDec.premiumMaterialPropertion / 100, pdtDec.assemblyTime, CONSTS.assemblyMaterial);
        oProduct.developWithBudget(pdtDec.developmentBudget * 1000);
        oProduct.takeUpImprovements(pdtDec.improvementsTakeup);

        marketsDec.forEach(function (marketDec: Scenario.market, idy) {
            let oMarket: Mkg.Market = o.markets[idy];
            let subMDec: Scenario.subMarket = marketDec.products[idx];

            let marketID = 'm' + (idy + 1);
            let deliveredQ = effDeliveries[marketID + '_' + pdtID + '_Q'];

            oProduct.deliverTo(deliveredQ, oMarket, subMDec.price, subMDec.advertisingBudget * 1000);
        });
    });

    console.silly('pdt dec succes');

    // corporate + agents
    marketsDec.forEach(function (marketDec: Scenario.market, idx: number) {
        let oMarket: Mkg.Market = o.markets[idx];

        // corporate
        oMarket.setCorporateCom(marketDec.corporateComBudget * 1000);
    });


    // sales agent
    agentsDec.forEach(function (agentDec: Scenario.agent, idx: number) {
        let oAgent: Mkg.SalesForce = o.agents[idx];

        oAgent.appoint(agentDec.appointedNb, agentDec.support * 1000, agentDec.commissionRate / 100);
    });

    console.silly('agents dec succes');

    // eCommerce
    eCommercesDec.forEach(function (eComDec: Scenario.eCommerce, idx: number) {
        let oECommerce: Mkg.ECommerce = o.eCommerces[idx];

        oECommerce.operateOn(eComDec.websitePortsNb);
        oECommerce.developWebsite(eComDec.websiteDevBudget * 1000);
    });

    console.silly('eComm dec succes');

    // intelligence
    o.BusinessIntelligence.commissionCompetitorsInfo(dec.orderCorporateActivityInfo);
    o.BusinessIntelligence.commissionMarketSharesInfo(dec.orderMarketSharesInfo);

    console.silly('BI dec succes');

    // finance
    bankAccountsDec.forEach(function (bkAccountDec: Scenario.bankAccount, idx: number) {
        let oBankAccount: Fin.BankAccount = o.bankAccounts[idx];

        oBankAccount.changeTermDepositAmount(bkAccountDec.termDeposit * 1000);
        oBankAccount.takeTermLoans(bkAccountDec.termLoans * 1000);
    });

    console.silly('bk dec succes');

    insurancesDec.forEach(function (insuranceDec: Scenario.insurance, idx: number) {
        let oInsurance: Fin.Insurance = o.insurances[idx];

        oInsurance.takeoutInsurance(insuranceDec.plan);
    });

    console.silly('insurance dec succes');

    o.capital.changeSharesNb(dec.sharesVariation);
    o.capital.payDividend(dec.dividend / 100);

    console.silly('capital dec succes');

    // at the end
    Marketplace.register(o.markets);

    console.silly('registring marketing mix succes');
}


export function simulateMarketplace() {

    Marketplace.simulate();

    console.silly('marektplace sim succes');
}



export function getEndState(playerID: string | number, currPeriod: number): Q.Promise<any> {
    let deferred = Q.defer();


    let o = setCurrentPlayer(playerID);

    if (!o) {
        let err = new Error("Players objects not yet created");

        console.error(err);

        deferred.reject(err);

        return deferred.promise;
    }



    // DEBUG
    o.ID = playerID;

    let endState = {};

    console.silly("trigger finish event on objects ...");

    // trigger finish event on objects
    ObjectsManager.finish(playerID).then(function () {

        console.silly("getting endstate ...");

        return ObjectsManager.getObjectsEndState(playerID);

    }).then(function (result) {
        console.log("getting endstate of prod...");

        Utils.ObjectApply(endState, result);


        return o.Production.getEndState();

    }).then(function (result) {
        Utils.ObjectApply(endState, result);

        console.log("getting endstate of Mkg...");

        return o.Marketing.getEndState();

    }).then(function (result) {
        Utils.ObjectApply(endState, result);

        console.log("getting endstate of fin...");

        return o.Finance.getEndState();

    }).then(function (result) {
        Utils.ObjectApply(endState, result);

        console.log("getting endstate of CF...");

        return o.CashFlow.getEndState();

    }).then(function (result) {
        Utils.ObjectApply(endState, result);

        console.log("getting endstate of comp ...");

        return o.Company.getEndState();

    }).done(function (result) {
        Utils.ObjectApply(endState, result);

        if (Utils.NODE_ENV() === "prod") {
            console.log("try to free memory ...");

            // try to free memory
            ObjectsManager.clean(playerID).then(function () {

                console.log("clean depts ...");

                o.Production.init();
                o.Marketing.init();
                o.Finance.init();

                o.CashFlow.reset();

            }, function (err) {
                console.error(err);
            });
        }

        deferred.resolve(endState);

    }, function (err) {
        console.error(err);

        deferred.reject(err);
    });

    return deferred.promise;
}





export function getEnvironnementState(): Q.Promise<any> {

    return ObjectsManager.getPersistedObjectsEndState();
}




export function reset(): Q.Promise<any> {
    // try to free memory
    return ObjectsManager.clean().then(function () {
        ObjectsManager.init();
    }, function (err) {
        console.error(err);
    });

}


export function getList_corporateActivityInfo(): string[] {
    return [
        "consumerStarRatings", "advertisingCost", "productsDevelopmentCost"
    ];
}



export function getList_freeInfo(): string[] {
    return [
        "playerID",
        "sharePriceByTenThousand",
        "marketValuation",
        "dividendPaid",
        "IP",
        "workersNb",
        "hourlyWageRatePerCent",
        "salesForceNb",
        "id",
        "nonCurrentAssetsTotalValue",
        "inventoriesValue",
        "tradeReceivablesValue",
        "cashValue",
        "taxAssessedAndDue",
        "tradePayablesValue",
        "banksOverdraft",
        "LTLoans",
        "ordinaryCapital",
        "sharePremiumAccount",
        "retainedEarnings"
    ];
}