"use strict";
var console = require('../../utils/logger');
var Utils = require('../../utils/Utils');
var FinUtils = require('../../utils/FinUtils');
var linear = require('everpolate').linear;
var $jStat = require("jstat");
var jStat = $jStat.jStat;
var Q = require('q');
var Compte = (function () {
    function Compte() {
        this.sums = 0;
    }
    Compte.prototype.addElement = function (dept, element, isMinus) {
        if (isMinus === void 0) { isMinus = false; }
        var value = dept[element];
        if (isNaN(value) || !isFinite(value)) {
            console.warn("warning Company accounting @", dept.departmentName, element);
            return;
        }
        if (isMinus) {
            value *= -1;
        }
        this.sums += value;
    };
    return Compte;
}());
var Company = (function () {
    function Company() {
    }
    Company.prototype.restoreLastState = function (playerAllLastStates) {
        var i = 0;
        var len = playerAllLastStates.length;
        this.lastFreeCashFlows = [];
        this.lastNetIncomes = [];
        var res;
        var dec;
        var netIncome;
        for (; i < len; i++) {
            var state = playerAllLastStates[i];
            res = state.results;
            dec = state.decision;
            var freeCashFlow = res.freeCashFlow;
            if (isNaN(freeCashFlow)) {
                var operatingProfitLoss = res.operatingProfitLoss || (res.grossProfit - res.administrativeExpensesTotalCost + res.insurancesReceipts - res.depreciation);
                var netIncomeBeforeTax = operatingProfitLoss - res.interestPaid;
                if (netIncomeBeforeTax > 0) {
                    netIncome = netIncomeBeforeTax * (1 - this.taxRate);
                }
                else {
                    netIncome = netIncomeBeforeTax;
                }
                freeCashFlow = netIncome + res.interestReceived + res.assetsSales - res.assetsPurchases - res.workingCapital;
                if (isNaN(freeCashFlow)) {
                    console.warn("freeCashFlow NaN");
                    freeCashFlow = 0;
                }
            }
            this.lastFreeCashFlows.push(freeCashFlow);
            this.lastNetIncomes.push(netIncome);
        }
        if (isNaN(res.taxDue)) {
            console.warn("res.taxDue NaN");
            res.taxDue = 0;
        }
        if (isNaN(res.previousTaxableProfitLoss)) {
            console.warn("res.previousTaxableProfitLoss NaN");
            res.previousTaxableProfitLoss = 0;
        }
        if (isNaN(res.previousRetainedEarnings)) {
            console.warn("res.previousRetainedEarnings NaN");
            res.previousRetainedEarnings = 0;
        }
        if (isNaN(res.workingCapital)) {
            console.warn("res.workingCapital NaN");
            res.workingCapital = 0;
        }
        this.lastTaxDue = res.taxDue;
        this.lastPreviousTaxableProfitLoss = res.previousTaxableProfitLoss;
        this.lastPreviousRetainedEarnings = res.previousRetainedEarnings;
        this.lastWorkingCapital = res.workingCapital;
        this.lastSharePrice = res.sharePrice;
    };
    Company.prototype.init = function (params, economy, ProductionDept, MarketingDept, FinanceDept, CashFlow, ManagementDept, quarter, playerAllLastStates) {
        this.params = params;
        this.economy = economy;
        this.ProductionDept = ProductionDept;
        this.MarketingDept = MarketingDept;
        this.ManagementDept = ManagementDept;
        this.FinanceDept = FinanceDept;
        this.CashFlow = CashFlow;
        if (isNaN(quarter)) {
            console.warn("quarter NaN");
            quarter = 0;
        }
        this.currentQuarter = quarter;
        this.restoreLastState(playerAllLastStates);
    };
    Company.prototype.prepareCompanyBankFile = function () {
        var self = this;
        return {
            property: self.propertyValue,
            inventories: this.ProductionDept.inventoriesClosingValue,
            taxDue: self.taxDue,
            tradeReceivables: this.MarketingDept.salesOffice.tradeReceivablesValue,
            tradePayables: this.CashFlow.tradePayablesValue
        };
    };
    Object.defineProperty(Company.prototype, "propertyValue", {
        get: function () {
            var lands = this.ProductionDept.landNetValue;
            var buildings = this.ProductionDept.buildingsNetValue;
            return lands + buildings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "nonCurrentAssetsTotalValue", {
        get: function () {
            var machines = this.ProductionDept.machineryNetValue;
            return this.propertyValue + machines;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "currentAssets", {
        get: function () {
            var inventories = this.ProductionDept.inventoriesClosingValue;
            var tradeReceivablesValue = this.MarketingDept.salesOffice.tradeReceivablesValue;
            var cash = this.FinanceDept.cashValue;
            return inventories + tradeReceivablesValue + cash;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "currentLiabilities", {
        get: function () {
            var taxDue = this.taxDue;
            var tradePayablesValue = this.CashFlow.tradePayablesValue;
            var banksOverdraft = this.FinanceDept.banksOverdraft;
            return taxDue + tradePayablesValue + banksOverdraft;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "liabilitiesTotalValue", {
        get: function () {
            return this.currentLiabilities + this.FinanceDept.termLoansValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "workingCapital", {
        get: function () {
            return this.currentAssets - this.currentLiabilities;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "workingCapitalVariation", {
        get: function () {
            return this.workingCapital - this.lastWorkingCapital;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "productionCost", {
        get: function () {
            var compte = new Compte();
            compte.addElement(this.ProductionDept, "inventoriesOpeningValue");
            compte.addElement(this.ProductionDept, "inventoriesClosingValue", true);
            compte.addElement(this.ProductionDept, "componentsPurchasedCost");
            compte.addElement(this.ProductionDept, "materialsPurchasedCost");
            compte.addElement(this.ProductionDept, "machinesRunningCost");
            compte.addElement(this.ProductionDept, "skilledWorkersWagesCost");
            compte.addElement(this.ProductionDept, "unskilledWorkersWagesCost");
            compte.addElement(this.ProductionDept, "qualityControlCostCost");
            compte.addElement(this.MarketingDept, "hiredTransportCost");
            return compte.sums;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "administrativeExpensesTotalCost", {
        get: function () {
            var compte = new Compte();
            compte.addElement(this.MarketingDept, "advertisingCost");
            compte.addElement(this.MarketingDept, "salesForceCost");
            compte.addElement(this.MarketingDept, "ISPCost");
            compte.addElement(this.MarketingDept, "internetDistributionCost");
            compte.addElement(this.MarketingDept, "websiteDevelopmentCost");
            compte.addElement(this.MarketingDept.salesOffice, "administrationCost");
            compte.addElement(this.MarketingDept.salesOffice, "creditControlCost");
            compte.addElement(this.MarketingDept.intelligence, "BusinessIntelligenceCost");
            compte.addElement(this.ManagementDept, "personnelCost");
            compte.addElement(this.ManagementDept, "managementCost");
            compte.addElement(this.ProductionDept, "guaranteeServicingCost");
            compte.addElement(this.ProductionDept, "productsDevelopmentCost");
            compte.addElement(this.ProductionDept, "machinesMaintenanceCost");
            compte.addElement(this.ProductionDept, "warehousingCost");
            compte.addElement(this.ProductionDept, "miscellaneousCost");
            compte.addElement(this.FinanceDept, "insurancesPremiumsCost");
            return compte.sums;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "grossProfit", {
        get: function () {
            var totalRevenues = this.MarketingDept.salesOffice.salesRevenue;
            var productionCosts = this.productionCost;
            var grossProfit = totalRevenues - productionCosts;
            return grossProfit;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "operatingProfitLoss", {
        get: function () {
            var result = this.grossProfit;
            result += this.FinanceDept.insurancesReceipts;
            result -= this.administrativeExpensesTotalCost;
            result -= this.ProductionDept.depreciation;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "beforeTaxProfitLoss", {
        get: function () {
            var result = this.operatingProfitLoss;
            result += this.FinanceDept.interestReceived;
            result -= this.FinanceDept.interestPaid;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_debtToEquityRatio", {
        get: function () {
            var ratio = this._debtsTotalValue / this.equityTotalValue;
            return Utils.round(ratio, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_debtRatio", {
        get: function () {
            var ratio = this._debtsTotalValue / (this.equityTotalValue + this._debtsTotalValue);
            return Utils.round(ratio, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_equityRatio", {
        get: function () {
            var ratio = this.equityTotalValue / (this.equityTotalValue + this._debtsTotalValue);
            return Utils.round(ratio, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_debtCapitalCost", {
        get: function () {
            var capitalCostInterpSchedules = this.params.capitalCostInterpSchedules;
            var cost = linear(this._debtToEquityRatio, capitalCostInterpSchedules.debtToEquityRatio, capitalCostInterpSchedules.debtCapitalCost)[0];
            return Utils.round(cost, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_equityCapitalCost", {
        get: function () {
            var capitalCostInterpSchedules = this.params.capitalCostInterpSchedules;
            var cost = linear(this._debtToEquityRatio, capitalCostInterpSchedules.debtToEquityRatio, capitalCostInterpSchedules.equityCapitalCost)[0];
            return Utils.round(cost, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_debtCost", {
        get: function () {
            var stockMarket = this.economy.stockMarket;
            var riskFreeRate = stockMarket.riskFreeRate;
            var debtCost;
            if (this._debtToEquityRatio > 1) {
                debtCost = this._debtCapitalCost;
            }
            else {
                // On suppose que le Beta d est nul car on est faiblement endetté
                debtCost = riskFreeRate;
            }
            return Utils.round(debtCost, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_equityCost", {
        get: function () {
            var stockMarket = this.economy.stockMarket;
            var riskFreeRate = stockMarket.riskFreeRate;
            var marketRiskPrime = stockMarket.marketRiskPrime;
            var beta = this.params.ungearedBeta;
            var regearedBeta = beta - beta * this._debtToEquityRatio;
            var equityCost = riskFreeRate + marketRiskPrime * regearedBeta;
            return Utils.round(equityCost, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_unleveredEquityCost", {
        get: function () {
            var stockMarket = this.economy.stockMarket;
            var riskFreeRate = stockMarket.riskFreeRate;
            var marketRiskPrime = stockMarket.marketRiskPrime;
            var beta = this.params.ungearedBeta;
            var equityCost = riskFreeRate + marketRiskPrime * beta;
            return Utils.round(equityCost, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_weightedAvgCapitalCost", {
        get: function () {
            var cost = this._equityCost * this._equityRatio + this._debtCost * (1 - this.taxRate) * this._debtRatio;
            return Utils.round(cost, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "netOperatingIncome", {
        get: function () {
            return this.operatingProfitLoss;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "interestExpense", {
        get: function () {
            var oldInterestRate;
            var newInterestRate;
            return this.FinanceDept.interestPaid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "netIncomeBeforeTax", {
        get: function () {
            return this.netOperatingIncome;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "netIncomeAfterTax", {
        get: function () {
            if (this.netIncomeBeforeTax <= 0) {
                return this.netIncomeBeforeTax;
            }
            return this.netIncomeBeforeTax * (1 - this.taxRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_freeCashFlow", {
        get: function () {
            var value = this.netIncomeAfterTax + this.CashFlow.investingNetCashFlow - this.workingCapitalVariation;
            return value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_normalizedFCF", {
        get: function () {
            var startFlow;
            if (this.netIncomeAfterTax > 0) {
                startFlow = this.netIncomeAfterTax;
            }
            else {
                startFlow = Math.abs(this.netIncomeAfterTax) * 0.05;
            }
            return startFlow;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_discountedFutureFreeCashFlow", {
        get: function () {
            var futurePeriodsNb = this.economy.stockMarket.params.projectionFuturePeriodsNb;
            var expectedFCFGrowthRate = this._expectedFCFGrowthRate;
            var rate = (1 + expectedFCFGrowthRate) / (1 + this._weightedAvgCapitalCost);
            var base = (1 - Math.pow(rate, futurePeriodsNb + 1)) / (1 - rate);
            var value = this._normalizedFCF * (base - 1); // +1 just in case of cf = 0
            return Math.round(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_terminalDiscountedFreeCashFlow", {
        get: function () {
            // Le taux de croissance à l'infini 0.5 % à 2 %
            var g;
            if (this._expectedFCFGrowthRate > 0.02) {
                g = 0.02;
            }
            else if (this._expectedFCFGrowthRate > 0.005) {
                g = this._expectedFCFGrowthRate;
            }
            else {
                g = 0.005;
            }
            var futurePeriodsNb = this.economy.stockMarket.params.projectionFuturePeriodsNb;
            var terminalValue = this._normalizedFCF * Math.pow(1 + g, futurePeriodsNb);
            var discountRate = (1 + g) / (this._weightedAvgCapitalCost - g);
            var value = terminalValue * discountRate;
            return value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_discountedFirmValue", {
        get: function () {
            return this._discountedFutureFreeCashFlow + this._terminalDiscountedFreeCashFlow + this.FinanceDept.cashValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_debtMarketValue", {
        get: function () {
            var debts = this.FinanceDept.interestBearingDebts;
            if (debts === 0) {
                return 0;
            }
            var maturity = 5; // years
            var discountDebt = debts / Math.pow(1 + this._debtCost, maturity);
            var rate = (1 - 1 / Math.pow(1 + this._debtCost, maturity)) / this._debtCost;
            var value = this.interestExpense * rate + discountDebt;
            if (value < 0) {
                value = 0;
            }
            return Math.round(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_equityMarketValue", {
        get: function () {
            return this._discountedFirmValue - this._debtMarketValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_debtsTotalValue", {
        get: function () {
            return this.FinanceDept.interestBearingDebts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_adjustedFirmPresentValue", {
        get: function () {
            var unleveredValue = this._normalizedFCF * (1 + this._expectedFCFGrowthRate) / (this._unleveredEquityCost - this._expectedFCFGrowthRate);
            var taxBenefits = this._debtsTotalValue * this.taxRate * this._unleveredEquityCost / (this._unleveredEquityCost - this._expectedFCFGrowthRate);
            var bankruptcyCosts = unleveredValue * this.bankruptcyPb * 0.4;
            var value = unleveredValue + taxBenefits - bankruptcyCosts + this.FinanceDept.cashValue;
            return Math.round(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_adjustedEquityPresentValue", {
        get: function () {
            return this._adjustedFirmPresentValue - this._debtMarketValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_expectedFCFGrowthRate", {
        /*get goodWill(): number {
            let capital = this.FinanceDept.capital;
            
            let dividend = capital.dividendPaid;
            let liquidity = this.FinanceDept.cashValue;
            let RnD = Utils.sums(this.ProductionDept.products, "RnDQuality");
    
            let monetaryMarketShare = this.MarketingDept._marketValueShareOfSales;
            let unitMarketShare = this.MarketingDept._marketVolumeShareOfSales;
    
            let marketShare = 2 / ((1 / monetaryMarketShare) + (1 / unitMarketShare));
    
            let shortfallRate = this.MarketingDept._shortfallRate;
    
            let capitalPerShare = capital.shareCapital / sharesNb;
            let lastRetainedEarningsPerShare = capital.lastRetainedEarnings / sharesNb;
    
            let ROE = this._ROE;
    
     
    
            let goodWill = dividend * liquidity *
    
    
            return Utils.round(value, 2);
    
        }*/
        // The expected growth rate is based on the historical growth in net income of the firm.
        /*  The growth rate is found by the a process similar to that used to
            compute the internal rate of return of an investment project.This
            procedure requires that the net income per share for a specified
            number of past periods be averaged.The use of an average as a
            bench mark in computing the growth rate reduces or smooths large
            abrupt changes in market value due to a large increase or decrease
            in earnings for just one period.
        */
        // le taux de croissance à l'infini
        get: function () {
            if (!this.lastFreeCashFlows || this.lastFreeCashFlows.length < 4) {
                return 0.05; // taux de croissance des revenus pour lancement 
            }
            var incomes = this.lastNetIncomes.concat(this.netIncomeAfterTax);
            // Compound growth rate 
            var periodsNb = incomes.length;
            var beginIncome = periodsNb > 4 ? incomes[periodsNb - 4 - 1] : incomes[0];
            var endIncome = incomes[periodsNb - 1];
            var CAGR = Math.pow(endIncome / beginIncome, 1 / periodsNb) - 1;
            var avgNetIncome = jStat(incomes).mean() + jStat(incomes).stdev() * 3;
            var benchMarkFCF;
            if (avgNetIncome > 0) {
                benchMarkFCF = CAGR > 0 ? avgNetIncome * (1 + CAGR) : avgNetIncome;
            }
            else {
                if (CAGR > 0) {
                    benchMarkFCF = this.netIncomeAfterTax * (1 + CAGR);
                }
                else {
                    // le revenu a connu une baisse catastrophique
                    // l'omptimite prédira qu'on va revenir au positif du moins résorber la perte 
                    benchMarkFCF = this.netIncomeAfterTax > 0 ? this.netIncomeAfterTax : Math.abs(this.netIncomeAfterTax) * 0.5;
                }
            }
            if (benchMarkFCF < 0) {
                return 0;
            }
            var growthRate = FinUtils.growthRate(this._freeCashFlow, periodsNb, benchMarkFCF);
            if (growthRate < 0.001) {
                growthRate = 0.001;
            }
            return growthRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "earningsPerShare", {
        get: function () {
            var ratio = this.netIncomeAfterTax / this.sharesNb;
            return Utils.round(ratio, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "assetsTotalValue", {
        get: function () {
            return this.nonCurrentAssetsTotalValue + this.currentAssets;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_assetsNetValue", {
        get: function () {
            return this.assetsTotalValue - this.liabilitiesTotalValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_bookNetValuePerShare", {
        get: function () {
            var value = this._assetsNetValue / this.sharesNb;
            return Utils.round(value, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "openingSharePrice", {
        get: function () {
            var openingSharePrice = !isNaN(this.sharePrice) ? this.sharePrice : this.FinanceDept.capital.openingSharePrice;
            return openingSharePrice;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "sharePrice", {
        get: function () {
            return this._marketValuePerShare;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "marketValuation", {
        get: function () {
            return this._marketValuePerShare * this.FinanceDept.capital.sharesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "sharePriceByTenThousand", {
        // regression
        get: function () {
            return this._marketValuePerShare * 10000;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "previousTaxableProfitLoss", {
        get: function () {
            var value;
            // case of loss last year
            if (this.currentQuarter === 1) {
                if (this.lastPreviousTaxableProfitLoss < 0) {
                    value = this.lastPreviousTaxableProfitLoss;
                }
                else {
                    value = 0;
                }
            }
            else {
                // accumulate just for this year not previous
                value = this.lastPreviousTaxableProfitLoss;
            }
            return value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxableProfitLoss", {
        get: function () {
            return this.beforeTaxProfitLoss + this.previousTaxableProfitLoss;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxRate", {
        get: function () {
            return this.params.taxAnnumRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxDue", {
        get: function () {
            if (this.currentQuarter === 4) {
                if (this.taxableProfitLoss > 0) {
                    return Math.ceil(this.taxableProfitLoss * this.taxRate);
                }
                return 0;
            }
            else if (this.currentQuarter !== this.params.taxAssessedPaymentQuarter) {
                return this.lastTaxDue;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxAssessed", {
        get: function () {
            if (this.currentQuarter === 4) {
                return this.taxDue;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxPaid", {
        get: function () {
            if (this.currentQuarter === this.params.taxAssessedPaymentQuarter) {
                return this.taxDue;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "taxAssessedAndDue", {
        get: function () {
            return this.taxAssessed + this.taxDue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "currPeriodProfitLoss", {
        get: function () {
            var result = this.beforeTaxProfitLoss - this.taxAssessed;
            return result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "retainedEarningsTransfered", {
        get: function () {
            return this.currPeriodProfitLoss - this.FinanceDept.capital.dividendPaid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "previousRetainedEarnings", {
        get: function () {
            return this.lastPreviousRetainedEarnings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "retainedEarnings", {
        get: function () {
            return this.retainedEarningsTransfered + this.previousRetainedEarnings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "_shareCapital", {
        get: function () {
            return this.FinanceDept.capital.shareCapital;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "equityTotalValue", {
        get: function () {
            var capital = this.FinanceDept.capital;
            var value = capital.shareCapital + capital.sharePremiumAccount + this.retainedEarnings;
            return value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "nextPOverdraftLimit", {
        get: function () {
            var company_bankFile = this.prepareCompanyBankFile();
            var value = Utils.roundMultiplier(this.FinanceDept.calcOverdraftLimit(company_bankFile), 1000);
            return (value < 0 ? 0 : value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "nextPBorrowingPower", {
        get: function () {
            var value = Utils.roundMultiplier(this.marketValuation * 0.5 - this.FinanceDept.termLoansValue - this.nextPOverdraftLimit, 1000);
            return (value < 0 ? 0 : value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "creditWorthiness", {
        get: function () {
            var value = Utils.roundMultiplier(this.nextPBorrowingPower + this.FinanceDept.cashValue, 1000);
            return (value < 0 ? 0 : value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "ROE", {
        get: function () {
            var ratio = this.netIncomeAfterTax / this._shareCapital;
            return Utils.round(ratio, 4);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "IP", {
        // TODO develop
        get: function () {
            return this.marketValuation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "bankruptcyPb", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Company.prototype, "sharesNb", {
        get: function () {
            return this.FinanceDept.capital.sharesNb;
        },
        enumerable: true,
        configurable: true
    });
    Company.prototype.getEndState = function (prefix) {
        var deferred = Q.defer();
        var endState = {};
        var that = this;
        setImmediate(function () {
            that._marketValuePerShare = that.economy.stockMarket.evaluate(that);
            for (var key in that) {
                if (key[0] === '_') {
                    continue;
                }
                console.silly("Comp GES @ of %s", key);
                try {
                    var value = that[key];
                    if (!Utils.isBasicType(value)) {
                        continue;
                    }
                    if (isNaN(value)) {
                        console.warn("GES @ Comp : %s is NaN", key);
                    }
                    key = prefix ? (prefix + key) : key;
                    endState[key] = value;
                }
                catch (e) {
                    console.error(e, "exception @ Comp %s", key);
                    deferred.reject(e);
                }
            }
            deferred.resolve(endState);
        });
        return deferred.promise;
    };
    return Company;
}());
exports.Company = Company;
//# sourceMappingURL=Company.js.map