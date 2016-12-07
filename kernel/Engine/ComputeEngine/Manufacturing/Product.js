"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Warehouse = require('./Warehouse');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Collections = require('../../../utils/Collections');
var $jStat = require("jstat");
var jStat = $jStat.jStat;
var extraString = require('string');
function fixImprovementResult(value) {
    if (typeof value === "string") {
        value = value.toUpperCase();
        return ENUMS.IMPROVEMENT_TYPE[value] || ENUMS.IMPROVEMENT_TYPE.NONE;
    }
    return ENUMS.IMPROVEMENT_TYPE.NONE;
}
var Product = (function (_super) {
    __extends(Product, _super);
    function Product(params) {
        _super.call(this, params);
        this.departmentName = "production";
        this.insurance = null;
        this.devStats = new Collections.Stack();
        this.notImplementedRnd = new Collections.Queue();
    }
    Product.prototype._calcRejectedUnitsNbOf = function (quantity) {
        var landa, probability, value = 0, result;
        probability = this.params.rejectedProbability;
        landa = probability * quantity;
        // variable X poisson variates with mean/variance of landa 
        value = Utils.getPoisson(landa);
        if (Utils.NODE_ENV() === "dev") {
            // TEST
            switch (this.params.productID) {
                case "0":
                    value = 94;
                    break;
                case "1":
                    value = 55;
                    break;
                case "2":
                    value = 27;
                    break;
            }
        }
        return value;
    };
    Product.prototype.restoreLastState = function (lastResults, lastDecs) {
        var i = 0;
        var len = Math.max(lastResults.length, lastDecs.length);
        this.lastQualityScores = [];
        var res;
        var dec;
        for (; i < len; i++) {
            res = lastResults[i];
            dec = lastDecs[i];
            var qualityScore = res.qualityScore;
            var improvementsResult = res.improvementsResult;
            if (isNaN(qualityScore)) {
                console.warn("qualityScore NaN");
                qualityScore = 0;
            }
            if (improvementsResult === undefined) {
                console.warn("improvementsResult NaN");
                improvementsResult = ENUMS.IMPROVEMENT_TYPE[0];
            }
            if (isNaN(dec.developmentBudget)) {
                console.warn("dec.developmentBudget NaN");
                dec.developmentBudget = 0;
            }
            this.lastQualityScores.push(qualityScore);
            var improvementResult = fixImprovementResult(improvementsResult);
            var devBudget = dec.developmentBudget * 1000;
            this.lastImprovementResults.push(improvementResult);
            this.lastDevBudgets.push(devBudget);
            if (dec.improvementsTakeup) {
                this.notImplementedRnd.clear();
            }
            if (improvementResult === ENUMS.IMPROVEMENT_TYPE.MAJOR) {
                this.notImplementedRnd.add(i);
            }
            this.devStats.add({
                devBudget: devBudget,
                improvementResult: improvementResult,
            });
            // à la suite d’une amélioration réussie, l’équipe embarque sur des nouveaux projets
            // if major we begin from 0 //  i < len => as the last one is the current and we dont yet fix improv result
            if (improvementResult === ENUMS.IMPROVEMENT_TYPE.MAJOR) {
                this.devStats.clear();
            }
        }
        this.lastDevProgress = res.devProgress;
        // regression
        if (this.lastDevProgress === undefined) {
            this.lastDevProgress = 1 - Math.exp(-this.devStats.size() * jStat(this.lastDevBudgets).sum() / this.params.minEffectiveDevBudget);
        }
        if (isNaN(res.qualityScore)) {
            console.warn("res.qualityScore NaN");
            res.qualityScore = 0;
        }
        if (isNaN(res.RnDQuality)) {
            console.warn("res.RnDQuality NaN");
            res.RnDQuality = 0;
        }
        this.lastQualityScore = res.qualityScore;
        this.lastRnDQuality = res.RnDQuality;
        this.lastRnDImplementDecision = dec.improvementsTakeup;
    };
    Product.prototype.init = function (semiProducts, economy, lastResults, lastDecs) {
        _super.prototype.init.call(this);
        this.semiProducts = semiProducts;
        this.economy = economy;
        this.restoreLastState(lastResults, lastDecs);
        var warehouseID = "warehouse" + this.params.id;
        var externalStorageUnitCost = this.params.costs.externalStorageUnitCost;
        // external storage and lost probability just for local stocks this is just a global temporary container for each submarket stock
        this.warehouse = new Warehouse.Warehouse({
            id: warehouseID,
            label: warehouseID,
            lostProbability: 0,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: 0,
                externalStorageUnitCost: 0
            }
        }, this);
        this.warehouse.stockedItem = this;
        this.warehouse.init(0);
    };
    Product.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.wantedNb = 0;
        this.manufacturedNb = 0;
        this.rejectedNb = 0;
        this.servicedQ = 0;
        this.localStocks = [];
        this.lastManufacturingParams = null;
        this.onMajorImprovementImplemented = function () { };
        this.onMinorImprovementImplemented = function () { };
        this.devStats.clear();
        this.notImplementedRnd.clear();
        this.lastImprovementResults = [];
        this.lastDevBudgets = [];
        // dec to 0
        this.developmentBudget = 0;
        this.isImprovementsImplemented = false;
    };
    Product.prototype.registerLocalStock = function (stock) {
        this.localStocks.push(stock);
    };
    Object.defineProperty(Product.prototype, "materialUnitCost", {
        get: function () {
            return Utils.sums(this.semiProducts, "materialUnitCost", null, null, null, ">", 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "manufacturingUnitCost", {
        get: function () {
            return Utils.sums(this.semiProducts, "manufacturingUnitCost", null, null, null, ">", 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "inventoryUnitValue", {
        // set valuation method
        get: function () {
            var totalCost = this.materialUnitCost + this.manufacturingUnitCost;
            var unitValue = totalCost * 1.1;
            return Utils.ceil(unitValue, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "producedNb", {
        // this is just manufactured - rejected - lost
        get: function () {
            return this.manufacturedNb - this.rejectedNb - this.lostNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "scheduledNb", {
        get: function () {
            var wantedNb = this.wantedNb;
            var producedNb = this.producedNb;
            if (producedNb > wantedNb) {
                return wantedNb;
            }
            return producedNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "openingValue", {
        get: function () {
            var openingValue = Utils.sums(this.localStocks, "openingValue", null, null, null, ">", 2);
            return openingValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "closingValue", {
        get: function () {
            var closingQ = Utils.sums(this.localStocks, "closingQ", null, null, null, ">", 2);
            var closingValue = closingQ * this.inventoryUnitValue;
            return closingValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "availableNb", {
        get: function () {
            return this.warehouse.availableQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "lostNb", {
        get: function () {
            return Utils.sums(this.localStocks, "lostQ") + Utils.sums(this.localStocks, "spoiledQ");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "scrapRevenue", {
        get: function () {
            var inflationImpact = this.economy.PPIOverheads;
            var scrapValue = Math.round(this.params.costs.scrapValue * inflationImpact);
            return this.rejectedNb * scrapValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "guaranteeServicingCost", {
        /*
         * The servicing of products returned under guarantee is carried out in those areas by local service agents,
         * who charge you (at fixed rates) for the work carried out.
         * Products returned to your internet distributor are repaired locally by a sub-contractor at the same rates (including delivery).
         */
        // considered not so influenced by inflation as it fixed in contrat
        get: function () {
            var inflationImpact = this.economy.PPIServices;
            var guaranteeServicingCharge = Math.round(this.params.costs.guaranteeServicingCharge * inflationImpact);
            return this.servicedQ * guaranteeServicingCharge;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "productDevelopmentCost", {
        get: function () {
            return this.developmentBudget;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "qualityControlCost", {
        // not considered influenced by inflation
        get: function () {
            var inflationImpact = this.economy.PPIOverheads;
            var inspectionUnit = Math.round(this.params.costs.inspectionUnit * inflationImpact);
            return this.manufacturedNb * inspectionUnit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "prodPlanningCost", {
        // not considered influenced by inflation
        get: function () {
            var inflationImpact = this.economy.PPIOverheads;
            var planningUnit = Math.round(this.params.costs.planningUnit * inflationImpact);
            return this.scheduledNb * planningUnit;
        },
        enumerable: true,
        configurable: true
    });
    Product.prototype.getNeededResForProd = function (quantity) {
        var semiProductsDecisions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            semiProductsDecisions[_i - 1] = arguments[_i];
        }
        var rejectedNb = this._calcRejectedUnitsNbOf(quantity);
        quantity += rejectedNb;
        var i = 0, len = this.semiProducts.length, manufacturingUnitTime, premiumQualityProp, result = [];
        var resources;
        var lastParams = [].concat(this.lastManufacturingParams);
        var needed = {};
        for (; i < len; i++) {
            manufacturingUnitTime = semiProductsDecisions[2 * i] || lastParams[2 * i] || 0;
            premiumQualityProp = semiProductsDecisions[2 * i + 1] || lastParams[2 * i] || 0;
            resources = this.semiProducts[i].getNeededResForProd(quantity, manufacturingUnitTime, premiumQualityProp);
            result.push(resources);
        }
        for (var j = 0, len = result.length; j < len; j++) {
            for (var key in result[j]) {
                if (!result[j].hasOwnProperty(key)) {
                    continue;
                }
                if (isNaN(needed[key])) {
                    needed[key] = result[j][key];
                }
                else {
                    needed[key] += result[j][key];
                }
            }
        }
        return needed;
    };
    Object.defineProperty(Product.prototype, "spaceUsed", {
        get: function () {
            return Utils.sums(this.localStocks, "spaceUsed", null, null, null, ">", 2);
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Product.prototype.produce = function (quantity) {
        var semiProductsDecisions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            semiProductsDecisions[_i - 1] = arguments[_i];
        }
        if (!this.isInitialised()) {
            console.warn('Product not initialised to Manufacture');
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('produc Pdt @Quantity not reel', arguments);
            return;
        }
        if (!Number.isInteger(quantity)) {
            quantity = Math.round(quantity);
        }
        var manufacturedNb, rejectedNb, availableNb, newArgs;
        this.wantedNb += quantity;
        manufacturedNb = this.manufacture.apply(this, arguments);
        // we do control and reject
        rejectedNb = this.inspect(manufacturedNb);
        newArgs = [rejectedNb].concat(semiProductsDecisions);
        manufacturedNb += this.manufacture.apply(this, newArgs); // it will call last params for manufacturing rejected
        availableNb = manufacturedNb - rejectedNb;
        // now supply the stock
        this.warehouse.moveIn(availableNb);
        return availableNb;
    };
    Product.prototype.manufacture = function (quantity) {
        var semiProductsDecisions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            semiProductsDecisions[_i - 1] = arguments[_i];
        }
        if (!this.isInitialised()) {
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Manufacture Pdt@ Quantity not reel', arguments);
            return 0;
        }
        var wantedNb = quantity;
        var diff = (this.semiProducts.length * 2) - (semiProductsDecisions.length - 1);
        if (diff < 0) {
            console.warn("you didn't give us enough params to manufacture", diff);
        }
        var semiPTypesNb = this.semiProducts.length, manufacturingUnitTime, premiumQualityProp, unitsNb, result = [], finalisedNb;
        var paramsNb = semiProductsDecisions.length;
        // something wrong with params
        if (paramsNb !== (semiPTypesNb * 2) || !Utils.testIfAllParamsIsNumeric(semiProductsDecisions)) {
            console.warn("manufacturing product @ error at params number");
            if (!this.lastManufacturingParams) {
                console.error(new Error(), "manufacturing product @ serious error for first call");
                return 0;
            }
            semiProductsDecisions = this.lastManufacturingParams;
        }
        else {
            this.lastManufacturingParams = semiProductsDecisions;
        }
        for (var i = 0; i < semiPTypesNb; i++) {
            var prodQ;
            manufacturingUnitTime = semiProductsDecisions[2 * i] || 0;
            premiumQualityProp = semiProductsDecisions[2 * i + 1] || 0;
            unitsNb = this.semiProducts[i].deliverTo(quantity, manufacturingUnitTime, premiumQualityProp); // 3la 7ssab lost la tkon f Stock w bghit li sna3t lost 3la 7sabkom
            result.push(unitsNb);
        }
        // we sort the results DESC and we take the first as it the min value
        result.sort(function (a, b) { return a - b; });
        finalisedNb = result[0];
        console.debug("The min from ", result, " is ", finalisedNb);
        if (!finalisedNb || finalisedNb < 0) {
            console.warn("no finalised product:", finalisedNb);
            return 0;
        }
        this.manufacturedNb += finalisedNb;
        return finalisedNb;
    };
    Product.prototype.inspect = function (quantity) {
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Inspect product @ Quantity not reel :', quantity);
            return 0;
        }
        var rejectedNb = this._calcRejectedUnitsNbOf(quantity);
        this.rejectedNb += rejectedNb;
        return rejectedNb;
    };
    Product.prototype.deliverTo = function (quantity, market, price, advertisingBudget, customerCredit) {
        if (!this.isInitialised()) {
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Delivery Pdt @ Quantity not reel : %d', quantity);
            return 0;
        }
        if (!Number.isInteger(quantity)) {
            quantity = Math.round(quantity);
        }
        /*var availableQ = this.warehouse.availableQ,
            diff: number,
            args,
            deliveredQ: number;


        diff = quantity - availableQ;

        // on peut pas satisfaire la totalité de la demande
        if (diff > 0) {
            args = [diff];
            args = args.concat(this.lastManufacturingParams);
           
            console.debug("Product", this.params.id, " call for compensation", diff);

            this.manufacture.apply(this, args);
            
        }*/
        var deliveredQ = this.warehouse.moveOut(quantity);
        market.receiveFrom(deliveredQ, this, price, advertisingBudget, customerCredit);
        return quantity;
    };
    Object.defineProperty(Product.prototype, "investmentEffort", {
        get: function () {
            var effort;
            // A steady effort is most likely to be effective.
            var devBudgets = [], devVariations = [], devResults = [];
            this.devStats.forEach(function (elm) {
                devBudgets.push(elm.devBudget);
                devResults.push(elm.improvementResult);
            });
            var cumulativeBudget = jStat(devBudgets).sum() + this.developmentBudget;
            var lastStat = this.devStats.peek();
            var lastDevBudget = lastStat && lastStat.devBudget || 1;
            var lastVariation = this.developmentBudget / lastDevBudget;
            var projectMaturity = this.devStats.size() + 1;
            // le cout total criitique augmente evec l'inflation
            var minEffectiveDevBudget = Math.round(this.params.minEffectiveDevBudget * this.economy.producerPriceBase100Index / 100);
            // TODO: develop effect of not steady effort
            if (lastVariation < 1) {
                cumulativeBudget *= (1 - lastVariation / projectMaturity);
            }
            // La production ne sera possible que si l’effort total nécessaire a été produit. 
            effort = cumulativeBudget / minEffectiveDevBudget;
            return effort;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "RnDProjectProgress", {
        get: function () {
            var progress;
            var investmentEffort = this.investmentEffort;
            var projectMaturity = this.devStats.size() + 1; // current period
            progress = 1 - Math.exp(-projectMaturity * investmentEffort);
            return progress;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "improvementResult", {
        // le degré de réussite de votre département Recherche et Développement
        get: function () {
            var result;
            var RnDProjectProgress = this.RnDProjectProgress;
            var MINOR_STEP = 0.1;
            if (RnDProjectProgress === 1) {
                result = ENUMS.IMPROVEMENT_TYPE.MAJOR;
            }
            else if (RnDProjectProgress - this.lastDevProgress > MINOR_STEP && this.developmentBudget > 0) {
                result = ENUMS.IMPROVEMENT_TYPE.MINOR;
            }
            else {
                result = ENUMS.IMPROVEMENT_TYPE.NONE;
            }
            return ENUMS.IMPROVEMENT_TYPE[result];
        },
        enumerable: true,
        configurable: true
    });
    Product.prototype.developWithBudget = function (developmentBudget) {
        if (!Utils.isNumericValid(developmentBudget)) {
            console.warn('Dev Product @ Budget not reel : %d', developmentBudget);
            return false;
        }
        this.developmentBudget = developmentBudget;
        return true;
    };
    Product.prototype.onMajorImprovementImplemented = function () { };
    Product.prototype.onMinorImprovementImplemented = function () { };
    Product.prototype.soldOff = function () {
        var soldOffQ = 0;
        this.localStocks.forEach(function (stock) {
            soldOffQ += stock.openingQ;
            stock.init(0);
        });
        return soldOffQ;
    };
    Object.defineProperty(Product.prototype, "majorNotYetImplementedNb", {
        get: function () {
            return this.notImplementedRnd.size();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "isMajorImplementedLastPeriod", {
        get: function () {
            var lastRes = this.lastImprovementResults[this.lastImprovementResults.length - 1];
            return this.lastRnDImplementDecision && lastRes === ENUMS.IMPROVEMENT_TYPE.MAJOR;
        },
        enumerable: true,
        configurable: true
    });
    Product.prototype.takeUpImprovements = function (toImplement) {
        var lastRes = this.lastImprovementResults[this.lastImprovementResults.length - 1];
        var isThereAnyMajorNotYetImplemented = this.majorNotYetImplementedNb > 0;
        // It is possible to leave a major improvement for so long that a second one is reported. 
        // In this case when you do take one up, you automatically take both with an increased marketing effect.
        if (isThereAnyMajorNotYetImplemented && toImplement) {
            // only concerned by major
            this.isImprovementsImplemented = true;
            // the introduction of a major improvement renders existing models of the product obsolete. 
            this.soldOff();
            this.onMajorImprovementImplemented();
        }
        if (lastRes === ENUMS.IMPROVEMENT_TYPE.MINOR) {
            this.onMinorImprovementImplemented();
        }
        if (lastRes === ENUMS.IMPROVEMENT_TYPE.NONE && toImplement) {
            // If you start the process to take one up without having had one reported, 
            // it goes ahead anyway and existing stocks are sold off, but there is no corresponding marketing advantage.
            this.soldOff();
        }
    };
    Object.defineProperty(Product.prototype, "assemblyQuality", {
        get: function () {
            var quality;
            var coefficient;
            var assembledSubPdt = this.semiProducts.filter(function (subPdt) {
                return !subPdt.isMachined;
            })[0];
            // Assembly time should be transformed from absolute time in minutes to percentage. 
            var ratio = Utils.ceil(assembledSubPdt.lastManufacturingParams[0] / assembledSubPdt.params.manufacturingCfg.minManufacturingUnitTime, 2);
            // Each additional percentage increases quality estimate of the product, 
            // but the effect is decreasing and each additional percentage has lighter weight than the previous one.
            // The resulting score should be added to the overall quality estimate of the product.
            // Estimate is rounded according to the rule of rounding.
            if (ratio < 1) {
                coefficient = 0;
            }
            else if (ratio <= 1.2) {
                coefficient = 0.315;
            }
            else if (ratio <= 1.4) {
                coefficient = 0.310;
            }
            else if (ratio <= 1.6) {
                coefficient = 0.305;
            }
            else if (ratio <= 1.8) {
                coefficient = 0.300;
            }
            else {
                coefficient = 0.295;
            }
            quality = ratio <= 1 ? 0 : (ratio - 1) * coefficient;
            return quality;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "materialsQuality", {
        get: function () {
            var quality;
            var coefficient;
            var premiumQualityProp = this.lastManufacturingParams[1];
            // Also, as for the assembly, each additional percent increase quality estimate of the product, 
            // but the effect is decreasing and each additional percentage has lighter weight than the previous one.
            // The resulting score should be added to the overall quality estimate of the product.Estimate is rounded according to the rule of rounding.
            if (premiumQualityProp < 0.01) {
                coefficient = 0;
            }
            else if (premiumQualityProp <= 0.2) {
                coefficient = 0.165;
            }
            else if (premiumQualityProp <= 0.4) {
                coefficient = 0.160;
            }
            else if (premiumQualityProp <= 0.6) {
                coefficient = 0.155;
            }
            else if (premiumQualityProp <= 0.8) {
                coefficient = 0.150;
            }
            else {
                coefficient = 0.145;
            }
            quality = premiumQualityProp < 1 ? 0 : premiumQualityProp * coefficient;
            return quality;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "RnDQuality", {
        /*
         * Quality estimate in R&D depends on:
         * - Getting R&D
         * - Implementation of R&D
         * - Aging of product
        */
        get: function () {
            var quality = 0;
            var scoreBeforeAging;
            var agingImpact;
            // Getting R&D
            // Getting Major gives +6 points, getting Major is equal to getting Minor.
            switch (this.improvementResult) {
                case ENUMS.IMPROVEMENT_TYPE[ENUMS.IMPROVEMENT_TYPE.MINOR]:
                case ENUMS.IMPROVEMENT_TYPE[ENUMS.IMPROVEMENT_TYPE.MAJOR]:
                    quality += 6;
                    break;
            }
            // Implementation of R&D
            if (this.isImprovementsImplemented) {
                // Implementation of Major gives + 20 points
                // It is possible to leave a major improvement for so long that a second one is reported.
                // In this case when you do take one up, you automatically take both with an increased marketing effect.
                quality += (20 * this.notImplementedRnd.size());
            }
            // Aging process reduces quality estimate
            // depending on the absolute value, estimate is reduced each period.
            // The higher quality estimate of the product, the faster it becomes old.
            scoreBeforeAging = (this.lastRnDQuality + quality - 60) / 20;
            agingImpact = scoreBeforeAging > 0 ? Math.floor(scoreBeforeAging) + 4 : 0;
            quality -= agingImpact;
            quality += this.lastRnDQuality;
            return quality;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "qualityScore", {
        // Estimation value sum from R&D, assembly time and hign quality raw materials. 
        // Than it is rounded to the nearest hundredth according to the rule.
        // Actual error of such estimation is + /- 0.01 compared with fact.
        /*get customerQualityEstimate(): number {
            var quality = this.RnDQuality + this.assemblyQuality + this.materialsQuality;
    
            return Utils.round(quality, 2);
        }*/
        get: function () {
            var score = (this.RnDQuality * 0.05 - 3) + this.materialsQuality + this.assemblyQuality;
            return Utils.round(score, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "consumerStarRatings", {
        get: function () {
            var starsNb = Math.round(this.qualityScore);
            return extraString('').padLeft(starsNb, '*').s;
        },
        enumerable: true,
        configurable: true
    });
    Product.prototype.returnForRepair = function (quantity) {
        this.servicedQ += quantity;
    };
    Product.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.guaranteeServicingCost, this.params.payments.guaranteeServicing, 'guaranteeServicing');
        this.CashFlow.addPayment(this.qualityControlCost, this.params.payments.qualityControl, 'qualityControl');
        this.CashFlow.addPayment(this.productDevelopmentCost, this.params.payments.development, 'development');
        this.CashFlow.addPayment(this.prodPlanningCost, this.params.payments.prodPlanning, 'prodPlanning');
        // TODO: add Dangerous or ecologically unsound products are included in guarantee servicing, and are usually large quantities.
        var losses = this.lostNb * this.inventoryUnitValue;
        this.insurance && this.insurance.claims(losses);
    };
    Object.defineProperty(Product.prototype, "state", {
        get: function () {
            return {
                "scheduledQ": this.scheduledNb,
                "producedQ": this.manufacturedNb,
                "rejectedQ": this.rejectedNb,
                "servicedQ": this.servicedQ,
                "lostQ": this.lostNb,
                "improvementsResult": this.improvementResult,
                "qualityScore": this.qualityScore,
                "RnDQuality": this.RnDQuality,
                "consumerStarRatings": this.consumerStarRatings
            };
        },
        enumerable: true,
        configurable: true
    });
    return Product;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Product;
//# sourceMappingURL=Product.js.map