/**
 * Created by jinwyp on 7/8/14 and.
 */



/**
 * recommended
 *
 * no globals are left behind
 */

(function () {
    'use strict';


    angular.module('marksimos.translation', ['ngCookies']);


    angular.module('marksimos.translation').config(['$translateProvider',  function($translateProvider){

    // Adding a translation table for the English language
        $translateProvider.translations('en_US', {

            "YES"     : "Yes",
            "NO"     : "No",

            //Labels for Login
            "LoginPageLabelWelcome"           : "Welcome !",
            "LoginPageLabelSignIn"            : "Sign In",
            "LoginPageLabelEmail"             : "Username / Email :",
            "LoginPageLabelPassword"          : "Password :",
            "LoginPageLabelPasswordErrorInfo" : "Password Incorrect !",
            "LoginPageButtonSignIn"           : "Sign In",


            //Labels for Introduction
            "IntroPageSeminarListTitle" : "List of the Game Enrolled :",
            "IntroPageSeminarListLabelSeminarID" : "Seminar ID",
            "IntroPageSeminarListLabelSeminarDescription" : "Seminar Description",
            "IntroPageSeminarListLabelTotalRound" : "Total Round",
            "IntroPageSeminarListLabelCompetitor" : "Competitor",
            "IntroPageSeminarListLabelDateOfCommencement" : "Date of Commencement",
            "IntroPageSeminarListLabelSeminarStatus" : "Seminar Status",
            "IntroPageSeminarListLabelCountry" : "Country",
            "IntroPageSeminarListLabelProvince" : "Province(State)",
            "IntroPageSeminarListLabelCity" : "City",
            "IntroPageSeminarListLabelVenue" : "Venue",


            "IntroPageSentence1" : "Who am I?",
            "IntroPageSentence2" : "I am leading company",
            "IntroPageSentence3" : "I manage",
            "IntroPageSentence4" : "products",
            "IntroPageSentence5" : "under",
            "IntroPageSentence6" : "brands",
            "IntroPageSentence7" : "I compete with",
            "IntroPageSentence8" : "other companies",

            "IntroPageSentence21" : "My company’s mission is to get the",
            "IntroPageSentence22" : "highest Market Share",
            "IntroPageSentence23" : "and",
            "IntroPageSentence24" : "Profit",

            "IntroPageStart" : "Start",



            //Labels for Items on Home page - Top Menu Bar
            "HomePageMenuBarLabelsHome"     : "Home",
            "HomePageMenuBarLabelsReport"     : "Reports",
            "HomePageMenuBarLabelsDecision"   : "Decision",
            "HomePageMenuBarLabelsScore"      : "Score",
            "HomePageMenuBarLabelsLanguage"   : "Language",
            "HomePageMenuBarLabelsHelp"       : "Help",
            "HomePageMenuBarLabelsHelpFAQ"    : "FAQ",
            "HomePageMenuBarLabelsHelpVideo"  : "Video",
            "HomePageMenuBarLabelsHelpManual" : "Manual",
            "HomePageMenuBarLabelsAbout"      : "About MarkSimos",
            "HomePageMenuBarLabelsLogout"     : "Log Out",


            //Labels for Segment
            "HomePageSegmentLabelPriceSensitive" : "1 Price Sensitive",
            "HomePageSegmentLabelPretenders"     : "2 Pretenders",
            "HomePageSegmentLabelModerate"       : "3 Moderate",
            "HomePageSegmentLabelGoodLife"       : "4 Good Life",
            "HomePageSegmentLabelUltimate"       : "5 Ultimate",
            "HomePageSegmentLabelPragmatic"      : "6 Pragmatic",
            "HomePageSegmentLabelAllSegments"    : "All Segments",




            //Labels for Items on Home page - Second Menu Bar
            "HomePageSecondMenuBarLabelsCompany"           : "Company",
            "HomePageSecondMenuBarLabelsCompanies"         : "Companies",
            "HomePageSecondMenuBarLabelsMemberTotal"         : "Now",
            "HomePageSecondMenuBarLabelsMember"         : "members in the company to make decision",

            "HomePageSecondMenuBarLabelsTimeLeft"          : "left",
            "HomePageSecondMenuBarLabelsTimeLeftForSubmit" : "for submitting decision",
            "HomePageSecondMenuBarLabelsMission"           : "Mission: Market Share + Profit",
            "HomePageSecondMenuBarLabelsMakeDecision"      : "Make Decision",
            "HomePageSecondMenuBarCurrentPeriod"           : "Period",

            "HomePageSecondMenuBarCompareData"     : "Compare Data",
            "HomePageSecondMenuBarCompareDataBack" : "Back to Report",

            //Labels for Items on Home page - Three Boxes
            "HomePageYourCompanyTableLabel"                 : "Your Company",
            "HomePageYourCompanyCompanyStatus"              : "Company Status",
            "HomePageYourCompanyFinancialReport"            : "Financial Report",
            "HomePageYourCompanyInventoryReport"            : "Inventory Report",
            "HomePageYourCompanyProfitabilityEvolution"     : "Profitability Evolution",
            "HomePageYourCompetitorTableLabel"              : "Your Competitor",
            "HomePageYourCompetitorMarketShare"             : "Market Share",
            "HomePageYourCompetitorCompetitorIntelligence"  : "Competitor Intelligence",
            "HomePageYourCompetitorInvestmentsandProfits"   : "Investments and Profits",
            "HomePageYourCompetitorMarketSalesandInventory" : "Market Sales and Inventory",
            "HomePageMarketLandscapeTableLabel"             : "Market Landscape",
            "HomePageMarketLandscapeSegmentLeaderTop5"      : "Segment Leader Top 5",
            "HomePageMarketLandscapePerceptionMap"          : "Perception Map",
            "HomePageMarketLandscapeSegmentDistributions"   : "Segment Distributions",
            "HomePageMarketLandscapeMarketEvolution"        : "Market Evolution",
            "HomePageMarketLandscapeMarketTrends"           : "Market Trends",
            "HomePageMarketLandscapeMarketIndicators"       : "Market Indicators",


            //Labels for Items on Reports page - reports menu
            "ReportYourCompany"                : "Your Company",
            "ReportMenuCompanyStatus"          : "Company Status",
            "ReportMenuFinancialReport"        : "Financial Report",
            "ReportMenuInventoryReport"        : "Inventory Report",
            "ReportMenuProfitabilityEvolution" : "Profitability Evolution",

            "ReportYourCompetitors"            : "Your Competitors",
            "ReportMenuMarketShare"            : "Market Share",
            "ReportMenuCompetitorIntelligence" : "Competitor Intelligence",
            "ReportMenuInvestmentProfits"      : "Investment & Profits",
            "ReportMenuMarketSalesInventory"   : "Market Sales & Inventory",

            "ReportMarketLandscape"            : "Market Landscape",
            "ReportMenuSegmentLeaderTop5"      : "Segment Leader Top5",
            "ReportMenuPerceptionMap"          : "Perception Map",
            "ReportMenuSegmentDistributions"   : "Segment Distributions",
            "ReportMenuMarketEvolution"        : "Market Evolution",
            "ReportMenuMarketTrends"           : "Market Trends",
            "ReportMenuMarketIndicator"        : "Market Indicator",



            //Labels for Company Status Report Tab Menu
            "ReportTabLabelSKU"    : "SKU",
            "ReportTabLabelBrand"  : "Brand",
            "ReportTabLabelGlobal" : "Global",

            "ReportTabLabelTableChartDisplayLine"  : "Line Chart",
            "ReportTabLabelTableChartDisplayBar"   : "Bar Chart",
            "ReportTabLabelTableChartDisplayPoint" : "Point Chart",
            "ReportTabLabelTableChartDisplayArea"  : "Area Chart",
            "ReportTabLabelTableChartDisplayPie"   : "Pie Chart",

            //Labels for Company Status Report - SKU Level
            "ReportCompanyStatusSKUQuarter" : "Quarter",

            "ReportCompanyStatusSKUMarketShareValue"                             : "Market Share (value %)",
            "ReportCompanyStatusSKUMarketShareVolume"                            : "Market Share (volume %)",
            "ReportCompanyStatusSKUMarketSalesVolumeStd"                         : "Market Sales Volume (mln std. packs)",
            "ReportCompanyStatusSKULostSalesVolumeDueToOOSStd"                   : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportCompanyStatusSKUNumericalDistribution"                        : "Numerical Distribution (%)",
            "ReportCompanyStatusSKUVolumeWeightedDistribution"                   : "Volume-weighted Distribution (%)",
            "ReportCompanyStatusSKUShelfSpace"                                   : "Shelf Space (%)",
            "ReportCompanyStatusSKUAwareness"                                    : "Awareness (%)",
            "ReportCompanyStatusSKUAverageNetMarketPrice"                        : "Average Net Market Price ($/std. pack)",
            "ReportCompanyStatusSKUAverageDisplayPrice"                          : "Average Display Price ($/std. pack)",
            "ReportCompanyStatusSKUPriceRankingIndex"                            : "Price Ranking Index",
            "ReportCompanyStatusSKUTargetConsumerSegment"                        : "Target Consumer Segment",
            "ReportCompanyStatusSKUTargetConsumerSegmentExpectedValuePerception" : "Target Consumer Segment Expected Value Perception",
            "ReportCompanyStatusSKUValuePerception"                              : "Value Perception",
            "ReportCompanyStatusSKUTargetConsumerSegmentExpectedImagePerception" : "Target Consumer Segment Expected Image Perception",
            "ReportCompanyStatusSKUImagePerception"                              : "Image Perception",

            "ReportCompanyStatusSKUIngredientsQualityIndex"	:	"Ingredients Quality Index",
            "ReportCompanyStatusSKUAppliedTechnologyIndex"	:	"Applied Technology Index",

            "ReportCompanyStatusSKUMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportCompanyStatusSKUConsumerPricePromotions" : "Consumer Price Promotions ($ mln)",
            "ReportCompanyStatusSKUMarketNetSalesValue"     : "Market Net Sales Value ($ mln)",

            "ReportCompanyStatusSKULostSalesVolumeDueToOOS"    : "Lost Sales Volume due to OOS (mln packs)",
            "ReportCompanyStatusSKUNumberOfOutOfStockEpisodes" : "Number of Out-of-stock Episodes",

            "ReportCompanyStatusSKUMarketSalesVolume"             : "Market Sales Volume (mln packs)",
            "ReportCompanyStatusSKURetailersPurchasesVolume"      : "Retailers Purchases Volume (mln packs)",
            "ReportCompanyStatusSKUShipmentsToWholesalers"        : "Shipments to Wholesalers (mln packs)",
            "ReportCompanyStatusSKUProductionVolume"              : "Production Volume (mln packs)",
            "ReportCompanyStatusSKUInventoryVolumeAtManufacturer" : "Inventory Volume At Manufacturer (mln packs)",
            "ReportCompanyStatusSKUInventoryVolumeAtWholesalers"  : "Inventory Volume At Wholesalers (mln packs)",
            "ReportCompanyStatusSKUInventoryVolumeAtRetailers"    : "Inventory Volume At Retailers (mln packs)",

            "ReportCompanyStatusSKUStocksCoverAtRetailers"   : "Stocks Cover At Retailers (weeks)",
            "ReportCompanyStatusSKUStocksCoverAtWholesalers" : "Stocks Cover At Wholesalers (weeks)",

            //Labels for Company Status Report - Brand Level
            "ReportCompanyStatusBrandMarketShareValue"           : "Market Share (value %)",
            "ReportCompanyStatusBrandMarketShareVolume"          : "Market Share (volume %)",
            "ReportCompanyStatusBrandMarketSalesVolumeStd"       : "Market Sales Volume (mln std. packs)",
            "ReportCompanyStatusBrandLostSalesVolumeDueToOOSStd" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportCompanyStatusBrandNumericalDistribution"      : "Numerical Distribution (%)",
            "ReportCompanyStatusBrandVolumeWeightedDistribution" : "Volume-weighted Distribution (%)",
            "ReportCompanyStatusBrandShelfSpace"                 : "Shelf Space (%)",
            "ReportCompanyStatusBrandAwareness"                  : "Awareness (%)",
            "ReportCompanyStatusBrandAverageNetMarketPrice"      : "Average Net Market Price ($/std. pack)",
            "ReportCompanyStatusBrandAverageDisplayPrice"        : "Average Display Price ($/std. pack)",
            "ReportCompanyStatusBrandPriceRankingIndex"          : "Price Ranking Index",
            "ReportCompanyStatusBrandValuePerception"            : "Value Perception",
            "ReportCompanyStatusBrandImagePerception"            : "Image Perception",
            "ReportCompanyStatusBrandIngredientsQualityIndex"    : "Ingredients Quality Index",
            "ReportCompanyStatusBrandAppliedTechnologyIndex"     : "Applied Technology Index",

            "ReportCompanyStatusBrandMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportCompanyStatusBrandConsumerPricePromotions" : "Consumer Price Promotions ($ mln)",
            "ReportCompanyStatusBrandMarketNetSalesValue"     : "Market Net Sales Value ($ mln)",

            "ReportCompanyStatusBrandLostSalesVolumeDueToOOS"    : "Lost Sales Volume due to OOS (mln packs)",
            "ReportCompanyStatusBrandNumberOfOutOfStockEpisodes" : "Number of Out-of-stock Episodes",

            "ReportCompanyStatusBrandMarketSalesVolume"             : "Market Sales Volume (mln packs)",
            "ReportCompanyStatusBrandRetailersPurchasesVolume"      : "Retailers Purchases Volume (mln packs)",
            "ReportCompanyStatusBrandShipmentsToWholesalers"        : "Shipments to Wholesalers (mln packs)",
            "ReportCompanyStatusBrandProductionVolume"              : "Production Volume (mln packs)",
            "ReportCompanyStatusBrandInventoryVolumeAtManufacturer" : "Inventory Volume At Manufacturer (mln packs)",
            "ReportCompanyStatusBrandInventoryVolumeAtWholesalers"  : "Inventory Volume At Wholesalers (mln packs)",
            "ReportCompanyStatusBrandInventoryVolumeAtRetailers"    : "Inventory Volume At Retailers (mln packs)",

            "ReportCompanyStatusBrandStocksCoverAtRetailers"   : "Stocks Cover At Retailers (weeks)",
            "ReportCompanyStatusBrandStocksCoverAtWholesalers" : "Stocks Cover At Wholesalers (weeks)",

            //Labels for Company Status Report - Global Level
            "ReportCompanyStatusGlobalMarketShareValue"           : "Market Share (value %)",
            "ReportCompanyStatusGlobalMarketShareVolume"          : "Market Share (volume %)",
            "ReportCompanyStatusGlobalMarketSalesVolumeStd"       : "Market Sales Volume (mln std. packs)",
            "ReportCompanyStatusGlobalLostSalesVolumeDueToOOSStd" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportCompanyStatusGlobalNumericalDistribution"      : "Numerical Distribution (%)",
            "ReportCompanyStatusGlobalVolumeWeightedDistribution" : "Volume-weighted Distribution (%)",
            "ReportCompanyStatusGlobalShelfSpace"                 : "Shelf Space (%)",
            "ReportCompanyStatusGlobalMindSpaceShare"             : "Mind Space Share (%)",
            "ReportCompanyStatusGlobalAverageNetMarketPrice"      : "Average Net Market Price ($/std. pack)",
            "ReportCompanyStatusGlobalAverageDisplayPrice"        : "Average Display Price ($/std. pack)",
            "ReportCompanyStatusGlobalIngredientsQualityIndex"    : "Ingredients Quality Index",
            "ReportCompanyStatusGlobalAppliedTechnologyIndex"     : "Applied Technology Index",

            "ReportCompanyStatusGlobalMarketSalesValue"	:	"Market Sales Value ($ mln)",
            "ReportCompanyStatusGlobalConsumerPricePromotions"	:	"Consumer Price Promotions ($ mln)",
            "ReportCompanyStatusGlobalMarketNetSalesValue"	:	"Market Net Sales Value ($ mln)",

            "ReportCompanyStatusGlobalLostSalesVolumeDueToOOS"	:	"Lost Sales Volume due to OOS (mln packs)",

            "ReportCompanyStatusGlobalMarketSalesVolume"	:	"Market Sales Volume (mln packs)",
            "ReportCompanyStatusGlobalRetailersPurchasesVolume"	:	"Retailers Purchases Volume (mln packs)",
            "ReportCompanyStatusGlobalShipmentsToWholesalers"	:	"Shipments to Wholesalers (mln packs)",
            "ReportCompanyStatusGlobalProductionVolume"	:	"Production Volume (mln packs)",
            "ReportCompanyStatusGlobalInventoryVolumeAtManufacturer"	:	"Inventory Volume At Manufacturer (mln packs)",
            "ReportCompanyStatusGlobalInventoryVolumeAtWholesalers"	:	"Inventory Volume At Wholesalers (mln packs)",
            "ReportCompanyStatusGlobalInventoryVolumeAtRetailers"	:	"Inventory Volume At Retailers (mln packs)",

            "ReportCompanyStatusGlobalStocksCoverAtRetailers"	:	"Stocks Cover At Retailers (weeks)",
            "ReportCompanyStatusGlobalStocksCoverAtWholesalers"	:	"Stocks Cover At Wholesalers (weeks)",

            //Labels for Financial Report - Brand Level
            "ReportFinancialReportBrandSalesValue"                           : "Sales Value ($ mln)",
            "ReportFinancialReportBrandChangeVersusPreviousPeriodSalesValue" : "(%) Change Versus Previous period",
            "ReportFinancialReportBrandShareInBrandTotalSalesValue"          : "Share In Brand Total Sales Value (%)",
            "ReportFinancialReportBrandCostOfGoodsSold"                      : "Cost of Goods Sold ($ mln)",
            "ReportFinancialReportBrandObsoleteGoodsCost"                    : "Obsolete Goods Cost ($ mln)",
            "ReportFinancialReportBrandDiscontinuedGoodsCost"                : "Discontinued Goods Cost ($ mln)",
            "ReportFinancialReportBrandInventoryHoldingCost"                 : "Inventory Holding Cost ($ mln)",
            "ReportFinancialReportBrandTotalMaterialCost"                    : "Total Material Cost ($ mln)",

            "ReportFinancialReportBrandGrossProfit"                           : "Gross Profit ($ mln)",
            "ReportFinancialReportBrandChangeVersusPreviousPeriodGrossProfit" : "(%) Change Versus Previous Period",
            "ReportFinancialReportBrandGrossProfitMargin"                     : "Gross Profit Margin (%)",
            "ReportFinancialReportBrandShareInBrandGrossProfitLosses"         : "Share In Brand Gross Profit/Losses (%)",

            "ReportFinancialReportBrandAdvertising"                                  : "Advertising ($ mln)",
            "ReportFinancialReportBrandConsumerPromotionCost"                        : "Consumer Promotion Cost ($ mln)",
            "ReportFinancialReportBrandTradeInvestment"                              : "Trade Investment ($ mln)",
            "ReportFinancialReportBrandSalesForceCost"                               : "Sales Force Cost ($ mln)",
            "ReportFinancialReportBrandAdditionalTradeMarginCost"                    : "Additional Trade Margin Cost ($ mln)",
            "ReportFinancialReportBrandVolumeDiscountCost"                           : "Volume Discount Cost ($ mln)",
            "ReportFinancialReportBrandTotalTradeAndMarketingExpenses"               : "Total Trade and Marketing Expenses ($ mln)",
            "ReportFinancialReportBrandTradeAndMarketingExpensesasaOfSales"          : "Trade and Marketing Expenses as a (%) of Sales",
            "ReportFinancialReportBrandShareOfTradeAndMarketingExpensesInBrandTotal" : "Share of Trade and Marketing Expenses in Brand Total (%)",

            "ReportFinancialReportBrandGeneralExpenses" : "General Expenses ($ mln)",
            "ReportFinancialReportBrandAmortisation"    : "Amortisation ($ mln)",

            "ReportFinancialReportBrandOperatingProfit"                           : "Operating Profit ($ mln)",
            "ReportFinancialReportBrandChangeVersusPreviousPeriodOperatingProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportBrandOperatingProfitMargin"                     : "Operating Profit Margin (%)",
            "ReportFinancialReportBrandShareInBrandOperatingProfitLoss"           : "Share in Brand Operating Profit/Loss (%)",

            "ReportFinancialReportBrandInterests"             : "Interests ($ mln)",
            "ReportFinancialReportBrandTaxes"                 : "Taxes ($ mln)",
            "ReportFinancialReportBrandExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",

            "ReportFinancialReportBrandNetProfit"                           : "Net Profit ($ mln)",
            "ReportFinancialReportBrandChangeVersusPreviousPeriodNetProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportBrandNetProfitMargin"                     : "Net Profit Margin (%)",
            "ReportFinancialReportBrandShareInBrandNetProfitLoss"           : "Share in Brand Net Profit/Loss (%)",

            "ReportFinancialReportBrandProductionCost" : "Production Cost ($ mln)",
            "ReportFinancialReportBrandInventoryValue" : "Inventory Value ($ mln)",

            //Labels for Financial Report - All Brands
            "ReportFinancialReportAllBrandSalesValue"                           : "Sales Value ($ mln)",
            "ReportFinancialReportAllBrandChangeVersusPreviousPeriodSalesValue" : "(%) Change Versus Previous period",
            "ReportFinancialReportAllBrandShareInCompanyTotalSalesValue"        : "Share In Company Total Sales Value (%)",
            "ReportFinancialReportAllBrandCostOfGoodsSold"                      : "Cost of Goods Sold ($ mln)",
            "ReportFinancialReportAllBrandObsoleteGoodsCost"                    : "Obsolete Goods Cost ($ mln)",
            "ReportFinancialReportAllBrandDiscontinuedGoodsCost"                : "Discontinued Goods Cost ($ mln)",
            "ReportFinancialReportAllBrandInventoryHoldingCost"                 : "Inventory Holding Cost ($ mln)",
            "ReportFinancialReportAllBrandTotalMaterialCost"                    : "Total Material Cost ($ mln)",

            "ReportFinancialReportAllBrandGrossProfit"                           : "Gross Profit ($ mln)",
            "ReportFinancialReportAllBrandChangeVersusPreviousperiodGrossProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportAllBrandGrossProfitMargin"                     : "Gross Profit Margin (%)",
            "ReportFinancialReportAllBrandShareInCompanyGrossProfitLosses"       : "Share In Company Gross Profit/Losses (%)",

            "ReportFinancialReportAllBrandAdvertising"                                  : "Advertising ($ mln)",
            "ReportFinancialReportAllBrandConsumerPromotionCost"                        : "Consumer Promotion Cost ($ mln)",
            "ReportFinancialReportAllBrandTradeInvestment"                              : "Trade Investment ($ mln)",
            "ReportFinancialReportAllBrandSalesForceCost"                               : "Sales Force Cost ($ mln)",
            "ReportFinancialReportAllBrandAdditionalTradeMarginCost"                    : "Additional Trade Margin Cost ($ mln)",
            "ReportFinancialReportAllBrandVolumeDiscountCost"                           : "Volume Discount Cost ($ mln)",
            "ReportFinancialReportAllBrandTotalTradeAndMarketingExpenses"               : "Total Trade and Marketing Expenses ($ mln)",
            "ReportFinancialReportAllBrandTradeAndMarketingExpensesasaOfSales"          : "Trade and Marketing Expenses as a (%) of Sales",
            "ReportFinancialReportAllBrandShareOfTradeAndMarketingExpensesInBrandTotal" : "Share of Trade and Marketing Expenses in Company Total (%)",

            "ReportFinancialReportAllBrandGeneralExpenses" : "General Expenses ($ mln)",
            "ReportFinancialReportAllBrandAmortisation"    : "Amortisation ($ mln)",

            "ReportFinancialReportAllBrandOperatingProfit"                           : "Operating Profit ($ mln)",
            "ReportFinancialReportAllBrandChangeVersusPreviousPeriodOperatingProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportAllBrandOperatingProfitMargin"                     : "Operating Profit Margin (%)",
            "ReportFinancialReportAllBrandShareInBrandOperatingProfitLoss"           : "Share in Company Operating Profit/Loss (%)",

            "ReportFinancialReportAllBrandInterests"             : "Interests ($ mln)",
            "ReportFinancialReportAllBrandTaxes"                 : "Taxes ($ mln)",
            "ReportFinancialReportAllBrandExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",

            "ReportFinancialReportAllBrandNetProfit"                           : "Net Profit ($ mln)",
            "ReportFinancialReportAllBrandChangeVersusPreviousPeriodNetProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportAllBrandNetProfitMargin"                     : "Net Profit Margin (%)",
            "ReportFinancialReportAllBrandShareInCompanyNetProfitLoss"     : "Share in Company Net Profit/Loss (%)",

            "ReportFinancialReportAllBrandProductionCost" : "Production Cost ($ mln)",
            "ReportFinancialReportAllBrandInventoryValue" : "Inventory Value ($ mln)",

            //Labels for Inventory Report
            "ReportInventoryReportLabelCloseToExpireInventory" : "Close to Expire Inventory",
    //        "ReportInventoryReportLabelPreviousInventory"      : "Previous Inventory",
            "ReportInventoryReportLabelPreviousInventory"      : "Close to Expire Inventory",
            "ReportInventoryReportLabelFreshInventory"         : "Fresh Inventory",
            "ReportInventoryReportTableLabelX"                 : "Total Stock (millions of standard pack) = Factory Stock + Trade Stock + Retailer Stock",
            "ReportInventoryReportTableLabelY"                 : "Million Units",


            //Labels for Profitability Evolution - SKU Level
            "ReportProfitabilityEvolutionSKUQuarter" : "Quarter",

            "ReportProfitabilityEvolutionSKUManufacturerSalesValue" : "Manufacturer Sales Value ($ mln)",

            "ReportProfitabilityEvolutionSKUCostOfGoodsSold"       : "Cost of Goods Sold ($ mln)",
            "ReportProfitabilityEvolutionSKUInventoryHolding"      : "Inventory Holding ($ mln)",
            "ReportProfitabilityEvolutionSKUObsoleteGoods"         : "Obsolete Goods ($ mln)",
            "ReportProfitabilityEvolutionSKUDiscontinuedGoodsCost" : "Discontinued Goods Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUGrossProfit"           : "Gross Profit ($ mln)",

            "ReportProfitabilityEvolutionSKUAdvertising"                    : "Advertising ($ mln)",
            "ReportProfitabilityEvolutionSKUConsumerPromotionsCost"         : "Consumer Promotions Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUTradeInvestment"                : "Trade Investment ($ mln)",
            "ReportProfitabilityEvolutionSKUSalesForceCost"                 : "Sales Force Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUVolumeDiscountCost"             : "Volume Discount Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUAdditionalTradeMarginCost"      : "Additional Trade Margin Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUTotalTradeAndMarketingExpenses" : "Total Trade and Marketing Expenses ($ mln)",

            "ReportProfitabilityEvolutionSKUGeneralExpenses" : "General Expenses ($ mln)",
            "ReportProfitabilityEvolutionSKUAmortisation"    : "Amortisation ($ mln)",
            "ReportProfitabilityEvolutionSKUOperatingProfit" : "Operating Profit ($ mln)",

            "ReportProfitabilityEvolutionSKUInterests"             : "Interests ($ mln)",
            "ReportProfitabilityEvolutionSKUExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",
            "ReportProfitabilityEvolutionSKUTaxes"                 : "Taxes ($ mln)",
            "ReportProfitabilityEvolutionSKUNetProfit"             : "Net Profit ($ mln)",

            "ReportProfitabilityEvolutionSKUSurchargeForSupplementaryInvestmentBudget"	:	"Surcharge for supplementary InvestmentBudget ($ mln)",
            "ReportProfitabilityEvolutionSKUNetResult"	:	"Net Result ($ mln)",

            "ReportProfitabilityEvolutionSKUShareInBrandTotalSalesValue"                  : "Share In Brand Total Sales Value (%)",
            "ReportProfitabilityEvolutionSKUShareInBrandGrossProfitLosses"                : "Share In Brand Gross Profit/Losses (%)",
            "ReportProfitabilityEvolutionSKUShareOfTradeAndMarketingExpensesInBrandTotal" : "Share of Trade and Marketing Expenses In Brand Total (%)",
            "ReportProfitabilityEvolutionSKUShareInBrandOperatingProfitLosses"            : "Share In Brand Operating Profit/Losses (%)",
            "ReportProfitabilityEvolutionSKUShareInBrandNetProfitLosses"                  : "Share In Brand Net Profit/Losses (%)",

            "ReportProfitabilityEvolutionSKUGrossProfitMargin"                   : "Gross Profit Margin (%)",
            "ReportProfitabilityEvolutionSKUTradeAndMarketingExpensesasaOfSales" : "Trade and Marketing Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionSKUGeneralExpensesasaOfSales"           : "General Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionSKUOperatingProfitMargin"               : "Operating Profit Margin (%)",
            "ReportProfitabilityEvolutionSKUNetProfitMargin"                     : "Net Profit Margin (%)",

            "ReportProfitabilityEvolutionSKUReturnOnInvestment" : "Return on Investment (%)",

            "ReportProfitabilityEvolutionSKUAverageNetMarketPrice"             : "Average Net Market Price ($/pack)",
            "ReportProfitabilityEvolutionSKUAverageWholesalesPrice"            : "Average Wholesales Price ($/pack)",
            "ReportProfitabilityEvolutionSKUAverageManufacturerPrice"          : "Average Manufacturer Price ($/pack)",
            "ReportProfitabilityEvolutionSKUAverageProductionCost"             : "Average Production Cost ($/pack)",
            "ReportProfitabilityEvolutionSKUMarketSalesValue"                  : "Market Sales Value ($ mln)",
            "ReportProfitabilityEvolutionSKUConsumerPricePromotions"           : "Consumer Price Promotions ($ mln)",
            "ReportProfitabilityEvolutionSKUMarketNetSalesValue"               : "Market Net Sales Value ($ mln)",
            "ReportProfitabilityEvolutionSKUAdditionalRetailersMargin"         : "Additional Retailers Margin (%)",
            "ReportProfitabilityEvolutionSKUWholesalersBonusRate"              : "Wholesalers Bonus Rate (%)",
            "ReportProfitabilityEvolutionSKUMinimalPurchaseQualifyingForBonus" : "Minimal Purchase Qualifying for Bonus (mln std. packs)",
            "ReportProfitabilityEvolutionSKUProductionCost"                    : "Production Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUInventoryValue"                    : "Inventory Value ($ mln)",

            //Labels for Profitability Evolution - Brand Level
            "ReportProfitabilityEvolutionBrandManufacturerSalesValue" : "Manufacturer Sales Value ($ mln)",

            "ReportProfitabilityEvolutionBrandCostOfGoodsSold"       : "Cost of Goods Sold ($ mln)",
            "ReportProfitabilityEvolutionBrandInventoryHolding"      : "Inventory Holding ($ mln)",
            "ReportProfitabilityEvolutionBrandObsoleteGoods"         : "Obsolete Goods ($ mln)",
            "ReportProfitabilityEvolutionBrandDiscontinuedGoodsCost" : "Discontinued Goods Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandGrossProfit"           : "Gross Profit ($ mln)",

            "ReportProfitabilityEvolutionBrandAdvertising"                    : "Advertising ($ mln)",
            "ReportProfitabilityEvolutionBrandConsumerPromotionsCost"         : "Consumer Promotions Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandTradeInvestment"                : "Trade Investment ($ mln)",
            "ReportProfitabilityEvolutionBrandSalesForceCost"                 : "Sales Force Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandVolumeDiscountCost"             : "Volume Discount Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandAdditionalTradeMarginCost"      : "Additional Trade Margin Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandTotalTradeAndMarketingExpenses" : "Total Trade and Marketing Expenses ($ mln)",

            "ReportProfitabilityEvolutionBrandGeneralExpenses" : "General Expenses ($ mln)",
            "ReportProfitabilityEvolutionBrandAmortisation"    : "Amortisation ($ mln)",
            "ReportProfitabilityEvolutionBrandOperatingProfit" : "Operating Profit ($ mln)",

            "ReportProfitabilityEvolutionBrandInterests"             : "Interests ($ mln)",
            "ReportProfitabilityEvolutionBrandExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",
            "ReportProfitabilityEvolutionBrandTaxes"                 : "Taxes ($ mln)",
            "ReportProfitabilityEvolutionBrandNetProfit"             : "Net Profit ($ mln)",

            "ReportProfitabilityEvolutionBrandSurchargeForSupplementaryInvestmentBudget" : "Surcharge for supplementary InvestmentBudget ($ mln)",
            "ReportProfitabilityEvolutionBrandNetResult"                                 : "Net Result ($ mln)",

            "ReportProfitabilityEvolutionBrandShareInCompanyTotalSalesValue"                  : "Share In Company Total Sales Value (%)",
            "ReportProfitabilityEvolutionBrandShareInCompanyGrossProfitLosses"                : "Share In Company Gross Profit/Losses (%)",
            "ReportProfitabilityEvolutionBrandShareOfTradeAndMarketingExpensesInCompanyTotal" : "Share of Trade and Marketing Expenses In Company Total (%)",
            "ReportProfitabilityEvolutionBrandShareInCompanyOperatingProfitLosses"            : "Share In Company Operating Profit/Losses (%)",
            "ReportProfitabilityEvolutionBrandShareInCompanyNetProfitLosses"                  : "Share In Company Net Profit/Losses (%)",

            "ReportProfitabilityEvolutionBrandGrossProfitMargin"                   : "Gross Profit Margin (%)",
            "ReportProfitabilityEvolutionBrandTradeAndMarketingExpensesasaOfSales" : "Trade and Marketing Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionBrandGeneralExpensesasaOfSales"           : "General Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionBrandOperatingProfitMargin"               : "Operating Profit Margin (%)",
            "ReportProfitabilityEvolutionBrandNetProfitMargin"                     : "Net Profit Margin (%)",

            "ReportProfitabilityEvolutionBrandReturnOnInvestment" : "Return on Investment (%)",

            "ReportProfitabilityEvolutionBrandAverageNetMarketPrice"    : "Average Net Market Price ($/pack)",
            "ReportProfitabilityEvolutionBrandAverageWholesalesPrice"   : "Average Wholesales Price ($/pack)",
            "ReportProfitabilityEvolutionBrandAverageManufacturerPrice" : "Average Manufacturer Price ($/pack)",
            "ReportProfitabilityEvolutionBrandAverageProductionCost"    : "Average Production Cost ($/pack)",

            "ReportProfitabilityEvolutionBrandMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportProfitabilityEvolutionBrandConsumerPricePromotions" : "Consumer Price Promotions ($ mln)",
            "ReportProfitabilityEvolutionBrandMarketNetSalesValue"     : "Market Net Sales Value ($ mln)",

            "ReportProfitabilityEvolutionBrandProductionCost"                    : "Production Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandInventoryValue"                    : "Inventory Value ($ mln)",


            //Labels for Profitability Evolution - Global Level
            "ReportProfitabilityEvolutionGlobalManufacturerSalesValue" : "Manufacturer Sales Value ($ mln)",
            "ReportProfitabilityEvolutionGlobalCostOfGoodsSold"        : "Cost of Goods Sold ($ mln)",
            "ReportProfitabilityEvolutionGlobalInventoryHolding"       : "Inventory Holding ($ mln)",
            "ReportProfitabilityEvolutionGlobalObsoleteGoods"          : "Obsolete Goods ($ mln)",
            "ReportProfitabilityEvolutionGlobalDiscontinuedGoodsCost"  : "Discontinued Goods Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalGrossProfit"            : "Gross Profit ($ mln)",

            "ReportProfitabilityEvolutionGlobalAdvertising"                    : "Advertising ($ mln)",
            "ReportProfitabilityEvolutionGlobalConsumerPromotionsCost"         : "Consumer Promotions Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalTradeInvestment"                : "Trade Investment ($ mln)",
            "ReportProfitabilityEvolutionGlobalSalesForceCost"                 : "Sales Force Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalVolumeDiscountCost"             : "Volume Discount Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalAdditionalTradeMarginCost"      : "Additional Trade Margin Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalTotalTradeAndMarketingExpenses" : "Total Trade and Marketing Expenses ($ mln)",

            "ReportProfitabilityEvolutionGlobalOverhead"                                 : "Overhead ($ mln)",
            "ReportProfitabilityEvolutionGlobalInvestmentToImproveTechnologyLevel"       : "Investment to Improve Technology Level ($ mln)",
            "ReportProfitabilityEvolutionGlobalInvestmentToIncreaseProductionEfficiency" : "Investment to Increase Production Efficiency ($ mln)",

            "ReportProfitabilityEvolutionGlobalProductionCapacityDisposalCost" : "Production Capacity Disposal Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalOvertimeShiftsCost"             : "Overtime Shifts Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalTotalGeneralExpenses"           : "Total General Expenses ($ mln)",
            "ReportProfitabilityEvolutionGlobalAmortisation"                   : "Amortisation ($ mln)",
            "ReportProfitabilityEvolutionGlobalOperatingProfit"                : "Operating Profit ($ mln)",

            "ReportProfitabilityEvolutionGlobalInterests"             : "Interests ($ mln)",
            "ReportProfitabilityEvolutionGlobalExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",
            "ReportProfitabilityEvolutionGlobalTaxes"                 : "Taxes ($ mln)",
            "ReportProfitabilityEvolutionGlobalNetProfit"             : "Net Profit ($ mln)",

            "ReportProfitabilityEvolutionGlobalSurchargeForSupplementaryInvestmentBudget" : "Surcharge for supplementary InvestmentBudget ($ mln)",
            "ReportProfitabilityEvolutionGlobalNetResult"                                 : "Net Result ($ mln)",

            "ReportProfitabilityEvolutionGlobalGrossProfitMargin"                   : "Gross Profit Margin (%)",
            "ReportProfitabilityEvolutionGlobalTradeAndMarketingExpensesasaOfSales" : "Trade and Marketing Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionGlobalGeneralExpensesasaOfSales"           : "General Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionGlobalOperatingProfitMargin"               : "Operating Profit Margin (%)",
            "ReportProfitabilityEvolutionGlobalNetProfitMargin"                     : "Net Profit Margin (%)",

            "ReportProfitabilityEvolutionGlobalReturnOnInvestment" : "Return on Investment (%)",

            "ReportProfitabilityEvolutionGlobalAverageNetMarketPrice"    : "Average Net Market Price ($/pack)",
            "ReportProfitabilityEvolutionGlobalAverageWholesalesPrice"   : "Average Wholesales Price ($/pack)",
            "ReportProfitabilityEvolutionGlobalAverageManufacturerPrice" : "Average Manufacturer Price ($/pack)",
            "ReportProfitabilityEvolutionGlobalAverageProductionCost"    : "Average Production Cost ($/pack)",

            "ReportProfitabilityEvolutionGlobalMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportProfitabilityEvolutionGlobalConsumerPricePromotions" : "Consumer Price Promotions ($ mln)",
            "ReportProfitabilityEvolutionGlobalMarketNetSalesValue"     : "Market Net Sales Value ($ mln)",

            "ReportProfitabilityEvolutionGlobalProductionCost" : "Production Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalInventoryValue" : "Inventory Value ($ mln)",

            "ReportProfitabilityEvolutionGlobalCapacityUtilisationRate"         : "Capacity Utilisation Rate (%)",
            "ReportProfitabilityEvolutionGlobalChangeInProductionCapacity"      : "Change In Production Capacity (mln std. packs)",
            "ReportProfitabilityEvolutionGlobalNextPeriodAvailableProdCapacity" : "Next Period Available Prod. Capacity (mln std. packs)",

            "ReportProfitabilityEvolutionGlobalAvailableTechnologyLevel"                             : "Available Technology Level",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseTechnologyLevelBy1Step"  : "Extra Budget Required to Increase Technology Level by 1 Step",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseTechnologyLevelBy2Steps" : "Extra Budget Required to Increase Technology Level by 2 Steps",

            "ReportProfitabilityEvolutionGlobalAcquiredProductionAndLogisticsEfficiency"         : "Acquired Production and Logistics Efficiency (%)",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseEfficiencyBy2points" : "Extra Budget Required to Increase Efficiency by 2% points",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseEfficiencyBy5points" : "Extra Budget Required to Increase Efficiency by 5% points",

            "ReportProfitabilityEvolutionGlobalAcquiredProductionPlanningFlexibility"             : "Acquired Production Planning Flexibility (%)",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseFlexibilityBy2points" : "Extra Budget Required to Increase Flexibility by 2% points",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseFlexibilityBy5points" : "Extra Budget Required to Increase Flexibility by 5% points",

            //Labels for Market Share
            "ReportMarketShareChartTitleMarketShareInValue"  : "Market Share in Value (%)",
            "ReportMarketShareChartTitleMarketShareInVolume" : "Market Share in Volume (%)",
            "ReportMarketShareChartTitleMindSpaceShare"      : "Mind Space Share (%)",
            "ReportMarketShareChartTitleShelfSpaceShare"     : "Shelf Space Share (%)",

            //Labels for Competitor Intelligence
            "ReportCompetitorIntelligenceTableTitleTechnology"                               : "Technology",
            "ReportCompetitorIntelligenceTechnologyAcquiredProductionAndLogisticsEfficiency" : "Acquired Production and Logistics Efficiency (%)",
            "ReportCompetitorIntelligenceTechnologyAcquiredProductionPlanningFlexibility"    : "Acquired Production Planning Flexibility (%)",
            "ReportCompetitorIntelligenceTechnologyAvailableTechnologyLevel"                 : "Available Technology Level",

            "ReportCompetitorIntelligenceTableTitleMarketingSales"                : "Marketing & Sales",
            "ReportCompetitorIntelligenceMarketingSalesAdditionalTradeMarginCost" : "Additional Trade Margin Cost ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesAdvertising"               : "Advertising ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesConsumerPromotionsCost"    : "Consumer Promotions Cost ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesRetailerPurchaseVolume"    : "Retailers Purchase Volume (mln std. packs)",
            "ReportCompetitorIntelligenceMarketingSalesSalesForceCost"            : "Sales Force Cost ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesShipmentToWholesalers"     : "Shipments to Wholesalers (mln std. packs)",
            "ReportCompetitorIntelligenceMarketingSalesTradeInvestments"          : "Trade Investments ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesVolumeDiscountCost"        : "Volume Discount Cost ($ mln)",

            "ReportCompetitorIntelligenceTableTitleOperations"                      : "Operations",
            "ReportCompetitorIntelligenceOperationsCapacityUtilisationRate"         : "Capacity Utilisation Rate (%)",
            "ReportCompetitorIntelligenceOperationsInventoryVolumeAtManufacturer"   : "Inventory Volume at Manufacturer (mln std. packs)",
            "ReportCompetitorIntelligenceOperationsInventoryVolumeAtRetailers"      : "Inventory Volume at Retailers (mln std. packs)",
            "ReportCompetitorIntelligenceOperationsInventoryVolumeAtWholesalers"    : "Inventory Volume at Wholesalers (mln std. packs)",
            "ReportCompetitorIntelligenceOperationsNextPeriodAvailableProdCapacity" : "Next Period Available Prod.Capacity (mln std. packs)",
            "ReportCompetitorIntelligenceOperationsProductionVolume"                : "Production Volume (mln std. packs)",

            "ReportCompetitorIntelligenceTableTitleInvestments"                               : "Investments",
            "ReportCompetitorIntelligenceInvestmentsInvestmentToImproveTechnologyLevel"       : "Investment to Improve Technology Level ($ mln)",
            "ReportCompetitorIntelligenceInvestmentsInvestmentToIncreaseProductionEfficiency" : "Investment to Increase Production Efficiency ($ mln)",

            //Labels for Investments and Profits
            "ReportInvestmentsAndProfitsChartTitleTotalInvestment"        : "Total Investment ($ mln)",
            "ReportInvestmentsAndProfitsChartTitleNetProfitByCompanies"   : "Net Profit By Companies ($ mln)",
            "ReportInvestmentsAndProfitsChartTitleReturnOnInvestment"     : "Return on Investment (%)",
            "ReportInvestmentsAndProfitsChartTitleInvestmentVersusBudget" : "Investment Versus Budget (%)",

            //Labels for Market Sales and Inventory
            "ReportMarketSalesAndInventoryChartTitleMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportMarketSalesAndInventoryChartTitleMarketSalesVolume"       : "Market Sales Volume (mln std. packs)",
            "ReportMarketSalesAndInventoryChartTitleTotalInventoryAtFactory" : "Total Inventory at Factory (mln std. packs)",
            "ReportMarketSalesAndInventoryChartTitleTotalInventoryAtTrade"   : "Total Inventory at Trade (mln std. packs)",
            "ReportMarketSalesAndInventoryChartBottomTextPeriod"   : "Period",

            //Labels for Segment Leader Top 5
            "ReportSegmentLeaderTop5ChartTitlePriceSensitive" : "1. Price Sensitive (%)",
            "ReportSegmentLeaderTop5ChartTitlePretenders"     : "2. Pretenders (%)",
            "ReportSegmentLeaderTop5ChartTitleModerate"       : "3. Moderate (%)",
            "ReportSegmentLeaderTop5ChartTitleGoodLife"       : "4. Good Life (%)",
            "ReportSegmentLeaderTop5ChartTitleUltimate"       : "5. Ultimate (%)",
            "ReportSegmentLeaderTop5ChartTitlePragmatic"      : "6. Pragmatic (%)",

            //Labels for Perception Map
            "ReportPerceptionMapAxisLabelSegment"         : "Segment",
            "ReportPerceptionMapAxisTitleValuePerception" : "Value Perception",
            "ReportPerceptionMapAxisTitleImagePerception" : "Image Perception",
            "ReportPerceptionMapHoverTooltipMarketShareValue" : "Market Share (Value %)",
            "ReportPerceptionMapHoverTooltipAverageDisplayPrice" : "Average Display Price",
            "ReportPerceptionMapHoverTooltipAppliedTechnologyIndex" : "Applied Technology Index",
            "ReportPerceptionMapHoverTooltipIngredientsQualityIndex" : "Ingredients Quality Index",
            "ReportPerceptionMapHoverTooltipAwareness" : "Awareness (%)",
            "ReportPerceptionMapHoverTooltipShelfSpace" : "Shelf Space (%)",
            "ReportPerceptionMapHoverTooltipValuePerceptionChange" : "Value Perception Change",
            "ReportPerceptionMapHoverTooltipImagePerceptionChange" : "Image Perception Change",

            //Labels for Segment Distributions
            "ReportSegmentDistributionsTableTitleMarketShareValue"      : "Market Share (value %)",
            "ReportSegmentDistributionsTableTitleMarketShareVolume"     : "Market Share (volume %)",
            "ReportSegmentDistributionsTableTitleMarketSalesValue"      : "Market Sales Value ($ mln)",
            "ReportSegmentDistributionsTableTitleMarketSalesVolume"     : "Market Sales Volume (mln std. packs)",
            "ReportSegmentDistributionsTableTitleAverageNetMarketPrice" : "Average Net Market Price ($/std. pack)",
            "ReportSegmentDistributionsTableTitleValuePerception"       : "Value Perception",
            "ReportSegmentDistributionsTableTitleImagePerception"       : "Image Perception",

            //Labels for Market Evolution
            "ReportMarketEvolutionChartTitleGrowthRateInVolume"             : "Growth Rate In Volume (Period -3 = 100)",
            "ReportMarketEvolutionChartTitleGrowthRateInValue"              : "Growth Rate In Value (Period -3 = 100)",
            "ReportMarketEvolutionChartTitleNetMarketPrice"                 : "Net Market Price (Period -3 = 100)",
            "ReportMarketEvolutionChartTitleSegmentValueShareInTotalMarket" : "Segment Value Share In Total Market (%)",

            //Labels for Market Trends - SKU Level
            "ReportMarketTrendsSKUTableTitleMarketFigures"            : "Market Figures", //Market Figures
            "ReportMarketTrendsSKUMarketFiguresAverageDisplayPrice"   : "Average Display Price ($/std. pack)",
            "ReportMarketTrendsSKUMarketFiguresAverageNetMarketPrice" : "Average Net Market Price ($/std. pack)",
            "ReportMarketTrendsSKUMarketFiguresBrandAwareness"        : "Brand Awareness (%)",
            "ReportMarketTrendsSKUMarketFiguresImagePerception"       : "Image Perception",
            "ReportMarketTrendsSKUMarketFiguresMarketNetSalesValue"   : "Market Net Sales Value ($ mln)",
            "ReportMarketTrendsSKUMarketFiguresMarketNetSalesVolume"  : "Market Net Sales Volume (mln std. packs)",
            "ReportMarketTrendsSKUMarketFiguresMarketShareValue"      : "Market Share (value %)",
            "ReportMarketTrendsSKUMarketFiguresMarketShareVolume"     : "Market Share (volume %)",

            "ReportMarketTrendsSKUTableTitleMiscellaneous"              : "Miscellaneous",		//Miscellaneous
            "ReportMarketTrendsSKUMiscellaneousLostSalesVolumeduetoOOS" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportMarketTrendsSKUMiscellaneousNumericalDistribution"   : "Numerical Distribution (%)",
            "ReportMarketTrendsSKUMiscellaneousTotalInventoryAtTrade"   : "Total Inventory at Trade (mln std. packs)",
            "ReportMarketTrendsSKUMiscellaneousPriceRankingIndex"       : "Price Ranking Index",
            "ReportMarketTrendsSKUMiscellaneousShelfSpace"              : "Shelf Space (%)",

            "ReportMarketTrendsSKUTableTitleSegmentWiseValueShare"                      : "Value Share by Segment",		//Segment-wise Value Share
            "ReportMarketTrendsSKUSegmentWiseValueShareValueSharePriceSensitiveSegment" : "Value Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueSharePretendersSegment"     : "Value Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueShareModerateSegment"       : "Value Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueShareGoodLifeSegment"       : "Value Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueShareUltimateSegment"       : "Value Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueSharePragmaticSegment"      : "Value Share (%) in 6. Pragmatic Segment",

            "ReportMarketTrendsSKUTableTitleSegmentWiseVolumeShare"                       : "Volume Share by Segment",	//Segment-wise Volume Share
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeSharePriceSensitiveSegment" : "Volume Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeSharePretendersSegment"     : "Volume Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeShareModerateSegment"       : "Volume Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeShareGoodLifeSegment"       : "Volume Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeShareUltimateSegment"       : "Volume Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeSharePragmaticSegment"      : "Volume Share (%) in 6. Pragmatic Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeWeightedDistribution"       : "Volume-weighted Distribution (%)",

            //Labels for Market Trends - Brand Level
            "ReportMarketTrendsBrandMarketFiguresAverageDisplayPrice"   : "Average Display Price ($/std. pack)",
            "ReportMarketTrendsBrandMarketFiguresAverageNetMarketPrice" : "Average Net Market Price ($/std. pack)",
            "ReportMarketTrendsBrandMarketFiguresBrandAwareness"        : "Brand Awareness (%)",
            "ReportMarketTrendsBrandMarketFiguresImagePerception"       : "Image Perception",
            "ReportMarketTrendsBrandMarketFiguresMarketNetSalesValue"   : "Market Net Sales Value ($ mln)",
            "ReportMarketTrendsBrandMarketFiguresMarketNetSalesVolume"  : "Market Net Sales Volume (mln std. packs)",
            "ReportMarketTrendsBrandMarketFiguresMarketShareValue"      : "Market Share (value %)",
            "ReportMarketTrendsBrandMarketFiguresMarketShareVolume"     : "Market Share (volume %)",

            "ReportMarketTrendsBrandMiscellaneousLostSalesVolumeduetoOOS" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportMarketTrendsBrandMiscellaneousNumericalDistribution"   : "Numerical Distribution (%)",
            "ReportMarketTrendsBrandMiscellaneousTotalInventoryAtTrade"   : "Total Inventory at Trade (mln std. packs)",
            "ReportMarketTrendsBrandMiscellaneousPriceRankingIndex"       : "Price Ranking Index",
            "ReportMarketTrendsBrandMiscellaneousShelfSpace"              : "Shelf Space (%)",

            "ReportMarketTrendsBrandSegmentWiseValueShareValueSharePriceSensitiveSegment" : "Value Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueSharePretendersSegment"     : "Value Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueShareModerateSegment"       : "Value Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueShareGoodLifeSegment"       : "Value Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueShareUltimateSegment"       : "Value Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueSharePragmaticSegment"      : "Value Share (%) in 6. Pragmatic Segment",

            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeSharePriceSensitiveSegment" : "Volume Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeSharePretendersSegment"     : "Volume Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeShareModerateSegment"       : "Volume Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeShareGoodLifeSegment"       : "Volume Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeShareUltimateSegment"       : "Volume Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeSharePragmaticSegment"      : "Volume Share (%) in 6. Pragmatic Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeWeightedDistribution"       : "Volume-weighted Distribution (%)",

            //Labels for Market Trends - Global Level
            "ReportMarketTrendsGlobalMarketFiguresAverageNetMarketPrice" : "Average Net Market Price ($/std. pack)",
            "ReportMarketTrendsGlobalMarketFiguresMarketNetSalesValue"   : "Market Net Sales Value ($ mln)",
            "ReportMarketTrendsGlobalMarketFiguresMarketNetSalesVolume"  : "Market Net Sales Volume (mln std. packs)",
            "ReportMarketTrendsGlobalMarketFiguresMarketShareValue"      : "Market Share (value %)",
            "ReportMarketTrendsGlobalMarketFiguresMarketShareVolume"     : "Market Share (volume %)",

            "ReportMarketTrendsGlobalMiscellaneousLostSalesVolumeduetoOOS" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportMarketTrendsGlobalMiscellaneousNumericalDistribution"   : "Numerical Distribution (%)",
            "ReportMarketTrendsGlobalMiscellaneousTotalInventoryAtTrade"   : "Total Inventory at Trade (mln std. packs)",
            "ReportMarketTrendsGlobalMiscellaneousPriceRankingIndex"       : "Price Ranking Index",
            "ReportMarketTrendsGlobalMiscellaneousShelfSpace"              : "Shelf Space (%)",

            "ReportMarketTrendsGlobalSegmentWiseValueShareValueSharePriceSensitiveSegment" : "Value Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueSharePretendersSegment"     : "Value Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueShareModerateSegment"       : "Value Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueShareGoodLifeSegment"       : "Value Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueShareUltimateSegment"       : "Value Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueSharePragmaticSegment"      : "Value Share (%) in 6. Pragmatic Segment",

            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeSharePriceSensitiveSegment" : "Volume Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeSharePretendersSegment"     : "Volume Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeShareModerateSegment"       : "Volume Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeShareGoodLifeSegment"       : "Volume Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeShareUltimateSegment"       : "Volume Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeSharePragmaticSegment"      : "Volume Share (%) in 6. Pragmatic Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeWeightedDistribution"       : "Volume-weighted Distribution (%)",

            //Labels for Market Indicator
            "ReportMarketIndicatorCorporateTaxRate"	:	"Corporate Tax Rate",
            "ReportMarketIndicatorInflationRate"	:	"Inflation Rate",
            "ReportMarketIndicatorDepositRate"	:	"Deposit Rate",
            "ReportMarketIndicatorBorrowingRate"	:	"Borrowing Rate",
            "ReportMarketIndicatorAdditionalInvestmentBudgetSurchargeRate"	:	"Additional Investment Budget Surcharge Rate",
            "ReportMarketIndicatorInventoryHoldingCost"	:	"Inventory Holding Cost (as a % of inventory value)",
            "ReportMarketIndicatorObsoleteGoodsCost"	:	"Obsolete Goods Cost (as a % of purchase cost)",
            "ReportMarketIndicatorDiscontinuedGoodsCost"	:	"Discontinued Goods Cost (as a % of purchase cost)",



            //Labels for Items on Decision Page - Second Menu Bar

            "DecisionPageSecondMenuBarLabelsTotalAvailableBudget" : "Total Available Budget",
            "DecisionPageSecondMenuBarLabelsNormalCapacity"       : "Normal Capacity Left",
            "DecisionPageSecondMenuBarLabelsOvertimeCapacity"     : "Overtime Capacity Left",
            "DecisionPageSecondMenuBarLabelsAdditionalBudget"     : "Additional Budget",


            //Labels for Items on Decision Page - DecisionTab
            "DecisionPageDecisionTabMAKEDECISIONS"     : "MAKE DECISIONS",
            "DecisionPageDecisionTabMission"           : "Market Share + Profit",
            "DecisionPageDecisionTabAddNewBrand"       : "Add New Brand",
            "DecisionPageDecisionTabSalesForce"        : "Sales Force ($ mln)",
            "DecisionPageDecisionTabAddNewSKU"         : "Add New SKU",
            "DecisionPageDecisionTabName"              : "SKU Name",
            "DecisionPageDecisionTabLabelBrandName"    : "Brand Name :",
            "DecisionPageDecisionTabLabelFirstSKUName" : "First SKU Name :",
            "DecisionPageDecisionTabLabelSKUName"      : "SKU Name :",

            "DecisionPageDecisionTabDiscontinue"           : "Discontinue?",
            "DecisionPageDecisionTabProcessingTechnology"  : "Processing Technology",
            "DecisionPageDecisionTabIngredientsQuality"    : "Ingredients Quality",
            "DecisionPageDecisionTabPackagingSize"         : "Packaging Size",
            "DecisionPageDecisionTabPackagingSizeSmall"    : "Small",
            "DecisionPageDecisionTabPackagingSizeStandard" : "Standard",
            "DecisionPageDecisionTabPackagingSizeLarge"    : "Large",

            "DecisionPageDecisionTabProductionVolume"               : "Production Volume (mln packs)",
            "DecisionPageDecisionTabManufacturerPrice"              : "Manufacturer Price ($)",
            "DecisionPageDecisionTabRepriceFactoryStock"            : "Reprice Factory Stock?",
            "DecisionPageDecisionTabConsumerCommunication"          : "Consumer Communication ($ mln)",
            "DecisionPageDecisionTabTargetConsumerSegment"          : "Target Consumer Segment",
            "DecisionPageDecisionTabConsumerPromotions"             : "Consumer Promotions ($ mln)",
            "DecisionPageDecisionTabConsumerPromotionsSchedule"     : "Consumer Promotions Schedule",
            "DecisionPageDecisionTabConsumerPromotionsScheduleWeek" : "Week",
            "DecisionPageDecisionTabTradeExpenses"                  : "Trade Expenses ($ mln)",
            "DecisionPageDecisionTabAdditionalTradeMargin"          : "Additional Trade Margin (%)",
            "DecisionPageDecisionTabWholesaleMinimumVolume"         : "Wholesale Minimum Volume (mln packs)",
            "DecisionPageDecisionTabWholesaleBonusRate"             : "Wholesale Bonus Rate (%)",

            "DecisionPageDecisionNewProductDevelopmentInvestment"                                 : "New Product Development Investment",
            "DecisionPageDecisionNewProductDevelopmentInvestmentInvestmentInProductionEfficiency" : "Investment in Production Efficiency ($ mln)",
            "DecisionPageDecisionNewProductDevelopmentInvestmentInvestmentInProcessingTechnology" : "Investment in Processing Technology ($ mln)",

            "DecisionPageDecisionNewProductDevelopmentInvestmentName"                                                   : "Name",
            "DecisionPageDecisionNewProductDevelopmentInvestmentRequiredAmount"                                         : "Required Amount ($ mln)",
            "DecisionPageDecisionNewProductDevelopmentInvestmentExtraBudgetRequiredToIncreaseEfficiencyBy25points"      : "Extra Budget Required to Increase Efficiency by 2% / 5% points",
            "DecisionPageDecisionNewProductDevelopmentInvestmentExtraBudgetRequiredToIncreaseFlexibilityBy25points"     : "Extra Budget Required to Increase Flexibility by 2% / 5% points",
            "DecisionPageDecisionNewProductDevelopmentInvestmentExtraBudgetRequiredToIncreaseTechnologyLevelBy12points" : "Extra Budget Required to Increase Technology Level by 1 / 2 Step(s)",
            "DecisionPageDecisionNewProductDevelopmentInvestmentNote"                                                   : "Note: Investment on Efficiency could increase Flexibility at the same time",

            "DecisionPageDecisionLockButton"     : "Submit and Lock Decision",
            "DecisionPageDecisionLockButtonInfo" : "Attention: Your team can't change any decisions after you lock decision",
            "DecisionPageDecisionLockButtonConfirmYes" : "Confirm Yes",
            "DecisionPageDecisionLockButtonConfirmNo" : "No",
            "DecisionPageDecisionLockStatus" : "Decisions Locked",


            "DecisionPageDecisionTabProcessingTechnologyFrontendValidation" : "Must be integer",
            "DecisionPageDecisionTabIngredientsQualityFrontendValidation"   : "Must be integer",
            "DecisionPageDecisionTabProductionVolumeFrontendValidation"     : "Must be integer",
            "DecisionPageDecisionTabManufacturerPriceFrontendValidation"    : "Must be float",

            "DecisionPageDecisionTabConsumerCommunicationFrontendValidation"  : "Must be integer",
            "DecisionPageDecisionTabConsumerPromotionsFrontendValidation"     : "Must be integer",
            "DecisionPageDecisionTabTradeExpensesFrontendValidation"          : "Must be integer",
            "DecisionPageDecisionTabAdditionalTradeMarginFrontendValidation"  : "Must be less than 100",
            "DecisionPageDecisionTabWholesaleMinimumVolumeFrontendValidation" : "Must be integer",
            "DecisionPageDecisionTabWholesaleBonusRateFrontendValidation"     : "Must be less than 100",



            //Labels for Items on Decision Page - Future Projections Calculator
            "DecisionPageFutureProjectionsTableTitleDATAREFERENCE"		:	"DATA REFERENCE",

            "DecisionPageFutureProjectionsCalculatorLabel"       : "Future Projection Calculator",
            "DecisionPageFutureProjectionsCalculatorTablePeriod" : "Period",

            "DecisionPageFutureProjectionsCalculatorTable1InPackUnits"     : "In Pack Units",
            "DecisionPageFutureProjectionsCalculatorTable1InStandardUnits" : "In Standard Units",

            "DecisionPageFutureProjectionsCalculatorTable1StocksAtFactory"     : "Stocks at Factory (mln)",
            "DecisionPageFutureProjectionsCalculatorTable1StocksAtWholesales"  : "Stocks at Wholesalers (mln)",
            "DecisionPageFutureProjectionsCalculatorTable1StocksAtRetailers"   : "Stocks at Retailers  (mln)",
            "DecisionPageFutureProjectionsCalculatorTable1UnitProductionCost"  : "Unit Production Cost ($)",
            "DecisionPageFutureProjectionsCalculatorTable1WholesalePrice"      : "Wholesale Price ($)",
            "DecisionPageFutureProjectionsCalculatorTable1RecommendedConsumer" : "Recommended Consumer Price ($)",

            "DecisionPageFutureProjectionsCalculatorTable2MarketSales"           : "Market Sales (mln Packs)",
            "DecisionPageFutureProjectionsCalculatorTable2ShipmentsToRetailers"  : "Shipments to retailers (mln Packs)",
            "DecisionPageFutureProjectionsCalculatorTable2UnitProductionCost"    : "Unit Production Cost ($)",
            "DecisionPageFutureProjectionsCalculatorTable2AverageConsumerPrice"  : "Average Consumer Price",
            "DecisionPageFutureProjectionsCalculatorTable2ConsumerCommunication" : "Consumer Communication ($ mln)",
            "DecisionPageFutureProjectionsCalculatorTable2ConsumerPromotions"    : "Consumer Promotions ($ mln)",

            "DecisionPageFutureProjectionsCalculatorTable3SKUExpectedSales"        : "SKU: Expected Sales",
            "DecisionPageFutureProjectionsCalculatorTable3AdditionalInformation"   : "Additional Information (SKU)",
            "DecisionPageFutureProjectionsCalculatorTable3ExpectedMaximalSales"    : "Expected Maximal Sales ($ mln)",
            "DecisionPageFutureProjectionsCalculatorTable3ExpectedGrossMargin"     : "Expected Gross Margin (%)",
            "DecisionPageFutureProjectionsCalculatorTable3ExpectedOperatingMargin" : "Expected Operating Margin (%)",


            //Labels for Items on Decision Page - Product Portfolio
            "DecisionPageProductPortfolioLabel"		:	"Product Portfolio",

            "DecisionPageProductPortfolioTable1CurrentProduction"  : "Current Production",
            "DecisionPageProductPortfolioTable1SKUName"            : "SKU Name",
            "DecisionPageProductPortfolioTable1TargetSegment"      : "Target Segment",
            "DecisionPageProductPortfolioTable1FactoryPrice"       : "Factory Price",
            "DecisionPageProductPortfolioTable1IngredientsQuality" : "Ingredients Quality",
            "DecisionPageProductPortfolioTable1TechnologyLevel"    : "Technology Level",
            "DecisionPageProductPortfolioTable1ProductionVolume"   : "Production Volume",

            "DecisionPageProductPortfolioTable2PreviousInventory"             : "Previous Inventory",
            "DecisionPageProductPortfolioTable2SKUName"                       : "SKU Name",
            "DecisionPageProductPortfolioTable2AverageFactoryPrice"           : "Average Factory Price",
            "DecisionPageProductPortfolioTable2AverageIngredientQuality"      : "Average Ingredient Quality",
            "DecisionPageProductPortfolioTable2AverageTechnologyLevel"        : "Average Technology Level",
            "DecisionPageProductPortfolioTable2TotalInventoryVolumeAtFactory" : "Total Inventory Volume at Factory",


            //Labels for Items on Decision Page - DecisionTab
            "DecisionPageDecisionTabFinance"     : "Finances",
            "DecisionPageDecisionTabProduction"     : "Production",
            "DecisionPageDecisionTabForecast"     : "Prévisions de Ventes",
            "DecisionPageDecisionTabCheckList"     : "Check List",
            "DecisionPageDecisionTabMarketing"     : "Marketing",
            "DecisionPageDecisionTabBI"     : "Intelligence économique",


            //Labels for Items on Decision Page - Spending Details
            "DecisionPageSpendingDetailsLabel" : "Spending Details",

            "DecisionPageSpendingDetailsTable1BrandName" : "Brand Name",
            "DecisionPageSpendingDetailsTable1Total"     : "Total",

            "DecisionPageSpendingDetailsTable1SalesForce"                         : "Sales Force ($ mln)",
            "DecisionPageSpendingDetailsTable1ConsumerCommunication"              : "Consumer Communication ($ mln)",
            "DecisionPageSpendingDetailsTable1ConsumerPromotions"                 : "Consumer Promotions ($ mln)",
            "DecisionPageSpendingDetailsTable1TradeExpenses"                      : "Trade Expenses ($ mln)",
            "DecisionPageSpendingDetailsTable1EstimatedAdditionalTradeMarginCost" : "Estimated Additional Trade Margin Cost ($ mln)",
            "DecisionPageSpendingDetailsTable1EstimatedWholesaleBonusCost"        : "Estimated Wholesale Bonus Cost ($ mln)",

            "DecisionPageSpendingDetailsTable2Company"		:	"Company",
            "DecisionPageSpendingDetailsTable2Total"		:	"Total",


            "DecisionPageSpendingDetailsTable2InvestmentInProductionEfficiency"    : "Investment in Production Efficiency ($ mln)",
            "DecisionPageSpendingDetailsTable2InvestmentInProcessingTechnology"    : "Investment in Processing Technology ($ mln)",
            "DecisionPageSpendingDetailsTable2TotalInvestment"                     : "(-) Estimated Spending this period ($ mln)",
            "DecisionPageSpendingDetailsTable2AverageBudgetPerPeriod"              : "Average Budget per Period ($ mln)",
            "DecisionPageSpendingDetailsTable2TotalInvestmentBudget"               : "Total Investment Budget ($ mln)",
            "DecisionPageSpendingDetailsTable2CumulatedPreviousInvestments"        : "(-) Cumulated Previous Investments ($ mln)",
            "DecisionPageSpendingDetailsTable2AvailableBudget"                     : "(=) Estimated Total Budget Left ($ mln)",
            "DecisionPageSpendingDetailsTable2NormalCapacity"                      : "Normal Capacity Left This Period (mln Packs)",
            "DecisionPageSpendingDetailsTable2AvailableOvertimeCapacityExtension"  : "Available Overtime Capacity Extension Left This Period (mln Packs)",
            "DecisionPageSpendingDetailsTable2AcquiredEfficiency"                  : "Acquired Efficiency (%)",
            "DecisionPageSpendingDetailsTable2AcquiredProductionVolumeFlexibility" : "Acquired Production Volume Flexibility (%)",
            "DecisionPageSpendingDetailsTable2AcquiredTechnologyLevel"             : "Acquired Technology Level",

            //Labels for Final Score page
            "FinalScorePageScore"          : "Score",
            "FinalScorePageButtonOriginal" : "Original",
            "FinalScorePageButtonRescaled" : "Rescaled",
            "FinalScorePageWeightFactor"   : "Weight / Factor",

            "FinalScorePageIncrementalMarketShare"         : "Incremental market share (value)",
            "FinalScorePageCumulatedNetProfit"             : "Cumulated net profit",
            "FinalScorePageSpendingVersusBudgets"          : "Spending versus budgets",

            "FinalScorePageShareInBrandTotalSalesValue"    : "Share in Brand Total Sales Value",
            "FinalScorePageAchievementOfInitialObjectives" : "Achievement of initial objectives",
            "FinalScorePageFinalScore"                     : "Final Score",
            "FinalScorePageFinalScoreTime"                     : "Time",
            "FinalScorePageFinalScoreTimeAll"                     : "All Time",

            "FinalScorePageCompany"             : "Company",
            "FinalScorePagePeriod"              : "Period",
            "FinalScorePageCongratulations"     : "Congratulations ! You finish the game",
            "FinalScorePageCongratulationsInfo" : "Please take 5 minutes to provide feedback to MarkSimos. Your feedback will help us to improve our service",
            "FinalScorePageProvideFeedback"     : "Provide Feedback",
            "FinalScorePageThank"               : "Thank you !",
            "FinalScorePageThankInfo"           : "Thank you for your feedback",

            "FinalScoreAdminPanelLabel"           : "Decisions and Results",
            "FinalScoreAdminPanelDecisionsButton" : "All Decisions",
            "FinalScoreAdminPanelResultsButton"   : "All Results",
            "FinalScoreAdminPanelReRunButton" : "Rerun Last Period Decisions",
            "FinalScoreAdminPanelUnlockDecisionButton" : "Unlock current Period Decision lock",
            "FinalScoreAdminPanelReRunSaveButton" : "Save",


            //Labels for Questionnaire Page
            "QuestionnairePageQuestionnaire"                             : "Questionnaire",
            "QuestionnairePageVeryPoor"                                  : "Very poor",
            "QuestionnairePageAverage"                                   : "Average",
            "QuestionnairePageExcellent"                                 : "Excellent",
            "QuestionnairePageOverallSatisfactionWiththeProgram"         : "Overall Satisfaction With the Program",
            "QuestionnairePageChallengeStrategicThinkingAbility"         : "Challenge strategic thinking ability",
            "QuestionnairePageDevelopAnIntegratedPerspective"            : "Develop an integrated perspective",
            "QuestionnairePageTestPersonalAbilityOfBalancingRisks"       : "Test personal ability of balancing risks",
            "QuestionnairePageChallengeLeadershipAndTeamworkAbility"     : "Challenge leadership and teamwork ability",
            "QuestionnairePageChallengeAnalysisAndDecisionMakingAbility" : "Challenge analysis and decision-making ability",
            "QuestionnairePageSimulationInteresting"                     : "Simulation interesting",
            "QuestionnairePageTeachingTeam"                              : "Teaching Team",
            "QuestionnairePageFacilitator"                               : "Facilitator",
            "QuestionnairePageNormanYen"                                 : "Norman Yen",
            "QuestionnairePageFeedbackOnSimulationDecisions"             : "Feedback on simulation decisions",
            "QuestionnairePageExpandingViewAndInspireThinking"           : "Expanding view and inspire thinking",
            "QuestionnairePageLectures"                                  : "Lectures",
            "QuestionnairePageProduct"                                   : "Product",
            "QuestionnairePageOverallProductUsageExperience"             : "Overall Product Usage Experience",
            "QuestionnairePageUserInterfaceExperience"                   : "User Interface Experience",
            "QuestionnairePageEaseOfNavigation"                          : "Ease of Navigation",
            "QuestionnairePageClarityOfWordsUsed"                        : "Clarity of words used",
            "QuestionnairePageInterpreter"                               : "Interpreter",
            "QuestionnairePageOlive"                                     : "Olive",
            "QuestionnairePageAccuracyANDPresentation"                   : "Accuracy & Presentation",
            "QuestionnairePageTeachingSupport"                           : "Teaching Support",
            "QuestionnairePageMayYu"                                     : "May Yu",
            "QuestionnairePageHelpfulness"                               : "Helpfulness",
            "QuestionnairePageQualityOfTechnicalSupport"                 : "Quality of Technical Support",

            "QuestionnairePageOthers"             : "Others",
            "QuestionnairePageMostBenefit"        : "Which format of the program would benefit you the most",
            "QuestionnairePageJoinProgram"        : "Join Program with other companies",
            "QuestionnairePageCompanyInHouse"     : "Company In-House Program with other functions",
            "QuestionnairePageOpenClass"          : "Open class",
            "QuestionnairePageRecommendMarkSimos" : "Would you like to recommend MarkSimos to other companies or business school",
            "QuestionnairePageYes"                : "Yes",
            "QuestionnairePageNo"                 : "No",
            "QuestionnairePageBringYou"           : "What is the best benefit or experience MarkSimos bring to you ? Is there something special you learned that you like was unique / different compared to what you learned before",
            "QuestionnaireSubmit"                 : "Submit Feedback",

            //Labels for Help page
            "HelpPageMenuFAQ"                     : "FAQ",
            "HelpPageMenuVideo"                   : "Video",
            "HelpPageMenuManual"                  : "Manual",

            //Labels for FAQ Page
            "FAQPageTitle"                        : "Frequently Asked Questions",
            "FAQPageSubTitle"                     : "This FAQ will attempt to cover the most asked questions about Marksimos game.",

            "ManualPageTitle"    : "Manual",
            "ManualPageDownload" : "Download"







        });










        // Adding a translation table for the Chinese language
        $translateProvider.translations('fr_FR', {

            "YES"     : "Oui",
            "NO"     : "Non",
            "ALL"     : "Tout",

            "BUY"     : "Acheter",

             //Labels for Login
            "LoginPageLabelWelcome"           : "Bienvenue !",
            "LoginPageLabelSignIn"            : "Se Connecter",
            "LoginPageLabelEmail"             : "Identifiant / E-mail :",
            "LoginPageLabelPassword"          : "Mot de Passe :",
            "LoginPageLabelPasswordErrorInfo" : "Password Incorrect !",
            "LoginPageButtonSignIn"           : "Se Connecter",


            //Labels for Introduction
            "IntroPageSeminarListTitle" : "Mes Séminaires",
            "IntroPageSeminarListLabelSeminarID" : "Code de Séminaire",
            "IntroPageSeminarListLabelSeminarDescription" : "Description",
            "IntroPageSeminarListLabelTotalRound" : "Nb. de Tours",
            "IntroPageSeminarListLabelCompetitor" : "Nb. de Concurrents",
            "IntroPageSeminarListLabelDateOfCommencement" : "Date de Début",
            "IntroPageSeminarListLabelSeminarStatus" : "Statut",
            "IntroPageSeminarListLabelCountry" : "Pays",
            "IntroPageSeminarListLabelProvince" : "Région",
            "IntroPageSeminarListLabelCity" : "Ville",
            "IntroPageSeminarListLabelVenue" : "Lieu",

            "IntroPageSeminarListLabelIsFinished": "Terminé",
            "IntroPageSeminarListLabelCurrentRound": "Période en cours",
            "IntroPageSeminarListLabelNoInfo": "Aucune Info",


            "IntroPageSentence1" : "Qui suis-je ?",
            "IntroPageSentence2" : "Je suis une Entreprise Leader",
            "IntroPageSentence3" : "Je gère",
            "IntroPageSentence4" : "produits",
            "IntroPageSentence5" : "sous",
            "IntroPageSentence6" : "marques",
            "IntroPageSentence7" : "Je suis en compétition avec",
            "IntroPageSentence8" : "autres entreprises",

            "IntroPageSentence21" : "La Mission de mon Entreprise",
            "IntroPageSentence22" : "gagner une grande part de marché",
            "IntroPageSentence23" : "et",
            "IntroPageSentence24" : "avoir une rentabilité élevée",

            "IntroPageStart" : "Commencer",



            //Labels for Items on Home page - Top Menu Bar
            "HomePageMenuBarLabelsHome"     : "Accueil",
            "HomePageMenuBarLabelsReport"     : "Rapport",
            "HomePageMenuBarLabelsDecision"   : "Décision",
            "HomePageMenuBarLabelsScore"      : "Score",
            "HomePageMenuBarLabelsLanguage"   : "Langue",
            "HomePageMenuBarLabelsHelp"       : "Aide",
            "HomePageMenuBarLabelsHelpFAQ"    : "FAQ",
            "HomePageMenuBarLabelsHelpVideo"  : "Vidéo",
            "HomePageMenuBarLabelsHelpManual" : "Guide d'utilisation",
            "HomePageMenuBarLabelsAbout"      : "à Propos de Stratège",
            "HomePageMenuBarLabelsLogout"     : "Se Déconnecter",


            //Labels for Segment
            "HomePageSegmentLabelPriceSensitive" : "1 Price Sensitive",
            "HomePageSegmentLabelPretenders"     : "2 Pretenders",
            "HomePageSegmentLabelModerate"       : "3 Moderate",
            "HomePageSegmentLabelGoodLife"       : "4 Good Life",
            "HomePageSegmentLabelUltimate"       : "5 Ultimate",
            "HomePageSegmentLabelPragmatic"      : "6 Pragmatic",
            "HomePageSegmentLabelAllSegments"    : "All Segments",




            //Labels for Items on Home page - Second Menu Bar
            "HomePageSecondMenuBarLabelsCompany"           : "Entreprise",
            "HomePageSecondMenuBarLabelsCompanies"         : "Concurrents",
            "HomePageSecondMenuBarLabelsMemberTotal"         : "Actuellement",
            "HomePageSecondMenuBarLabelsMember"         : "Membre(s) de l'équipe pour prendre les décisions",

            "HomePageSecondMenuBarLabelsTimeLeft"          : "Il vous reste",
            "HomePageSecondMenuBarLabelsTimeLeftForSubmit" : "pour soumettre la décision",
            "HomePageSecondMenuBarLabelsMission"           : "Mes Objectifs",
            "HomePageSecondMenuBarLabelsMakeDecision"      : "Faire une décision",
            "HomePageSecondMenuBarCurrentPeriod"           : "Période",

            "HomePageSecondMenuBarCompareData"     : "Comparer les Données",
            "HomePageSecondMenuBarCompareDataBack" : "Revenir au Rapport",

            //Labels for Items on Home page - Three Boxes
            "HomePageYourCompanyTableLabel"                 : "Votre Entreprise",
            "HomePageYourCompanyCompanyStatus"              : "Situation de l'Entreprise",
            "HomePageYourCompanyFinancialReport"            : "Rapport Financier",
            "HomePageYourCompanyInventoryReport"            : "Inventaire",
            "HomePageYourCompanyProfitabilityEvolution"     : "Evolution de la Rentabilité",
            "HomePageYourCompetitorTableLabel"              : "La Concurrence",
            "HomePageYourCompetitorMarketShare"             : "Parts de Marchés",
            "HomePageYourCompetitorCompetitorIntelligence"  : "Intelligence économique",
            "HomePageYourCompetitorInvestmentsandProfits"   : "Investissements",
            "HomePageYourCompetitorMarketSalesandInventory" : "Ventes et Inventaire",
            "HomePageMarketLandscapeTableLabel"             : "Market Landscape",
            "HomePageMarketLandscapeSegmentLeaderTop5"      : "Segment Leader Top 5",
            "HomePageMarketLandscapePerceptionMap"          : "Perception Map",
            "HomePageMarketLandscapeSegmentDistributions"   : "Segment Distributions",
            "HomePageMarketLandscapeMarketEvolution"        : "Evolution des Marchés",
            "HomePageMarketLandscapeMarketTrends"           : "Tendances",
            "HomePageMarketLandscapeMarketIndicators"       : "Indicateurs",


            //Labels for Items on Reports page - reports menu
            "ReportYourCompany"                : "Votre Entreprise",
            "ReportMenuCompanyStatus"          : "Situation de l'Entreprise",
            "ReportMenuFinancialReport"        : "Rapport Financier",
            "ReportMenuInventoryReport"        : "Inventaire",
            "ReportMenuProfitabilityEvolution" : "Evolution de la Rentabilité",

            "ReportYourCompetitors"            : "Vos Concurrents",
            "ReportMenuMarketShare"            : "Parts de Marché",
            "ReportMenuCompetitorIntelligence" : "Veille",
            "ReportMenuInvestmentProfits"      : "Investissements",
            "ReportMenuMarketSalesInventory"   : "Ventes et Inventaires",

            "ReportMarketLandscape"            : "Market Landscape",
            "ReportMenuSegmentLeaderTop5"      : "Segment Leader Top5",
            "ReportMenuPerceptionMap"          : "Perception Map",
            "ReportMenuSegmentDistributions"   : "Segment Distributions",
            "ReportMenuMarketEvolution"        : "Market Evolution",
            "ReportMenuMarketTrends"           : "Market Trends",
            "ReportMenuMarketIndicator"        : "Market Indicator",



            //Labels for Company Status Report Tab Menu
            "ReportTabLabelSKU"    : "SKU",
            "ReportTabLabelBrand"  : "Brand",
            "ReportTabLabelGlobal" : "Global",

            "ReportTabLabelTableChartDisplayLine"  : "Line Chart",
            "ReportTabLabelTableChartDisplayBar"   : "Bar Chart",
            "ReportTabLabelTableChartDisplayPoint" : "Point Chart",
            "ReportTabLabelTableChartDisplayArea"  : "Area Chart",
            "ReportTabLabelTableChartDisplayPie"   : "Pie Chart",

            //Labels for Company Status Report - SKU Level
            "ReportCompanyStatusSKUQuarter" : "Trimestre",

            "ReportCompanyStatusSKUMarketShareValue"                             : "Market Share (value %)",
            "ReportCompanyStatusSKUMarketShareVolume"                            : "Market Share (volume %)",
            "ReportCompanyStatusSKUMarketSalesVolumeStd"                         : "Market Sales Volume (mln std. packs)",
            "ReportCompanyStatusSKULostSalesVolumeDueToOOSStd"                   : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportCompanyStatusSKUNumericalDistribution"                        : "Numerical Distribution (%)",
            "ReportCompanyStatusSKUVolumeWeightedDistribution"                   : "Volume-weighted Distribution (%)",
            "ReportCompanyStatusSKUShelfSpace"                                   : "Shelf Space (%)",
            "ReportCompanyStatusSKUAwareness"                                    : "Awareness (%)",
            "ReportCompanyStatusSKUAverageNetMarketPrice"                        : "Average Net Market Price ($/std. pack)",
            "ReportCompanyStatusSKUAverageDisplayPrice"                          : "Average Display Price ($/std. pack)",
            "ReportCompanyStatusSKUPriceRankingIndex"                            : "Price Ranking Index",
            "ReportCompanyStatusSKUTargetConsumerSegment"                        : "Target Consumer Segment",
            "ReportCompanyStatusSKUTargetConsumerSegmentExpectedValuePerception" : "Target Consumer Segment Expected Value Perception",
            "ReportCompanyStatusSKUValuePerception"                              : "Value Perception",
            "ReportCompanyStatusSKUTargetConsumerSegmentExpectedImagePerception" : "Target Consumer Segment Expected Image Perception",
            "ReportCompanyStatusSKUImagePerception"                              : "Image Perception",

            "ReportCompanyStatusSKUIngredientsQualityIndex"	:	"Ingredients Quality Index",
            "ReportCompanyStatusSKUAppliedTechnologyIndex"	:	"Applied Technology Index",

            "ReportCompanyStatusSKUMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportCompanyStatusSKUConsumerPricePromotions" : "Consumer Price Promotions ($ mln)",
            "ReportCompanyStatusSKUMarketNetSalesValue"     : "Market Net Sales Value ($ mln)",

            "ReportCompanyStatusSKULostSalesVolumeDueToOOS"    : "Lost Sales Volume due to OOS (mln packs)",
            "ReportCompanyStatusSKUNumberOfOutOfStockEpisodes" : "Number of Out-of-stock Episodes",

            "ReportCompanyStatusSKUMarketSalesVolume"             : "Market Sales Volume (mln packs)",
            "ReportCompanyStatusSKURetailersPurchasesVolume"      : "Retailers Purchases Volume (mln packs)",
            "ReportCompanyStatusSKUShipmentsToWholesalers"        : "Shipments to Wholesalers (mln packs)",
            "ReportCompanyStatusSKUProductionVolume"              : "Production Volume (mln packs)",
            "ReportCompanyStatusSKUInventoryVolumeAtManufacturer" : "Inventory Volume At Manufacturer (mln packs)",
            "ReportCompanyStatusSKUInventoryVolumeAtWholesalers"  : "Inventory Volume At Wholesalers (mln packs)",
            "ReportCompanyStatusSKUInventoryVolumeAtRetailers"    : "Inventory Volume At Retailers (mln packs)",

            "ReportCompanyStatusSKUStocksCoverAtRetailers"   : "Stocks Cover At Retailers (weeks)",
            "ReportCompanyStatusSKUStocksCoverAtWholesalers" : "Stocks Cover At Wholesalers (weeks)",

            //Labels for Company Status Report - Brand Level
            "ReportCompanyStatusBrandMarketShareValue"           : "Market Share (value %)",
            "ReportCompanyStatusBrandMarketShareVolume"          : "Market Share (volume %)",
            "ReportCompanyStatusBrandMarketSalesVolumeStd"       : "Market Sales Volume (mln std. packs)",
            "ReportCompanyStatusBrandLostSalesVolumeDueToOOSStd" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportCompanyStatusBrandNumericalDistribution"      : "Numerical Distribution (%)",
            "ReportCompanyStatusBrandVolumeWeightedDistribution" : "Volume-weighted Distribution (%)",
            "ReportCompanyStatusBrandShelfSpace"                 : "Shelf Space (%)",
            "ReportCompanyStatusBrandAwareness"                  : "Awareness (%)",
            "ReportCompanyStatusBrandAverageNetMarketPrice"      : "Average Net Market Price ($/std. pack)",
            "ReportCompanyStatusBrandAverageDisplayPrice"        : "Average Display Price ($/std. pack)",
            "ReportCompanyStatusBrandPriceRankingIndex"          : "Price Ranking Index",
            "ReportCompanyStatusBrandValuePerception"            : "Value Perception",
            "ReportCompanyStatusBrandImagePerception"            : "Image Perception",
            "ReportCompanyStatusBrandIngredientsQualityIndex"    : "Ingredients Quality Index",
            "ReportCompanyStatusBrandAppliedTechnologyIndex"     : "Applied Technology Index",

            "ReportCompanyStatusBrandMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportCompanyStatusBrandConsumerPricePromotions" : "Consumer Price Promotions ($ mln)",
            "ReportCompanyStatusBrandMarketNetSalesValue"     : "Market Net Sales Value ($ mln)",

            "ReportCompanyStatusBrandLostSalesVolumeDueToOOS"    : "Lost Sales Volume due to OOS (mln packs)",
            "ReportCompanyStatusBrandNumberOfOutOfStockEpisodes" : "Number of Out-of-stock Episodes",

            "ReportCompanyStatusBrandMarketSalesVolume"             : "Market Sales Volume (mln packs)",
            "ReportCompanyStatusBrandRetailersPurchasesVolume"      : "Retailers Purchases Volume (mln packs)",
            "ReportCompanyStatusBrandShipmentsToWholesalers"        : "Shipments to Wholesalers (mln packs)",
            "ReportCompanyStatusBrandProductionVolume"              : "Production Volume (mln packs)",
            "ReportCompanyStatusBrandInventoryVolumeAtManufacturer" : "Inventory Volume At Manufacturer (mln packs)",
            "ReportCompanyStatusBrandInventoryVolumeAtWholesalers"  : "Inventory Volume At Wholesalers (mln packs)",
            "ReportCompanyStatusBrandInventoryVolumeAtRetailers"    : "Inventory Volume At Retailers (mln packs)",

            "ReportCompanyStatusBrandStocksCoverAtRetailers"   : "Stocks Cover At Retailers (weeks)",
            "ReportCompanyStatusBrandStocksCoverAtWholesalers" : "Stocks Cover At Wholesalers (weeks)",

            //Labels for Company Status Report - Global Level
            "ReportCompanyStatusGlobalMarketShareValue"           : "Market Share (value %)",
            "ReportCompanyStatusGlobalMarketShareVolume"          : "Market Share (volume %)",
            "ReportCompanyStatusGlobalMarketSalesVolumeStd"       : "Market Sales Volume (mln std. packs)",
            "ReportCompanyStatusGlobalLostSalesVolumeDueToOOSStd" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportCompanyStatusGlobalNumericalDistribution"      : "Numerical Distribution (%)",
            "ReportCompanyStatusGlobalVolumeWeightedDistribution" : "Volume-weighted Distribution (%)",
            "ReportCompanyStatusGlobalShelfSpace"                 : "Shelf Space (%)",
            "ReportCompanyStatusGlobalMindSpaceShare"             : "Mind Space Share (%)",
            "ReportCompanyStatusGlobalAverageNetMarketPrice"      : "Average Net Market Price ($/std. pack)",
            "ReportCompanyStatusGlobalAverageDisplayPrice"        : "Average Display Price ($/std. pack)",
            "ReportCompanyStatusGlobalIngredientsQualityIndex"    : "Ingredients Quality Index",
            "ReportCompanyStatusGlobalAppliedTechnologyIndex"     : "Applied Technology Index",

            "ReportCompanyStatusGlobalMarketSalesValue"	:	"Market Sales Value ($ mln)",
            "ReportCompanyStatusGlobalConsumerPricePromotions"	:	"Consumer Price Promotions ($ mln)",
            "ReportCompanyStatusGlobalMarketNetSalesValue"	:	"Market Net Sales Value ($ mln)",

            "ReportCompanyStatusGlobalLostSalesVolumeDueToOOS"	:	"Lost Sales Volume due to OOS (mln packs)",

            "ReportCompanyStatusGlobalMarketSalesVolume"	:	"Market Sales Volume (mln packs)",
            "ReportCompanyStatusGlobalRetailersPurchasesVolume"	:	"Retailers Purchases Volume (mln packs)",
            "ReportCompanyStatusGlobalShipmentsToWholesalers"	:	"Shipments to Wholesalers (mln packs)",
            "ReportCompanyStatusGlobalProductionVolume"	:	"Production Volume (mln packs)",
            "ReportCompanyStatusGlobalInventoryVolumeAtManufacturer"	:	"Inventory Volume At Manufacturer (mln packs)",
            "ReportCompanyStatusGlobalInventoryVolumeAtWholesalers"	:	"Inventory Volume At Wholesalers (mln packs)",
            "ReportCompanyStatusGlobalInventoryVolumeAtRetailers"	:	"Inventory Volume At Retailers (mln packs)",

            "ReportCompanyStatusGlobalStocksCoverAtRetailers"	:	"Stocks Cover At Retailers (weeks)",
            "ReportCompanyStatusGlobalStocksCoverAtWholesalers"	:	"Stocks Cover At Wholesalers (weeks)",

            //Labels for Financial Report - Brand Level
            "ReportFinancialReportBrandSalesValue"                           : "Sales Value ($ mln)",
            "ReportFinancialReportBrandChangeVersusPreviousPeriodSalesValue" : "(%) Change Versus Previous period",
            "ReportFinancialReportBrandShareInBrandTotalSalesValue"          : "Share In Brand Total Sales Value (%)",
            "ReportFinancialReportBrandCostOfGoodsSold"                      : "Cost of Goods Sold ($ mln)",
            "ReportFinancialReportBrandObsoleteGoodsCost"                    : "Obsolete Goods Cost ($ mln)",
            "ReportFinancialReportBrandDiscontinuedGoodsCost"                : "Discontinued Goods Cost ($ mln)",
            "ReportFinancialReportBrandInventoryHoldingCost"                 : "Inventory Holding Cost ($ mln)",
            "ReportFinancialReportBrandTotalMaterialCost"                    : "Total Material Cost ($ mln)",

            "ReportFinancialReportBrandGrossProfit"                           : "Gross Profit ($ mln)",
            "ReportFinancialReportBrandChangeVersusPreviousPeriodGrossProfit" : "(%) Change Versus Previous Period",
            "ReportFinancialReportBrandGrossProfitMargin"                     : "Gross Profit Margin (%)",
            "ReportFinancialReportBrandShareInBrandGrossProfitLosses"         : "Share In Brand Gross Profit/Losses (%)",

            "ReportFinancialReportBrandAdvertising"                                  : "Advertising ($ mln)",
            "ReportFinancialReportBrandConsumerPromotionCost"                        : "Consumer Promotion Cost ($ mln)",
            "ReportFinancialReportBrandTradeInvestment"                              : "Trade Investment ($ mln)",
            "ReportFinancialReportBrandSalesForceCost"                               : "Sales Force Cost ($ mln)",
            "ReportFinancialReportBrandAdditionalTradeMarginCost"                    : "Additional Trade Margin Cost ($ mln)",
            "ReportFinancialReportBrandVolumeDiscountCost"                           : "Volume Discount Cost ($ mln)",
            "ReportFinancialReportBrandTotalTradeAndMarketingExpenses"               : "Total Trade and Marketing Expenses ($ mln)",
            "ReportFinancialReportBrandTradeAndMarketingExpensesasaOfSales"          : "Trade and Marketing Expenses as a (%) of Sales",
            "ReportFinancialReportBrandShareOfTradeAndMarketingExpensesInBrandTotal" : "Share of Trade and Marketing Expenses in Brand Total (%)",

            "ReportFinancialReportBrandGeneralExpenses" : "General Expenses ($ mln)",
            "ReportFinancialReportBrandAmortisation"    : "Amortisation ($ mln)",

            "ReportFinancialReportBrandOperatingProfit"                           : "Operating Profit ($ mln)",
            "ReportFinancialReportBrandChangeVersusPreviousPeriodOperatingProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportBrandOperatingProfitMargin"                     : "Operating Profit Margin (%)",
            "ReportFinancialReportBrandShareInBrandOperatingProfitLoss"           : "Share in Brand Operating Profit/Loss (%)",

            "ReportFinancialReportBrandInterests"             : "Interests ($ mln)",
            "ReportFinancialReportBrandTaxes"                 : "Taxes ($ mln)",
            "ReportFinancialReportBrandExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",

            "ReportFinancialReportBrandNetProfit"                           : "Net Profit ($ mln)",
            "ReportFinancialReportBrandChangeVersusPreviousPeriodNetProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportBrandNetProfitMargin"                     : "Net Profit Margin (%)",
            "ReportFinancialReportBrandShareInBrandNetProfitLoss"           : "Share in Brand Net Profit/Loss (%)",

            "ReportFinancialReportBrandProductionCost" : "Production Cost ($ mln)",
            "ReportFinancialReportBrandInventoryValue" : "Inventory Value ($ mln)",

            //Labels for Financial Report - All Brands
            "ReportFinancialReportAllBrandSalesValue"                           : "Sales Value ($ mln)",
            "ReportFinancialReportAllBrandChangeVersusPreviousPeriodSalesValue" : "(%) Change Versus Previous period",
            "ReportFinancialReportAllBrandShareInCompanyTotalSalesValue"        : "Share In Company Total Sales Value (%)",
            "ReportFinancialReportAllBrandCostOfGoodsSold"                      : "Cost of Goods Sold ($ mln)",
            "ReportFinancialReportAllBrandObsoleteGoodsCost"                    : "Obsolete Goods Cost ($ mln)",
            "ReportFinancialReportAllBrandDiscontinuedGoodsCost"                : "Discontinued Goods Cost ($ mln)",
            "ReportFinancialReportAllBrandInventoryHoldingCost"                 : "Inventory Holding Cost ($ mln)",
            "ReportFinancialReportAllBrandTotalMaterialCost"                    : "Total Material Cost ($ mln)",

            "ReportFinancialReportAllBrandGrossProfit"                           : "Gross Profit ($ mln)",
            "ReportFinancialReportAllBrandChangeVersusPreviousperiodGrossProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportAllBrandGrossProfitMargin"                     : "Gross Profit Margin (%)",
            "ReportFinancialReportAllBrandShareInCompanyGrossProfitLosses"       : "Share In Company Gross Profit/Losses (%)",

            "ReportFinancialReportAllBrandAdvertising"                                  : "Advertising ($ mln)",
            "ReportFinancialReportAllBrandConsumerPromotionCost"                        : "Consumer Promotion Cost ($ mln)",
            "ReportFinancialReportAllBrandTradeInvestment"                              : "Trade Investment ($ mln)",
            "ReportFinancialReportAllBrandSalesForceCost"                               : "Sales Force Cost ($ mln)",
            "ReportFinancialReportAllBrandAdditionalTradeMarginCost"                    : "Additional Trade Margin Cost ($ mln)",
            "ReportFinancialReportAllBrandVolumeDiscountCost"                           : "Volume Discount Cost ($ mln)",
            "ReportFinancialReportAllBrandTotalTradeAndMarketingExpenses"               : "Total Trade and Marketing Expenses ($ mln)",
            "ReportFinancialReportAllBrandTradeAndMarketingExpensesasaOfSales"          : "Trade and Marketing Expenses as a (%) of Sales",
            "ReportFinancialReportAllBrandShareOfTradeAndMarketingExpensesInBrandTotal" : "Share of Trade and Marketing Expenses in Company Total (%)",

            "ReportFinancialReportAllBrandGeneralExpenses" : "General Expenses ($ mln)",
            "ReportFinancialReportAllBrandAmortisation"    : "Amortisation ($ mln)",

            "ReportFinancialReportAllBrandOperatingProfit"                           : "Operating Profit ($ mln)",
            "ReportFinancialReportAllBrandChangeVersusPreviousPeriodOperatingProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportAllBrandOperatingProfitMargin"                     : "Operating Profit Margin (%)",
            "ReportFinancialReportAllBrandShareInBrandOperatingProfitLoss"           : "Share in Company Operating Profit/Loss (%)",

            "ReportFinancialReportAllBrandInterests"             : "Interests ($ mln)",
            "ReportFinancialReportAllBrandTaxes"                 : "Taxes ($ mln)",
            "ReportFinancialReportAllBrandExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",

            "ReportFinancialReportAllBrandNetProfit"                           : "Net Profit ($ mln)",
            "ReportFinancialReportAllBrandChangeVersusPreviousPeriodNetProfit" : "(%) Change Versus Previous period",
            "ReportFinancialReportAllBrandNetProfitMargin"                     : "Net Profit Margin (%)",
            "ReportFinancialReportAllBrandShareInCompanyNetProfitLoss"     : "Share in Company Net Profit/Loss (%)",

            "ReportFinancialReportAllBrandProductionCost" : "Production Cost ($ mln)",
            "ReportFinancialReportAllBrandInventoryValue" : "Inventory Value ($ mln)",

            //Labels for Inventory Report
            "ReportInventoryReportLabelCloseToExpireInventory" : "Close to Expire Inventory",
    //        "ReportInventoryReportLabelPreviousInventory"      : "Previous Inventory",
            "ReportInventoryReportLabelPreviousInventory"      : "Close to Expire Inventory",
            "ReportInventoryReportLabelFreshInventory"         : "Fresh Inventory",
            "ReportInventoryReportTableLabelX"                 : "Total Stock (millions of standard pack) = Factory Stock + Trade Stock + Retailer Stock",
            "ReportInventoryReportTableLabelY"                 : "Million Units",


            //Labels for Profitability Evolution - SKU Level
            "ReportProfitabilityEvolutionSKUQuarter" : "Quarter",

            "ReportProfitabilityEvolutionSKUManufacturerSalesValue" : "Manufacturer Sales Value ($ mln)",

            "ReportProfitabilityEvolutionSKUCostOfGoodsSold"       : "Cost of Goods Sold ($ mln)",
            "ReportProfitabilityEvolutionSKUInventoryHolding"      : "Inventory Holding ($ mln)",
            "ReportProfitabilityEvolutionSKUObsoleteGoods"         : "Obsolete Goods ($ mln)",
            "ReportProfitabilityEvolutionSKUDiscontinuedGoodsCost" : "Discontinued Goods Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUGrossProfit"           : "Gross Profit ($ mln)",

            "ReportProfitabilityEvolutionSKUAdvertising"                    : "Advertising ($ mln)",
            "ReportProfitabilityEvolutionSKUConsumerPromotionsCost"         : "Consumer Promotions Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUTradeInvestment"                : "Trade Investment ($ mln)",
            "ReportProfitabilityEvolutionSKUSalesForceCost"                 : "Sales Force Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUVolumeDiscountCost"             : "Volume Discount Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUAdditionalTradeMarginCost"      : "Additional Trade Margin Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUTotalTradeAndMarketingExpenses" : "Total Trade and Marketing Expenses ($ mln)",

            "ReportProfitabilityEvolutionSKUGeneralExpenses" : "General Expenses ($ mln)",
            "ReportProfitabilityEvolutionSKUAmortisation"    : "Amortisation ($ mln)",
            "ReportProfitabilityEvolutionSKUOperatingProfit" : "Operating Profit ($ mln)",

            "ReportProfitabilityEvolutionSKUInterests"             : "Interests ($ mln)",
            "ReportProfitabilityEvolutionSKUExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",
            "ReportProfitabilityEvolutionSKUTaxes"                 : "Taxes ($ mln)",
            "ReportProfitabilityEvolutionSKUNetProfit"             : "Net Profit ($ mln)",

            "ReportProfitabilityEvolutionSKUSurchargeForSupplementaryInvestmentBudget"	:	"Surcharge for supplementary InvestmentBudget ($ mln)",
            "ReportProfitabilityEvolutionSKUNetResult"	:	"Net Result ($ mln)",

            "ReportProfitabilityEvolutionSKUShareInBrandTotalSalesValue"                  : "Share In Brand Total Sales Value (%)",
            "ReportProfitabilityEvolutionSKUShareInBrandGrossProfitLosses"                : "Share In Brand Gross Profit/Losses (%)",
            "ReportProfitabilityEvolutionSKUShareOfTradeAndMarketingExpensesInBrandTotal" : "Share of Trade and Marketing Expenses In Brand Total (%)",
            "ReportProfitabilityEvolutionSKUShareInBrandOperatingProfitLosses"            : "Share In Brand Operating Profit/Losses (%)",
            "ReportProfitabilityEvolutionSKUShareInBrandNetProfitLosses"                  : "Share In Brand Net Profit/Losses (%)",

            "ReportProfitabilityEvolutionSKUGrossProfitMargin"                   : "Gross Profit Margin (%)",
            "ReportProfitabilityEvolutionSKUTradeAndMarketingExpensesasaOfSales" : "Trade and Marketing Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionSKUGeneralExpensesasaOfSales"           : "General Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionSKUOperatingProfitMargin"               : "Operating Profit Margin (%)",
            "ReportProfitabilityEvolutionSKUNetProfitMargin"                     : "Net Profit Margin (%)",

            "ReportProfitabilityEvolutionSKUReturnOnInvestment" : "Return on Investment (%)",

            "ReportProfitabilityEvolutionSKUAverageNetMarketPrice"             : "Average Net Market Price ($/pack)",
            "ReportProfitabilityEvolutionSKUAverageWholesalesPrice"            : "Average Wholesales Price ($/pack)",
            "ReportProfitabilityEvolutionSKUAverageManufacturerPrice"          : "Average Manufacturer Price ($/pack)",
            "ReportProfitabilityEvolutionSKUAverageProductionCost"             : "Average Production Cost ($/pack)",
            "ReportProfitabilityEvolutionSKUMarketSalesValue"                  : "Market Sales Value ($ mln)",
            "ReportProfitabilityEvolutionSKUConsumerPricePromotions"           : "Consumer Price Promotions ($ mln)",
            "ReportProfitabilityEvolutionSKUMarketNetSalesValue"               : "Market Net Sales Value ($ mln)",
            "ReportProfitabilityEvolutionSKUAdditionalRetailersMargin"         : "Additional Retailers Margin (%)",
            "ReportProfitabilityEvolutionSKUWholesalersBonusRate"              : "Wholesalers Bonus Rate (%)",
            "ReportProfitabilityEvolutionSKUMinimalPurchaseQualifyingForBonus" : "Minimal Purchase Qualifying for Bonus (mln std. packs)",
            "ReportProfitabilityEvolutionSKUProductionCost"                    : "Production Cost ($ mln)",
            "ReportProfitabilityEvolutionSKUInventoryValue"                    : "Inventory Value ($ mln)",

            //Labels for Profitability Evolution - Brand Level
            "ReportProfitabilityEvolutionBrandManufacturerSalesValue" : "Manufacturer Sales Value ($ mln)",

            "ReportProfitabilityEvolutionBrandCostOfGoodsSold"       : "Cost of Goods Sold ($ mln)",
            "ReportProfitabilityEvolutionBrandInventoryHolding"      : "Inventory Holding ($ mln)",
            "ReportProfitabilityEvolutionBrandObsoleteGoods"         : "Obsolete Goods ($ mln)",
            "ReportProfitabilityEvolutionBrandDiscontinuedGoodsCost" : "Discontinued Goods Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandGrossProfit"           : "Gross Profit ($ mln)",

            "ReportProfitabilityEvolutionBrandAdvertising"                    : "Advertising ($ mln)",
            "ReportProfitabilityEvolutionBrandConsumerPromotionsCost"         : "Consumer Promotions Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandTradeInvestment"                : "Trade Investment ($ mln)",
            "ReportProfitabilityEvolutionBrandSalesForceCost"                 : "Sales Force Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandVolumeDiscountCost"             : "Volume Discount Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandAdditionalTradeMarginCost"      : "Additional Trade Margin Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandTotalTradeAndMarketingExpenses" : "Total Trade and Marketing Expenses ($ mln)",

            "ReportProfitabilityEvolutionBrandGeneralExpenses" : "General Expenses ($ mln)",
            "ReportProfitabilityEvolutionBrandAmortisation"    : "Amortisation ($ mln)",
            "ReportProfitabilityEvolutionBrandOperatingProfit" : "Operating Profit ($ mln)",

            "ReportProfitabilityEvolutionBrandInterests"             : "Interests ($ mln)",
            "ReportProfitabilityEvolutionBrandExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",
            "ReportProfitabilityEvolutionBrandTaxes"                 : "Taxes ($ mln)",
            "ReportProfitabilityEvolutionBrandNetProfit"             : "Net Profit ($ mln)",

            "ReportProfitabilityEvolutionBrandSurchargeForSupplementaryInvestmentBudget" : "Surcharge for supplementary InvestmentBudget ($ mln)",
            "ReportProfitabilityEvolutionBrandNetResult"                                 : "Net Result ($ mln)",

            "ReportProfitabilityEvolutionBrandShareInCompanyTotalSalesValue"                  : "Share In Company Total Sales Value (%)",
            "ReportProfitabilityEvolutionBrandShareInCompanyGrossProfitLosses"                : "Share In Company Gross Profit/Losses (%)",
            "ReportProfitabilityEvolutionBrandShareOfTradeAndMarketingExpensesInCompanyTotal" : "Share of Trade and Marketing Expenses In Company Total (%)",
            "ReportProfitabilityEvolutionBrandShareInCompanyOperatingProfitLosses"            : "Share In Company Operating Profit/Losses (%)",
            "ReportProfitabilityEvolutionBrandShareInCompanyNetProfitLosses"                  : "Share In Company Net Profit/Losses (%)",

            "ReportProfitabilityEvolutionBrandGrossProfitMargin"                   : "Gross Profit Margin (%)",
            "ReportProfitabilityEvolutionBrandTradeAndMarketingExpensesasaOfSales" : "Trade and Marketing Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionBrandGeneralExpensesasaOfSales"           : "General Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionBrandOperatingProfitMargin"               : "Operating Profit Margin (%)",
            "ReportProfitabilityEvolutionBrandNetProfitMargin"                     : "Net Profit Margin (%)",

            "ReportProfitabilityEvolutionBrandReturnOnInvestment" : "Return on Investment (%)",

            "ReportProfitabilityEvolutionBrandAverageNetMarketPrice"    : "Average Net Market Price ($/pack)",
            "ReportProfitabilityEvolutionBrandAverageWholesalesPrice"   : "Average Wholesales Price ($/pack)",
            "ReportProfitabilityEvolutionBrandAverageManufacturerPrice" : "Average Manufacturer Price ($/pack)",
            "ReportProfitabilityEvolutionBrandAverageProductionCost"    : "Average Production Cost ($/pack)",

            "ReportProfitabilityEvolutionBrandMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportProfitabilityEvolutionBrandConsumerPricePromotions" : "Consumer Price Promotions ($ mln)",
            "ReportProfitabilityEvolutionBrandMarketNetSalesValue"     : "Market Net Sales Value ($ mln)",

            "ReportProfitabilityEvolutionBrandProductionCost"                    : "Production Cost ($ mln)",
            "ReportProfitabilityEvolutionBrandInventoryValue"                    : "Inventory Value ($ mln)",


            //Labels for Profitability Evolution - Global Level
            "ReportProfitabilityEvolutionGlobalManufacturerSalesValue" : "Manufacturer Sales Value ($ mln)",
            "ReportProfitabilityEvolutionGlobalCostOfGoodsSold"        : "Cost of Goods Sold ($ mln)",
            "ReportProfitabilityEvolutionGlobalInventoryHolding"       : "Inventory Holding ($ mln)",
            "ReportProfitabilityEvolutionGlobalObsoleteGoods"          : "Obsolete Goods ($ mln)",
            "ReportProfitabilityEvolutionGlobalDiscontinuedGoodsCost"  : "Discontinued Goods Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalGrossProfit"            : "Gross Profit ($ mln)",

            "ReportProfitabilityEvolutionGlobalAdvertising"                    : "Advertising ($ mln)",
            "ReportProfitabilityEvolutionGlobalConsumerPromotionsCost"         : "Consumer Promotions Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalTradeInvestment"                : "Trade Investment ($ mln)",
            "ReportProfitabilityEvolutionGlobalSalesForceCost"                 : "Sales Force Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalVolumeDiscountCost"             : "Volume Discount Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalAdditionalTradeMarginCost"      : "Additional Trade Margin Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalTotalTradeAndMarketingExpenses" : "Total Trade and Marketing Expenses ($ mln)",

            "ReportProfitabilityEvolutionGlobalOverhead"                                 : "Overhead ($ mln)",
            "ReportProfitabilityEvolutionGlobalInvestmentToImproveTechnologyLevel"       : "Investment to Improve Technology Level ($ mln)",
            "ReportProfitabilityEvolutionGlobalInvestmentToIncreaseProductionEfficiency" : "Investment to Increase Production Efficiency ($ mln)",

            "ReportProfitabilityEvolutionGlobalProductionCapacityDisposalCost" : "Production Capacity Disposal Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalOvertimeShiftsCost"             : "Overtime Shifts Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalTotalGeneralExpenses"           : "Total General Expenses ($ mln)",
            "ReportProfitabilityEvolutionGlobalAmortisation"                   : "Amortisation ($ mln)",
            "ReportProfitabilityEvolutionGlobalOperatingProfit"                : "Operating Profit ($ mln)",

            "ReportProfitabilityEvolutionGlobalInterests"             : "Interests ($ mln)",
            "ReportProfitabilityEvolutionGlobalExceptionalCostProfit" : "Exceptional Cost/Profit ($ mln)",
            "ReportProfitabilityEvolutionGlobalTaxes"                 : "Taxes ($ mln)",
            "ReportProfitabilityEvolutionGlobalNetProfit"             : "Net Profit ($ mln)",

            "ReportProfitabilityEvolutionGlobalSurchargeForSupplementaryInvestmentBudget" : "Surcharge for supplementary InvestmentBudget ($ mln)",
            "ReportProfitabilityEvolutionGlobalNetResult"                                 : "Net Result ($ mln)",

            "ReportProfitabilityEvolutionGlobalGrossProfitMargin"                   : "Gross Profit Margin (%)",
            "ReportProfitabilityEvolutionGlobalTradeAndMarketingExpensesasaOfSales" : "Trade and Marketing Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionGlobalGeneralExpensesasaOfSales"           : "General Expenses as a(%) of Sales",
            "ReportProfitabilityEvolutionGlobalOperatingProfitMargin"               : "Operating Profit Margin (%)",
            "ReportProfitabilityEvolutionGlobalNetProfitMargin"                     : "Net Profit Margin (%)",

            "ReportProfitabilityEvolutionGlobalReturnOnInvestment" : "Return on Investment (%)",

            "ReportProfitabilityEvolutionGlobalAverageNetMarketPrice"    : "Average Net Market Price ($/pack)",
            "ReportProfitabilityEvolutionGlobalAverageWholesalesPrice"   : "Average Wholesales Price ($/pack)",
            "ReportProfitabilityEvolutionGlobalAverageManufacturerPrice" : "Average Manufacturer Price ($/pack)",
            "ReportProfitabilityEvolutionGlobalAverageProductionCost"    : "Average Production Cost ($/pack)",

            "ReportProfitabilityEvolutionGlobalMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportProfitabilityEvolutionGlobalConsumerPricePromotions" : "Consumer Price Promotions ($ mln)",
            "ReportProfitabilityEvolutionGlobalMarketNetSalesValue"     : "Market Net Sales Value ($ mln)",

            "ReportProfitabilityEvolutionGlobalProductionCost" : "Production Cost ($ mln)",
            "ReportProfitabilityEvolutionGlobalInventoryValue" : "Inventory Value ($ mln)",

            "ReportProfitabilityEvolutionGlobalCapacityUtilisationRate"         : "Capacity Utilisation Rate (%)",
            "ReportProfitabilityEvolutionGlobalChangeInProductionCapacity"      : "Change In Production Capacity (mln std. packs)",
            "ReportProfitabilityEvolutionGlobalNextPeriodAvailableProdCapacity" : "Next Period Available Prod. Capacity (mln std. packs)",

            "ReportProfitabilityEvolutionGlobalAvailableTechnologyLevel"                             : "Available Technology Level",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseTechnologyLevelBy1Step"  : "Extra Budget Required to Increase Technology Level by 1 Step",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseTechnologyLevelBy2Steps" : "Extra Budget Required to Increase Technology Level by 2 Steps",

            "ReportProfitabilityEvolutionGlobalAcquiredProductionAndLogisticsEfficiency"         : "Acquired Production and Logistics Efficiency (%)",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseEfficiencyBy2points" : "Extra Budget Required to Increase Efficiency by 2% points",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseEfficiencyBy5points" : "Extra Budget Required to Increase Efficiency by 5% points",

            "ReportProfitabilityEvolutionGlobalAcquiredProductionPlanningFlexibility"             : "Acquired Production Planning Flexibility (%)",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseFlexibilityBy2points" : "Extra Budget Required to Increase Flexibility by 2% points",
            "ReportProfitabilityEvolutionGlobalExtraBudgetRequiredToIncreaseFlexibilityBy5points" : "Extra Budget Required to Increase Flexibility by 5% points",

            //Labels for Market Share
            "ReportMarketShareChartTitleMarketShareInValue"  : "Market Share in Value (%)",
            "ReportMarketShareChartTitleMarketShareInVolume" : "Market Share in Volume (%)",
            "ReportMarketShareChartTitleMindSpaceShare"      : "Mind Space Share (%)",
            "ReportMarketShareChartTitleShelfSpaceShare"     : "Shelf Space Share (%)",

            //Labels for Competitor Intelligence
            "ReportCompetitorIntelligenceTableTitleTechnology"                               : "Technology",
            "ReportCompetitorIntelligenceTechnologyAcquiredProductionAndLogisticsEfficiency" : "Acquired Production and Logistics Efficiency (%)",
            "ReportCompetitorIntelligenceTechnologyAcquiredProductionPlanningFlexibility"    : "Acquired Production Planning Flexibility (%)",
            "ReportCompetitorIntelligenceTechnologyAvailableTechnologyLevel"                 : "Available Technology Level",

            "ReportCompetitorIntelligenceTableTitleMarketingSales"                : "Marketing & Sales",
            "ReportCompetitorIntelligenceMarketingSalesAdditionalTradeMarginCost" : "Additional Trade Margin Cost ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesAdvertising"               : "Advertising ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesConsumerPromotionsCost"    : "Consumer Promotions Cost ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesRetailerPurchaseVolume"    : "Retailers Purchase Volume (mln std. packs)",
            "ReportCompetitorIntelligenceMarketingSalesSalesForceCost"            : "Sales Force Cost ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesShipmentToWholesalers"     : "Shipments to Wholesalers (mln std. packs)",
            "ReportCompetitorIntelligenceMarketingSalesTradeInvestments"          : "Trade Investments ($ mln)",
            "ReportCompetitorIntelligenceMarketingSalesVolumeDiscountCost"        : "Volume Discount Cost ($ mln)",

            "ReportCompetitorIntelligenceTableTitleOperations"                      : "Operations",
            "ReportCompetitorIntelligenceOperationsCapacityUtilisationRate"         : "Capacity Utilisation Rate (%)",
            "ReportCompetitorIntelligenceOperationsInventoryVolumeAtManufacturer"   : "Inventory Volume at Manufacturer (mln std. packs)",
            "ReportCompetitorIntelligenceOperationsInventoryVolumeAtRetailers"      : "Inventory Volume at Retailers (mln std. packs)",
            "ReportCompetitorIntelligenceOperationsInventoryVolumeAtWholesalers"    : "Inventory Volume at Wholesalers (mln std. packs)",
            "ReportCompetitorIntelligenceOperationsNextPeriodAvailableProdCapacity" : "Next Period Available Prod.Capacity (mln std. packs)",
            "ReportCompetitorIntelligenceOperationsProductionVolume"                : "Production Volume (mln std. packs)",

            "ReportCompetitorIntelligenceTableTitleInvestments"                               : "Investments",
            "ReportCompetitorIntelligenceInvestmentsInvestmentToImproveTechnologyLevel"       : "Investment to Improve Technology Level ($ mln)",
            "ReportCompetitorIntelligenceInvestmentsInvestmentToIncreaseProductionEfficiency" : "Investment to Increase Production Efficiency ($ mln)",

            //Labels for Investments and Profits
            "ReportInvestmentsAndProfitsChartTitleTotalInvestment"        : "Total Investment ($ mln)",
            "ReportInvestmentsAndProfitsChartTitleNetProfitByCompanies"   : "Net Profit By Companies ($ mln)",
            "ReportInvestmentsAndProfitsChartTitleReturnOnInvestment"     : "Return on Investment (%)",
            "ReportInvestmentsAndProfitsChartTitleInvestmentVersusBudget" : "Investment Versus Budget (%)",

            //Labels for Market Sales and Inventory
            "ReportMarketSalesAndInventoryChartTitleMarketSalesValue"        : "Market Sales Value ($ mln)",
            "ReportMarketSalesAndInventoryChartTitleMarketSalesVolume"       : "Market Sales Volume (mln std. packs)",
            "ReportMarketSalesAndInventoryChartTitleTotalInventoryAtFactory" : "Total Inventory at Factory (mln std. packs)",
            "ReportMarketSalesAndInventoryChartTitleTotalInventoryAtTrade"   : "Total Inventory at Trade (mln std. packs)",
            "ReportMarketSalesAndInventoryChartBottomTextPeriod"   : "Period",

            //Labels for Segment Leader Top 5
            "ReportSegmentLeaderTop5ChartTitlePriceSensitive" : "1. Price Sensitive (%)",
            "ReportSegmentLeaderTop5ChartTitlePretenders"     : "2. Pretenders (%)",
            "ReportSegmentLeaderTop5ChartTitleModerate"       : "3. Moderate (%)",
            "ReportSegmentLeaderTop5ChartTitleGoodLife"       : "4. Good Life (%)",
            "ReportSegmentLeaderTop5ChartTitleUltimate"       : "5. Ultimate (%)",
            "ReportSegmentLeaderTop5ChartTitlePragmatic"      : "6. Pragmatic (%)",

            //Labels for Perception Map
            "ReportPerceptionMapAxisLabelSegment"         : "Segment",
            "ReportPerceptionMapAxisTitleValuePerception" : "Value Perception",
            "ReportPerceptionMapAxisTitleImagePerception" : "Image Perception",
            "ReportPerceptionMapHoverTooltipMarketShareValue" : "Market Share (Value %)",
            "ReportPerceptionMapHoverTooltipAverageDisplayPrice" : "Average Display Price",
            "ReportPerceptionMapHoverTooltipAppliedTechnologyIndex" : "Applied Technology Index",
            "ReportPerceptionMapHoverTooltipIngredientsQualityIndex" : "Ingredients Quality Index",
            "ReportPerceptionMapHoverTooltipAwareness" : "Awareness (%)",
            "ReportPerceptionMapHoverTooltipShelfSpace" : "Shelf Space (%)",
            "ReportPerceptionMapHoverTooltipValuePerceptionChange" : "Value Perception Change",
            "ReportPerceptionMapHoverTooltipImagePerceptionChange" : "Image Perception Change",

            //Labels for Segment Distributions
            "ReportSegmentDistributionsTableTitleMarketShareValue"      : "Market Share (value %)",
            "ReportSegmentDistributionsTableTitleMarketShareVolume"     : "Market Share (volume %)",
            "ReportSegmentDistributionsTableTitleMarketSalesValue"      : "Market Sales Value ($ mln)",
            "ReportSegmentDistributionsTableTitleMarketSalesVolume"     : "Market Sales Volume (mln std. packs)",
            "ReportSegmentDistributionsTableTitleAverageNetMarketPrice" : "Average Net Market Price ($/std. pack)",
            "ReportSegmentDistributionsTableTitleValuePerception"       : "Value Perception",
            "ReportSegmentDistributionsTableTitleImagePerception"       : "Image Perception",

            //Labels for Market Evolution
            "ReportMarketEvolutionChartTitleGrowthRateInVolume"             : "Growth Rate In Volume (Period -3 = 100)",
            "ReportMarketEvolutionChartTitleGrowthRateInValue"              : "Growth Rate In Value (Period -3 = 100)",
            "ReportMarketEvolutionChartTitleNetMarketPrice"                 : "Net Market Price (Period -3 = 100)",
            "ReportMarketEvolutionChartTitleSegmentValueShareInTotalMarket" : "Segment Value Share In Total Market (%)",

            //Labels for Market Trends - SKU Level
            "ReportMarketTrendsSKUTableTitleMarketFigures"            : "Market Figures", //Market Figures
            "ReportMarketTrendsSKUMarketFiguresAverageDisplayPrice"   : "Average Display Price ($/std. pack)",
            "ReportMarketTrendsSKUMarketFiguresAverageNetMarketPrice" : "Average Net Market Price ($/std. pack)",
            "ReportMarketTrendsSKUMarketFiguresBrandAwareness"        : "Brand Awareness (%)",
            "ReportMarketTrendsSKUMarketFiguresImagePerception"       : "Image Perception",
            "ReportMarketTrendsSKUMarketFiguresMarketNetSalesValue"   : "Market Net Sales Value ($ mln)",
            "ReportMarketTrendsSKUMarketFiguresMarketNetSalesVolume"  : "Market Net Sales Volume (mln std. packs)",
            "ReportMarketTrendsSKUMarketFiguresMarketShareValue"      : "Market Share (value %)",
            "ReportMarketTrendsSKUMarketFiguresMarketShareVolume"     : "Market Share (volume %)",

            "ReportMarketTrendsSKUTableTitleMiscellaneous"              : "Miscellaneous",		//Miscellaneous
            "ReportMarketTrendsSKUMiscellaneousLostSalesVolumeduetoOOS" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportMarketTrendsSKUMiscellaneousNumericalDistribution"   : "Numerical Distribution (%)",
            "ReportMarketTrendsSKUMiscellaneousTotalInventoryAtTrade"   : "Total Inventory at Trade (mln std. packs)",
            "ReportMarketTrendsSKUMiscellaneousPriceRankingIndex"       : "Price Ranking Index",
            "ReportMarketTrendsSKUMiscellaneousShelfSpace"              : "Shelf Space (%)",

            "ReportMarketTrendsSKUTableTitleSegmentWiseValueShare"                      : "Value Share by Segment",		//Segment-wise Value Share
            "ReportMarketTrendsSKUSegmentWiseValueShareValueSharePriceSensitiveSegment" : "Value Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueSharePretendersSegment"     : "Value Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueShareModerateSegment"       : "Value Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueShareGoodLifeSegment"       : "Value Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueShareUltimateSegment"       : "Value Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsSKUSegmentWiseValueShareValueSharePragmaticSegment"      : "Value Share (%) in 6. Pragmatic Segment",

            "ReportMarketTrendsSKUTableTitleSegmentWiseVolumeShare"                       : "Volume Share by Segment",	//Segment-wise Volume Share
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeSharePriceSensitiveSegment" : "Volume Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeSharePretendersSegment"     : "Volume Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeShareModerateSegment"       : "Volume Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeShareGoodLifeSegment"       : "Volume Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeShareUltimateSegment"       : "Volume Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeSharePragmaticSegment"      : "Volume Share (%) in 6. Pragmatic Segment",
            "ReportMarketTrendsSKUSegmentWiseVolumeShareVolumeWeightedDistribution"       : "Volume-weighted Distribution (%)",

            //Labels for Market Trends - Brand Level
            "ReportMarketTrendsBrandMarketFiguresAverageDisplayPrice"   : "Average Display Price ($/std. pack)",
            "ReportMarketTrendsBrandMarketFiguresAverageNetMarketPrice" : "Average Net Market Price ($/std. pack)",
            "ReportMarketTrendsBrandMarketFiguresBrandAwareness"        : "Brand Awareness (%)",
            "ReportMarketTrendsBrandMarketFiguresImagePerception"       : "Image Perception",
            "ReportMarketTrendsBrandMarketFiguresMarketNetSalesValue"   : "Market Net Sales Value ($ mln)",
            "ReportMarketTrendsBrandMarketFiguresMarketNetSalesVolume"  : "Market Net Sales Volume (mln std. packs)",
            "ReportMarketTrendsBrandMarketFiguresMarketShareValue"      : "Market Share (value %)",
            "ReportMarketTrendsBrandMarketFiguresMarketShareVolume"     : "Market Share (volume %)",

            "ReportMarketTrendsBrandMiscellaneousLostSalesVolumeduetoOOS" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportMarketTrendsBrandMiscellaneousNumericalDistribution"   : "Numerical Distribution (%)",
            "ReportMarketTrendsBrandMiscellaneousTotalInventoryAtTrade"   : "Total Inventory at Trade (mln std. packs)",
            "ReportMarketTrendsBrandMiscellaneousPriceRankingIndex"       : "Price Ranking Index",
            "ReportMarketTrendsBrandMiscellaneousShelfSpace"              : "Shelf Space (%)",

            "ReportMarketTrendsBrandSegmentWiseValueShareValueSharePriceSensitiveSegment" : "Value Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueSharePretendersSegment"     : "Value Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueShareModerateSegment"       : "Value Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueShareGoodLifeSegment"       : "Value Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueShareUltimateSegment"       : "Value Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsBrandSegmentWiseValueShareValueSharePragmaticSegment"      : "Value Share (%) in 6. Pragmatic Segment",

            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeSharePriceSensitiveSegment" : "Volume Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeSharePretendersSegment"     : "Volume Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeShareModerateSegment"       : "Volume Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeShareGoodLifeSegment"       : "Volume Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeShareUltimateSegment"       : "Volume Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeSharePragmaticSegment"      : "Volume Share (%) in 6. Pragmatic Segment",
            "ReportMarketTrendsBrandSegmentWiseVolumeShareVolumeWeightedDistribution"       : "Volume-weighted Distribution (%)",

            //Labels for Market Trends - Global Level
            "ReportMarketTrendsGlobalMarketFiguresAverageNetMarketPrice" : "Average Net Market Price ($/std. pack)",
            "ReportMarketTrendsGlobalMarketFiguresMarketNetSalesValue"   : "Market Net Sales Value ($ mln)",
            "ReportMarketTrendsGlobalMarketFiguresMarketNetSalesVolume"  : "Market Net Sales Volume (mln std. packs)",
            "ReportMarketTrendsGlobalMarketFiguresMarketShareValue"      : "Market Share (value %)",
            "ReportMarketTrendsGlobalMarketFiguresMarketShareVolume"     : "Market Share (volume %)",

            "ReportMarketTrendsGlobalMiscellaneousLostSalesVolumeduetoOOS" : "Lost Sales Volume due to OOS (mln std. packs)",
            "ReportMarketTrendsGlobalMiscellaneousNumericalDistribution"   : "Numerical Distribution (%)",
            "ReportMarketTrendsGlobalMiscellaneousTotalInventoryAtTrade"   : "Total Inventory at Trade (mln std. packs)",
            "ReportMarketTrendsGlobalMiscellaneousPriceRankingIndex"       : "Price Ranking Index",
            "ReportMarketTrendsGlobalMiscellaneousShelfSpace"              : "Shelf Space (%)",

            "ReportMarketTrendsGlobalSegmentWiseValueShareValueSharePriceSensitiveSegment" : "Value Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueSharePretendersSegment"     : "Value Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueShareModerateSegment"       : "Value Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueShareGoodLifeSegment"       : "Value Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueShareUltimateSegment"       : "Value Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsGlobalSegmentWiseValueShareValueSharePragmaticSegment"      : "Value Share (%) in 6. Pragmatic Segment",

            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeSharePriceSensitiveSegment" : "Volume Share (%) in 1. Price Sensitive Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeSharePretendersSegment"     : "Volume Share (%) in 2. Pretenders Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeShareModerateSegment"       : "Volume Share (%) in 3. Moderate Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeShareGoodLifeSegment"       : "Volume Share (%) in 4. Good Life Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeShareUltimateSegment"       : "Volume Share (%) in 5. Ultimate Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeSharePragmaticSegment"      : "Volume Share (%) in 6. Pragmatic Segment",
            "ReportMarketTrendsGlobalSegmentWiseVolumeShareVolumeWeightedDistribution"       : "Volume-weighted Distribution (%)",

            //Labels for Market Indicator
            "ReportMarketIndicatorCorporateTaxRate"	:	"Corporate Tax Rate",
            "ReportMarketIndicatorInflationRate"	:	"Inflation Rate",
            "ReportMarketIndicatorDepositRate"	:	"Deposit Rate",
            "ReportMarketIndicatorBorrowingRate"	:	"Borrowing Rate",
            "ReportMarketIndicatorAdditionalInvestmentBudgetSurchargeRate"	:	"Additional Investment Budget Surcharge Rate",
            "ReportMarketIndicatorInventoryHoldingCost"	:	"Inventory Holding Cost (as a % of inventory value)",
            "ReportMarketIndicatorObsoleteGoodsCost"	:	"Obsolete Goods Cost (as a % of purchase cost)",
            "ReportMarketIndicatorDiscontinuedGoodsCost"	:	"Discontinued Goods Cost (as a % of purchase cost)",



            //Labels for Items on Decision Page - Second Menu Bar

            "DecisionPageSecondMenuBarLabelsTotalAvailableBudget" : "Budget Disponible",
            "DecisionPageSecondMenuBarLabelsNormalCapacity"       : "Normal Capacity Left",
            "DecisionPageSecondMenuBarLabelsOvertimeCapacity"     : "Overtime Capacity Left",
            "DecisionPageSecondMenuBarLabelsAdditionalBudget"     : "Budget Supplémentaire",


            //Labels for Items on Decision Page - DecisionTab
            "DecisionPageDecisionTabMAKEDECISIONS"     : "Prendre des Décisions",
            "DecisionPageDecisionTabMission"           : "Market Share + Profit",
            "DecisionPageDecisionTabAddNewBrand"       : "Add New Brand",
            "DecisionPageDecisionTabSalesForce"        : "Sales Force ($ mln)",
            "DecisionPageDecisionTabAddNewSKU"         : "Add New SKU",
            "DecisionPageDecisionTabName"              : "SKU Name",
            "DecisionPageDecisionTabLabelBrandName"    : "Brand Name :",
            "DecisionPageDecisionTabLabelFirstSKUName" : "First SKU Name :",
            "DecisionPageDecisionTabLabelSKUName"      : "SKU Name :",

            //Labels for Items on Decision Page - DecisionTab
            "DecisionPageDecisionTabFinance"     : "Finances",
            "DecisionPageDecisionTabProduction"     : "Production",
            "DecisionPageDecisionTabForecast"     : "Prévisions de Ventes",
            "DecisionPageDecisionTabCheckList"     : "Check List",
            "DecisionPageDecisionTabMarketing"     : "Marketing",
            "DecisionPageDecisionTabBI"     : "Intelligence économique",

            //Labels for Items on BI Decision Page
            "DecisionPageDecisionBIOrders"     : "Commander des études",
            "DecisionPageDecisionBIReport"     : "Etudes",
            "DecisionPageDecisionBICost"     : "Prix",

            "DecisionPageDecisionTabDiscontinue"           : "Discontinue?",
            "DecisionPageDecisionTabProcessingTechnology"  : "Processing Technology",
            "DecisionPageDecisionTabIngredientsQuality"    : "Ingredients Quality",
            "DecisionPageDecisionTabPackagingSize"         : "Packaging Size",
            "DecisionPageDecisionTabPackagingSizeSmall"    : "Small",
            "DecisionPageDecisionTabPackagingSizeStandard" : "Standard",
            "DecisionPageDecisionTabPackagingSizeLarge"    : "Large",

            "DecisionPageDecisionTabProductionVolume"               : "Production Volume (mln packs)",
            "DecisionPageDecisionTabManufacturerPrice"              : "Manufacturer Price ($)",
            "DecisionPageDecisionTabRepriceFactoryStock"            : "Reprice Factory Stock?",
            "DecisionPageDecisionTabConsumerCommunication"          : "Consumer Communication ($ mln)",
            "DecisionPageDecisionTabTargetConsumerSegment"          : "Target Consumer Segment",
            "DecisionPageDecisionTabConsumerPromotions"             : "Consumer Promotions ($ mln)",
            "DecisionPageDecisionTabConsumerPromotionsSchedule"     : "Consumer Promotions Schedule",
            "DecisionPageDecisionTabConsumerPromotionsScheduleWeek" : "Week",
            "DecisionPageDecisionTabTradeExpenses"                  : "Trade Expenses ($ mln)",
            "DecisionPageDecisionTabAdditionalTradeMargin"          : "Additional Trade Margin (%)",
            "DecisionPageDecisionTabWholesaleMinimumVolume"         : "Wholesale Minimum Volume (mln packs)",
            "DecisionPageDecisionTabWholesaleBonusRate"             : "Wholesale Bonus Rate (%)",

            "DecisionPageDecisionNewProductDevelopmentInvestment"                                 : "New Product Development Investment",
            "DecisionPageDecisionNewProductDevelopmentInvestmentInvestmentInProductionEfficiency" : "Investment in Production Efficiency ($ mln)",
            "DecisionPageDecisionNewProductDevelopmentInvestmentInvestmentInProcessingTechnology" : "Investment in Processing Technology ($ mln)",

            "DecisionPageDecisionNewProductDevelopmentInvestmentName"                                                   : "Name",
            "DecisionPageDecisionNewProductDevelopmentInvestmentRequiredAmount"                                         : "Required Amount ($ mln)",
            "DecisionPageDecisionNewProductDevelopmentInvestmentExtraBudgetRequiredToIncreaseEfficiencyBy25points"      : "Extra Budget Required to Increase Efficiency by 2% / 5% points",
            "DecisionPageDecisionNewProductDevelopmentInvestmentExtraBudgetRequiredToIncreaseFlexibilityBy25points"     : "Extra Budget Required to Increase Flexibility by 2% / 5% points",
            "DecisionPageDecisionNewProductDevelopmentInvestmentExtraBudgetRequiredToIncreaseTechnologyLevelBy12points" : "Extra Budget Required to Increase Technology Level by 1 / 2 Step(s)",
            "DecisionPageDecisionNewProductDevelopmentInvestmentNote"                                                   : "Note: Investment on Efficiency could increase Flexibility at the same time",

            "DecisionPageDecisionLockButton"     : "Submit and Lock Decision",
            "DecisionPageDecisionLockButtonInfo" : "Attention: Your team can't change any decisions after you lock decision",
            "DecisionPageDecisionLockButtonConfirmYes" : "Confirm Yes",
            "DecisionPageDecisionLockButtonConfirmNo" : "No",
            "DecisionPageDecisionLockStatus" : "Decisions Locked",


            "DecisionPageDecisionTabProcessingTechnologyFrontendValidation" : "Must be integer",
            "DecisionPageDecisionTabIngredientsQualityFrontendValidation"   : "Must be integer",
            "DecisionPageDecisionTabProductionVolumeFrontendValidation"     : "Must be integer",
            "DecisionPageDecisionTabManufacturerPriceFrontendValidation"    : "Must be float",

            "DecisionPageDecisionTabConsumerCommunicationFrontendValidation"  : "Must be integer",
            "DecisionPageDecisionTabConsumerPromotionsFrontendValidation"     : "Must be integer",
            "DecisionPageDecisionTabTradeExpensesFrontendValidation"          : "Must be integer",
            "DecisionPageDecisionTabAdditionalTradeMarginFrontendValidation"  : "Must be less than 100",
            "DecisionPageDecisionTabWholesaleMinimumVolumeFrontendValidation" : "Must be integer",
            "DecisionPageDecisionTabWholesaleBonusRateFrontendValidation"     : "Must be less than 100",



            //Labels for Items on Decision Page - Future Projections Calculator
            "DecisionPageFutureProjectionsTableTitleDATAREFERENCE"		:	"DATA REFERENCE",

            "DecisionPageFutureProjectionsCalculatorLabel"       : "Future Projection Calculator",
            "DecisionPageFutureProjectionsCalculatorTablePeriod" : "Period",

            "DecisionPageFutureProjectionsCalculatorTable1InPackUnits"     : "In Pack Units",
            "DecisionPageFutureProjectionsCalculatorTable1InStandardUnits" : "In Standard Units",

            "DecisionPageFutureProjectionsCalculatorTable1StocksAtFactory"     : "Stocks at Factory (mln)",
            "DecisionPageFutureProjectionsCalculatorTable1StocksAtWholesales"  : "Stocks at Wholesalers (mln)",
            "DecisionPageFutureProjectionsCalculatorTable1StocksAtRetailers"   : "Stocks at Retailers  (mln)",
            "DecisionPageFutureProjectionsCalculatorTable1UnitProductionCost"  : "Unit Production Cost ($)",
            "DecisionPageFutureProjectionsCalculatorTable1WholesalePrice"      : "Wholesale Price ($)",
            "DecisionPageFutureProjectionsCalculatorTable1RecommendedConsumer" : "Recommended Consumer Price ($)",

            "DecisionPageFutureProjectionsCalculatorTable2MarketSales"           : "Market Sales (mln Packs)",
            "DecisionPageFutureProjectionsCalculatorTable2ShipmentsToRetailers"  : "Shipments to retailers (mln Packs)",
            "DecisionPageFutureProjectionsCalculatorTable2UnitProductionCost"    : "Unit Production Cost ($)",
            "DecisionPageFutureProjectionsCalculatorTable2AverageConsumerPrice"  : "Average Consumer Price",
            "DecisionPageFutureProjectionsCalculatorTable2ConsumerCommunication" : "Consumer Communication ($ mln)",
            "DecisionPageFutureProjectionsCalculatorTable2ConsumerPromotions"    : "Consumer Promotions ($ mln)",

            "DecisionPageFutureProjectionsCalculatorTable3SKUExpectedSales"        : "SKU: Expected Sales",
            "DecisionPageFutureProjectionsCalculatorTable3AdditionalInformation"   : "Additional Information (SKU)",
            "DecisionPageFutureProjectionsCalculatorTable3ExpectedMaximalSales"    : "Expected Maximal Sales ($ mln)",
            "DecisionPageFutureProjectionsCalculatorTable3ExpectedGrossMargin"     : "Expected Gross Margin (%)",
            "DecisionPageFutureProjectionsCalculatorTable3ExpectedOperatingMargin" : "Expected Operating Margin (%)",


            //Labels for Items on Decision Page - Product Portfolio
            "DecisionPageProductPortfolioLabel"		:	"Product Portfolio",

            "DecisionPageProductPortfolioTable1CurrentProduction"  : "Current Production",
            "DecisionPageProductPortfolioTable1SKUName"            : "SKU Name",
            "DecisionPageProductPortfolioTable1TargetSegment"      : "Target Segment",
            "DecisionPageProductPortfolioTable1FactoryPrice"       : "Factory Price",
            "DecisionPageProductPortfolioTable1IngredientsQuality" : "Ingredients Quality",
            "DecisionPageProductPortfolioTable1TechnologyLevel"    : "Technology Level",
            "DecisionPageProductPortfolioTable1ProductionVolume"   : "Production Volume",

            "DecisionPageProductPortfolioTable2PreviousInventory"             : "Previous Inventory",
            "DecisionPageProductPortfolioTable2SKUName"                       : "SKU Name",
            "DecisionPageProductPortfolioTable2AverageFactoryPrice"           : "Average Factory Price",
            "DecisionPageProductPortfolioTable2AverageIngredientQuality"      : "Average Ingredient Quality",
            "DecisionPageProductPortfolioTable2AverageTechnologyLevel"        : "Average Technology Level",
            "DecisionPageProductPortfolioTable2TotalInventoryVolumeAtFactory" : "Total Inventory Volume at Factory",


            //Labels for Items on Decision Page - Spending Details
            "DecisionPageSpendingDetailsLabel" : "Spending Details",

            "DecisionPageSpendingDetailsTable1BrandName" : "Brand Name",
            "DecisionPageSpendingDetailsTable1Total"     : "Total",

            "DecisionPageSpendingDetailsTable1SalesForce"                         : "Sales Force ($ mln)",
            "DecisionPageSpendingDetailsTable1ConsumerCommunication"              : "Consumer Communication ($ mln)",
            "DecisionPageSpendingDetailsTable1ConsumerPromotions"                 : "Consumer Promotions ($ mln)",
            "DecisionPageSpendingDetailsTable1TradeExpenses"                      : "Trade Expenses ($ mln)",
            "DecisionPageSpendingDetailsTable1EstimatedAdditionalTradeMarginCost" : "Estimated Additional Trade Margin Cost ($ mln)",
            "DecisionPageSpendingDetailsTable1EstimatedWholesaleBonusCost"        : "Estimated Wholesale Bonus Cost ($ mln)",

            "DecisionPageSpendingDetailsTable2Company"		:	"Company",
            "DecisionPageSpendingDetailsTable2Total"		:	"Total",


            "DecisionPageSpendingDetailsTable2InvestmentInProductionEfficiency"    : "Investment in Production Efficiency ($ mln)",
            "DecisionPageSpendingDetailsTable2InvestmentInProcessingTechnology"    : "Investment in Processing Technology ($ mln)",
            "DecisionPageSpendingDetailsTable2TotalInvestment"                     : "(-) Estimated Spending this period ($ mln)",
            "DecisionPageSpendingDetailsTable2AverageBudgetPerPeriod"              : "Average Budget per Period ($ mln)",
            "DecisionPageSpendingDetailsTable2TotalInvestmentBudget"               : "Total Investment Budget ($ mln)",
            "DecisionPageSpendingDetailsTable2CumulatedPreviousInvestments"        : "(-) Cumulated Previous Investments ($ mln)",
            "DecisionPageSpendingDetailsTable2AvailableBudget"                     : "(=) Estimated Total Budget Left ($ mln)",
            "DecisionPageSpendingDetailsTable2NormalCapacity"                      : "Normal Capacity Left This Period (mln Packs)",
            "DecisionPageSpendingDetailsTable2AvailableOvertimeCapacityExtension"  : "Available Overtime Capacity Extension Left This Period (mln Packs)",
            "DecisionPageSpendingDetailsTable2AcquiredEfficiency"                  : "Acquired Efficiency (%)",
            "DecisionPageSpendingDetailsTable2AcquiredProductionVolumeFlexibility" : "Acquired Production Volume Flexibility (%)",
            "DecisionPageSpendingDetailsTable2AcquiredTechnologyLevel"             : "Acquired Technology Level",

            //Labels for Final Score page
            "FinalScorePageScore"          : "Score",
            "FinalScorePageButtonOriginal" : "Original",
            "FinalScorePageButtonRescaled" : "Rescaled",
            "FinalScorePageWeightFactor"   : "Weight / Factor",

            "FinalScorePageIncrementalMarketShare"         : "Incremental market share (value)",
            "FinalScorePageCumulatedNetProfit"             : "Cumulated net profit",
            "FinalScorePageSpendingVersusBudgets"          : "Spending versus budgets",

            "FinalScorePageShareInBrandTotalSalesValue"    : "Share in Brand Total Sales Value",
            "FinalScorePageAchievementOfInitialObjectives" : "Achievement of initial objectives",
            "FinalScorePageFinalScore"                     : "Final Score",
            "FinalScorePageFinalScoreTime"                     : "Time",
            "FinalScorePageFinalScoreTimeAll"                     : "All Time",

            "FinalScorePageCompany"             : "Company",
            "FinalScorePagePeriod"              : "Period",
            "FinalScorePageCongratulations"     : "Congratulations ! You finish the game",
            "FinalScorePageCongratulationsInfo" : "Please take 5 minutes to provide feedback to MarkSimos. Your feedback will help us to improve our service",
            "FinalScorePageProvideFeedback"     : "Provide Feedback",
            "FinalScorePageThank"               : "Thank you !",
            "FinalScorePageThankInfo"           : "Thank you for your feedback",

            "FinalScoreAdminPanelLabel"           : "Decisions and Results",
            "FinalScoreAdminPanelDecisionsButton" : "All Decisions",
            "FinalScoreAdminPanelResultsButton"   : "All Results",
            "FinalScoreAdminPanelReRunButton" : "Rerun Last Period Decisions",
            "FinalScoreAdminPanelUnlockDecisionButton" : "Unlock current Period Decision lock",
            "FinalScoreAdminPanelReRunSaveButton" : "Save",


            //Labels for Questionnaire Page
            "QuestionnairePageQuestionnaire"                             : "Questionnaire",
            "QuestionnairePageVeryPoor"                                  : "Very poor",
            "QuestionnairePageAverage"                                   : "Average",
            "QuestionnairePageExcellent"                                 : "Excellent",
            "QuestionnairePageOverallSatisfactionWiththeProgram"         : "Overall Satisfaction With the Program",
            "QuestionnairePageChallengeStrategicThinkingAbility"         : "Challenge strategic thinking ability",
            "QuestionnairePageDevelopAnIntegratedPerspective"            : "Develop an integrated perspective",
            "QuestionnairePageTestPersonalAbilityOfBalancingRisks"       : "Test personal ability of balancing risks",
            "QuestionnairePageChallengeLeadershipAndTeamworkAbility"     : "Challenge leadership and teamwork ability",
            "QuestionnairePageChallengeAnalysisAndDecisionMakingAbility" : "Challenge analysis and decision-making ability",
            "QuestionnairePageSimulationInteresting"                     : "Simulation interesting",
            "QuestionnairePageTeachingTeam"                              : "Teaching Team",
            "QuestionnairePageFacilitator"                               : "Facilitator",
            "QuestionnairePageNormanYen"                                 : "Norman Yen",
            "QuestionnairePageFeedbackOnSimulationDecisions"             : "Feedback on simulation decisions",
            "QuestionnairePageExpandingViewAndInspireThinking"           : "Expanding view and inspire thinking",
            "QuestionnairePageLectures"                                  : "Lectures",
            "QuestionnairePageProduct"                                   : "Product",
            "QuestionnairePageOverallProductUsageExperience"             : "Overall Product Usage Experience",
            "QuestionnairePageUserInterfaceExperience"                   : "User Interface Experience",
            "QuestionnairePageEaseOfNavigation"                          : "Ease of Navigation",
            "QuestionnairePageClarityOfWordsUsed"                        : "Clarity of words used",
            "QuestionnairePageInterpreter"                               : "Interpreter",
            "QuestionnairePageOlive"                                     : "Olive",
            "QuestionnairePageAccuracyANDPresentation"                   : "Accuracy & Presentation",
            "QuestionnairePageTeachingSupport"                           : "Teaching Support",
            "QuestionnairePageMayYu"                                     : "May Yu",
            "QuestionnairePageHelpfulness"                               : "Helpfulness",
            "QuestionnairePageQualityOfTechnicalSupport"                 : "Quality of Technical Support",

            "QuestionnairePageOthers"             : "Others",
            "QuestionnairePageMostBenefit"        : "Which format of the program would benefit you the most",
            "QuestionnairePageJoinProgram"        : "Join Program with other companies",
            "QuestionnairePageCompanyInHouse"     : "Company In-House Program with other functions",
            "QuestionnairePageOpenClass"          : "Open class",
            "QuestionnairePageRecommendMarkSimos" : "Would you like to recommend MarkSimos to other companies or business school",
            "QuestionnairePageYes"                : "Yes",
            "QuestionnairePageNo"                 : "No",
            "QuestionnairePageBringYou"           : "What is the best benefit or experience MarkSimos bring to you ? Is there something special you learned that you like was unique / different compared to what you learned before",
            "QuestionnaireSubmit"                 : "Submit Feedback",

            //Labels for Help page
            "HelpPageMenuFAQ"                     : "FAQ",
            "HelpPageMenuVideo"                   : "Video",
            "HelpPageMenuManual"                  : "Manual",

            //Labels for FAQ Page
            "FAQPageTitle"                        : "Frequently Asked Questions",
            "FAQPageSubTitle"                     : "This FAQ will attempt to cover the most asked questions about Marksimos game.",

            "ManualPageTitle"    : "Manual",
            "ManualPageDownload" : "Download"
        });

        // Tell the module what language to use by default
        $translateProvider.preferredLanguage('fr_FR');
        $translateProvider.use('fr_FR');

        $translateProvider.useCookieStorage();
    }]);


})();