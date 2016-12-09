
import * as Prod from './';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');


import Q = require('q');


export default class Production {
    departmentName = "Production";

    get Proto(): Production {
        return Production.prototype;
    }

    products: Prod.Product[];
    semiProducts: Prod.SemiProduct[];
    machineries: Prod.Machinery[];
    ateliers: Prod.Atelier[];
    workers: Prod.Worker[];
    materials: Prod.RawMaterial[];
    warehouses: Prod.Warehouse[];
    factories: Prod.Factory[];
    lands: Prod.Land[];

    inventoriesLastPOpeningValue: number;
    productsLastPClosingValue: number;
    materialsLastPClosingValue: number;


    init(inventoriesOpeningValue?: number, productsLastPClosingValue?: number, materialsLastPClosingValue?: number) { // regression param

        if (isNaN(inventoriesOpeningValue)) {
            console.warn("inventoriesOpeningValue NaN");

            inventoriesOpeningValue = 0;
        }

        if (isNaN(productsLastPClosingValue )) {
            console.warn("productsLastPClosingValue NaN");

            productsLastPClosingValue = 0;
        }

        if (isNaN(materialsLastPClosingValue)) {
            console.warn("materialsLastPClosingValue NaN");

            materialsLastPClosingValue = 0;
        }


        this.inventoriesLastPOpeningValue = inventoriesOpeningValue;
        this.productsLastPClosingValue = productsLastPClosingValue;
        this.materialsLastPClosingValue = materialsLastPClosingValue;

        this.products = [];
        this.semiProducts = [];
        this.machineries = [];
        this.ateliers = [];
        this.workers = [];
        this.materials = [];
        this.warehouses = [];
        this.factories = [];
        this.lands = [];
    }


    register(objects: any[]) {

        let i = 0,
            len = objects.length,
            object;

        for (; i < len; i++) {
            object = objects[i];

            if (object instanceof Prod.Atelier) {
                this.ateliers.push(object);

            }

            else if (object instanceof Prod.Product) {
                this.products.push(object);

            }

            else if (object instanceof Prod.SemiProduct) {
                this.semiProducts.push(object);

            }

            else if (object instanceof Prod.Machinery) {
                this.machineries.push(object);
            }

            else if (object instanceof Prod.Worker) {
                this.workers.push(object);
            }

            else if (object instanceof Prod.RawMaterial) {
                this.materials.push(object);
            }

            else if (object instanceof Prod.Warehouse) {
                this.warehouses.push(object);
            }

            else if (object instanceof Prod.Factory) {
                this.factories.push(object);
            }

            else if (object instanceof Prod.Land) {
                this.lands.push(object);
            }
        }
    }


    // results
    get productsProducedNb(): number {
        return Utils.sums(this.products, "producedNb");
    }

    get scrapRevenue(): number {
        return Utils.sums(this.products, "scrapRevenue");
    }

    get productsScheduledNb(): number {
        return Utils.sums(this.products, "scheduledNb");
    }

    get stocksSpaceUsed(): number {
        return Utils.sums(this.warehouses, "spaceUsed");
    }

    get machiningOperationsSpaceUsed(): number {
        return Utils.sums(this.machineries, "spaceUsed");
    }

    get workersOperationsSpaceUsed(): number {
        return Utils.sums(this.workers, "spaceUsed");
    }

    get ateliersSpaceUsed(): number {
        return Utils.sums(this.ateliers, "spaceUsed");
    }

    get ownedLandsSpace(): number {
        return Utils.sums(this.lands, "availableSpace");
    }

    get factoriesCO2PrimaryFootprintTotalWeight(): number {
        return Utils.sums(this.factories, "CO2PrimaryFootprintWeight", null, null, null, "=", 2);
    }

    get productionCO2PrimaryFootprintTotalWeight(): number {
        let machinesCO2Weight = Utils.sums(this.machineries, "CO2PrimaryFootprintWeight", null, null, null, "=", 2);
        let workersCO2Weight = Utils.sums(this.workers, "CO2PrimaryFootprintWeight", null, null, null, "=", 2);

        return Utils.round(machinesCO2Weight + workersCO2Weight, 2);
    }

    get CO2PrimaryFootprintTotalWeight(): number {
        let weight = this.factoriesCO2PrimaryFootprintTotalWeight + this.productionCO2PrimaryFootprintTotalWeight;

        return Utils.round(weight, 2);
    }


    // costs
    get CO2PrimaryFootprintOffsettingCost(): number {
        let factoriesShare = Utils.sums(this.factories, "CO2PrimaryFootprintOffsettingCost");
        let machinesShare = Utils.sums(this.machineries, "CO2PrimaryFootprintOffsettingCost");
        let workersShare = Utils.sums(this.workers, "CO2PrimaryFootprintOffsettingCost");

        let totalCost = factoriesShare + machinesShare + workersShare;

        return Math.ceil(totalCost);
    }

    get factoriesFixedCost(): number {
        return Utils.sums(this.factories, "fixedCost");
    }

    get productsDevelopmentCost(): number {
        return Utils.sums(this.products, "productDevelopmentCost");
    }

    get machinesMaintenanceCost(): number {
        return Utils.sums(this.machineries, "maintenanceCost");
    }

    get machinesRunningCost(): number {
        return Utils.sums(this.machineries, "runningCost") + Utils.sums(this.products, "prodPlanningCost");
    }

    get machinesDecommissioningCost(): number {
        return Utils.sums(this.machineries, "decommissioningCost")
    }

    get guaranteeServicingCost(): number {
        return Utils.sums(this.products, "guaranteeServicingCost");
    }

    get qualityControlCostCost(): number {
        return Utils.sums(this.products, "qualityControlCost");
    }

    get warehousingCost(): number {
        return Utils.sums(this.warehouses, "warehousingCost");
    }

    get materialsPurchasedCost(): number {
        return Utils.sums(this.materials, "purchasesValue");
    }

    get componentsPurchasedCost(): number {
        return Utils.sums(this.semiProducts, "purchasesValue");
    }


    get workersNb(): number {
        return Utils.sums(this.workers, "employeesNb");
    }

    get unskilledWorkersWagesCost(): number {
        return Utils.sums(this.workers, "adjustedWages", "params.isUnskilled", true);
    }

    get skilledWorkersWagesCost(): number {
        return Utils.sums(this.workers, "adjustedWages", "params.isUnskilled", false);
    }

    get hourlyWageRatePerCent(): number {
        let skilledWorkers = this.workers.filter(function (oWorker) {
            return oWorker.params.isUnskilled === false;
        })[0];

        return skilledWorkers.hourlyWageRate;
    }

    get miscellaneousCost(): number {
        let totalCost = 0;

        totalCost += this.factoriesFixedCost;
        totalCost += this.machinesDecommissioningCost;
        totalCost += this.CO2PrimaryFootprintOffsettingCost;

        return totalCost;
    }

    get machineryNetValue(): number {
        return Utils.sums(this.machineries, "machineryNetValue");
    }

    get landNetValue(): number {
        return Utils.sums(this.lands, "netValue");
    }

    get buildingsNetValue(): number {
        return Utils.sums(this.factories, "netValue");
    }

    get depreciation(): number {
        let totalValue = 0;

        let machinesDepreciation = Utils.sums(this.machineries, "depreciation");
        let landsDepreciation = Utils.sums(this.lands, "depreciation");
        let factoriesDepreciation = Utils.sums(this.factories, "depreciation");

        totalValue += machinesDepreciation;
        totalValue += landsDepreciation;
        totalValue += factoriesDepreciation;

        return totalValue;
    }

    get inventoriesOpeningValue(): number {
        let extractedValue = this.inventoriesLastPOpeningValue;
        let calculatedValue = Utils.sums(this.warehouses, "openingValue");

        return extractedValue || calculatedValue;
    }

    get inventoriesClosingValue(): number {
        // the calculation of material is different from warehouse as it includes also next deliveries
        //return Utils.sums(this.warehouses, "closingValue");

        let materialsInventoriesValue = this.materialsInventoriesValue;
        let componentsInventoriesValue = this.componentsInventoriesValue;
        let productsInventoriesValue = this.productsInventoriesValue;

        let total = materialsInventoriesValue + componentsInventoriesValue + productsInventoriesValue;

        return total;

    }

    get productsInventoriesValue(): number {
        return Utils.sums(this.products, "closingValue");
    }

    get productsOpeningInventoriesValue(): number {
        return this.productsLastPClosingValue;
    }

    get materialsOpeningInventoriesValue(): number {
        return this.materialsLastPClosingValue;
    }

    // just for components
    get componentsInventoriesValue(): number {
        return Utils.sums(this.semiProducts, "closingValue", "subContracter");
    }

    get materialsInventoriesValue(): number {
        return Utils.sums(this.materials, "closingValue");
    }


    getEndState(prefix?: string): Q.Promise<any> {
        let deferred = Q.defer();

        let endState = {};

        let that: Object = this;
        let deptName = this.departmentName;

        setImmediate(function () {

            for (let key in that) {

                if (!Production.prototype.hasOwnProperty(key)) {
                    continue;
                }

                console.silly("GES @ %s of %s", deptName, key);

                try {
                    let value = that[key];

                    if (!Utils.isBasicType(value)) {
                        continue;
                    }

                    if (isNaN(value)) {
                        console.warn("GES @ %s: %s is NaN", deptName, key);
                    }

                    key = prefix ? (prefix + key) : key;
                    endState[key] = value;

                } catch (e) {
                    console.error(e, "exception @ %s", deptName);
                    deferred.reject(e);
                }
            }

            deferred.resolve(endState);
        });

        return deferred.promise;

    }
}