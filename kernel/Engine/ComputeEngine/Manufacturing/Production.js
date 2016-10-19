"use strict";
var Prod = require('./');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Q = require('q');
var Production = (function () {
    function Production() {
        this.departmentName = "Production";
    }
    Object.defineProperty(Production.prototype, "Proto", {
        get: function () {
            return Production.prototype;
        },
        enumerable: true,
        configurable: true
    });
    Production.prototype.init = function (inventoriesOpeningValue, productsLastPClosingValue, materialsLastPClosingValue) {
        if (isNaN(inventoriesOpeningValue)) {
            console.warn("inventoriesOpeningValue NaN");
            inventoriesOpeningValue = 0;
        }
        if (isNaN(productsLastPClosingValue)) {
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
    };
    Production.prototype.register = function (objects) {
        var i = 0, len = objects.length, object;
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
    };
    Object.defineProperty(Production.prototype, "productsProducedNb", {
        // results
        get: function () {
            return Utils.sums(this.products, "producedNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "scrapRevenue", {
        get: function () {
            return Utils.sums(this.products, "scrapRevenue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "productsScheduledNb", {
        get: function () {
            return Utils.sums(this.products, "scheduledNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "stocksSpaceUsed", {
        get: function () {
            return Utils.sums(this.warehouses, "spaceUsed");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machiningOperationsSpaceUsed", {
        get: function () {
            return Utils.sums(this.machineries, "spaceUsed");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "workersOperationsSpaceUsed", {
        get: function () {
            return Utils.sums(this.workers, "spaceUsed");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "ateliersSpaceUsed", {
        get: function () {
            return Utils.sums(this.ateliers, "spaceUsed");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "ownedLandsSpace", {
        get: function () {
            return Utils.sums(this.lands, "availableSpace");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "factoriesCO2PrimaryFootprintTotalWeight", {
        get: function () {
            return Utils.sums(this.factories, "CO2PrimaryFootprintWeight", null, null, null, "=", 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "productionCO2PrimaryFootprintTotalWeight", {
        get: function () {
            var machinesCO2Weight = Utils.sums(this.machineries, "CO2PrimaryFootprintWeight", null, null, null, "=", 2);
            var workersCO2Weight = Utils.sums(this.workers, "CO2PrimaryFootprintWeight", null, null, null, "=", 2);
            return Utils.round(machinesCO2Weight + workersCO2Weight, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "CO2PrimaryFootprintTotalWeight", {
        get: function () {
            var weight = this.factoriesCO2PrimaryFootprintTotalWeight + this.productionCO2PrimaryFootprintTotalWeight;
            return Utils.round(weight, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "CO2PrimaryFootprintOffsettingCost", {
        // costs
        get: function () {
            var factoriesShare = Utils.sums(this.factories, "CO2PrimaryFootprintOffsettingCost");
            var machinesShare = Utils.sums(this.machineries, "CO2PrimaryFootprintOffsettingCost");
            var workersShare = Utils.sums(this.workers, "CO2PrimaryFootprintOffsettingCost");
            var totalCost = factoriesShare + machinesShare + workersShare;
            return Math.ceil(totalCost);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "factoriesFixedCost", {
        get: function () {
            return Utils.sums(this.factories, "fixedCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "productsDevelopmentCost", {
        get: function () {
            return Utils.sums(this.products, "productDevelopmentCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machinesMaintenanceCost", {
        get: function () {
            return Utils.sums(this.machineries, "maintenanceCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machinesRunningCost", {
        get: function () {
            return Utils.sums(this.machineries, "runningCost") + Utils.sums(this.products, "prodPlanningCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machinesDecommissioningCost", {
        get: function () {
            return Utils.sums(this.machineries, "decommissioningCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "guaranteeServicingCost", {
        get: function () {
            return Utils.sums(this.products, "guaranteeServicingCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "qualityControlCostCost", {
        get: function () {
            return Utils.sums(this.products, "qualityControlCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "warehousingCost", {
        get: function () {
            return Utils.sums(this.warehouses, "warehousingCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "materialsPurchasedCost", {
        get: function () {
            return Utils.sums(this.materials, "purchasesValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "componentsPurchasedCost", {
        get: function () {
            return Utils.sums(this.semiProducts, "purchasesValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "workersNb", {
        get: function () {
            return Utils.sums(this.workers, "employeesNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "unskilledWorkersWagesCost", {
        get: function () {
            return Utils.sums(this.workers, "adjustedWages", "params.isUnskilled", true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "skilledWorkersWagesCost", {
        get: function () {
            return Utils.sums(this.workers, "adjustedWages", "params.isUnskilled", false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "hourlyWageRatePerCent", {
        get: function () {
            var skilledWorkers = this.workers.filter(function (oWorker) {
                return oWorker.params.isUnskilled === false;
            })[0];
            return skilledWorkers.hourlyWageRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "miscellaneousCost", {
        get: function () {
            var totalCost = 0;
            totalCost += this.factoriesFixedCost;
            totalCost += this.machinesDecommissioningCost;
            totalCost += this.CO2PrimaryFootprintOffsettingCost;
            return totalCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "machineryNetValue", {
        get: function () {
            return Utils.sums(this.machineries, "machineryNetValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "landNetValue", {
        get: function () {
            return Utils.sums(this.lands, "netValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "buildingsNetValue", {
        get: function () {
            return Utils.sums(this.factories, "netValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "depreciation", {
        get: function () {
            var totalValue = 0;
            var machinesDepreciation = Utils.sums(this.machineries, "depreciation");
            var landsDepreciation = Utils.sums(this.lands, "depreciation");
            var factoriesDepreciation = Utils.sums(this.factories, "depreciation");
            totalValue += machinesDepreciation;
            totalValue += landsDepreciation;
            totalValue += factoriesDepreciation;
            return totalValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "inventoriesOpeningValue", {
        get: function () {
            var extractedValue = this.inventoriesLastPOpeningValue;
            var calculatedValue = Utils.sums(this.warehouses, "openingValue");
            return extractedValue || calculatedValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "inventoriesClosingValue", {
        get: function () {
            // the calculation of material is different from warehouse as it includes also next deliveries
            //return Utils.sums(this.warehouses, "closingValue");
            var materialsInventoriesValue = this.materialsInventoriesValue;
            var componentsInventoriesValue = this.componentsInventoriesValue;
            var productsInventoriesValue = this.productsInventoriesValue;
            var total = materialsInventoriesValue + componentsInventoriesValue + productsInventoriesValue;
            return total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "productsInventoriesValue", {
        get: function () {
            return Utils.sums(this.products, "closingValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "productsOpeningInventoriesValue", {
        get: function () {
            return this.productsLastPClosingValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "materialsOpeningInventoriesValue", {
        get: function () {
            return this.materialsLastPClosingValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "componentsInventoriesValue", {
        // just for components
        get: function () {
            return Utils.sums(this.semiProducts, "closingValue", "subContracter");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Production.prototype, "materialsInventoriesValue", {
        get: function () {
            return Utils.sums(this.materials, "closingValue");
        },
        enumerable: true,
        configurable: true
    });
    Production.prototype.getEndState = function (prefix) {
        var deferred = Q.defer();
        var endState = {};
        var that = this;
        var deptName = this.departmentName;
        setImmediate(function () {
            for (var key in that) {
                if (!Production.prototype.hasOwnProperty(key)) {
                    continue;
                }
                console.silly("GES @ %s of %s", deptName, key);
                try {
                    var value = that[key];
                    if (!Utils.isBasicType(value)) {
                        continue;
                    }
                    if (isNaN(value)) {
                        console.warn("GES @ %s: %s is NaN", deptName, key);
                    }
                    key = prefix ? (prefix + key) : key;
                    endState[key] = value;
                }
                catch (e) {
                    console.error(e, "exception @ %s", deptName);
                    deferred.reject(e);
                }
            }
            deferred.resolve(endState);
        });
        return deferred.promise;
    };
    return Production;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Production;
//# sourceMappingURL=Production.js.map