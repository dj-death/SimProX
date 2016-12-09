import * as Prod from './Manufacturing';
import * as Mkg from './Marketing';
import * as Env from './Environnement';
import * as Fin from './Finance';
import * as Rh from './Personnel';

import Game from '../Game';

import game = require('../../simulation/Games');

import CompanyParams = require('../../simulation/CompanyParams');

import * as Company from './Company';


import lands from '../../simulation/manufacturing/Lands';
import factories from '../../simulation/manufacturing/Factories';

import * as machineries from '../../simulation/manufacturing/Machineries';

import rmWarehouses from '../../simulation/manufacturing/RMWarehouses';
import rawMaterials from '../../simulation/manufacturing/RawMaterials';
import suppliers from '../../simulation/manufacturing/Suppliers';


import products from '../../simulation/manufacturing/Products';
import semiProducts from '../../simulation/manufacturing/SemiProducts';
import subContracters from '../../simulation/manufacturing/SubContracters';


import ateliers from '../../simulation/manufacturing/Ateliers';
import workers from '../../simulation/manufacturing/Workers';


import markets from '../../simulation/marketing/Markets';
import salesForce from '../../simulation/marketing/SalesForce';
import salesOffice from '../../simulation/marketing/SalesOffice';
import transports from '../../simulation/marketing/Transport';
import eCommerce from '../../simulation/marketing/ECommerce';
import BusinessIntelligence from '../../simulation/marketing/Intelligence';

import Management from '../../simulation/personnel/Management';

import insurances from '../../simulation/finance/Insurances';
import bankAccounts from '../../simulation/finance/BankAccounts';
import capital from '../../simulation/finance/Capital';

import { Production } from './Manufacturing';
import { Marketing } from './Marketing';
import { Finance, CashFlow } from './Finance';


export interface GameObjects {
    ID?: number|string;

    lands: Prod.Land[];
    factories: Prod.Factory[];
    rmWarehouses: Prod.RMWarehouse[];
    materials: Prod.RawMaterial[];
    suppliers: Env.Supplier<Prod.RawMaterial>[];
    products: Prod.Product[];
    subProducts: Prod.SemiProduct[];
    subContracters: Env.SubContracter[];
    ateliers: Prod.Atelier[];
    workers: Prod.Worker[];

    machineries: Prod.Machinery[];

    markets: Mkg.Market[];
    agents: Mkg.SalesForce[];
    salesOffice: Mkg.SalesOffice;
    transports: Mkg.Transport[];
    eCommerces: Mkg.ECommerce[];
    BusinessIntelligence: Mkg.Intelligence;


    Management: Rh.Management;

    insurances: Fin.Insurance[];
    bankAccounts: Fin.BankAccount[];
    capital: Fin.Capital;

    Production: Prod.Production;
    Marketing: Mkg.Marketing;
    Finance: Fin.Finance;
    CashFlow: Fin.CashFlow;

    game: Game;

    Company: Company.Company;
    CompanyParams: Company.CompanyParams;
}


export class Factory {
    private static _instance: Factory = null;

    private static playersObjects = {};


    constructor() {
        if (Factory._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        Factory._instance = this;
    }

    public static init() {
        let that = this.getInstance();

        if (Factory._instance) {
            delete Factory._instance;
        }

        Factory._instance = new Factory();
    }

    public static getInstance(): Factory {
        if (Factory._instance === null) {
            Factory._instance = new Factory();
        }

        return Factory._instance;
    }


    public static getObjects(playerID: string | number): GameObjects {
        let objects = this.playersObjects[playerID];

        if (objects === undefined) {
            return this.createObjects(playerID);
        }

        return objects;
    }

    static createObjects(playerID: string | number): GameObjects {
        let objects = {
            game: game,

            Company: new Company.Company(),
            CompanyParams: CompanyParams,

            Production: new Production(),
            Marketing: new Marketing(),
            Finance: new Finance(),
            CashFlow: new CashFlow(),

            Management: Management(),

            insurances: insurances(),
            bankAccounts: bankAccounts(),

            capital: capital(),
            eCommerces: eCommerce(),
            salesOffice: salesOffice(),

            lands: lands(),
            factories: factories(),
            machineries: machineries.create(),
            machinesStates: machineries.machinesStates,

            materials: rawMaterials(),
            suppliers: suppliers(),
            rmWarehouses: rmWarehouses(),

            subProducts: semiProducts(),
            products: products(),
            subContracters: subContracters(),

            ateliers: ateliers(),

            workers: workers(),

            markets: markets(),
            agents: salesForce(),
            transports: transports(),

            BusinessIntelligence: BusinessIntelligence()
        }

        this.playersObjects[playerID] = objects;

        return objects;

    }

}