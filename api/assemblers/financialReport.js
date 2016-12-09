"use strict";
let consts = require('../consts');
/*
Report data structure

[
  {
    "periods": [
      {
        "allBrands": {
          "data": [
            {
              "inventoryValue": 112.85809727177538,
              "productionCost": 1107.00378417969,
              "brandName": "APONE"
            },
            {
              "inventoryValue": 253.0387106991291,
              "productionCost": 310.456420898438,
              "brandName": "ACOOP"
            }
          ],
          "brandName": "All Brands"
        },
        "brands": [
          {
            "data": [
              {
                "inventoryValue": 0,
                "productionCost": 550.569091796875,
                "SKUName": "_1 Normal Pack"
              },
              {
                "inventoryValue": 112.85809727177553,
                "productionCost": 163.041610717773,
                "SKUName": "_2 Small Pack"
              }
            ],
            "brandName": "APONE",
            "brandId": 11
          },
          {
            "data": [
              {
                "inventoryValue": 253.03871069912955,
                "productionCost": 310.456420898438,
                "SKUName": "_1 Large Pack"
              },
              {
                "inventoryValue": 253.0387106991291,
                "productionCost": 310.456420898438,
                "SKUName": "Brand Total"
              }
            ],
            "brandName": "ACOOP",
            "brandId": 12
          }
        ],
        "period": -3
      }
    ],
    "companyName": "CompanyA",
    "companyId": 1
  }
]

*/
function getFinancialReport(allResults) {
    let allCompanyReport = [];
    let currPeriodResult = allResults[0];
    let companiesResults = currPeriodResult.companies;
    function isCompanyExist(companyId, result) {
        return result.some(function (companyReport) {
            return companyReport.companyId === companyId;
        });
    }
    companiesResults.forEach(function (companyResult) {
        //if (!isCompanyExist(companyResult.c_CompanyID, allCompanyReport)) {
        allCompanyReport.push({
            companyId: companyResult.c_CompanyID,
            companyName: companyResult.c_CompanyName,
            periods: []
        });
        //}
    });
    allCompanyReport.forEach(function (companyReport) {
        allResults.forEach(function (onePeriodResult) {
            let periodReport = onePeriodResult;
            periodReport.period = onePeriodResult.period;
            companyReport.periods.push(periodReport);
        });
    });
    return allCompanyReport;
}
exports.getFinancialReport = getFinancialReport;
/**
* brandReport: {
    brandId: brandResult.b_BrandID,
    brandName: brandResult.b_BrandName,
    data: []
}
*/
/*
function reportForSKU(onePeriodResult, brandId) {
    let SKUReports = [];

    onePeriodResult.p_SKUs.forEach(function (SKUResult) {
        if (SKUResult.u_ParentBrandID === brandId) {
            SKUReports.push({
                SKUName: SKUResult.u_SKUName + ' ' + config.packsizeDescription[SKUResult.u_PackSize],
                salesValue: SKUResult.u_FactorySalesValue,
                changeVersusPreviousPeriodSalesValue: SKUResult.u_FactorySalesValueChange * 100,
                shareInBrandTotalSalesValue: SKUResult.u_ShareInBrandSalesValue * 100,
                costOfGoodsSold: -SKUResult.u_CostOfGoodsSold,
                obsoleteGoodsCost: -SKUResult.u_ObsoleteGoodsCost,
                discontinuedGoodsCost: -SKUResult.u_DroppedGoodsCost,
                inventoryHoldingCost: -SKUResult.u_InventoryHoldingCost,
                totalMaterialCosts: -SKUResult.u_MaterialCosts,

                grossProfit: SKUResult.u_GrossProfit,
                changeVersusPreviousPeriodGrossProfit: SKUResult.u_GrossProfitChange * 100,
                grossProfitMargin: SKUResult.u_GrossProfitMargin * 100,
                shareInBrandGrossProfitLosses: SKUResult.u_ShareInBrandGrossProfit * 100,
                advertising: -SKUResult.u_Advertising,
                consumerPromotionsCost: -SKUResult.u_ConsumerPromotions,
                tradeInvestment: -SKUResult.u_TradeExpenses,
                salesForceCost: -SKUResult.u_SalesForceCost,
                additionalTradeMarginCost: -SKUResult.u_AdditionalMarginValue,
                volumeDiscountCost: -SKUResult.u_VolumeDiscountCost,
                totalTradeAndMarketingExpenses: -SKUResult.u_TotalTradeAndMarketing,
                tradeAndMarketingExpensesAsAPercentageOfSales: SKUResult.u_TradeAndMrktngSalesRatio * 100,
                shareOfTradeAndMarketingExpensesInBrandTotal: SKUResult.u_ShareInBrandTradeAndMrktng * 100,
                generalExpenses: -SKUResult.u_GeneralExpenses,
                amortisation: -SKUResult.u_Amortisation,

                operatingProfit: SKUResult.u_OperatingProfit,
                changeVersusPreviousPeriodOperatingProfit: SKUResult.u_OperatingProfitChange * 100,
                operatingProfitMargin: SKUResult.u_OperatingProfitMargin * 100,
                shareInBrandOperatingProfitLosses: SKUResult.u_ShareInBrandOperatingProfit * 100,
                interests: SKUResult.u_Interests,
                taxes: -SKUResult.u_Taxes,
                exceptionalCostsProfits: SKUResult.u_CurrentExceptionalCostProfit,

                netProfit: SKUResult.u_NetProfit,
                changeVersusPreviousPeriodNetProfit: SKUResult.u_NetProfitChange * 100,
                netProfitMargin: SKUResult.u_NetProfitMargin * 100,
                shareInBrandNetProfitLosses: SKUResult.u_ShareInBrandNetProfit * 100,
                productionCost: SKUResult.u_ProductionCost,
                inventoryValue: SKUResult.u_ps_FactoryStocks[consts.StocksMaxTotal].s_ps_Volume * SKUResult.u_ps_FactoryStocks[consts.StocksMaxTotal].s_ps_UnitCost
            })
        }
    });

    return SKUReports;
}


function reportForBrandTotal(brandResult) {
    // SKUTotal is actually got from field of brand.
    return {
        SKUName: 'Brand Total',
        salesValue: brandResult.b_FactorySalesValue,
        changeVersusPreviousPeriodSalesValue: brandResult.b_FactorySalesValueChange * 100,
        shareInBrandTotalSalesValue: 0,
        costOfGoodsSold: -brandResult.b_CostOfGoodsSold,
        obsoleteGoodsCost: -brandResult.b_ObsoleteGoodsCost,
        discontinuedGoodsCost: -brandResult.b_DroppedGoodsCost,
        inventoryHoldingCost: -brandResult.b_InventoryHoldingCost,
        totalMaterialCosts: -brandResult.b_MaterialCosts,

        grossProfit: brandResult.b_GrossProfit,
        changeVersusPreviousPeriodGrossProfit: brandResult.b_GrossProfitChange * 100,
        grossProfitMargin: brandResult.b_GrossProfitMargin * 100,
        shareInBrandGrossProfitLosses: 0,
        advertising: -brandResult.b_Advertising,
        consumerPromotionsCost: -brandResult.b_ConsumerPromotions,
        tradeInvestment: -brandResult.b_TradeExpenses,
        salesForceCost: -brandResult.b_SalesForceCost,
        additionalTradeMarginCost: -brandResult.b_AdditionalMarginValue,
        volumeDiscountCost: -brandResult.b_VolumeDiscountCost,
        totalTradeAndMarketingExpenses: -brandResult.b_TotalTradeAndMarketing,
        tradeAndMarketingExpensesAsAPercentageOfSales: brandResult.b_TradeAndMrktngSalesRatio * 100,
        shareOfTradeAndMarketingExpensesInBrandTotal: 0,
        generalExpenses: -brandResult.b_GeneralExpenses,
        amortisation: -brandResult.b_Amortisation,

        operatingProfit: brandResult.b_OperatingProfit,
        changeVersusPreviousPeriodOperatingProfit: brandResult.b_OperatingProfitChange * 100,
        operatingProfitMargin: brandResult.b_OperatingProfitMargin * 100,
        shareInBrandOperatingProfitLosses: 0,
        interests: brandResult.b_Interests,
        taxes: -brandResult.b_Taxes,
        exceptionalCostsProfits: brandResult.b_CurrentExceptionalCostProfit,

        netProfit: brandResult.b_NetProfit,
        changeVersusPreviousPeriodNetProfit: brandResult.b_NetProfitChange * 100,
        netProfitMargin: brandResult.b_NetProfitMargin * 100,
        shareInBrandNetProfitLosses: 0,
        productionCost: brandResult.b_ProductionCost,
        inventoryValue: brandResult.b_FactoryStocks[consts.StocksMaxTotal].s_Volume * brandResult.b_FactoryStocks[consts.StocksMaxTotal].s_UnitCost
    };
}

function reportForBrand(onePeriodResult, companyId) {
    let brandReports = [];

    onePeriodResult.p_Brands.forEach(function (brandResult) {
        if (brandResult.b_ParentCompanyID !== companyId) {
            return;
        }

        let tempReportByBrand = {
            brandName: brandResult.b_BrandName,
            salesValue: brandResult.b_FactorySalesValue,
            changeVersusPreviousPeriodSalesValue: brandResult.b_FactorySalesValueChange * 100,
            shareInCompanyTotalSalesValue: brandResult.b_ShareInCompanySalesValue * 100,
            costOfGoodsSold: -brandResult.b_CostOfGoodsSold,
            obsoleteGoodsCost: -brandResult.b_ObsoleteGoodsCost,
            discontinuedGoodsCost: -brandResult.b_DroppedGoodsCost,
            inventoryHoldingCost: -brandResult.b_InventoryHoldingCost,
            totalMaterialCosts: -brandResult.b_MaterialCosts,

            grossProfit: brandResult.b_GrossProfit,
            changeVersusPreviousPeriodGrossProfit: brandResult.b_GrossProfitChange * 100,
            grossProfitMargin: brandResult.b_GrossProfitMargin * 100,
            shareInCompanyGrossProfitLosses: brandResult.b_ShareInCompanyGrossProfit * 100,
            advertising: -brandResult.b_Advertising,
            consumerPromotionsCost: -brandResult.b_ConsumerPromotions,
            tradeInvestment: -brandResult.b_TradeExpenses,
            salesForceCost: -brandResult.b_SalesForceCost,
            additionalTradeMarginCost: -brandResult.b_AdditionalMarginValue,
            volumeDiscountCost: -brandResult.b_VolumeDiscountCost,
            totalTradeAndMarketingExpenses: -brandResult.b_TotalTradeAndMarketing,
            tradeAndMarketingExpensesAsAPercentageOfSales: brandResult.b_TradeAndMrktngSalesRatio * 100,
            shareOfTradeAndMarketingExpensesInBrandTotal: brandResult.b_ShareInCompanyTradeAndMrktng * 100,
            generalExpenses: -brandResult.b_GeneralExpenses,
            amortisation: -brandResult.b_Amortisation,

            operatingProfit: brandResult.b_OperatingProfit,
            changeVersusPreviousPeriodOperatingProfit: brandResult.b_OperatingProfitChange * 100,
            operatingProfitMargin: brandResult.b_OperatingProfitMargin * 100,
            shareInBrandOperatingProfitLosses: brandResult.b_ShareInCompanyOperatingProfit * 100,
            interests: brandResult.b_Interests,
            taxes: -brandResult.b_Taxes,
            exceptionalCostsProfits: brandResult.b_CurrentExceptionalCostProfit,

            netProfit: brandResult.b_NetProfit,
            changeVersusPreviousPeriodNetProfit: brandResult.b_NetProfitChange * 100,
            netProfitMargin: brandResult.b_NetProfitMargin * 100,
            shareInBrandNetProfitLosses: brandResult.b_ShareInCompanyNetProfit * 100,
            productionCost: brandResult.b_ProductionCost,
            inventoryValue: brandResult.b_FactoryStocks[consts.StocksMaxTotal].s_Volume * brandResult.b_FactoryStocks[consts.StocksMaxTotal].s_UnitCost
        };

        brandReports.push(tempReportByBrand);
    })
    return brandReports;
}
*/
function reportForCompanyTotal(onePeriodResult, companyId) {
    let report = {};
    onePeriodResult.p_Companies.forEach(function (companyResult) {
        if (companyId === companyResult.c_CompanyID) {
            report = {
                brandName: 'Company Total',
                salesValue: companyResult.c_FactorySalesValue,
                changeVersusPreviousPeriodSalesValue: companyResult.c_FactorySalesValueChange * 100,
                shareInCompanyTotalSalesValue: 0,
                costOfGoodsSold: -companyResult.c_CostOfGoodsSold,
                obsoleteGoodsCost: -companyResult.c_ObsoleteGoodsCost,
                discontinuedGoodsCost: -companyResult.c_DroppedGoodsCost,
                inventoryHoldingCost: -companyResult.c_InventoryHoldingCost,
                totalMaterialCosts: -companyResult.c_MaterialCosts,
                grossProfit: companyResult.c_GrossProfit,
                changeVersusPreviousPeriodGrossProfit: companyResult.c_GrossProfitChange * 100,
                grossProfitMargin: companyResult.c_GrossProfitMargin * 100,
                shareInCompanyGrossProfitLosses: 0,
                advertising: -companyResult.c_Advertising,
                consumerPromotionsCost: -companyResult.c_ConsumerPromotions,
                tradeInvestment: -companyResult.c_TradeExpenses,
                salesForceCost: -companyResult.c_SalesForceCost,
                additionalTradeMarginCost: -companyResult.c_AdditionalMarginValue,
                volumeDiscountCost: -companyResult.c_VolumeDiscountCost,
                totalTradeAndMarketingExpenses: -companyResult.c_TotalTradeAndMarketing,
                tradeAndMarketingExpensesAsAPercentageOfSales: companyResult.c_TradeAndMrktngSalesRatio * 100,
                shareOfTradeAndMarketingExpensesInBrandTotal: 0,
                generalExpenses: -companyResult.c_GeneralExpenses,
                amortisation: -companyResult.c_Amortisation,
                operatingProfit: companyResult.c_OperatingProfit,
                changeVersusPreviousPeriodOperatingProfit: companyResult.c_OperatingProfitChange * 100,
                operatingProfitMargin: companyResult.c_OperatingProfitMargin * 100,
                shareInBrandOperatingProfitLosses: 0,
                interests: companyResult.c_Interests,
                taxes: -companyResult.c_Taxes,
                exceptionalCostsProfits: companyResult.c_CurrentExceptionalCostProfit,
                netProfit: companyResult.c_NetProfit,
                changeVersusPreviousPeriodNetProfit: companyResult.c_NetProfitChange * 100,
                netProfitMargin: companyResult.c_NetProfitMargin * 100,
                shareInBrandNetProfitLosses: 0,
                productionCost: companyResult.c_ProductionCost,
                inventoryValue: companyResult.c_FactoryStocks[consts.StocksMaxTotal].s_Volume * companyResult.c_FactoryStocks[consts.StocksMaxTotal].s_UnitCost
            };
        }
    });
    return report;
}
//# sourceMappingURL=financialReport.js.map