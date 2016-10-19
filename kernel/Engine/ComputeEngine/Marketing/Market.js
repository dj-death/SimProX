"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var ECommerce_1 = require('./ECommerce');
var Manufacturing_1 = require('../Manufacturing');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Game = require('../../../simulation/Games');
var everpolate = require('everpolate');
var linear = everpolate.linear;
var linearSolver = require('linear-solve');
// TEST
var UNIT_VALUES = [98.85, 157.18, 254.74];
function solveFactorElasticiy(value, desiredElasticities, isNonPrice) {
    if (isNonPrice === void 0) { isNonPrice = false; }
    var g1;
    var g2;
    var A = [];
    var b = [];
    desiredElasticities.forEach(function (item) {
        var factor = item.value * (1 + Math.log(item.value));
        if (isNonPrice) {
            factor *= -1;
        }
        A.push([1, factor]);
        b.push(item.elasticity);
        if (desiredElasticities.length === 1) {
            factor = item.value;
            if (!isNonPrice) {
                factor *= -1;
            }
            var e2 = Math.pow(item.elasticity, 2);
            A.push([1, factor]);
            b.push(e2);
        }
    });
    var solution = linearSolver.solve(A, b);
    if (!solution || solution.length < 2) {
        console.error("equation solving fails", A, b);
    }
    var gF1 = Utils.round(solution[0], 3);
    var gF2 = Utils.round(solution[1], 3);
    console.info("g1 : %d, g2: %d", gF1, gF2);
    if (isNonPrice) {
        return gF1 - (gF2 * value);
    }
    return gF1 + (gF2 * value);
}
var SubMarket = (function (_super) {
    __extends(SubMarket, _super);
    function SubMarket(market, params) {
        _super.call(this, params);
        this.departmentName = "marketing";
        this.market = market;
        this.economy = this.market.economy;
    }
    SubMarket.prototype.restoreLastState = function (lastResults, lastDecs) {
        var i = 0;
        var len = Math.max(lastResults.length, lastDecs.length);
        this.lastPrices = [];
        this.lastAdsBudgets = [];
        this.lastCreditEasings = [];
        this.lastQualityScores = this.product.lastQualityScores;
        var lastPDec;
        var lastPRes;
        for (; i < len; i++) {
            lastPDec = lastDecs[i];
            lastPRes = lastResults[i];
            this.lastPrices.push(lastPDec.price);
            this.lastAdsBudgets.push(lastPDec.advertisingBudget * 1000);
            var credit = lastPDec.customerCredit || this.params.defaultCustomerCredit;
            var creditEasing = this.calcCreditEasing(credit);
            this.lastCreditEasings.push(creditEasing);
        }
        this.lastStockClosingQ = lastPRes.stockQ; // TODO see if it ok
        this.lastStockClosingValue = lastPRes.stockValue || (lastPRes.stockQ * UNIT_VALUES[this.productId]);
        this.lastPBacklogQ = Number(lastPRes.backlogQ) || 0;
        this.openingBacklogQ = Number(lastPRes.backlogQ) || 0;
        this.lastSoldQ = lastPRes.soldQ;
        this.lastIndustrySatisfactionScoreAvg = lastPRes.industrySatisfactionScoreAvg || 0.5;
    };
    SubMarket.prototype.init = function (product, salesForce, lastResults, lastDecs) {
        _super.prototype.init.call(this);
        this.product = product;
        this.productId = product.params.code;
        this.salesForce = salesForce;
        this.restoreLastState(lastResults, lastDecs);
        // create warehouse
        var warehouseID = "warehouse_" + this.params.id;
        var initialExchangeRate = this.economy.currency.initialExchangeRate;
        var storageCostPerProductUnit = this.params.costs.storageCostPerProductUnit * initialExchangeRate;
        this.warehouse = new Manufacturing_1.Warehouse({
            id: warehouseID,
            label: warehouseID,
            lostProbability: product.params.lostProbability,
            costs: {
                fixedAdministrativeCost: 0,
                storageUnitCost: storageCostPerProductUnit,
                externalStorageUnitCost: 0
            }
        });
        this.warehouse.stockedItem = this.product;
        this.warehouse.init(this.lastStockClosingQ, this.lastStockClosingValue);
        this.product.registerLocalStock(this.warehouse);
    };
    SubMarket.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.orderedQ = 0;
        this.lastPBacklogSoldQ = 0;
        this.openingBacklogQ = 0;
    };
    Object.defineProperty(SubMarket.prototype, "soldOffQ", {
        get: function () {
            return this.lastStockClosingQ - this.warehouse.openingQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "deliveredQ", {
        get: function () {
            return this.warehouse.inQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "effectiveDeliveredQ", {
        get: function () {
            return this.warehouse.inQ - this.warehouse.lostQ - this.warehouse.spoiledQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "soldQ", {
        get: function () {
            var demandQ = this.orderedQ + this.lastPBacklogSoldQ;
            var supplyQ = this.effectiveDeliveredQ + this.warehouse.openingQ - this.soldOffQ;
            return Math.min(demandQ, supplyQ);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "backlogQ", {
        get: function () {
            if (!this.params.acceptBacklog) {
                return 0;
            }
            return Math.floor(this.shortfallQ * (1 - this.params.dissatisfiedOrdersCancelledPercent));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "shortfallQ", {
        get: function () {
            return this.warehouse.shortfallQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "stockQ", {
        get: function () {
            return this.warehouse.availableQ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "salesRevenue", {
        get: function () {
            return this.soldQ * this.price;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "ordersValue", {
        get: function () {
            return this.orderedQ * this.price;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "soldOffValue", {
        get: function () {
            // todo fix for cmup with inventory value
            return this.soldOffQ * this.product.inventoryUnitValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "stockValue", {
        get: function () {
            // todo fix for cmup with inventory value
            return this.stockQ * this.product.inventoryUnitValue;
        },
        enumerable: true,
        configurable: true
    });
    SubMarket.prototype.calcCreditEasing = function (credit) {
        var maxCredit = this.params.periodDaysNb;
        return credit / maxCredit;
    };
    Object.defineProperty(SubMarket.prototype, "smoothedCustomerCreditEasing", {
        // effect of previous investments continues to act in the current period. 
        get: function () {
            var credit;
            var residualFactor = Game.configs.demandFactors.customerCredit.residualEffect;
            var currCreditEasing = this.calcCreditEasing(this.customerCredit);
            var lastSmoothedCreditEasing = Utils.simpleexpSmooth(this.lastCreditEasings, residualFactor);
            // Cumulative effect lasts for 1 or 2 periods.
            credit = currCreditEasing * (1 - residualFactor) + lastSmoothedCreditEasing * residualFactor;
            return credit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "creditEfficiency", {
        get: function () {
            var refRatio = this.smoothedCustomerCreditEasing; // as cash is ref so nothing will be different 
            var industryRatio = this.smoothedCustomerCreditEasing * 0.5 / this.industryCreditEasingAvg;
            var competitorsInfluence = Game.configs.demandFactors.customerCredit.competitorsInfluence;
            var eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);
            if (eff > 1) {
                eff = 1;
            }
            if (eff < 0) {
                eff = 0;
            }
            return Utils.round(eff, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "smoothedDirectAdsBudget", {
        // effect of previous investments continues to act in the current 
        get: function () {
            var budget;
            var residualFactor = Game.configs.demandFactors.directAds.adsInvestmentCumulativeEffect;
            var lastSmoothedDirectAdsBudget = Utils.simpleexpSmooth(this.lastAdsBudgets, residualFactor);
            // Cumulative effect lasts for 1 or 2 periods.
            budget = this.advertisingBudget * (1 - residualFactor) + lastSmoothedDirectAdsBudget * residualFactor;
            return budget;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "directAdsEfficiency", {
        get: function () {
            var range = this.params.directAdsBudgetRanges[this.productId];
            var refRatio = Utils.normalize(this.smoothedDirectAdsBudget, range);
            var industryRatio = this.smoothedDirectAdsBudget * 0.5 / this.industryDirectAdsBudgetAvg;
            var competitorsInfluence = Game.configs.demandFactors.directAds.competitorsInfluence;
            var eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);
            if (eff < 0) {
                eff = 0;
            }
            if (eff > 1) {
                eff = 1;
            }
            return Utils.round(eff, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "smoothedPrice", {
        get: function () {
            var price;
            var residualFactor = Game.configs.demandFactors.price.residualEffect;
            var lastSmoothedPrice = Utils.simpleexpSmooth(this.lastPrices, residualFactor);
            // Cumulative effect lasts for 1 or 2 periods.
            price = this.price * (1 - residualFactor) + lastSmoothedPrice * residualFactor;
            return price;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "priceToRefRatio", {
        // TODO: devlopt in function of quality
        get: function () {
            var pricesByQ = this.params.refPrices[this.productId];
            var minQuality = Game.configs.demandFactors.quality.minValue;
            var maxQuality = Game.configs.demandFactors.quality.maxValue;
            var currency = this.economy.currency;
            var exchangeRate = Utils.round(currency.initialExchangeRate * 0.33 + currency.quotedExchangeRate * 0.67, 2);
            // linear(xx {Array|Number}, XX {Array}, YY {Array}) → {Array}
            var refPrice = everpolate.linear(this.product.qualityScore, [minQuality, maxQuality], [pricesByQ.LQPriceRef, pricesByQ.HQPriceRef]);
            var ratio = (this.price / exchangeRate) * 0.5 / refPrice; // as price in euro and the ref in local curr
            return ratio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "smoothedQuality", {
        get: function () {
            var quality;
            var residualFactor = Game.configs.demandFactors.quality.residualEffect;
            var lastSmoothedQuality = Utils.simpleexpSmooth(this.lastQualityScores, residualFactor);
            // Cumulative effect lasts for 1 or 2 periods.
            quality = this.product.qualityScore * (1 - residualFactor) + lastSmoothedQuality * residualFactor;
            return quality;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "qualityEfficiency", {
        get: function () {
            var range = this.params.qualityRanges[this.productId];
            var refRatio = Utils.normalize(this.smoothedQuality, range);
            var industryRatio = this.smoothedQuality * 0.5 / this.industryQualityScoreAvg;
            var competitorsInfluence = Game.configs.demandFactors.quality.competitorsInfluence;
            var eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);
            if (eff < 0) {
                eff = 0;
            }
            if (eff > 1) {
                eff = 1;
            }
            return Utils.round(eff, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "customerSatisfactionScore", {
        get: function () {
            var satisfaction;
            var score;
            var scoreRef = this.priceToRefRatio; // Note recherché par Client
            // is ECommerce
            if (this.market.hasECommerce && this.salesForce.employeesNb <= 0) {
                return 0;
            }
            score = this.directAdsEfficiency * this.params.directAdsWeights[this.productId];
            score += this.creditEfficiency * this.params.creditWeights[this.productId];
            score += this.qualityEfficiency * this.params.qualityWeights[this.productId];
            score += this.market.corporateAdsEfficiency * this.params.corporateComWeights[this.productId];
            score += this.market.salesForceGlobalEfficiency * this.params.salesForceWeights[this.productId];
            if (this.market.hasECommerce) {
                score += this.market.websiteEfficiency * this.params.websiteQualityWeights[this.productId];
            }
            satisfaction = score * 0.5 / scoreRef; // reference so the median effect 50 %
            return Utils.round(satisfaction, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "developmentRate", {
        get: function () {
            var rate;
            var PLC = this.params.productLifeCycle[this.productId];
            var initialPLCStage = this.params.initialPLCStage[this.productId];
            var currPeriod = this.market.currPeriod;
            var endGrowth = PLC.introduction + PLC.growth;
            var endMaturity = endGrowth + PLC.maturity;
            var maturityPeak = endGrowth + Math.round(PLC.maturity * 1 / 3);
            var elapsedStageTimeRate;
            var polyInterpolate = everpolate.polynomial;
            // elapsedTime till the middle of the current period (0.5) in months from period 0
            var elapsedTime;
            var RnDImpact = 0;
            var RnDFactor;
            // we add 
            switch (initialPLCStage) {
                case ENUMS.PLC_STAGE.INTRODUCTION:
                    elapsedTime = 0;
                    break;
                case ENUMS.PLC_STAGE.GROWTH:
                    elapsedTime = PLC.introduction;
                    break;
                case ENUMS.PLC_STAGE.MATURITY_BEGIN:
                    elapsedTime = endGrowth;
                    break;
                case ENUMS.PLC_STAGE.MATURITY_END:
                    elapsedTime = maturityPeak;
                    break;
                case ENUMS.PLC_STAGE.DECLINE:
                    elapsedTime = endMaturity;
                    break;
            }
            elapsedTime += Math.ceil(currPeriod * Game.daysNbByPeriod / 60);
            if (elapsedTime < 1) {
                elapsedTime = 1;
            }
            /* S-Curve
                 *
                 * S: Saturation Maximum Feasible Market Penetration
                 * Yg Start of Growth Stage = Time to get into the critical mass of 10 %
                 * Tm: Take Over Time = Time to get into the red zone of maturity or 90 %
                 */
            var S = 1;
            var Yg = PLC.introduction;
            var Tg = PLC.growth;
            var Tm = Math.round(PLC.maturity * 2 / 3);
            var Td = PLC.decline;
            var base;
            if (elapsedTime < maturityPeak) {
                base = (Yg + (Tg / 2) - elapsedTime) / Tg;
                rate = S / (1 + Math.pow(81, base));
            }
            else {
                base = (Tm + (Td / 2) - (elapsedTime - maturityPeak)) / Td;
                rate = 1 - (S / (1 + Math.pow(81, base)));
            }
            RnDImpact = 0.4 * (1 - 1 / Math.exp(this.product.majorNotYetImplementedNb * 0.2));
            if (this.product.isMajorImplementedLastPeriod && !this.product.majorNotYetImplementedNb) {
                RnDImpact += (1.1 * 0.4 * (1 - 1 / Math.exp(1 * 0.2))); // 110 % from RnD jsut like if it happen now
            }
            // is the inverse of derivatife as it like an elasticity
            base = (-elapsedTime + (Tg / 2) + Yg) / Tg;
            var derivative = Math.log(81) * Math.pow(81, base) / (Tg * Math.pow(Math.pow(81, base) + 1, 2));
            RnDFactor = Utils.round((1 / (10 * derivative + 0.25)) / 2, 2);
            RnDImpact *= (1 + RnDFactor);
            rate += RnDImpact;
            if (rate > 1.25) {
                rate = 1.25;
            }
            if (rate < 0) {
                rate = 0;
            }
            return Utils.round(rate, 4);
        },
        enumerable: true,
        configurable: true
    });
    SubMarket.prototype.__developmentRate = function (elapsedTime, majors) {
        this.__testArr = this.__testArr || [];
        var rate;
        var PLC = this.params.productLifeCycle[this.productId];
        var initialPLCStage = this.params.initialPLCStage[this.productId];
        var currPeriod = this.market.currPeriod;
        var endGrowth = PLC.introduction + PLC.growth;
        var endMaturity = endGrowth + PLC.maturity;
        var maturityPeak = endGrowth + Math.round(PLC.maturity * 1 / 3);
        var elapsedStageTimeRate;
        var polyInterpolate = everpolate.polynomial;
        var RnDImpact = 0;
        var RnDFactor;
        /* S-Curve
             *
             * S: Saturation Maximum Feasible Market Penetration
             * Yg Start of Growth Stage = Time to get into the critical mass of 10 %
             * Tm: Take Over Time = Time to get into the red zone of maturity or 90 %
             */
        var S = 1;
        var Yg = PLC.introduction;
        var Tg = PLC.growth;
        var Tm = Math.round(PLC.maturity * 2 / 3);
        var Td = PLC.decline;
        var base;
        if (elapsedTime < maturityPeak) {
            base = (Yg + (Tg / 2) - elapsedTime) / Tg;
            rate = S / (1 + Math.pow(81, base));
        }
        else {
            base = (Tm + (Td / 2) - (elapsedTime - maturityPeak)) / Td;
            rate = 1 - (S / (1 + Math.pow(81, base)));
        }
        RnDImpact = 0.4 * (1 - 1 / Math.exp(majors * 0.2));
        this.__testArr[elapsedTime] = majors;
        if (this.__testArr[elapsedTime - 1]) {
            RnDImpact += 0.09;
        }
        // is the inverse of derivatife as it like an elasticity
        base = (-elapsedTime + (Tg / 2) + Yg) / Tg;
        var derivative = Math.log(81) * Math.pow(81, base) / (Tg * Math.pow(Math.pow(81, base) + 1, 2));
        RnDFactor = Utils.round((1 / (10 * derivative + 0.25)) / 2, 2);
        RnDImpact *= (1 + RnDFactor);
        rate += RnDImpact;
        if (rate > 1.25) {
            rate = 1.25;
        }
        if (rate < 0) {
            rate = 0;
        }
        return Utils.round(rate, 4);
    };
    Object.defineProperty(SubMarket.prototype, "tradingReceipts", {
        // cash flows
        get: function () {
            var currPeriodReceiptsRatio, credit = this.customerCredit, latePaymentsRate = 0;
            if (credit === ENUMS.CREDIT.CASH) {
                currPeriodReceiptsRatio = 1;
            }
            else if (credit >= this.params.periodDaysNb) {
                currPeriodReceiptsRatio = 0;
            }
            else {
                latePaymentsRate = this.economy.calcLatePaymentsRate(credit);
                currPeriodReceiptsRatio = 1 - credit / this.params.periodDaysNb;
                currPeriodReceiptsRatio = Utils.ceil(currPeriodReceiptsRatio, 2);
            }
            return this.salesRevenue * currPeriodReceiptsRatio * (1 - latePaymentsRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "tradeReceivablesValue", {
        get: function () {
            return this.salesRevenue - this.tradingReceipts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "marketVolumeShareOfSales", {
        get: function () {
            if (!this.industryTotalSoldQ) {
                return 0;
            }
            return Utils.round(this.soldQ / this.industryTotalSoldQ, 4) * 100;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SubMarket.prototype, "marketValueShareOfSales", {
        get: function () {
            if (!this.industryTotalSalesRevenue) {
                return 0;
            }
            return Utils.round(this.salesRevenue / this.industryTotalSalesRevenue, 4) * 100;
        },
        enumerable: true,
        configurable: true
    });
    // helpers
    // actions
    SubMarket.prototype.receiveFrom = function (quantity, product, price, adsBudget, customerCredit) {
        if (!this.isInitialised()) {
            return false;
        }
        var value = quantity * price;
        this.price = price;
        this.advertisingBudget = adsBudget;
        this.customerCredit = customerCredit || this.params.defaultCustomerCredit;
        this.warehouse.moveIn(quantity, value);
        // TODO: develop it f(prix varia
        if (this.openingBacklogQ > 0) {
            var backlogSoldQ = this.getOrdersOf(this.lastPBacklogQ, false); // false not a new order
            this.openingBacklogQ -= backlogSoldQ;
            this.lastPBacklogSoldQ += backlogSoldQ;
        }
        return true;
    };
    SubMarket.prototype.getOrdersOf = function (quantity, isNewOrder) {
        if (isNewOrder === void 0) { isNewOrder = true; }
        if (!this.isInitialised()) {
            console.debug('not initialised');
            return 0;
        }
        if (!Utils.isNumericValid(quantity)) {
            console.warn('Market get orders of @ Quantity not reel : %d', quantity);
            return 0;
        }
        if (isNewOrder) {
            this.orderedQ += quantity;
        }
        var deliveredQ = this.warehouse.moveOut(quantity);
        this.returnForRepair();
        return deliveredQ;
    };
    // TODO: develop it
    SubMarket.prototype._calcReturnedQ = function () {
        //let distributorEff = this.internetMarket.salesForceGlobalEfficiency;
        //let problemsRate = (1 - distributorEff) * 0.04 / 0.5;
        var problemsRate = 0.04;
        var value = Math.round(this.soldQ * problemsRate);
        return value;
    };
    SubMarket.prototype.returnForRepair = function () {
        var returnedQ = this._calcReturnedQ();
        this.product.returnForRepair(returnedQ);
    };
    Object.defineProperty(SubMarket.prototype, "state", {
        get: function () {
            return {
                "effectiveDeliveredQ": this.effectiveDeliveredQ,
                "orderedQ": this.orderedQ,
                "soldQ": this.soldQ,
                "backlogQ": this.backlogQ,
                "stockQ": this.stockQ,
                "price": this.price
            };
        },
        enumerable: true,
        configurable: true
    });
    return SubMarket;
}(IObject.IObject));
var Market = (function (_super) {
    __extends(Market, _super);
    function Market(params) {
        _super.call(this, params);
        this.departmentName = "marketing";
        this.eCommerce = null;
    }
    Object.defineProperty(Market.prototype, "hasECommerce", {
        get: function () {
            return this.eCommerce instanceof ECommerce_1.default;
        },
        enumerable: true,
        configurable: true
    });
    Market.prototype.restoreLastState = function (lastResults, lastDecs) {
        var i = 0;
        var len = Math.max(lastResults.length, lastDecs.length);
        this.lastCorporateComBudgets = [];
        for (; i < len; i++) {
            var lastPDec = lastDecs[i];
            var lastPRes = lastResults[i];
            if (isNaN(lastPDec.corporateComBudget)) {
                console.warn("lastPDec.corporateComBudget NaN");
                lastPDec.corporateComBudget = 0;
            }
            this.lastCorporateComBudgets.push(lastPDec.corporateComBudget * 1000);
        }
        this.lastSalesForceCommissions = this.salesForce.lastCommissionRates;
        this.lastSalesForceStaffs = this.salesForce.lastStaffs;
        this.lastSalesForceSupports = this.salesForce.lastSupports;
    };
    Market.prototype.init = function (economy, products, salesForce, transport, lastResults, lastDecs, lastTradingReceivables, currPeriod) {
        _super.prototype.init.call(this);
        this.economy = economy;
        this.salesForce = salesForce;
        this.transport = transport;
        this.currPeriod = currPeriod;
        this.restoreLastState(lastResults, lastDecs);
        this.lastTradingReceivables = lastTradingReceivables;
        this.salesForce.market = this;
        var productCode, subMarket;
        this.subMarkets = [];
        var _loop_1 = function(i, len) {
            productCode = products[i].params.code;
            id = this_1.params.id + "_" + products[i].params.id;
            params = Utils.ObjectApply({}, this_1.params, { id: id });
            var subMarketLastResults = [];
            var subMarketLastDecs = [];
            lastResults.forEach(function (res) {
                subMarketLastResults.push(res.products[i]);
            });
            lastDecs.forEach(function (dec) {
                subMarketLastDecs.push(dec.products[i]);
            });
            subMarket = new SubMarket(this_1, params);
            subMarket.init(products[i], salesForce, subMarketLastResults, subMarketLastDecs);
            this_1.subMarkets[productCode] = subMarket;
        };
        var this_1 = this;
        var id, params;
        for (var i = 0, len = products.length; i < len; i++) {
            _loop_1(i, len);
        }
    };
    Object.defineProperty(Market.prototype, "hiredTransportCost", {
        // results
        get: function () {
            return this.transport.hiredTransportCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "salesRevenue", {
        get: function () {
            // aggregate sales revenue of all subMarkets
            return Utils.sums(this.subMarkets, "salesRevenue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "tradingReceipts", {
        // cash flows
        get: function () {
            return Utils.sums(this.subMarkets, "tradingReceipts");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "tradeReceivablesValue", {
        get: function () {
            return Utils.sums(this.subMarkets, "tradeReceivablesValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "soldUnitsNb", {
        get: function () {
            return Utils.sums(this.subMarkets, "soldQ");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "ordersValue", {
        get: function () {
            return Utils.sums(this.subMarkets, "ordersValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "soldOffValue", {
        get: function () {
            return Utils.sums(this.subMarkets, "soldOffValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "stockValue", {
        get: function () {
            return Utils.sums(this.subMarkets, "stockValue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "advertisingCost", {
        get: function () {
            var total, i = 0, len = this.subMarkets.length, budget;
            total = this.corporateComBudget;
            total += Utils.sums(this.subMarkets, "advertisingBudget");
            return total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "creditControlCost", {
        get: function () {
            return this.soldUnitsNb * (this.params.costs.creditControlUnitCost + this.params.costs.creditCardRatePerUnitSold);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "smoothedCorporateAdsBudget", {
        // effect of previous investments continues to act in the current period. 
        get: function () {
            var budget;
            var residualFactor = Game.configs.demandFactors.corporateAds.adsInvestmentCumulativeEffect;
            var lastSmoothedCorporateAdsBudget = Utils.simpleexpSmooth(this.lastCorporateComBudgets, residualFactor);
            // Cumulative effect lasts for 1 or 2 periods.
            budget = this.corporateComBudget * (1 - residualFactor) + lastSmoothedCorporateAdsBudget * residualFactor;
            return budget;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "corporateAdsEfficiency", {
        get: function () {
            var range = this.params.corporateAdsBudgetRange;
            var refRatio = Utils.normalize(this.smoothedCorporateAdsBudget, range);
            var industryRatio = this.smoothedCorporateAdsBudget * 0.5 / this.industryCorporateComBudgetAvg;
            var competitorsInfluence = Game.configs.demandFactors.corporateAds.competitorsInfluence;
            var eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);
            if (eff > 1) {
                eff = 1;
            }
            if (eff < 0) {
                eff = 0;
            }
            return Utils.round(eff, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "smoothedSalesForceStaff", {
        get: function () {
            var staffNb;
            var residualFactor = Game.configs.demandFactors.salesForce.staffResidualEffect;
            var lastSmoothedSalesForceStaff = Utils.simpleexpSmooth(this.lastSalesForceStaffs, residualFactor);
            staffNb = this.salesForce.employeesNb * (1 - residualFactor) + lastSmoothedSalesForceStaff * residualFactor;
            return staffNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "salesForceStaffEfficiency", {
        get: function () {
            var range = this.params.salesForceStaffRange;
            var refRatio = Utils.normalize(this.smoothedSalesForceStaff, range);
            var industryRatio = this.smoothedSalesForceStaff * 0.5 / this.industrySalesForceStaffAvg;
            var competitorsInfluence = Game.configs.demandFactors.salesForce.competitorsInfluence;
            var eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);
            if (eff > 1) {
                eff = 1;
            }
            if (eff < 0) {
                eff = 0;
            }
            return Utils.round(eff, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "smoothedSalesForceCommission", {
        get: function () {
            var commissionRate;
            var residualFactor = Game.configs.demandFactors.salesForce.commissionResidualEffect;
            var lastSmoothedSalesForceCommission = Utils.simpleexpSmooth(this.lastSalesForceCommissions, residualFactor);
            commissionRate = this.salesForce.commissionRate * (1 - residualFactor) + lastSmoothedSalesForceCommission * residualFactor;
            return commissionRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "salesForceCommissionEfficiency", {
        get: function () {
            var range = this.params.salesForceCommissionRange;
            var refRatio = Utils.normalize(this.smoothedSalesForceCommission, range);
            var industryRatio = this.smoothedSalesForceCommission * 0.5 / this.industrySalesForceCommissionRateAvg;
            var competitorsInfluence = Game.configs.demandFactors.salesForce.competitorsInfluence;
            var eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);
            if (eff > 1) {
                eff = 1;
            }
            if (eff < 0) {
                eff = 0;
            }
            return Utils.round(eff, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "smoothedSalesForceSupport", {
        get: function () {
            var support;
            var residualFactor = Game.configs.demandFactors.salesForce.supportResidualEffect;
            var lastSmoothedSalesForceSupport = Utils.simpleexpSmooth(this.lastSalesForceSupports, residualFactor);
            support = this.salesForce.supportPerAgent * (1 - residualFactor) + lastSmoothedSalesForceSupport * residualFactor;
            return support;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "salesForceSupportEfficiency", {
        get: function () {
            var range = this.params.salesForceSupportRange;
            var refRatio = Utils.normalize(this.smoothedSalesForceSupport, range);
            var industryRatio = this.smoothedSalesForceCommission * 0.5 / this.industrySalesForceSupportAvg;
            var competitorsInfluence = Game.configs.demandFactors.salesForce.competitorsInfluence;
            var eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);
            if (eff > 1) {
                eff = 1;
            }
            if (eff < 0) {
                eff = 0;
            }
            return Utils.round(eff, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "salesForceGlobalEfficiency", {
        get: function () {
            var commissionEff = this.salesForceCommissionEfficiency;
            var staffEff = this.salesForceStaffEfficiency;
            var supportEff = this.salesForceSupportEfficiency;
            var commissionWeight = Game.configs.demandFactors.salesForce.commissionWeight;
            var staffWeight = Game.configs.demandFactors.salesForce.staffWeight;
            var supportWeight = Game.configs.demandFactors.salesForce.supportWeight;
            var eff = (commissionEff * commissionWeight) + (staffEff * staffWeight) + (supportEff * supportWeight);
            return Utils.round(eff, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "smoothedWebsiteLevel", {
        // effect of previous level continues to act in the current period. 
        get: function () {
            if (!this.hasECommerce) {
                return 0;
            }
            var level;
            var residualFactor = Game.configs.demandFactors.eCommerce.residualEffect;
            var lastSmoothedWebsiteLevel = Utils.simpleexpSmooth(this.eCommerce.lastWebsiteLevels, residualFactor);
            // Cumulative effect lasts for 1 or 2 periods.
            level = this.eCommerce.websiteLevel * (1 - residualFactor) + lastSmoothedWebsiteLevel * residualFactor;
            return level;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "websiteEfficiency", {
        get: function () {
            if (!this.hasECommerce) {
                return 0;
            }
            var range = this.eCommerce.params.websiteLevelRange;
            var refRatio = Utils.normalize(this.smoothedWebsiteLevel, range);
            var industryRatio = this.smoothedWebsiteLevel * 0.5 / this.industryWebsiteLevelAvg;
            var competitorsInfluence = Game.configs.demandFactors.eCommerce.competitorsInfluence;
            var eff = industryRatio * competitorsInfluence + refRatio * (1 - competitorsInfluence);
            if (eff > 1) {
                eff = 1;
            }
            if (eff < 0) {
                eff = 0;
            }
            return Utils.round(eff, 4);
        },
        enumerable: true,
        configurable: true
    });
    Market.prototype.setIndustryMarketingMix = function (mkgMix) {
        var marketID = this.params.marketID;
        // just to not getting an illegal divide
        var EPSILON = 2.220446049250313e-16; // Number.EPSILON;
        this.industryCorporateComBudgetAvg = mkgMix.corporateAds[marketID] || EPSILON;
        this.industrySalesForceCommissionRateAvg = mkgMix.salesForceCommissions[marketID] || EPSILON;
        this.industrySalesForceStaffAvg = mkgMix.salesForceStaff[marketID] || EPSILON;
        this.industrySalesForceSupportAvg = mkgMix.salesForceSupport[marketID] || EPSILON;
        this.industryWebsiteLevelAvg = mkgMix.websiteLevels[marketID] || EPSILON;
        this.subMarkets.forEach(function (subMarket, idx) {
            subMarket.industryPriceAvg = mkgMix.prices[marketID][idx] || EPSILON;
            subMarket.industryDirectAdsBudgetAvg = mkgMix.directAds[marketID][idx] || EPSILON;
            subMarket.industryCreditEasingAvg = mkgMix.credits[marketID][idx] || EPSILON;
            subMarket.industryQualityScoreAvg = mkgMix.qualities[marketID][idx] || EPSILON;
        });
    };
    // actions
    Market.prototype.receiveFrom = function (quantity, product, price, adsBudget, customerCredit) {
        if (!this.isInitialised()) {
            return false;
        }
        var containerCapacityUnitsNb = product.params.containerCapacityUnitsNb;
        if (Utils.isNumericValid(containerCapacityUnitsNb) && containerCapacityUnitsNb !== 0) {
            var containersNb = quantity / containerCapacityUnitsNb;
            this.transport.load(containersNb);
        }
        else {
            console.warn("Market %s @ containerCapacityUnitsNb params is not valid %d", this.params.label, containerCapacityUnitsNb);
        }
        var subMarket = this.subMarkets[product.params.code];
        return subMarket && subMarket.receiveFrom.apply(subMarket, arguments);
    };
    Market.prototype.setCorporateCom = function (corporateComBudget) {
        if (!this.isInitialised()) {
            return false;
        }
        this.corporateComBudget = corporateComBudget;
        return true;
    };
    Object.defineProperty(Market.prototype, "industryTotalSoldQ", {
        get: function () {
            return Utils.sums(this.subMarkets, "industryTotalSoldQ");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "industryTotalSalesRevenue", {
        get: function () {
            return Utils.sums(this.subMarkets, "industryTotalSalesRevenue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "firmTotalSoldQ", {
        get: function () {
            return Utils.sums(this.subMarkets, "soldQ");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "firmTotalSalesRevenue", {
        get: function () {
            return Utils.sums(this.subMarkets, "salesRevenue");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "marketVolumeShareOfSales", {
        get: function () {
            var share = this.firmTotalSoldQ / this.industryTotalSoldQ;
            return Utils.round(share, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "marketValueShareOfSales", {
        get: function () {
            var share = this.firmTotalSalesRevenue / this.industryTotalSalesRevenue;
            return Utils.round(share, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "shortfallQ", {
        get: function () {
            return Utils.sums(this.subMarkets, "shortfallQ");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Market.prototype, "shortfallRate", {
        get: function () {
            return this.shortfallQ / Utils.sums(this.subMarkets, "orderedQ");
        },
        enumerable: true,
        configurable: true
    });
    Market.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.advertisingCost, this.params.payments.advertising, 'advertising');
    };
    return Market;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Market;
//# sourceMappingURL=Market.js.map