"use strict";
const game = require('../../simulation/Games');
const CompanyParams = require('../../simulation/CompanyParams');
const Company = require('./Company');
const Lands_1 = require('../../simulation/manufacturing/Lands');
const Factories_1 = require('../../simulation/manufacturing/Factories');
const machineries = require('../../simulation/manufacturing/Machineries');
const RMWarehouses_1 = require('../../simulation/manufacturing/RMWarehouses');
const RawMaterials_1 = require('../../simulation/manufacturing/RawMaterials');
const Suppliers_1 = require('../../simulation/manufacturing/Suppliers');
const Products_1 = require('../../simulation/manufacturing/Products');
const SemiProducts_1 = require('../../simulation/manufacturing/SemiProducts');
const SubContracters_1 = require('../../simulation/manufacturing/SubContracters');
const Ateliers_1 = require('../../simulation/manufacturing/Ateliers');
const Workers_1 = require('../../simulation/manufacturing/Workers');
const Markets_1 = require('../../simulation/marketing/Markets');
const SalesForce_1 = require('../../simulation/marketing/SalesForce');
const SalesOffice_1 = require('../../simulation/marketing/SalesOffice');
const Transport_1 = require('../../simulation/marketing/Transport');
const ECommerce_1 = require('../../simulation/marketing/ECommerce');
const Intelligence_1 = require('../../simulation/marketing/Intelligence');
const Management_1 = require('../../simulation/personnel/Management');
const Insurances_1 = require('../../simulation/finance/Insurances');
const BankAccounts_1 = require('../../simulation/finance/BankAccounts');
const Capital_1 = require('../../simulation/finance/Capital');
const Manufacturing_1 = require('./Manufacturing');
const Marketing_1 = require('./Marketing');
const Finance_1 = require('./Finance');
class Factory {
    constructor() {
        if (Factory._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Factory._instance = this;
    }
    static init() {
        let that = this.getInstance();
        if (Factory._instance) {
            delete Factory._instance;
        }
        Factory._instance = new Factory();
    }
    static getInstance() {
        if (Factory._instance === null) {
            Factory._instance = new Factory();
        }
        return Factory._instance;
    }
    static getObjects(playerID) {
        let objects = this.playersObjects[playerID];
        if (objects === undefined) {
            return this.createObjects(playerID);
        }
        return objects;
    }
    static createObjects(playerID) {
        let objects = {
            game: game,
            Company: new Company.Company(),
            CompanyParams: CompanyParams,
            Production: new Manufacturing_1.Production(),
            Marketing: new Marketing_1.Marketing(),
            Finance: new Finance_1.Finance(),
            CashFlow: new Finance_1.CashFlow(),
            Management: Management_1.default(),
            insurances: Insurances_1.default(),
            bankAccounts: BankAccounts_1.default(),
            capital: Capital_1.default(),
            eCommerces: ECommerce_1.default(),
            salesOffice: SalesOffice_1.default(),
            lands: Lands_1.default(),
            factories: Factories_1.default(),
            machineries: machineries.create(),
            machinesStates: machineries.machinesStates,
            materials: RawMaterials_1.default(),
            suppliers: Suppliers_1.default(),
            rmWarehouses: RMWarehouses_1.default(),
            subProducts: SemiProducts_1.default(),
            products: Products_1.default(),
            subContracters: SubContracters_1.default(),
            ateliers: Ateliers_1.default(),
            workers: Workers_1.default(),
            markets: Markets_1.default(),
            agents: SalesForce_1.default(),
            transports: Transport_1.default(),
            BusinessIntelligence: Intelligence_1.default()
        };
        this.playersObjects[playerID] = objects;
        return objects;
    }
}
Factory._instance = null;
Factory.playersObjects = {};
exports.Factory = Factory;
//# sourceMappingURL=ObjectsFactory.js.map