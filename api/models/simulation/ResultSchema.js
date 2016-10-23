"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
function Numeric(key, options) {
    mongoose.SchemaType.call(this, key, options, 'Numeric');
}
Numeric.prototype = Object.create(mongoose.SchemaType.prototype);
// `cast()` takes a parameter that can be anything. You need to
// validate the provided `val` and throw a `CastError` if you
// can't convert it.
Numeric.prototype.cast = function (val) {
    var _val = !isNaN(val) ? Number(val) : 0;
    if (isNaN(_val)) {
        throw new mongoose.SchemaType.CastError('Numeric', val + ' is not a number');
    }
    return _val;
};
// Don't forget to add Numeric to the type registry
Schema.Types.Numeric = Numeric;
/******* Results *******/
var subProductRes = Schema({
    outQ: Numeric,
    closingQ: Numeric,
    availableNextPQ: Numeric,
    availableNextPValue: Numeric
});
var productRes = Schema({
    scheduledQ: Numeric,
    producedQ: Numeric,
    rejectedQ: Numeric,
    lostQ: Numeric,
    servicedQ: Numeric,
    improvementsResult: Numeric,
    RnDQuality: Numeric,
    qualityScore: Numeric,
    devProgress: Numeric,
    consumerStarRatings: String
});
var machineryRes = Schema({
    effectiveSoldNb: Numeric,
    effectiveBoughtNb: Numeric,
    machinesNb: Numeric,
    availablesNextPeriodNb: Numeric,
    theoreticalAvailableHoursNb: Numeric,
    breakdownHoursNb: Numeric,
    workedHoursNb: Numeric,
    machinesEfficiencyAvg: Numeric,
    machineryNetValue: Numeric,
    stats: [Schema.Types.Mixed]
});
var materialRes = Schema({
    openingQ: Numeric,
    premiumMaterialPurchasesQ: Numeric,
    unplannedPurchasesQ: Numeric,
    lostQ: Numeric,
    outQ: Numeric,
    closingQ: Numeric,
    closingValue: Numeric,
    deliveryNextPBoughtBeforeLastPQ: Numeric
});
var landRes = Schema({
    availableSpace: Numeric,
    netValue: Numeric
});
var factoryRes = Schema({
    availableSpace: Numeric,
    machiningSpaceUsed: Numeric,
    assemblyWorkersSpaceUsed: Numeric,
    stocksSpaceUsed: Numeric,
    netValue: Numeric
});
var workerRes = Schema({
    availablesAtStartNb: Numeric,
    recruitedEffectiveNb: Numeric,
    dismissedEffectiveNb: Numeric,
    availablesNextPeriodNb: Numeric,
    availableTotalHoursNb: Numeric,
    absenteeismHoursNb: Numeric,
    workedTotaHoursNb: Numeric,
    strikeNextPeriodWeeksNb: Numeric
});
var subMarketRes = Schema({
    effectiveDeliveredQ: Numeric,
    orderedQ: Numeric,
    soldQ: Numeric,
    backlogQ: Numeric,
    stockQ: Numeric,
    stockValue: Numeric
});
var agentRes = Schema({
    effectiveAppointedNb: Numeric,
    resignedNb: Numeric,
    availablesNextPeriodNb: Numeric
});
var marketRes = Schema({
    //agents: [agentRes],
    products: [subMarketRes],
    transport: {
        journeyLength: Numeric,
        loadsNb: Numeric
    }
});
var eCommerceRes = Schema({
    wantedWebsitePortsNb: Numeric,
    activeWebsitePortsNb: Numeric,
    websiteVisitsNb: Numeric,
    successfulWebsiteVisitsPerThousand: Numeric,
    serviceComplaintsNb: Numeric
});
var economyRes = Schema({
    GDP: Numeric,
    unemploymentRatePerThousand: Numeric,
    externalTradeBalance: Numeric,
    interestBaseRatePerThousand: Numeric,
    exchangeRatePerCent: Numeric,
    inflationRate: Numeric,
    consumerPriceBase100Index: Numeric,
    producerPriceBase100Index: Numeric,
    revenueBase100Index: Numeric,
    population: Numeric
});
var materialMarketRes = Schema({
    spotPrice: Numeric,
    threeMthPrice: Numeric,
    sixMthPrice: Numeric
});
var buildingContractorRes = Schema({
    buildingCost: Numeric
});
var bankAccountRes = Schema({
    banksOverdraft: Numeric,
    interestPaid: Numeric,
    interestReceived: Numeric,
    termDeposit: Numeric,
    termLoansValue: Numeric,
    previousBalance: Numeric,
    balance: Numeric,
    additionalLoans: Numeric
});
var financial = Schema({
    advertisingCost: Numeric,
    distributionCost: Numeric,
    ISPCost: Numeric,
    salesForceCost: Numeric,
    salesOfficeCost: Numeric,
    guaranteeServicingCost: Numeric,
    productsDevelopmentCost: Numeric,
    websiteDevelopmentCost: Numeric,
    personnelCost: Numeric,
    machinesMaintenanceCost: Numeric,
    warehousingCost: Numeric,
    BusinessIntelligenceCost: Numeric,
    creditControlCost: Numeric,
    insurancesPremiumsCost: Numeric,
    managementCost: Numeric,
    miscellaneousCost: Numeric,
    administrativeExpensesTotalCost: Numeric,
    previousTaxableProfitLoss: Numeric,
    taxableProfitLoss: Numeric,
    insurancesClaimsForLosses: Numeric,
    insurancesPrimaryNonInsuredRisk: Numeric,
    salesRevenue: Numeric,
    openingValue: Numeric,
    componentsPurchasedCost: Numeric,
    materialsPurchasedCost: Numeric,
    machinesRunningCost: Numeric,
    unskilledWorkersWagesCost: Numeric,
    skilledWorkersWagesCost: Numeric,
    qualityControlCostCost: Numeric,
    hiredTransportCost: Numeric,
    closingValue: Numeric,
    productionCost: Numeric,
    grossProfit: Numeric,
    depreciation: Numeric,
    taxAssessed: Numeric,
    currPeriodProfitLoss: Numeric,
    dividendPaid: Numeric,
    previousRetainedEarnings: Numeric,
    landNetValue: Numeric,
    buildingsNetValue: Numeric,
    machineryNetValue: Numeric,
    productsInventoriesValue: Numeric,
    componentsInventoriesValue: Numeric,
    materialsInventoriesValue: Numeric,
    tradeReceivablesValue: Numeric,
    cashValue: Numeric,
    taxDue: Numeric,
    tradePayablesValue: Numeric,
    banksOverdraft: Numeric,
    termLoansValue: Numeric,
    shareCapital: Numeric,
    sharePremiumAccount: Numeric,
    equityTotalValue: Numeric,
    tradingReceipts: Numeric,
    insurancesReceipts: Numeric,
    tradingPayments: Numeric,
    taxPaid: Numeric,
    interestReceived: Numeric,
    assetsSales: Numeric,
    assetsPurchases: Numeric,
    sharesIssued: Numeric,
    sharesRepurchased: Numeric,
    additionalLoans: Numeric,
    interestPaid: Numeric,
    netCashFlow: Numeric,
    previousBalance: Numeric,
    termDeposit: Numeric,
    nextPOverdraftLimit: Numeric,
    nextPBorrowingPower: Numeric
});
var corporateRes = Schema({
    playerID: Numeric,
    playerName: String,
    IP: Numeric,
    sharePriceByTenThousand: Numeric,
    marketValuation: Numeric,
    dividendRate: Numeric,
    workersNb: Numeric,
    salesForceNb: Numeric,
    hourlyWageRatePerCent: Numeric,
    nonCurrentAssetsTotalValue: Numeric,
    inventoriesClosingValue: Numeric,
    tradeReceivablesValue: Numeric,
    cashValue: Numeric,
    taxAssessedAndDue: Numeric,
    tradePayablesValue: Numeric,
    banksOverdraft: Numeric,
    LTLoans: Numeric,
    shareCapital: Numeric,
    sharePremiumAccount: Numeric,
    retainedEarnings: Numeric
});
var marketResearchRes = Schema({
    playerID: Numeric,
    playerName: String,
    advertisingBudget: Numeric,
    productsDevBudget: Numeric,
    markets: [{
            products: [{
                    price: Numeric,
                    marketShare: Numeric
                }]
        }],
    products: [{
            consumerStarRatings: Numeric
        }],
    websites: [{
            consumerStarRatings: Numeric
        }]
});
var companyResult = Schema({
    report: mongoose.Schema.Types.Mixed,
    markets: [marketRes],
    products: [productRes],
    subProducts: [subProductRes],
    materials: [materialRes],
    machineries: [machineryRes],
    factories: [factoryRes],
    lands: [landRes],
    eCommerces: [eCommerceRes],
    workers: [workerRes],
    agents: [agentRes],
    bankAccounts: [bankAccountRes],
    capital: {
        sharesNb: Numeric,
        shareCapital: Numeric,
        sharePremiumAccount: Numeric,
        sharesRepurchased: Numeric,
        sharesIssued: Numeric,
        dividendPaid: Numeric,
        sharesNbAtStartOfYear: Numeric
    },
    advertisingCost: Numeric,
    internetDistributionCost: Numeric,
    ISPCost: Numeric,
    salesForceCost: Numeric,
    salesOfficeCost: Numeric,
    guaranteeServicingCost: Numeric,
    productsDevelopmentCost: Numeric,
    websiteDevelopmentCost: Numeric,
    personnelCost: Numeric,
    machinesMaintenanceCost: Numeric,
    warehousingCost: Numeric,
    BusinessIntelligenceCost: Numeric,
    creditControlCost: Numeric,
    insurancesPremiumsCost: Numeric,
    managementCost: Numeric,
    miscellaneousCost: Numeric,
    administrativeExpensesTotalCost: Numeric,
    previousTaxableProfitLoss: Numeric,
    taxableProfitLoss: Numeric,
    insurancesClaimsForLosses: Numeric,
    insurancesPrimaryNonInsuredRisk: Numeric,
    salesRevenue: Numeric,
    inventoriesOpeningValue: Numeric,
    componentsPurchasedCost: Numeric,
    materialsPurchasedCost: Numeric,
    machinesRunningCost: Numeric,
    unskilledWorkersWagesCost: Numeric,
    skilledWorkersWagesCost: Numeric,
    qualityControlCostCost: Numeric,
    hiredTransportCost: Numeric,
    inventoriesClosingValue: Numeric,
    productionCost: Numeric,
    grossProfit: Numeric,
    depreciation: Numeric,
    taxAssessed: Numeric,
    currPeriodProfitLoss: Numeric,
    operatingProfitLoss: Numeric,
    netIncomeAfterTax: Numeric,
    dividendPaid: Numeric,
    previousRetainedEarnings: Numeric,
    landNetValue: Numeric,
    buildingsNetValue: Numeric,
    machineryNetValue: Numeric,
    nonCurrentAssetsTotalValue: Numeric,
    productsInventoriesValue: Numeric,
    componentsInventoriesValue: Numeric,
    materialsInventoriesValue: Numeric,
    tradeReceivablesValue: Numeric,
    cashValue: Numeric,
    taxDue: Numeric,
    tradePayablesValue: Numeric,
    banksOverdraft: Numeric,
    termLoansValue: Numeric,
    shareCapital: Numeric,
    sharePremiumAccount: Numeric,
    equityTotalValue: Numeric,
    tradingReceipts: Numeric,
    insurancesReceipts: Numeric,
    tradingPayments: Numeric,
    taxPaid: Numeric,
    interestReceived: Numeric,
    assetsSales: Numeric,
    assetsPurchases: Numeric,
    sharesIssued: Numeric,
    sharesRepurchased: Numeric,
    additionalLoans: Numeric,
    interestPaid: Numeric,
    netCashFlow: Numeric,
    previousBalance: Numeric,
    termDeposit: Numeric,
    nextPOverdraftLimit: Numeric,
    nextPBorrowingPower: Numeric,
    retainedEarnings: Numeric,
    sharePrice: Numeric,
    sharePriceByTenThousand: Numeric,
    marketValuation: Numeric,
    IP: Numeric,
    workingCapital: Numeric,
    freeCashFlow: Numeric
});
var result = Schema({
    seminarId: String,
    period: Number,
    p_Companies: [],
    p_Number: Number,
    p_Brands: [],
    p_Type: Number,
    p_SKUs: [],
    p_Market: {},
    environnement: {
        economies: [economyRes],
        currencies: [{
                exchangeRatePerCent: Number
            }],
        materialMarkets: [materialMarketRes],
        buildingContractors: [buildingContractorRes],
        businessReport: [String],
        BI: {
            corporates: [corporateRes],
            marketResearchs: [marketResearchRes]
        }
    },
    companies: [companyResult]
});
module.exports = result;
//# sourceMappingURL=ResultSchema.js.map