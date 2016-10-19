/****** Decision ********/

export interface manufacturingTime {
    time: number;
}

export interface subProduct {
    subcontractQ: number;
    premiumMaterialPropertion: number;
}

export interface product {
    manufacturingTime: number;

    assemblyTime: number;

    improvementsTakeup: boolean;
    developmentBudget: number;
    premiumMaterialPropertion: number;
}

interface machineTypeDec {
    boughtNb: number;
    soldNb: number;
}

export interface machinery {
    maintenanceHours: number;

    types: machineTypeDec[];
}

export interface futures {
    term: number;
    quantity: number;
}

export interface material {
    purchases: futures[]
}

export interface factory {
    extension: number;
}

export interface worker {
    hourlyWageRate: number;
    hire: number;
    trainedNb: number;
}

export interface subMarket {
    advertisingBudget: number;
    price: number;
    deliveredQ: number;

    customerCredit?: number;
}

export interface agent {
    appointedNb: number;
    commissionRate: number;
    support: number;
}

export interface market {
    corporateComBudget: number;
    //agents: agent[];
    products: subMarket[];
}

export interface eCommerce {
    websitePortsNb: number;
    websiteDevBudget: number;
}


export interface insurance {
    plan: number;
}

export interface bankAccount {
    termLoans: number;
    termDeposit: number;
}

export interface Decision {
    markets: market[];
    agents: agent[];
    subProducts: subProduct[];
    products: product[];
    materials: material[];
    machineries: machinery[];
    shiftLevel: number;
    factories: factory[];
    eCommerces: eCommerce[];
    bankAccounts: bankAccount[];
    insurances: insurance[];
    sharesVariation: number;

    dividend: number;
    orderMarketSharesInfo: boolean;
    orderCorporateActivityInfo: boolean;

    staffTrainingDays: number;

    managementBudget: number;

    workers: worker[];

}


/******* Results *******/

export interface subProductRes { 
    outsourcedOutQ: number;
    outsourcedClosingQ: number;
    outsourcedAvailableNextPQ: number;

    availableNextPValue?: number

    outsourcedAvailableNextPValue?: number;
}

export interface productRes { 
    scheduledQ: number;
    producedQ: number;
    rejectedQ: number;
    lostQ: number;
    servicedQ: number;
    improvementsResult: string;
    RnDQuality: number;
    qualityScore: number;

    devProgress?: number;
}

export interface machineryRes { 
    effectiveSoldNb: number;
    effectiveBoughtNb: number;
    machinesNb: number;
    availablesNextPeriodNb: number;
    theoreticalAvailableHoursNb: number;
    breakdownHoursNb: number;
    workedHoursNb: number;
    machinesEfficiencyAvg: number;

    machineryNetValue?: number;
    stats?: any[]
}

export interface materialRes { 
    openingQ: number;
    premiumMaterialPurchasesQ: number;
    unplannedPurchasesQ: number;
    lostQ: number;
    spoiledQ: number;
    outQ: number;
    closingQ: number;
    closingValue: number;
    deliveryNextPBoughtBeforeLastPQ: number;

    deliveryNextPBoughtBeforeLastPValue?: number;
}

export interface landRes { 
    availableSpace: number;

    netValue?: number
}


export interface factoryRes { 
    availableSpace: number;
    machiningSpaceUsed: number;
    assemblyWorkersSpaceUsed: number;
    stocksSpaceUsed: number;

    netValue?: number
}

export interface workerRes { 
    availablesAtStartNb: number;
    recruitedEffectiveNb: number;
    dismissedEffectiveNb: number;
    availablesNextPeriodNb: number;

    availableTotalHoursNb?: number;
    absenteeismHoursNb?: number;

    workedTotaHoursNb?: number;
    strikeNextPeriodWeeksNb?: number
}

export interface subMarketRes {
    price: number;
     
    effectiveDeliveredQ: number;
    orderedQ: number;
    soldQ: number;
    backlogQ?: number;

    stockQ: number;

    stockValue?: number;

    normalizedDirectAdsBudget: number;
    normalizedPrice: number;
    normalizedCustomerCreditEasing: number;

    normalizedQuality: number;

    industrySatisfactionScoreAvg: number;
}

export interface agentRes { 
    effectiveAppointedNb: number;
    resignedNb: number;
    availablesNextPeriodNb: number
}

export interface marketRes { 
    products: subMarketRes[];

    transport: {
        journeyLength: number;
        loadsNb: number
    };

    normalizedCorporateAdsBudget: number;
    normalizedSalesForceStaff: number;
    normalizedSalesForceCommission: number;
    normalizedSalesForceSupport: number;
}

export interface eCommerceRes { 
    wantedWebsitePortsNb: number;
    initialActiveWebsitePortsNb: number;
    activeWebsitePortsNb: number;
    websiteVisitsNb: number;
    successfulWebsiteVisitsPerThousand: number;
    serviceComplaintsNb: number;

    websiteConsumerStarRatings: string;
    websiteLevel: number;
}

export interface economyRes { 
    GDP: number;
    unemploymentRatePerThousand?: number;
    externalTradeBalance?: number;
    interestBaseRatePerThousand?: number;
    exchangeRatePerCent?: number;
    consumerPriceBase100Index?: number;
    producerPriceBase100Index?: number;
    revenueBase100Index?: number;
    inflationRate?: number;

    population: number;
}

export interface materialMarketRes { 
    spotPrice: number;
    threeMthPrice: number;
    sixMthPrice: number
}

export interface buildingContractorRes { 
    buildingCost: number
}

export interface bankAccountRes { 
    banksOverdraft: number;
    interestPaid: number;
    interestReceived: number;
    termDeposit: number;
    termLoansValue: number;
    previousBalance: number;
    balance: number;
    additionalLoans: number;

    cashValue?: number;
    nextPOverdraftLimit?: number;
    cashBalance?: number;
}

export interface corporateRes { 
    playerID: number;
    playerName: string;

    IP: number;
    sharePriceByTenThousand: number;
    marketValuation: number;

    dividendRate: number;

    workersNb: number;
    salesForceNb: number;
    hourlyWageRatePerCent: number;

    nonCurrentAssetsTotalValue: number;
    inventoriesClosingValue: number;
    tradeReceivablesValue: number;
    cashValue: number;
    taxAssessedAndDue: number;
    tradePayablesValue: number;
    banksOverdraft: number;
    LTLoans: number;
    shareCapital: number;
    sharePremiumAccount: number;
    retainedEarnings: number
}

export interface productBI {
    price: number;
    marketVolumeShareOfSales: number
}

export interface marketBI {
    products: productBI[];
}

export interface productRating {
    consumerStarRatings: number
}

export interface eCommerceRating {
    websiteConsumerStarRatings: number
}

export interface marketResearchRes { 
    playerID: number;
    playerName: string;

    advertisingBudget: number;
    productsDevBudget: number;

    markets: marketBI[];

    products: productRating[];

    eCommerces: eCommerceRating[];
}


export interface Results {
    report: any;
    markets: marketRes[];
    products: productRes[];
    subProducts: subProductRes[];
    materials: materialRes[];
    machineries: machineryRes[];
    factories: factoryRes[];
    lands: landRes[];
    eCommerces: eCommerceRes[];
    workers: workerRes[];
    agents: agentRes[];

    bankAccounts: bankAccountRes[];

    capital: {
        sharesNb: number;
        shareCapital: number;
        
        sharePremiumAccount: number;
        sharesRepurchased: number;
        sharesIssued: number;
        dividendPaid: number;
        sharesNbAtStartOfYear: number;

    };

    economies: economyRes[];
    materialMarkets: materialMarketRes[];
    buildingContractors: buildingContractorRes[];

    businessReport: string[];

    BI: {
        corporates: corporateRes[];
        marketResearchs: marketResearchRes[]
    };

    advertisingCost: number;
    internetDistributionCost: number;
    ISPCost: number;
    salesForceCost: number;
    salesOfficeCost: number;
    guaranteeServicingCost: number;
    productsDevelopmentCost: number;
    websiteDevelopmentCost: number;
    personnelCost: number;
    machinesMaintenanceCost: number;
    warehousingCost: number;
    BusinessIntelligenceCost: number;
    creditControlCost: number;
    insurancesPremiumsCost: number;
    managementCost: number;
    miscellaneousCost: number;
    administrativeExpensesTotalCost: number;
    previousTaxableProfitLoss: number;
    taxableProfitLoss: number;
    insurancesClaimsForLosses: number;
    insurancesPrimaryNonInsuredRisk: number;
    salesRevenue: number;
    inventoriesOpeningValue: number;
    componentsPurchasedCost: number;
    materialsPurchasedCost: number;
    machinesRunningCost: number;
    unskilledWorkersWagesCost: number;
    skilledWorkersWagesCost: number;
    qualityControlCostCost: number;
    hiredTransportCost: number;
    inventoriesClosingValue: number;
    productionCost: number;
    grossProfit: number;
    depreciation: number;
    taxAssessed: number;
    currPeriodProfitLoss: number;

    operatingProfitLoss: number;
    netIncomeAfterTax: number;

    dividendPaid: number;
    previousRetainedEarnings: number;
    retainedEarnings: number;
    landNetValue: number;
    buildingsNetValue: number;
    machineryNetValue: number;
    nonCurrentAssetsTotalValue: number;
    productsInventoriesValue: number;
    componentsInventoriesValue: number;
    materialsInventoriesValue: number;
    tradeReceivablesValue: number;
    cashValue: number;
    cashFlowBalance: number;
    taxDue: number;
    tradePayablesValue: number;
    banksOverdraft: number;
    termLoansValue: number;
    shareCapital: number;
    sharePremiumAccount: number;
    equityTotalValue: number;
    tradingReceipts: number;
    insurancesReceipts: number;
    tradingPayments: number;
    taxPaid: number;
    interestReceived: number;
    assetsSales: number;
    assetsPurchases: number;
    sharesIssued: number;
    sharesRepurchased: number;
    additionalLoans: number;
    interestPaid: number;
    netCashFlow: number;
    previousBalance: number;
    termDeposit: number;
    nextPOverdraftLimit: number;
    nextPBorrowingPower: number
    creditWorthiness: number;

    marketValuation: number;
    sharePrice: number;

    IP: number;

    workingCapital: number;
    freeCashFlow: number;

}

/*********************/



export interface Scenario {
    playerID: string;
    period: number;
    reportDate: string;
    scenarioID: string;

    periodYear: number;
    periodQuarter: number;

    decision: Decision;
	
    results: Results; 
};