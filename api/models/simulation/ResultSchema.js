"use strict";
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
function Numeric(key, options) {
    mongoose.SchemaType.call(this, key, options, 'Numeric');
}
Numeric.prototype = Object.create(mongoose.SchemaType.prototype);
// `cast()` takes a parameter that can be anything. You need to
// validate the provided `val` and throw a `CastError` if you
// can't convert it.
Numeric.prototype.cast = function (val) {
    let _val = !isNaN(val) ? Number(val) : 0;
    if (isNaN(_val)) {
        throw new mongoose.SchemaType.CastError('Numeric', val + ' is not a number');
    }
    return _val;
};
// Don't forget to add Numeric to the type registry
Schema.Types.Numeric = Numeric;
/******* Results *******/
let subProductRes = Schema({
    outQ: Numeric,
    closingQ: Numeric,
    availableNextPQ: Numeric,
    availableNextPValue: Numeric
});
let productRes = Schema({
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
let machineryRes = Schema({
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
let materialRes = Schema({
    openingQ: Numeric,
    premiumMaterialPurchasesQ: Numeric,
    unplannedPurchasesQ: Numeric,
    lostQ: Numeric,
    outQ: Numeric,
    closingQ: Numeric,
    closingValue: Numeric,
    deliveryNextPBoughtBeforeLastPQ: Numeric
});
let landRes = Schema({
    availableSpace: Numeric,
    netValue: Numeric
});
let factoryRes = Schema({
    availableSpace: Numeric,
    machiningSpaceUsed: Numeric,
    assemblyWorkersSpaceUsed: Numeric,
    stocksSpaceUsed: Numeric,
    netValue: Numeric
});
let workerRes = Schema({
    availablesAtStartNb: Numeric,
    recruitedEffectiveNb: Numeric,
    dismissedEffectiveNb: Numeric,
    availablesNextPeriodNb: Numeric,
    availableTotalHoursNb: Numeric,
    absenteeismHoursNb: Numeric,
    workedTotaHoursNb: Numeric,
    strikeNextPeriodWeeksNb: Numeric
});
let subMarketRes = Schema({
    effectiveDeliveredQ: Numeric,
    orderedQ: Numeric,
    soldQ: Numeric,
    backlogQ: Numeric,
    stockQ: Numeric,
    stockValue: Numeric
});
let agentRes = Schema({
    effectiveAppointedNb: Numeric,
    resignedNb: Numeric,
    availablesNextPeriodNb: Numeric
});
let marketRes = Schema({
    //agents: [agentRes],
    products: [subMarketRes],
    transport: {
        journeyLength: Numeric,
        loadsNb: Numeric
    }
});
let eCommerceRes = Schema({
    wantedWebsitePortsNb: Numeric,
    activeWebsitePortsNb: Numeric,
    websiteVisitsNb: Numeric,
    successfulWebsiteVisitsPerThousand: Numeric,
    serviceComplaintsNb: Numeric
});
let economyRes = Schema({
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
let materialMarketRes = Schema({
    spotPrice: Numeric,
    threeMthPrice: Numeric,
    sixMthPrice: Numeric
});
let buildingContractorRes = Schema({
    buildingCost: Numeric
});
let bankAccountRes = Schema({
    banksOverdraft: Numeric,
    interestPaid: Numeric,
    interestReceived: Numeric,
    termDeposit: Numeric,
    termLoansValue: Numeric,
    previousBalance: Numeric,
    balance: Numeric,
    additionalLoans: Numeric
});
let financial = Schema({
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
let corporateRes = Schema({
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
let marketResearchRes = Schema({
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
let companyResult = Schema({
    c_CID: Number,
    c_CompanyName: String,
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
    BI: {
        BusinessIntelligenceCost: Numeric
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
let result = Schema({
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
        BI: mongoose.Schema.Types.Mixed
    },
    companies: [companyResult]
});
module.exports = result;
//# sourceMappingURL=ResultSchema.js.map