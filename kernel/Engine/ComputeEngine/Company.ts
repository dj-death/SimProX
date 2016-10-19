import { Production } from './Manufacturing/';
import { Marketing } from './Marketing';
import { Management } from './Personnel';
import { Finance, CashFlow } from './Finance';
import { Economy } from './Environnement';

import * as Scenario from '../Scenario';

import ENUMS = require('./ENUMS');
import console = require('../../utils/logger');
import Utils = require('../../utils/Utils');

import FinUtils = require('../../utils/FinUtils');


var linear = require('everpolate').linear;

import $jStat = require("jstat");
var jStat = $jStat.jStat;


import Q = require('q');



export interface CompanyParams {
    taxAnnumRate: number;
    taxAssessedPaymentQuarter: number;

    capitalCostInterpSchedules: {
        debtToEquityRatio: number[];
        debtCapitalCost: number[];
        equityCapitalCost: number[];
    };

    // le bêta sectoriel désendetté
    ungearedBeta: number;

}

class Compte {
    sums: number;

    constructor() {
        this.sums = 0;
    }

    addElement(dept, element, isMinus = false) {
        var value = dept[element];

        if (isNaN(value) || !isFinite(value)) {
            console.warn("warning Company accounting @", dept.departmentName, element);
            return;
        }

        if (isMinus) {
            value *= -1;
        }

        this.sums += value;
    }

}


export class Company {

    params: CompanyParams;

    ProductionDept: Production;
    MarketingDept: Marketing;
    ManagementDept: Management;
    FinanceDept: Finance;

    CashFlow: CashFlow;

    economy: Economy;

    currentQuarter: number;
    lastWorkingCapital: number;
    lastTaxDue: number;
    lastPreviousTaxableProfitLoss: number;
    lastPreviousRetainedEarnings: number;

    lastNetIncomes: number[];
    lastFreeCashFlows: number[];

    lastSharePrice: number;


    _marketValuePerShare: number;

    restoreLastState(playerAllLastStates: Scenario.Scenario[]) {
        let i = 0;
        let len = playerAllLastStates.length;

        this.lastFreeCashFlows = [];
        this.lastNetIncomes = [];

        let res: Scenario.Results;
        let dec: Scenario.Decision;

        let netIncome;

        for (; i < len; i++) {
            let state = playerAllLastStates[i];

            res = state.results;
            dec = state.decision;

            let freeCashFlow = res.freeCashFlow;

            if (isNaN(freeCashFlow)) {
                let operatingProfitLoss = res.operatingProfitLoss || (res.grossProfit - res.administrativeExpensesTotalCost + res.insurancesReceipts - res.depreciation);
                let netIncomeBeforeTax = operatingProfitLoss - res.interestPaid;

                if (netIncomeBeforeTax > 0) {
                    netIncome = netIncomeBeforeTax * (1 - this.taxRate);
                } else {
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
    }


    init(params: CompanyParams, economy: Economy, ProductionDept: Production, MarketingDept: Marketing, FinanceDept: Finance, CashFlow: CashFlow, ManagementDept: Management, quarter: number, playerAllLastStates: Scenario.Scenario[]) {

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
    }


    prepareCompanyBankFile(): ENUMS.Company_BankFile {
        var self = this;

        return {
            property: self.propertyValue,
            inventories: this.ProductionDept.inventoriesClosingValue,
            taxDue: self.taxDue,
            tradeReceivables: this.MarketingDept.salesOffice.tradeReceivablesValue,
            tradePayables: this.CashFlow.tradePayablesValue
        };
    }

    get propertyValue(): number {
        var lands = this.ProductionDept.landNetValue;
        var buildings = this.ProductionDept.buildingsNetValue;

        return lands + buildings;
    }

    get nonCurrentAssetsTotalValue(): number {
        var machines = this.ProductionDept.machineryNetValue;

        return this.propertyValue + machines;
    }


    get currentAssets(): number {
        let inventories = this.ProductionDept.inventoriesClosingValue;
        let tradeReceivablesValue = this.MarketingDept.salesOffice.tradeReceivablesValue;
        let cash = this.FinanceDept.cashValue;

        return inventories + tradeReceivablesValue + cash;
    }


    get currentLiabilities(): number {
        let taxDue = this.taxDue;
        let tradePayablesValue = this.CashFlow.tradePayablesValue;
        let banksOverdraft = this.FinanceDept.banksOverdraft;

        return taxDue + tradePayablesValue + banksOverdraft;
    }

    get liabilitiesTotalValue(): number {
        return this.currentLiabilities + this.FinanceDept.termLoansValue;
    }


    get workingCapital(): number { // BFR
        return this.currentAssets - this.currentLiabilities;
    }

    get workingCapitalVariation(): number {
        return this.workingCapital - this.lastWorkingCapital;
    }

    get productionCost(): number {
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
    }

    get administrativeExpensesTotalCost(): number {
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
    }

    get grossProfit(): number {
        var totalRevenues = this.MarketingDept.salesOffice.salesRevenue;
        var productionCosts = this.productionCost;

        var grossProfit = totalRevenues - productionCosts;

        return grossProfit;
    }

    get operatingProfitLoss(): number {
        var result = this.grossProfit;

        result += this.FinanceDept.insurancesReceipts;

        result -= this.administrativeExpensesTotalCost;
        result -= this.ProductionDept.depreciation;

        return result;
    }

    get beforeTaxProfitLoss(): number {
        var result = this.operatingProfitLoss;

        result += this.FinanceDept.interestReceived;
        result -= this.FinanceDept.interestPaid;

        return result;
    }


    get _debtToEquityRatio(): number {
        let ratio = this._debtsTotalValue / this.equityTotalValue;

        return Utils.round(ratio, 4);
    }

    get _debtRatio(): number {
        let ratio = this._debtsTotalValue / (this.equityTotalValue + this._debtsTotalValue);

        return Utils.round(ratio, 4);
    }

    get _equityRatio(): number {
        let ratio = this.equityTotalValue / (this.equityTotalValue + this._debtsTotalValue);

        return Utils.round(ratio, 4);
    }


    get _debtCapitalCost(): number {
        let capitalCostInterpSchedules = this.params.capitalCostInterpSchedules;

        let cost = linear(this._debtToEquityRatio, capitalCostInterpSchedules.debtToEquityRatio, capitalCostInterpSchedules.debtCapitalCost)[0];

        return Utils.round(cost, 4);
    }

    get _equityCapitalCost(): number {

        let capitalCostInterpSchedules = this.params.capitalCostInterpSchedules;

        let cost = linear(this._debtToEquityRatio, capitalCostInterpSchedules.debtToEquityRatio, capitalCostInterpSchedules.equityCapitalCost)[0];

        return Utils.round(cost, 4);
    }


    get _debtCost(): number {

        let stockMarket = this.economy.stockMarket;

        let riskFreeRate = stockMarket.riskFreeRate;

        let debtCost;


        if (this._debtToEquityRatio > 1) {
            debtCost = this._debtCapitalCost;

        } else {
            // On suppose que le Beta d est nul car on est faiblement endetté
            debtCost = riskFreeRate;
        }

        return Utils.round(debtCost, 4);
    }


    get _equityCost(): number {

        let stockMarket = this.economy.stockMarket;

        let riskFreeRate = stockMarket.riskFreeRate;
        let marketRiskPrime = stockMarket.marketRiskPrime;

        let beta = this.params.ungearedBeta;
        let regearedBeta = beta - beta * this._debtToEquityRatio;

        let equityCost = riskFreeRate + marketRiskPrime * regearedBeta;

        return Utils.round(equityCost, 4);
    }


    get _unleveredEquityCost(): number {
        let stockMarket = this.economy.stockMarket;

        let riskFreeRate = stockMarket.riskFreeRate;
        let marketRiskPrime = stockMarket.marketRiskPrime;

        let beta = this.params.ungearedBeta;

        let equityCost = riskFreeRate + marketRiskPrime * beta;

        return Utils.round(equityCost, 4);
    }


    get _weightedAvgCapitalCost(): number {
        let cost = this._equityCost * this._equityRatio + this._debtCost * (1 - this.taxRate) * this._debtRatio;

        return Utils.round(cost, 4);
    }

    get netOperatingIncome(): number {
        return this.operatingProfitLoss;
    }

    get interestExpense(): number {
        let oldInterestRate;
        let newInterestRate;

        return this.FinanceDept.interestPaid;
    }

    get netIncomeBeforeTax(): number {
        return this.netOperatingIncome;
    }

    get netIncomeAfterTax(): number {
        if (this.netIncomeBeforeTax <= 0) {
            return this.netIncomeBeforeTax;
        }

        return this.netIncomeBeforeTax * (1 - this.taxRate);
    }


    get _freeCashFlow(): number {
        let value = this.netIncomeAfterTax + this.CashFlow.investingNetCashFlow - this.workingCapitalVariation;

        return value;
    }


    get _normalizedFCF(): number {
        let startFlow;

        if (this.netIncomeAfterTax > 0) {
            startFlow = this.netIncomeAfterTax;

        } else {
            startFlow = Math.abs(this.netIncomeAfterTax) * 0.05;
        }

        return startFlow;
    }


    get _discountedFutureFreeCashFlow(): number {
        let futurePeriodsNb = this.economy.stockMarket.params.projectionFuturePeriodsNb;

        let expectedFCFGrowthRate = this._expectedFCFGrowthRate;

        let rate = (1 + expectedFCFGrowthRate) / (1 + this._weightedAvgCapitalCost);
        let base = (1 - Math.pow(rate, futurePeriodsNb + 1)) / (1 - rate);
            

        let value = this._normalizedFCF * (base - 1); // +1 just in case of cf = 0


        return Math.round(value);
    }


    get _terminalDiscountedFreeCashFlow(): number {
        // Le taux de croissance à l'infini 0.5 % à 2 %
        let g;

        if (this._expectedFCFGrowthRate > 0.02) {
            g = 0.02;

        } else if (this._expectedFCFGrowthRate > 0.005) {
            g = this._expectedFCFGrowthRate;

        } else {
            g = 0.005;
        }


        let futurePeriodsNb = this.economy.stockMarket.params.projectionFuturePeriodsNb;

        let terminalValue = this._normalizedFCF * Math.pow(1 + g, futurePeriodsNb)
        let discountRate = (1 + g) / (this._weightedAvgCapitalCost - g);

        let value = terminalValue * discountRate;


        return value;
    }


    get _discountedFirmValue(): number {
        return this._discountedFutureFreeCashFlow + this._terminalDiscountedFreeCashFlow + this.FinanceDept.cashValue;
    }



    get _debtMarketValue(): number {
        let debts = this.FinanceDept.interestBearingDebts;

        if (debts === 0) {
            return 0;
        }

        let maturity = 5; // years
        let discountDebt = debts / Math.pow(1 + this._debtCost, maturity);

        let rate = (1 - 1 / Math.pow(1 + this._debtCost, maturity)) / this._debtCost;

        let value = this.interestExpense * rate + discountDebt;

        if (value < 0) {
            value = 0;
        }

        return Math.round(value);
    }


    get _equityMarketValue(): number {
        return this._discountedFirmValue - this._debtMarketValue;
    }
    

    get _debtsTotalValue(): number {
        return this.FinanceDept.interestBearingDebts;
    }

    
    get _adjustedFirmPresentValue(): number {
        let unleveredValue = this._normalizedFCF * (1 + this._expectedFCFGrowthRate) / (this._unleveredEquityCost - this._expectedFCFGrowthRate);
        let taxBenefits = this._debtsTotalValue * this.taxRate * this._unleveredEquityCost / (this._unleveredEquityCost - this._expectedFCFGrowthRate);
        let bankruptcyCosts = unleveredValue * this.bankruptcyPb * 0.4;

        let value = unleveredValue + taxBenefits - bankruptcyCosts + this.FinanceDept.cashValue;

        return Math.round(value);
    }

    get _adjustedEquityPresentValue(): number {
        return this._adjustedFirmPresentValue - this._debtMarketValue;
    }



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
    get _expectedFCFGrowthRate(): number {
        if (!this.lastFreeCashFlows || this.lastFreeCashFlows.length < 4) {
            return 0.05; // taux de croissance des revenus pour lancement 
        }


        let incomes = this.lastNetIncomes.concat(this.netIncomeAfterTax);

        // Compound growth rate 
        let periodsNb = incomes.length;
        let beginIncome = periodsNb > 4 ? incomes[periodsNb - 4 - 1] : incomes[0];
        let endIncome = incomes[periodsNb - 1];

        let CAGR = Math.pow(endIncome / beginIncome, 1 / periodsNb) - 1;

        let avgNetIncome = jStat(incomes).mean() + jStat(incomes).stdev() * 3;

        let benchMarkFCF;


        if (avgNetIncome > 0) {
            benchMarkFCF = CAGR > 0 ? avgNetIncome * (1 + CAGR) : avgNetIncome;

        } else {

            
            if (CAGR > 0) {
                benchMarkFCF = this.netIncomeAfterTax * (1 + CAGR);

            } else {
                // le revenu a connu une baisse catastrophique
                // l'omptimite prédira qu'on va revenir au positif du moins résorber la perte 
                benchMarkFCF = this.netIncomeAfterTax > 0 ? this.netIncomeAfterTax : Math.abs(this.netIncomeAfterTax) * 0.5;
            }

        }

        if (benchMarkFCF < 0) {
            return 0;
        }


        let growthRate = FinUtils.growthRate(this._freeCashFlow, periodsNb, benchMarkFCF);


        if (growthRate < 0.001) {
            growthRate = 0.001;
        }

        return growthRate;
    }
    

    get earningsPerShare(): number {
        let ratio = this.netIncomeAfterTax / this.sharesNb;

        return Utils.round(ratio, 2);
    }

    get assetsTotalValue(): number {
        return this.nonCurrentAssetsTotalValue + this.currentAssets;
    }

    get _assetsNetValue(): number {
        return this.assetsTotalValue - this.liabilitiesTotalValue;
    }


    get _bookNetValuePerShare(): number {
        let value = this._assetsNetValue / this.sharesNb;

        return Utils.round(value, 2);
    }

    
    

    get openingSharePrice(): number {
        let openingSharePrice = !isNaN(this.sharePrice) ? this.sharePrice : this.FinanceDept.capital.openingSharePrice;

        return openingSharePrice;
    }


    get sharePrice(): number {
        return this._marketValuePerShare;
    }


    get marketValuation(): number {
        return this._marketValuePerShare * this.FinanceDept.capital.sharesNb;
    }

    // regression
    get sharePriceByTenThousand(): number {
        return this._marketValuePerShare * 10000;
    }

    get previousTaxableProfitLoss(): number {
        var value;

        // case of loss last year
        if (this.currentQuarter === 1) {
            if (this.lastPreviousTaxableProfitLoss < 0) {
                value = this.lastPreviousTaxableProfitLoss;
            } else {
                value = 0;
            }
        } else {
            // accumulate just for this year not previous
            value = this.lastPreviousTaxableProfitLoss;
        }

        return value;
    }

    get taxableProfitLoss(): number {
        return this.beforeTaxProfitLoss + this.previousTaxableProfitLoss;
    }



    get taxRate(): number {
        return this.params.taxAnnumRate;
    }


    get taxDue(): number {
        if (this.currentQuarter === 4) {
            if (this.taxableProfitLoss > 0) {
                return Math.ceil(this.taxableProfitLoss * this.taxRate);
            }

            return 0;

        } else if (this.currentQuarter !== this.params.taxAssessedPaymentQuarter) {
            return this.lastTaxDue;
        }

        return 0;
    }


    get taxAssessed(): number {
        if (this.currentQuarter === 4) {
            return this.taxDue;
        }

        return 0;
    }

    get taxPaid(): number {
        if (this.currentQuarter === this.params.taxAssessedPaymentQuarter) {
            return this.taxDue;
        }

        return 0;
    }

    get taxAssessedAndDue(): number {
        return this.taxAssessed + this.taxDue;
    }

    get currPeriodProfitLoss(): number {
        var result = this.beforeTaxProfitLoss - this.taxAssessed;

        return result;
    }

    get retainedEarningsTransfered(): number {
        return this.currPeriodProfitLoss - this.FinanceDept.capital.dividendPaid;
    }

    get previousRetainedEarnings(): number {
        return this.lastPreviousRetainedEarnings;
    }

    get retainedEarnings(): number {
        return this.retainedEarningsTransfered + this.previousRetainedEarnings;
    }

    get _shareCapital(): number {
        return this.FinanceDept.capital.shareCapital;
    }

    get equityTotalValue(): number {
        var capital = this.FinanceDept.capital;
        var value = capital.shareCapital + capital.sharePremiumAccount + this.retainedEarnings;

        return value;
    }


    get nextPOverdraftLimit(): number {
        let company_bankFile = this.prepareCompanyBankFile();

        let value = Utils.roundMultiplier(this.FinanceDept.calcOverdraftLimit(company_bankFile), 1000);

        return (value < 0 ? 0 : value);
    }

    get nextPBorrowingPower(): number {
        let value = Utils.roundMultiplier(this.marketValuation * 0.5 - this.FinanceDept.termLoansValue - this.nextPOverdraftLimit, 1000);

        return (value < 0 ? 0 : value);
    }

    get creditWorthiness(): number {
        let value = Utils.roundMultiplier(this.nextPBorrowingPower + this.FinanceDept.cashValue, 1000);

        return (value < 0 ? 0 : value);
    }



    get ROE(): number {
        let ratio = this.netIncomeAfterTax / this._shareCapital;

        return Utils.round(ratio, 4);
    }


    // TODO develop
    get IP(): number {
        return this.marketValuation;
    }


    get bankruptcyPb(): number {
        return 0;
    }


    get sharesNb(): number {
        return this.FinanceDept.capital.sharesNb;
    }


    getEndState(prefix?: string): Q.Promise<any> {
        let deferred = Q.defer();


        var endState = {};

        let that = this;

        setImmediate(function () {

            that._marketValuePerShare = that.economy.stockMarket.evaluate(that);

            for (var key in that) {

                if (key[0] === '_') {
                    continue;
                }

                console.silly("Comp GES @ of %s", key);


                try {

                    let value = that[key];

                    if (!Utils.isBasicType(value)) {
                        continue;
                    }

                    if (isNaN(value)) {
                        console.warn("GES @ Comp : %s is NaN", key);
                    }

                    key = prefix ? (prefix + key) : key;
                    endState[key] = value;

                } catch (e) {
                    console.error(e, "exception @ Comp %s", key);
                    deferred.reject(e);
                }
            }

            deferred.resolve(endState);
        });

        return deferred.promise;

    }
}
