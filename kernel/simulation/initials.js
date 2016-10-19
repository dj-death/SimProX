"use strict";
var initials = {
    period: -3,
    playerID: 1,
    decision: {
        markets: [
            {
                corporateComBudget: 50,
                products: [
                    {
                        advertisingBudget: 35,
                        price: 395,
                        deliveredQ: 975
                    },
                    {
                        advertisingBudget: 35,
                        price: 675,
                        deliveredQ: 425
                    },
                    {
                        advertisingBudget: 35,
                        price: 935,
                        deliveredQ: 275
                    }
                ]
            },
            {
                corporateComBudget: 50,
                products: [
                    {
                        advertisingBudget: 35,
                        price: 395,
                        deliveredQ: 1020
                    },
                    {
                        advertisingBudget: 35,
                        price: 675,
                        deliveredQ: 475
                    },
                    {
                        advertisingBudget: 35,
                        price: 935,
                        deliveredQ: 300
                    }
                ]
            },
            {
                corporateComBudget: 50,
                products: [
                    {
                        advertisingBudget: 35,
                        price: 375,
                        deliveredQ: 1050
                    },
                    {
                        advertisingBudget: 35,
                        price: 600,
                        deliveredQ: 600
                    },
                    {
                        advertisingBudget: 35,
                        price: 900,
                        deliveredQ: 300
                    }
                ]
            }
        ],
        products: [
            {
                improvementsTakeup: 0,
                developmentBudget: 15,
                assemblyTime: 125,
                premiumMaterialPropertion: 0
            },
            {
                improvementsTakeup: 0,
                developmentBudget: 15,
                assemblyTime: 170,
                premiumMaterialPropertion: 0
            },
            {
                improvementsTakeup: 0,
                developmentBudget: 15,
                assemblyTime: 350,
                premiumMaterialPropertion: 0
            }
        ],
        subProducts: [
            {
                subcontractQ: 0
            },
            {
                subcontractQ: 0
            },
            {
                subcontractQ: 0
            }
        ],
        agents: [
            {
                appointedNb: 3,
                support: 13,
                commissionRate: 13
            },
            {
                appointedNb: 2,
                support: 13,
                commissionRate: 13
            },
            {
                support: 11,
                commissionRate: 11
            }
        ],
        materials: [
            {
                purchases: [
                    {
                        quantity: 10
                    },
                    {
                        quantity: 0
                    },
                    {
                        quantity: 0
                    }
                ]
            }
        ],
        machineries: [
            {
                maintenanceHours: 25,
                types: [
                    {
                        boughtNb: 0,
                        soldNb: 0
                    }
                ]
            }
        ],
        shiftLevel: 2,
        eCommerces: [
            {
                websitePortsNb: 11,
                websiteDevBudget: 15
            }
        ],
        workers: [
            {
                hire: 0,
                trainedNb: 0,
                hourlyWageRate: 1500
            }
        ],
        managementBudget: 150,
        staffTrainingDays: 0,
        sharesVariation: 0,
        dividend: 0,
        bankAccounts: [
            {
                termLoans: 0,
                termDeposit: 0
            }
        ],
        factories: [
            {
                extension: 0
            }
        ],
        insurances: [
            {
                plan: 3
            }
        ],
        orderMarketSharesInfo: 0,
        orderCorporateActivityInfo: 1
    },
    results: {
        economies: [
            {
                GDP: 94,
                unemploymentRatePerThousand: 0.086,
                externalTradeBalance: -16.66,
                interestBaseRatePerThousand: 32.5,
                inflationRate: 0.01,
                producerPriceBase100Index: 101,
                exchangeRatePerCent: 100,
            },
            {
                GDP: 12762.52,
                unemploymentRatePerThousand: 0.108,
                externalTradeBalance: 167.9,
                interestBaseRatePerThousand: 10,
                inflationRate: 0.0203,
                producerPriceBase100Index: 103,
                exchangeRatePerCent: 9,
            },
            {
                GDP: 44769.45,
                unemploymentRatePerThousand: 0.068,
                externalTradeBalance: -191499.55,
                interestBaseRatePerThousand: 10,
                inflationRate: 0.0293,
                producerPriceBase100Index: 103,
                exchangeRatePerCent: 9,
            }
        ],
        materialMarkets: [
            {
                spotPrice: 47925,
                threeMthPrice: 46756,
                sixMthPrice: 46325,
            }
        ],
        buildingContractors: [
            {
                buildingCost: 505,
            }
        ],
        factories: [
            {
                availableSpace: 1400,
                machiningSpaceUsed: 250,
                stocksSpaceUsed: 40,
            }
        ],
        lands: [
            {
                availableSpace: 7500,
            }
        ],
        machineries: [
            {
                effectiveSoldNb: 0,
                machinesNb: 10,
                effectiveBoughtNb: 0,
                availablesNextPeriodNb: 10,
                theoreticalAvailableHoursNb: 10680,
                breakdownHoursNb: 33,
                workedHoursNb: 7396,
                machinesEfficiencyAvg: 93.1,
                stats: [
                    {
                        nextUse: Infinity,
                        netValue: 180806.30406573,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 20,
                        type: 0
                    },
                    {
                        nextUse: Infinity,
                        netValue: 180806.30406573,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 20,
                        type: 0
                    },
                    {
                        nextUse: Infinity,
                        netValue: 210467.903250438,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 14,
                        type: 0
                    },
                    {
                        nextUse: Infinity,
                        netValue: 210467.903250438,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 14,
                        type: 0
                    },
                    {
                        nextUse: Infinity,
                        netValue: 210467.903250438,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 14,
                        type: 0
                    },
                    {
                        nextUse: Infinity,
                        netValue: 210467.903250438,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 14,
                        type: 0
                    },
                    {
                        nextUse: Infinity,
                        netValue: 215864.516154295,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 13,
                        type: 0
                    },
                    {
                        nextUse: Infinity,
                        netValue: 215864.516154295,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 13,
                        type: 0
                    },
                    {
                        nextUse: Infinity,
                        netValue: 221399.503747995,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 12,
                        type: 0
                    },
                    {
                        nextUse: Infinity,
                        netValue: 244995.541098679,
                        runningHoursNb: 10740,
                        efficiency: 0.931,
                        age: 8,
                        type: 0
                    }
                ]
            }
        ],
        materials: [
            {
                openingQ: 6938,
                unplannedPurchasesQ: 0,
                lostQ: 0,
                outQ: 8951,
                closingQ: 7987,
                deliveryNextPBoughtBeforeLastPQ: 0,
            }
        ],
        workers: [
            {
                availablesAtStartNb: 36,
                recruitedEffectiveNb: 0,
                dismissedEffectiveNb: 0,
                availablesNextPeriodNb: 36,
                availableTotalHoursNb: 20736,
                absenteeismHoursNb: 258,
                workedTotaHoursNb: 16210,
                strikeNextPeriodWeeksNb: 0,
            },
            {
                availablesAtStartNb: 69,
                recruitedEffectiveNb: 11,
                dismissedEffectiveNb: 0,
                availablesNextPeriodNb: 80,
                availableTotalHoursNb: 10680,
                absenteeismHoursNb: 0,
                workedTotaHoursNb: 734,
                strikeNextPeriodWeeksNb: 0,
            }
        ],
        subProducts: [
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        products: [
            {
                scheduledQ: 3045,
                producedQ: 3143,
                rejectedQ: 98,
                servicedQ: 66,
                lostQ: 0,
                improvementsResult: 0,
                qualityScore: 3.73,
                RnDQuality: 133,
                consumerStarRatings: "****",
            },
            {
                scheduledQ: 1500,
                producedQ: 1545,
                rejectedQ: 45,
                servicedQ: 32,
                lostQ: 0,
                improvementsResult: 0,
                qualityScore: 3.24,
                RnDQuality: 124,
                consumerStarRatings: "***",
            },
            {
                scheduledQ: 875,
                producedQ: 906,
                rejectedQ: 31,
                servicedQ: 12,
                lostQ: 0,
                improvementsResult: 0,
                qualityScore: 1.8,
                RnDQuality: 95,
                consumerStarRatings: "**",
            }
        ],
        eCommerces: [
            {
                wantedWebsitePortsNb: 11,
                activeWebsitePortsNb: 11,
                websiteVisitsNb: 99371,
                successfulWebsiteVisitsPerThousand: 1000,
                serviceComplaintsNb: 19,
            }
        ],
        agents: [
            {
                effectiveAppointedNb: 3,
                availablesNextPeriodNb: 0,
            },
            {
                effectiveAppointedNb: 2,
                availablesNextPeriodNb: 0,
            },
            {
                availablesNextPeriodNb: 0,
            }
        ],
        markets: [
            {
                transport: {
                    journeyLength: 1434,
                    loadsNb: 6
                },
                products: [
                    {
                        effectiveDeliveredQ: 975,
                        orderedQ: 590,
                        soldQ: 590,
                        backlogQ: 0,
                        stockQ: 395,
                    },
                    {
                        effectiveDeliveredQ: 425,
                        orderedQ: 311,
                        soldQ: 311,
                        backlogQ: 0,
                        stockQ: 120,
                    },
                    {
                        effectiveDeliveredQ: 275,
                        orderedQ: 145,
                        soldQ: 145,
                        backlogQ: 0,
                        stockQ: 130,
                    }
                ]
            },
            {
                transport: {
                    journeyLength: 500,
                    loadsNb: 7
                },
                products: [
                    {
                        effectiveDeliveredQ: 1020,
                        orderedQ: 809,
                        soldQ: 809,
                        backlogQ: 0,
                        stockQ: 215,
                    },
                    {
                        effectiveDeliveredQ: 475,
                        orderedQ: 347,
                        soldQ: 347,
                        backlogQ: 0,
                        stockQ: 140,
                    },
                    {
                        effectiveDeliveredQ: 300,
                        orderedQ: 144,
                        soldQ: 144,
                        backlogQ: 0,
                        stockQ: 168,
                    }
                ]
            },
            {
                transport: {
                    journeyLength: 300,
                    loadsNb: 7
                },
                products: [
                    {
                        effectiveDeliveredQ: 1050,
                        orderedQ: 213,
                        soldQ: 213,
                        backlogQ: 0,
                        stockQ: 837,
                    },
                    {
                        effectiveDeliveredQ: 600,
                        orderedQ: 125,
                        soldQ: 125,
                        backlogQ: 0,
                        stockQ: 492,
                    },
                    {
                        effectiveDeliveredQ: 300,
                        orderedQ: 5,
                        soldQ: 5,
                        backlogQ: 0,
                        stockQ: 318,
                    }
                ]
            }
        ],
        salesRevenue: 1437585,
        creditControlCost: 2689,
        salesOfficeCost: 14376,
        tradeReceivablesValue: 1243278,
        BI: {},
        managementCost: 150000,
        personnelCost: 11000,
        bankAccounts: [
            {
                interestPaid: 245,
                interestReceived: 0,
                banksOverdraft: 0,
                termDeposit: 0,
                termLoansValue: 0,
                previousBalance: -178276,
                balance: 287340,
                additionalLoans: 0,
            }
        ],
        capital: {
            shareCapital: 400000000,
            sharePremiumAccount: 0,
            sharesRepurchased: 0,
            sharesIssued: 0,
            dividendPaid: 0,
            sharesNbAtStartOfYear: 4000000
        },
        productsDevelopmentCost: 45000,
        machinesMaintenanceCost: 21463,
        machinesRunningCost: 125535,
        guaranteeServicingCost: 11760,
        qualityControlCostCost: 5594,
        warehousingCost: 13588,
        materialsPurchasedCost: 551720,
        componentsPurchasedCost: 0,
        unskilledWorkersWagesCost: 374400,
        skilledWorkersWagesCost: 251325,
        miscellaneousCost: 29794,
        machineryNetValue: 2101609,
        landNetValue: 375000,
        buildingsNetValue: 700000,
        depreciation: 53888,
        inventoriesOpeningValue: 350759,
        inventoriesClosingValue: 403325,
        productsInventoriesValue: 373230,
        componentsInventoriesValue: 0,
        materialsInventoriesValue: 29969,
        advertisingCost: 465000,
        hiredTransportCost: 168000,
        salesForceCost: 229707,
        websiteDevelopmentCost: 15000,
        internetDistributionCost: 28532,
        ISPCost: 11000,
        insurancesPremiumsCost: 7342,
        insurancesClaimsForLosses: 0,
        insurancesReceipts: 0,
        insurancesPrimaryNonInsuredRisk: 11014,
        interestPaid: 245,
        interestReceived: 0,
        banksOverdraft: 0,
        termDeposit: 0,
        termLoansValue: 0,
        additionalLoans: 0,
        cashValue: 287340,
        tradingReceipts: 2035515,
        tradingPayments: 2454248,
        tradePayablesValue: 970671,
        assetsSales: 0,
        assetsPurchases: 0,
        netCashFlow: -418978,
        previousBalance: -178276,
        nonCurrentAssetsTotalValue: 3176609,
        productionCost: 1424008,
        administrativeExpensesTotalCost: 1063751,
        grossProfit: 13577,
        operatingProfitLoss: -1104062,
        netIncomeAfterTax: -1103817,
        previousTaxableProfitLoss: 658139,
        taxableProfitLoss: -446168,
        taxDue: 279360,
        taxAssessed: 0,
        taxPaid: 0,
        currPeriodProfitLoss: -1104307,
        previousRetainedEarnings: 1426511,
        equityTotalValue: 400322204,
        nextPOverdraftLimit: 608000,
        nextPBorrowingPower: 0
    }
};
module.exports = initials;
//# sourceMappingURL=initials.js.map