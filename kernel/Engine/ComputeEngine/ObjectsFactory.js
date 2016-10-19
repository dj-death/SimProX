"use strict";
var game = require('../../simulation/Games');
var CompanyParams = require('../../simulation/CompanyParams');
var Company = require('./Company');
var Lands_1 = require('../../simulation/manufacturing/Lands');
var Factories_1 = require('../../simulation/manufacturing/Factories');
var machineries = require('../../simulation/manufacturing/Machineries');
var RMWarehouses_1 = require('../../simulation/manufacturing/RMWarehouses');
var RawMaterials_1 = require('../../simulation/manufacturing/RawMaterials');
var Suppliers_1 = require('../../simulation/manufacturing/Suppliers');
var Products_1 = require('../../simulation/manufacturing/Products');
var SemiProducts_1 = require('../../simulation/manufacturing/SemiProducts');
var SubContracters_1 = require('../../simulation/manufacturing/SubContracters');
var Ateliers_1 = require('../../simulation/manufacturing/Ateliers');
var Workers_1 = require('../../simulation/manufacturing/Workers');
var Markets_1 = require('../../simulation/marketing/Markets');
var SalesForce_1 = require('../../simulation/marketing/SalesForce');
var SalesOffice_1 = require('../../simulation/marketing/SalesOffice');
var Transport_1 = require('../../simulation/marketing/Transport');
var ECommerce_1 = require('../../simulation/marketing/ECommerce');
var Intelligence_1 = require('../../simulation/marketing/Intelligence');
var Management_1 = require('../../simulation/personnel/Management');
var Insurances_1 = require('../../simulation/finance/Insurances');
var BankAccounts_1 = require('../../simulation/finance/BankAccounts');
var Capital_1 = require('../../simulation/finance/Capital');
var Manufacturing_1 = require('./Manufacturing');
var Marketing_1 = require('./Marketing');
var Finance_1 = require('./Finance');
var Factory = (function () {
    function Factory() {
        if (Factory._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }
        Factory._instance = this;
    }
    Factory.init = function () {
        var that = this.getInstance();
        if (Factory._instance) {
            delete Factory._instance;
        }
        Factory._instance = new Factory();
    };
    Factory.getInstance = function () {
        if (Factory._instance === null) {
            Factory._instance = new Factory();
        }
        return Factory._instance;
    };
    Factory.getObjects = function (playerID) {
        var objects = this.playersObjects[playerID];
        if (objects === undefined) {
            return this.createObjects(playerID);
        }
        return objects;
    };
    Factory.createObjects = function (playerID) {
        var objects = {
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
    };
    Factory._instance = null;
    Factory.playersObjects = {};
    return Factory;
}());
exports.Factory = Factory;
//# sourceMappingURL=ObjectsFactory.js.map