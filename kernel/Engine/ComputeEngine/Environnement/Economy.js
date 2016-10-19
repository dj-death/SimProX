"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var LabourPool_1 = require('./LabourPool');
var Game = require('../../../simulation/Games');
var Utils = require('../../../utils/Utils');
var BaseEconomy = (function (_super) {
    __extends(BaseEconomy, _super);
    function BaseEconomy(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
    }
    BaseEconomy.prototype.init = function (currency) {
        _super.prototype.init.call(this);
        this.currency = currency;
    };
    return BaseEconomy;
}(IObject.IObject));
var Economy = (function (_super) {
    __extends(Economy, _super);
    function Economy(params) {
        _super.call(this, params);
        this.departmentName = "environnement";
        this.isPersistedObject = true;
        this.isItWorld = false;
    }
    Economy.prototype.restoreLastState = function (lastPRes) {
        this.lastConsumerPriceBase100Index = lastPRes.consumerPriceBase100Index || this.params.initialIPC || 100;
        this.lastProducerPriceBase100Index = lastPRes.producerPriceBase100Index || this.params.initialIPP || 100;
        this.lastRevenueBase100Index = lastPRes.revenueBase100Index || 100;
        this.lastGDP = lastPRes.GDP || this.params.initialGDP;
        // regressio
        if (this.lastGDP > this.params.initialGDP * 1.5 || this.lastGDP < this.params.initialGDP * 0.5) {
            this.lastGDP = this.params.initialGDP;
        }
        this.lastPopulation = lastPRes.population || (this.params.initialPopulation * Math.pow(10, 6));
        this.lastExternalTradeBalance = lastPRes.externalTradeBalance || this.params.initialBalanceTrade;
        this.lastUnemploymentRate = (lastPRes.unemploymentRatePerThousand / 1000) || (this.params.unemploymentBaseRate / 100);
    };
    Economy.prototype.init = function (currency, labourPool, centralBank, stockMarket, lastPRes) {
        _super.prototype.init.call(this, currency);
        this.restoreLastState(lastPRes);
        this.currency = currency;
        this.labourPool = labourPool || new LabourPool_1.default();
        var activePeopleRate = 0.65;
        var unemployedSkilledNb = Math.round(this.lastPopulation * activePeopleRate * this.lastUnemploymentRate * 0.2);
        var unemployedUnskilledNb = Math.round(this.lastPopulation * activePeopleRate * this.lastUnemploymentRate * 0.8);
        var employedSkilledNb = Math.round(this.lastPopulation * activePeopleRate * (1 - this.lastUnemploymentRate));
        this.labourPool.init(unemployedSkilledNb, unemployedUnskilledNb, employedSkilledNb);
        this.centralBank = centralBank;
        this.stockMarket = stockMarket;
        if (this.centralBank) {
            this.centralBank.economy = this;
        }
        if (this.stockMarket) {
            this.stockMarket.economy = this;
        }
    };
    Economy.prototype.reset = function () {
        this.currPeriod = null;
    };
    Object.defineProperty(Economy.prototype, "internetUsersNb", {
        get: function () {
            return Math.round(this.population * this.params.internetAccessPercent / 100);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "GDP", {
        // results
        get: function () {
            var GDP;
            var GDPGrowthRateStats = this.params.GDPGrowthRateStats;
            var GDPStats = this.params.GDPStats;
            if (GDPStats && GDPStats.length) {
                GDP = Utils.getStat(GDPStats, this.currPeriod);
            }
            else if (GDPGrowthRateStats && GDPGrowthRateStats.length) {
                //let periodDuration_quartersNb = Math.ceil(Game.daysNbByPeriod / 90);
                var growthRate = Utils.getStat(GDPGrowthRateStats, this.currPeriod) / 100;
                GDP = this.lastGDP * (1 + growthRate);
            }
            else {
                var annualBaseGrowthRate = this.params.annualGDPBaseGrowthRate / 100;
                var periodicRate = Utils.round(Math.pow(annualBaseGrowthRate + 1, Game.daysNbByPeriod / 360) - 1, 4);
                GDP = Math.round(this.lastGDP * (1 + periodicRate));
            }
            return Utils.round(GDP, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "population", {
        get: function () {
            var annualBaseGrowthRate = this.params.annualPopulationBaseGrowthRate / 100;
            var periodicRate = Utils.round(Math.pow(annualBaseGrowthRate + 1, Game.daysNbByPeriod / 360) - 1, 4);
            return Math.round(this.lastPopulation * (1 + periodicRate));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "unemploymentRate", {
        get: function () {
            var rate;
            var stats = this.params.unemploymentRateStats;
            if (stats && stats.length) {
                rate = Utils.getStat(stats, this.currPeriod);
            }
            else {
                rate = this.params.unemploymentBaseRate / 100;
            }
            return rate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "externalTradeBalance", {
        get: function () {
            var balance;
            var stats = this.params.externalTradeBalanceStats;
            if (stats && stats.length) {
                balance = Utils.getStat(stats, this.currPeriod);
            }
            else {
                balance = this.params.initialBalanceTrade;
            }
            return balance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "interestBaseRate", {
        get: function () {
            return this.centralBank && this.centralBank.interestBaseRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "quotedExchangeRate", {
        get: function () {
            return this.currency.quotedExchangeRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "businessReport", {
        get: function () {
            if (!this.params.businessReports) {
                return;
            }
            var period = this.currPeriod + Game.configs.historicPeriodsNb;
            var report = Utils.getStat(this.params.businessReports, this.currPeriod);
            return report;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "economyShortTermRisk", {
        // TODO develop it
        get: function () {
            var avgCreditRating = this.params.avgCreditShortTermRating, rate;
            if (!avgCreditRating) {
                return 0;
            }
            rate = avgCreditRating / 10000;
            return rate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "economyLongTermRisk", {
        get: function () {
            var avgCreditRating = this.params.avgCreditLongTermRating, rate;
            if (!avgCreditRating) {
                return 0;
            }
            rate = avgCreditRating / 10000;
            return rate;
        },
        enumerable: true,
        configurable: true
    });
    // TODO develop
    Economy.prototype.calcLatePaymentsRate = function (debtTerm) {
        var rate, economyShortTermRisk = this.economyShortTermRisk, avgLatePaymentsRate = this.params.avgLatePaymentsRate, avgDSO = this.params.avgDaysSalesOutstanding;
        if (debtTerm < avgDSO) {
        }
        else {
        }
        rate = avgLatePaymentsRate;
        return rate;
    };
    Object.defineProperty(Economy.prototype, "inflationRate", {
        get: function () {
            var rate;
            var stats = this.params.IPCInflationStats;
            if (stats && stats.length) {
                //let periodDuration_quartersNb = Math.ceil(Game.daysNbByPeriod / 90);
                rate = Utils.getStat(stats, this.currPeriod) / 100;
            }
            else {
                rate = this.params.inflationBaseRate || 0.01;
            }
            return Utils.round(rate, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "GDPGrowthRate", {
        get: function () {
            var rate = (this.GDP - this.lastGDP) / this.lastGDP;
            return Utils.round(rate, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "revenueBase100Index", {
        get: function () {
            var index = this.lastRevenueBase100Index * (1 + this.GDPGrowthRate);
            return Math.round(index);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "consumerPriceBase100Index", {
        get: function () {
            var index = this.lastConsumerPriceBase100Index * (1 + this.inflationRate);
            return Math.round(index);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "producerPriceBase100Index", {
        get: function () {
            var stats = this.params.PPIInflationStats;
            var inflationRate;
            if (stats && stats.length) {
                //let periodDuration_quartersNb = Math.ceil(Game.daysNbByPeriod / 90);
                inflationRate = Utils.round(Utils.getStat(stats, this.currPeriod) / 100, 4);
            }
            else {
                inflationRate = this.inflationRate;
            }
            var index = this.lastProducerPriceBase100Index * (1 + inflationRate);
            return Math.round(index);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "PPICommodity", {
        /*
         * Les prix sont rigides s’ils s’ajustent lentement aux variations de la demande globale.
         *
         *  Les producteurs peuvent préférer réduire les délais de livraison ou fournir moins de services complémentaires plutôt que d’augmenter les prix (et inversement).
    - Ils peuvent aussi faire varier leurs stocks.
    - Les entreprises préfèrent généralement attendre que leurs concurrents prennent la décision de changer les prix avant de le faire. Cela entraîne un défaut de coordination qui décale la variation des prix des évolutions réelles du marché.
    - Très souvent la formation des prix passe par l’application simple d’une marge aux coûts de production. Les prix ne changent que lorsque les coûts se modifient. Bien entendu, si le marché reste orienté durablement à la hausse ou la baisse du prix, l’ajustement interviendra, mais il le fait avec retard.
    - Pour fidèliser leurs clients les entreprises peuvent choisir une stratégie de prix stabilisés sur des périodes assez longues. C’est une sorte de contrats implicites.
    - L’engagement peut d’ailleurs être explicité dans un contrat pour une durée fixée à l’avance.
    - Le changement des prix a un coût. Les coûts d’étiquetage et coûts de catalogues peuvent freiner l’ajustement des prix aux conditions du marché.
    - En situation de concurrence imparfaite les taux de marge n’évoluent pas de la même manière en période d’expansion et de ralentissement. En période d’expansion les marges se réduisent ce qui freine l’augmentation des prix.
    - Certains seuils de prix sont "symboliques" ce qui limite leur franchissement (99 euros par exemple).
    Toutes ces explications permettent de comprendre pourquoi les ajustements de prix ne correspondent pas aux fondamentaux du marché en situation de concurrence imparfaite.
         */
        // such as energy, coal, crude oil and the steel scrap
        get: function () {
            return this.producerPriceBase100Index / 100; // so volatil
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "PPIIntermediate", {
        // Goods here have been manufactured at some level but will be sold to further manufacturers to create the finished good. 
        // Some examples of SOP products are lumber, steel, cotton and diesel fuel
        get: function () {
            var pricesIdx = this.producerPriceBase100Index;
            return pricesIdx < 104 ? 1 + Math.floor((pricesIdx / 2) - (100 / 2)) * 1 / 100 : (pricesIdx / 100);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "PPIIndustry", {
        // finished goods
        get: function () {
            var pricesIdx = this.producerPriceBase100Index;
            return pricesIdx < 110 ? 1 + Math.floor((pricesIdx / 4) - (100 / 4)) * 2 / 100 : (pricesIdx / 100);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "PPIServices", {
        get: function () {
            var pricesIdx = this.producerPriceBase100Index * 0.33 + this.consumerPriceBase100Index * 0.67; // weighted 3la 7ssab part des couts
            return pricesIdx < 110 ? 1 + Math.floor((pricesIdx / 4) - (100 / 4)) * 1 / 100 : (pricesIdx / 100); // 4 so 1 each quarter
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "PPIOverheads", {
        get: function () {
            var pricesIdx = this.producerPriceBase100Index * 0.6 + this.consumerPriceBase100Index * 0.4;
            return pricesIdx < 110 ? 1 + Math.floor((pricesIdx / 4) - (100 / 4)) * 1 / 100 : (pricesIdx / 100);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Economy.prototype, "economicBase100Index", {
        // Indicateur de pouvoir d'achat = (Indice des revenus / Indice des prix) x 100.
        get: function () {
            var base = 100;
            var index;
            index = base * this.revenueBase100Index / this.consumerPriceBase100Index;
            if (index < 0) {
                index = 0;
            }
            return Math.round(index);
        },
        enumerable: true,
        configurable: true
    });
    // action
    Economy.prototype.simulate = function (currPeriod) {
        this.currPeriod = currPeriod;
        this.centralBank && this.centralBank.simulate(currPeriod);
        this.currency.simulate(currPeriod);
        this.stockMarket && this.stockMarket.simulate(currPeriod);
    };
    Object.defineProperty(Economy.prototype, "state", {
        get: function () {
            return {
                "GDP": this.GDP,
                "unemploymentRatePerThousand": this.unemploymentRate * 1000,
                "externalTradeBalance": this.externalTradeBalance,
                "interestBaseRatePerThousand": this.interestBaseRate * 1000,
                "inflationRate": this.inflationRate,
                "producerPriceBase100Index": this.producerPriceBase100Index,
                "businessReport": this.businessReport,
                "exchangeRatePerCent": this.quotedExchangeRate * 100
            };
        },
        enumerable: true,
        configurable: true
    });
    return Economy;
}(BaseEconomy));
exports.Economy = Economy;
var World = (function (_super) {
    __extends(World, _super);
    function World(params, economies) {
        _super.call(this, params);
        this.isItWorld = true;
        this.economies = economies;
    }
    Object.defineProperty(World.prototype, "internetUsersNb", {
        get: function () {
            return Utils.sums(this.economies, "internetUsersNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(World.prototype, "economicBase100Index", {
        // Indicateur de pouvoir d'achat = (Indice des revenus / Indice des prix) x 100.
        get: function () {
            var index = 0;
            var totalInternetUsersNb = this.internetUsersNb;
            this.economies && this.economies.forEach(function (oEconomy) {
                var weight = oEconomy.internetUsersNb / totalInternetUsersNb;
                index += (oEconomy.economicBase100Index * weight);
            });
            return Utils.round(index, 2);
        },
        enumerable: true,
        configurable: true
    });
    World.prototype.calcLatePaymentsRate = function (debtTerm) {
        var rate = 0;
        var totalInternetUsersNb = this.internetUsersNb;
        this.economies && this.economies.forEach(function (oEconomy) {
            var weight = oEconomy.internetUsersNb / totalInternetUsersNb;
            rate += (oEconomy.calcLatePaymentsRate(debtTerm) * weight);
        });
        return Utils.round(rate, 4);
    };
    // action
    World.prototype.simulate = function (currPeriod) {
        this.currPeriod = currPeriod;
        this.currency.simulate(currPeriod);
    };
    return World;
}(BaseEconomy));
exports.World = World;
//# sourceMappingURL=Economy.js.map