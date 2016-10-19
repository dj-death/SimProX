export interface Initials {
    period: number;
    playerID: number;
    decision: {
        markets: [
            {
                corporateComBudget: number;
                products: [
                    {
                        advertisingBudget: number;
                        price: number;
                        deliveredQ: number;
                    },
                    {
                        advertisingBudget: number;
                        price: number;
                        deliveredQ: number;
                    },
                    {
                        advertisingBudget: number;
                        price: number;
                        deliveredQ: number;
                    }
                ]
            },
            {
                corporateComBudget: number;
                products: [
                    {
                        advertisingBudget: number;
                        price: number;
                        deliveredQ: number;
                    },
                    {
                        advertisingBudget: number;
                        price: number;
                        deliveredQ: number;
                    },
                    {
                        advertisingBudget: number;
                        price: number;
                        deliveredQ: number;
                    }
                ]
            },
            {
                corporateComBudget: number;
                products: [
                    {
                        advertisingBudget: number;
                        price: number;
                        deliveredQ: number;
                    },
                    {
                        advertisingBudget: number;
                        price: number;
                        deliveredQ: number;
                    },
                    {
                        advertisingBudget: number;
                        price: number;
                        deliveredQ: number;
                    }
                ]
            }
        ],
        products: [
            {
                improvementsTakeup: number;
                developmentBudget: number;
                assemblyTime: number;
                premiumMaterialPropertion: number;
            },
            {
                improvementsTakeup: number;
                developmentBudget: number;
                assemblyTime: number;
                premiumMaterialPropertion: number;
            },
            {
                improvementsTakeup: number;
                developmentBudget: number;
                assemblyTime: number;
                premiumMaterialPropertion: number;
            }
        ],
        subProducts: [
            {
                subcontractQ: number;
            },
            {
                subcontractQ: number;
            },
            {
                subcontractQ: number;
            }
        ],
        agents: [
            {
                appointedNb: number;
                support: number;
                commissionRate: number;
            },
            {
                appointedNb: number;
                support: number;
                commissionRate: number;
            },
            {
                support: number;
                commissionRate: number;
            }
        ],
        materials: [
            {
                purchases: [
                    {
                        quantity: number;
                    },
                    {
                        quantity: number;
                    },
                    {
                        quantity: number;
                    }
                ]
            }
        ],
        machineries: [
            {
                maintenanceHours: number;
                types: [
                    {
                        boughtNb: number;
                        soldNb: number;
                    }
                ]
            }
        ],
        shiftLevel: number;
        eCommerces: [
            {
                websitePortsNb: number;
                websiteDevBudget: number;
            }
        ],
        workers: [
            {
                hire: number;
                trainedNb: number;
                hourlyWageRate: number;
            }
        ],
        managementBudget: number;
        staffTrainingDays: number;
        sharesVariation: number;
        dividend: number;
        bankAccounts: [
            {
                termLoans: number;
                termDeposit: number;
            }
        ],
        factories: [
            {
                extension: number;
            }
        ],
        insurances: [
            {
                plan: number;
            }
        ],
        orderMarketSharesInfo: number;
        orderCorporateActivityInfo: number;
    },
    results: {
        economies: [
            {
                GDP: number;
                unemploymentRatePerThousand: number;
                externalTradeBalance: number;
                interestBaseRatePerThousand: number;
                inflationRate: number;
                producerPriceBase100Index: number;
                exchangeRatePerCent: number;
            },
            {
                GDP: number;
                unemploymentRatePerThousand: number;
                externalTradeBalance: number;
                interestBaseRatePerThousand: number;
                inflationRate: number;
                producerPriceBase100Index: number;
                exchangeRatePerCent: number;
            },
            {
                GDP: number;
                unemploymentRatePerThousand: number;
                externalTradeBalance: number;
                interestBaseRatePerThousand: number;
                inflationRate: number;
                producerPriceBase100Index: number;
                exchangeRatePerCent: number;

            }
        ],
        materialMarkets: [
            {
                spotPrice: number;
                threeMthPrice: number;
                sixMthPrice: number;

            }
        ],
        buildingContractors: [
            {
                buildingCost: number;

            }
        ],
        factories: [
            {
                availableSpace: number;
                machiningSpaceUsed: number;
                stocksSpaceUsed: number;

            }
        ],
        lands: [
            {
                availableSpace: number;

            }
        ],
        machineries: [
            {
                effectiveSoldNb: number;
                machinesNb: number;
                effectiveBoughtNb: number;
                availablesNextPeriodNb: number;
                theoreticalAvailableHoursNb: number;
                breakdownHoursNb: number;
                workedHoursNb: number;
                machinesEfficiencyAvg: number;

                stats: [
                    {
                        nextUse: number;
                        netValue: number;
                        runningHoursNb: number;
                        efficiency: number;
                        age: number;
                        type: number;
                    },
                    {
                        nextUse: number;
                        netValue: number;
                        runningHoursNb: number;
                        efficiency: number;
                        age: number;
                        type: number;
                    },
                    {
                        nextUse: number;
                        netValue: number;
                        runningHoursNb: number;
                        efficiency: number;
                        age: number;
                        type: number;
                    },
                    {
                        nextUse: number;
                        netValue: number;
                        runningHoursNb: number;
                        efficiency: number;
                        age: number;
                        type: number;
                    },
                    {
                nextUse: number;
                netValue: number;
                runningHoursNb: number;
                efficiency: number;
                age: number;
                type: number;
                    },
                    {
                        nextUse: number;
                        netValue: number;
                        runningHoursNb: number;
                        efficiency: number;
                        age: number;
                        type: number;
                    },
                    {
                        nextUse: number;
                        netValue: number;
                        runningHoursNb: number;
                        efficiency: number;
                        age: number;
                        type: number;
                    },
                    {
                        nextUse: number;
                        netValue: number;
                        runningHoursNb: number;
                        efficiency: number;
                        age: number;
                        type: number;
                    },
                    {
                        nextUse: number;
                        netValue: number;
                        runningHoursNb: number;
                        efficiency: number;
                        age: number;
                        type: number;
                    },
                    {
                        nextUse: number;
                        netValue: number;
                        runningHoursNb: number;
                        efficiency: number;
                        age: number;
                        type: number;
                    }
                ]
            }
        ],
        materials: [
            {
                openingQ: number;
                unplannedPurchasesQ: number;
                lostQ: number;
                outQ: number;
                closingQ: number;
                deliveryNextPBoughtBeforeLastPQ: number;

            }
        ],
        workers: [
            {
                availablesAtStartNb: number;
                recruitedEffectiveNb: number;
                dismissedEffectiveNb: number;
                availablesNextPeriodNb: number;
                availableTotalHoursNb: number;
                absenteeismHoursNb: number;
                workedTotaHoursNb: number;
                strikeNextPeriodWeeksNb: number;

            },
            {
                availablesAtStartNb: number;
                recruitedEffectiveNb: number;
                dismissedEffectiveNb: number;
                availablesNextPeriodNb: number;
                availableTotalHoursNb: number;
                absenteeismHoursNb: number;
                workedTotaHoursNb: number;
                strikeNextPeriodWeeksNb: number;

            }
        ],
        subProducts: [
            {

            },
            {

            },
            {

            },
            {

            },
            {

            },
            {

            }
        ],
        products: [
            {
                scheduledQ: number;
                producedQ: number;
                rejectedQ: number;
                servicedQ: number;
                lostQ: number;
                improvementsResult: number;
                qualityScore: number;
                RnDQuality: number;
                consumerStarRatings: string;

            },
            {
                scheduledQ: number;
                producedQ: number;
                rejectedQ: number;
                servicedQ: number;
                lostQ: number;
                improvementsResult: number;
                qualityScore: number;
                RnDQuality: number;
                consumerStarRatings: string;

            },
            {
                scheduledQ: number;
                producedQ: number;
                rejectedQ: number;
                servicedQ: number;
                lostQ: number;
                improvementsResult: number;
                qualityScore: number;
                RnDQuality: number;
                consumerStarRatings: string;

            }
        ],
        eCommerces: [
            {
                wantedWebsitePortsNb: number;
                activeWebsitePortsNb: number;
                websiteVisitsNb: number;
                successfulWebsiteVisitsPerThousand: number;
                serviceComplaintsNb: number;

            }
        ],
        agents: [
            {
                effectiveAppointedNb: number;
                availablesNextPeriodNb: number;

            },
            {
                effectiveAppointedNb: number;
                availablesNextPeriodNb: number;

            },
            {
                availablesNextPeriodNb: number;

            }
        ],
        markets: [
            {

                transport: {
                    journeyLength: number;
                    loadsNb: number;
                },
                products: [
                    {
                        effectiveDeliveredQ: number;
                        orderedQ: number;
                        soldQ: number;
                        backlogQ: number;
                        stockQ: number;

                    },
                    {
                        effectiveDeliveredQ: number;
                        orderedQ: number;
                        soldQ: number;
                        backlogQ: number;
                        stockQ: number;

                    },
                    {
                        effectiveDeliveredQ: number;
                        orderedQ: number;
                        soldQ: number;
                        backlogQ: number;
                        stockQ: number;

                    }
                ]
            },
            {

                transport: {
                    journeyLength: number;
                    loadsNb: number;
                },
                products: [
                    {
                        effectiveDeliveredQ: number;
                        orderedQ: number;
                        soldQ: number;
                        backlogQ: number;
                        stockQ: number;

                    },
                    {
                        effectiveDeliveredQ: number;
                        orderedQ: number;
                        soldQ: number;
                        backlogQ: number;
                        stockQ: number;

                    },
                    {
                        effectiveDeliveredQ: number;
                        orderedQ: number;
                        soldQ: number;
                        backlogQ: number;
                        stockQ: number;

                    }
                ]
            },
            {

                transport: {
                    journeyLength: number;
                    loadsNb: number;
                },
                products: [
                    {
                        effectiveDeliveredQ: number;
                        orderedQ: number;
                        soldQ: number;
                        backlogQ: number;
                        stockQ: number;

                    },
                    {
                        effectiveDeliveredQ: number;
                        orderedQ: number;
                        soldQ: number;
                        backlogQ: number;
                        stockQ: number;

                    },
                    {
                        effectiveDeliveredQ: number;
                        orderedQ: number;
                        soldQ: number;
                        backlogQ: number;
                        stockQ: number;

                    }
                ]
            }
        ],
        salesRevenue: number;
        creditControlCost: number;
        salesOfficeCost: number;
        tradeReceivablesValue: number;
        BI: {},
        managementCost: number;
        personnelCost: number;
        bankAccounts: [
            {
                interestPaid: number;
                interestReceived: number;
                banksOverdraft: number;
                termDeposit: number;
                termLoansValue: number;
                previousBalance: number;
                balance: number;
                additionalLoans: number;

            }
        ],
        capital: {
            shareCapital: number;
            sharePremiumAccount: number;
            sharesRepurchased: number;
            sharesIssued: number;
            dividendPaid: number;
            sharesNbAtStartOfYear: number;
        },
        productsDevelopmentCost: number;
        machinesMaintenanceCost: number;
        machinesRunningCost: number;
        guaranteeServicingCost: number;
        qualityControlCostCost: number;
        warehousingCost: number;
        materialsPurchasedCost: number;
        componentsPurchasedCost: number;
        unskilledWorkersWagesCost: number;
        skilledWorkersWagesCost: number;
        miscellaneousCost: number;
        machineryNetValue: number;
        landNetValue: number;
        buildingsNetValue: number;
        depreciation: number;
        inventoriesOpeningValue: number;
        inventoriesClosingValue: number;
        productsInventoriesValue: number;
        componentsInventoriesValue: number;
        materialsInventoriesValue: number;
        advertisingCost: number;
        hiredTransportCost: number;
        salesForceCost: number;
        websiteDevelopmentCost: number;
        internetDistributionCost: number;
        ISPCost: number;
        insurancesPremiumsCost: number;
        insurancesClaimsForLosses: number;
        insurancesReceipts: number;
        insurancesPrimaryNonInsuredRisk: number;
        interestPaid: number;
        interestReceived: number;
        banksOverdraft: number;
        termDeposit: number;
        termLoansValue: number;
        additionalLoans: number;
        cashValue: number;
        tradingReceipts: number;
        tradingPayments: number;
        tradePayablesValue: number;
        assetsSales: number;
        assetsPurchases: number;
        netCashFlow: number;
        previousBalance: number;
        nonCurrentAssetsTotalValue: number;
        productionCost: number;
        administrativeExpensesTotalCost: number;
        grossProfit: number;
        operatingProfitLoss: number;
        netIncomeAfterTax: number;
        previousTaxableProfitLoss: number;
        taxableProfitLoss: number;
        taxDue: number;
        taxAssessed: number;
        taxPaid: number;
        currPeriodProfitLoss: number;
        previousRetainedEarnings: number;
        equityTotalValue: number;
        nextPOverdraftLimit: number;
        nextPBorrowingPower: number;
    }
};



export interface Result {
    economies: [
        {
            GDP: number;
            unemploymentRatePerThousand: number;
            externalTradeBalance: number;
            interestBaseRatePerThousand: number;
            inflationRate: number;
            producerPriceBase100Index: number;
            exchangeRatePerCent: number;
        },
        {
            GDP: number;
            unemploymentRatePerThousand: number;
            externalTradeBalance: number;
            interestBaseRatePerThousand: number;
            inflationRate: number;
            producerPriceBase100Index: number;
            exchangeRatePerCent: number;
        },
        {
            GDP: number;
            unemploymentRatePerThousand: number;
            externalTradeBalance: number;
            interestBaseRatePerThousand: number;
            inflationRate: number;
            producerPriceBase100Index: number;
            exchangeRatePerCent: number;

        }
    ],
        materialMarkets: [
            {
                spotPrice: number;
                threeMthPrice: number;
                sixMthPrice: number;

            }
        ],
            buildingContractors: [
                {
                    buildingCost: number;

                }
            ],
                factories: [
                    {
                        availableSpace: number;
                        machiningSpaceUsed: number;
                        stocksSpaceUsed: number;

                    }
                ],
                    lands: [
                        {
                            availableSpace: number;

                        }
                    ],
                        machineries: [
                            {
                                effectiveSoldNb: number;
                                machinesNb: number;
                                effectiveBoughtNb: number;
                                availablesNextPeriodNb: number;
                                theoreticalAvailableHoursNb: number;
                                breakdownHoursNb: number;
                                workedHoursNb: number;
                                machinesEfficiencyAvg: number;

                                stats: [
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    },
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    },
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    },
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    },
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    },
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    },
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    },
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    },
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    },
                                    {
                                        nextUse: number;
                                        netValue: number;
                                        runningHoursNb: number;
                                        efficiency: number;
                                        age: number;
                                        type: number;
                                    }
                                ]
                            }
                        ],
                            materials: [
                                {
                                    openingQ: number;
                                    unplannedPurchasesQ: number;
                                    lostQ: number;
                                    outQ: number;
                                    closingQ: number;
                                    deliveryNextPBoughtBeforeLastPQ: number;

                                }
                            ],
                                workers: [
                                    {
                                        availablesAtStartNb: number;
                                        recruitedEffectiveNb: number;
                                        dismissedEffectiveNb: number;
                                        availablesNextPeriodNb: number;
                                        availableTotalHoursNb: number;
                                        absenteeismHoursNb: number;
                                        workedTotaHoursNb: number;
                                        strikeNextPeriodWeeksNb: number;

                                    },
                                    {
                                        availablesAtStartNb: number;
                                        recruitedEffectiveNb: number;
                                        dismissedEffectiveNb: number;
                                        availablesNextPeriodNb: number;
                                        availableTotalHoursNb: number;
                                        absenteeismHoursNb: number;
                                        workedTotaHoursNb: number;
                                        strikeNextPeriodWeeksNb: number;

                                    }
                                ],
                                    subProducts: [
                                        {

                                        },
                                        {

                                        },
                                        {

                                        },
                                        {

                                        },
                                        {

                                        },
                                        {

                                        }
                                    ],
                                        products: [
                                            {
                                                scheduledQ: number;
                                                producedQ: number;
                                                rejectedQ: number;
                                                servicedQ: number;
                                                lostQ: number;
                                                improvementsResult: number;
                                                qualityScore: number;
                                                RnDQuality: number;
                                                consumerStarRatings: string;

                                            },
                                            {
                                                scheduledQ: number;
                                                producedQ: number;
                                                rejectedQ: number;
                                                servicedQ: number;
                                                lostQ: number;
                                                improvementsResult: number;
                                                qualityScore: number;
                                                RnDQuality: number;
                                                consumerStarRatings: string;

                                            },
                                            {
                                                scheduledQ: number;
                                                producedQ: number;
                                                rejectedQ: number;
                                                servicedQ: number;
                                                lostQ: number;
                                                improvementsResult: number;
                                                qualityScore: number;
                                                RnDQuality: number;
                                                consumerStarRatings: string;

                                            }
                                        ],
                                            eCommerces: [
                                                {
                                                    wantedWebsitePortsNb: number;
                                                    activeWebsitePortsNb: number;
                                                    websiteVisitsNb: number;
                                                    successfulWebsiteVisitsPerThousand: number;
                                                    serviceComplaintsNb: number;

                                                }
                                            ],
                                                agents: [
                                                    {
                                                        effectiveAppointedNb: number;
                                                        availablesNextPeriodNb: number;

                                                    },
                                                    {
                                                        effectiveAppointedNb: number;
                                                        availablesNextPeriodNb: number;

                                                    },
                                                    {
                                                        availablesNextPeriodNb: number;

                                                    }
                                                ],
                                                    markets: [
                                                        {

                                                            transport: {
                                                                journeyLength: number;
                                                                loadsNb: number;
                                                            },
                                                            products: [
                                                                {
                                                                    effectiveDeliveredQ: number;
                                                                    orderedQ: number;
                                                                    soldQ: number;
                                                                    backlogQ: number;
                                                                    stockQ: number;

                                                                },
                                                                {
                                                                    effectiveDeliveredQ: number;
                                                                    orderedQ: number;
                                                                    soldQ: number;
                                                                    backlogQ: number;
                                                                    stockQ: number;

                                                                },
                                                                {
                                                                    effectiveDeliveredQ: number;
                                                                    orderedQ: number;
                                                                    soldQ: number;
                                                                    backlogQ: number;
                                                                    stockQ: number;

                                                                }
                                                            ]
                                                        },
                                                        {

                                                            transport: {
                                                                journeyLength: number;
                                                                loadsNb: number;
                                                            },
                                                            products: [
                                                                {
                                                                    effectiveDeliveredQ: number;
                                                                    orderedQ: number;
                                                                    soldQ: number;
                                                                    backlogQ: number;
                                                                    stockQ: number;

                                                                },
                                                                {
                                                                    effectiveDeliveredQ: number;
                                                                    orderedQ: number;
                                                                    soldQ: number;
                                                                    backlogQ: number;
                                                                    stockQ: number;

                                                                },
                                                                {
                                                                    effectiveDeliveredQ: number;
                                                                    orderedQ: number;
                                                                    soldQ: number;
                                                                    backlogQ: number;
                                                                    stockQ: number;

                                                                }
                                                            ]
                                                        },
                                                        {

                                                            transport: {
                                                                journeyLength: number;
                                                                loadsNb: number;
                                                            },
                                                            products: [
                                                                {
                                                                    effectiveDeliveredQ: number;
                                                                    orderedQ: number;
                                                                    soldQ: number;
                                                                    backlogQ: number;
                                                                    stockQ: number;

                                                                },
                                                                {
                                                                    effectiveDeliveredQ: number;
                                                                    orderedQ: number;
                                                                    soldQ: number;
                                                                    backlogQ: number;
                                                                    stockQ: number;

                                                                },
                                                                {
                                                                    effectiveDeliveredQ: number;
                                                                    orderedQ: number;
                                                                    soldQ: number;
                                                                    backlogQ: number;
                                                                    stockQ: number;

                                                                }
                                                            ]
                                                        }
                                                    ],
                                                        salesRevenue: number;
    creditControlCost: number;
    salesOfficeCost: number;
    tradeReceivablesValue: number;
    BI: { },
    managementCost: number;
    personnelCost: number;
    bankAccounts: [
        {
            interestPaid: number;
            interestReceived: number;
            banksOverdraft: number;
            termDeposit: number;
            termLoansValue: number;
            previousBalance: number;
            balance: number;
            additionalLoans: number;

        }
    ],
        capital: {
        shareCapital: number;
        sharePremiumAccount: number;
        sharesRepurchased: number;
        sharesIssued: number;
        dividendPaid: number;
        sharesNbAtStartOfYear: number;
    },
    productsDevelopmentCost: number;
    machinesMaintenanceCost: number;
    machinesRunningCost: number;
    guaranteeServicingCost: number;
    qualityControlCostCost: number;
    warehousingCost: number;
    materialsPurchasedCost: number;
    componentsPurchasedCost: number;
    unskilledWorkersWagesCost: number;
    skilledWorkersWagesCost: number;
    miscellaneousCost: number;
    machineryNetValue: number;
    landNetValue: number;
    buildingsNetValue: number;
    depreciation: number;
    inventoriesOpeningValue: number;
    inventoriesClosingValue: number;
    productsInventoriesValue: number;
    componentsInventoriesValue: number;
    materialsInventoriesValue: number;
    advertisingCost: number;
    hiredTransportCost: number;
    salesForceCost: number;
    websiteDevelopmentCost: number;
    internetDistributionCost: number;
    ISPCost: number;
    insurancesPremiumsCost: number;
    insurancesClaimsForLosses: number;
    insurancesReceipts: number;
    insurancesPrimaryNonInsuredRisk: number;
    interestPaid: number;
    interestReceived: number;
    banksOverdraft: number;
    termDeposit: number;
    termLoansValue: number;
    additionalLoans: number;
    cashValue: number;
    tradingReceipts: number;
    tradingPayments: number;
    tradePayablesValue: number;
    assetsSales: number;
    assetsPurchases: number;
    netCashFlow: number;
    previousBalance: number;
    nonCurrentAssetsTotalValue: number;
    productionCost: number;
    administrativeExpensesTotalCost: number;
    grossProfit: number;
    operatingProfitLoss: number;
    netIncomeAfterTax: number;
    previousTaxableProfitLoss: number;
    taxableProfitLoss: number;
    taxDue: number;
    taxAssessed: number;
    taxPaid: number;
    currPeriodProfitLoss: number;
    previousRetainedEarnings: number;
    equityTotalValue: number;
    nextPOverdraftLimit: number;
    nextPBorrowingPower: number;
}