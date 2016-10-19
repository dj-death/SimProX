"use strict";
var nodemailer = require('nodemailer');
var Q = require('q');
var util = require('util');
function setSize(num) {
    return num;
}
exports.setSize = setSize;
//TODO: need to implement this function  
//For Number of Out-of-stock Episodes goes wrong in the report company status SKU/Brand
//MA0_Mathfunction s.pas
// function  SetSize( aSet : HCD_set ) : byte;
// var
//   i       : byte;
//   Counter : integer;
// begin
//   Counter := 0;
//   for i := 0 to 255 do
//     if ( i in aSet ) then Inc(Counter);
//   Result := Counter;
// end; 
/**
 * Find brand by brandId
 *
 * @method findBrand
 * @param {Object} currentPeriodResult data from allResults
 * @param {function } u_ParentBrandID
 * @return {Object} the brand data from allResults
 */
/*
export function  findBrand (onePeriodResult, u_ParentBrandID){
    for(let i=0; i<onePeriodResult.p_Brands.length; i++){
        let brand = onePeriodResult.p_Brands[i];
        if(brand.b_BrandID === u_ParentBrandID){
            return brand;
        }
    }
}

export function  findSKU (onePeriodResult, SKUID){
    for(let i=0; i<onePeriodResult.p_SKUs.length; i++){
        let SKU = onePeriodResult.p_SKUs[i];
        if(SKUID === SKU.u_SKUID){
            return SKU;
        }
    }
}
*/
function findCompany(onePeriodResult, companyId) {
    var companyResult = undefined;
    try {
        for (var i = 0; i < onePeriodResult.p_Companies.length; i++) {
            //        let companyResult = onePeriodResult.p_Companies[i];
            if (onePeriodResult.p_Companies[i].c_CompanyID === companyId) {
                companyResult = onePeriodResult.p_Companies[i];
            }
        }
    }
    catch (e) {
        return undefined;
    }
    return companyResult;
}
exports.findCompany = findCompany;
/*
export function  unitCost (periodNumber, packsize, ingredientsQuality, technologyLevel, previousCumulatedVolumes, efficiencyOfProduction, currentVolume){
    let deferred = Q.defer();

    if(periodNumber === undefined) throw new Error("Invalid parameter periodNumber.");
    if(packsize === undefined) throw new Error("Invalid parameter packsize.");
    if(ingredientsQuality===undefined) throw new Error("Invalid parameter ingredientQuality.");
    if(technologyLevel === undefined) throw new Error("Invalid parameter technologyLevel.");
    if(previousCumulatedVolumes === undefined) throw new Error("Invalid parameter previousCumulatedVolumes.");
    if(efficiencyOfProduction === undefined) throw new Error("Invalid parameter efficiencyOfProduction.");
    if(currentVolume === undefined) throw new Error("Invalid patameter currentVolume.");

    let tLevel;
    let inflation;
    let QI;
    let TL;
    let costNow;
    let exogenous;

    //logger.log('UnitCost Debug -------------------- ');
    //logger.log('  periodNumber: '+periodNumber);
    //logger.log('  packsize: '+packsize);
    //logger.log('  ingredientsQuality: '+ingredientsQuality);
    //logger.log('  technologyLevel: '+technologyLevel);
    //logger.log('  previousCumulatedVolumes: ['+previousCumulatedVolumes+']');
    //logger.log('  efficiencyOfProduction: '+efficiencyOfProduction);
    //logger.log('  currentVolume: '+currentVolume);

    let volumeNow = currentVolume * consts.ActualSize[packsize];
    volumeNow += previousCumulatedVolumes[technologyLevel - 1];

    //logger.log(' ++++++++')
    //logger.log(' volumeNow 1: ' + volumeNow);
    //logger.log(' consts.TechnologyUltimateLevel: ' + consts.TechnologyUltimateLevel);

    if(technologyLevel < consts.TechnologyUltimateLevel){
        for(let i = technologyLevel; i < consts.TechnologyUltimateLevel; i++){
            volumeNow += previousCumulatedVolumes[i] * gameParameters.pgen.firm_HigherTechnologyImpact;
        }
    }
    //logger.log(' gameParameters.pgen.firm_HigherTechnologyImpact: ' + gameParameters.pgen.firm_HigherTechnologyImpact);
    //logger.log(' volumeNow 2: ' + volumeNow);
    volumeNow = Math.max(volumeNow, gameParameters.pgen.sku_MinProductionVolume);
    //logger.log(' volumeNow 3: ' + volumeNow);

    //edit exogenous function
    exogenous = gameExogenous.getExogenousByPeriod(periodNumber);
    if(periodNumber < 0){
        inflation = Math.pow(1 + exogenous.exo_InflationRate, Math.abs(periodNumber));
    }else{
        inflation = 1.0;
    }

    QI = ingredientsQuality;

    QI = gameParameters.pgen.sku_CostIQSquare * QI * QI
        + gameParameters.pgen.sku_CostIQLinear * QI
        + gameParameters.pgen.sku_CostIQIntercept;

    TL = technologyLevel;

    TL = gameParameters.pgen.sku_CostTLSquare * TL * TL
        + gameParameters.pgen.sku_CostTLLinear * TL
        + gameParameters.pgen.sku_CostTLIntercept;


    costNow = exogenous.exo_IngredientsCost / inflation * QI
        + exogenous.exo_TechnologyExpense / inflation * TL;
    costNow = costNow* Math.pow((volumeNow / gameParameters.pgen.sku_MinProductionVolume), gameParameters.pgen.sku_DefaultCostDrop);
    costNow = (costNow + exogenous.exo_LogisticsFixedCosts / inflation) * (1.00 - efficiencyOfProduction);

    costNow = costNow * consts.ActualSize[packsize];

    //logger.log('RESULT : ' + costNow);
    deferred.resolve(costNow);

    return deferred.promise;
}

export function  unitPrice (localtion, consumerPrice){
    let priceNow;

    switch(localtion){
        case 'RETAILERS':
            priceNow = consumerPrice;
            break;
        case 'WHOLESALERS':
            priceNow = consumerPrice / ( 1.0 + gameParameters.pgen.retail_Markup);
            break;
        default:
            priceNow = consumerPrice / ( 1.0 + gameParameters.pgen.retail_Markup);
            priceNow = priceNow / (1.0 + gameParameters.pgen.wholesale_Markup)
            break;
    }
    
    return priceNow;
}

export function  calculateTotalVolume (currentDecision){
    let totalVolume = 0;
    currentDecision.d_BrandsDecisions.forEach(function (brandDecision){
        brandDecision.d_SKUsDecisions.forEach(function (SKUDecision){
            totalVolume += SKUDecision.d_ProductionVolume * consts.ActualSize[SKUDecision.d_PackSize];
        })
    })
    return totalVolume;
}

export function  calculateTechnology (SKUResult){
    if(SKUResult.u_ps_RetailStocks[consts.StocksMaxTotal].s_ps_Volume > 0){
        return SKUResult.u_ps_RetailStocks[consts.StocksMaxTotal].s_Technology;
    }else if(SKUResult.u_ps_WholesaleStocks[consts.StocksMaxTotal].s_ps_Volume > 0){
        return SKUResult.u_ps_WholesaleStocks[consts.StocksMaxTotal].s_Technology;
    }else if(SKUResult.u_ps_FactoryStocks[consts.StocksMaxTotal].s_ps_Volume > 0){
        return SKUResult.u_ps_FactoryStocks[consts.StocksMaxTotal].s_Technology;
    }else{
        return SKUResult.u_ps_FactoryStocks[0].s_Technology;
    }
}

export function  calculateIngredientsQuality (SKUResult){
    if(SKUResult.u_ps_RetailStocks[consts.StocksMaxTotal].s_ps_Volume > 0){
        return SKUResult.u_ps_RetailStocks[consts.StocksMaxTotal].s_IngredientsQuality;
    }else if(SKUResult.u_ps_WholesaleStocks[consts.StocksMaxTotal].s_ps_Volume > 0){
        return SKUResult.u_ps_WholesaleStocks[consts.StocksMaxTotal].s_IngredientsQuality;
    }else if(SKUResult.u_ps_FactoryStocks[consts.StocksMaxTotal].s_ps_Volume > 0){
        return SKUResult.u_ps_FactoryStocks[consts.StocksMaxTotal].s_IngredientsQuality;
    }else{
        return SKUResult.u_ps_FactoryStocks[0].s_IngredientsQuality;
    }
}
*/
/**
* Create an array of all the company names
* @param {Number} companyNum num of companies we need
*/
function createCompanyArray(companyNum) {
    var companies = [];
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var j = 0; j < companyNum; j++) {
        companies.push(letters[j]);
    }
    return companies;
}
exports.createCompanyArray = createCompanyArray;
/*
export function  getConsumerPrice (factoryPrice){
    return factoryPrice * (gameParameters.pgen.wholesale_Markup + 1)
                        * (gameParameters.pgen.retail_Markup + 1);
}

export function  getEstimatedAdditionalTradeMarginCost (consumerPrice, productionVolume, margin){
    return consumerPrice * productionVolume * margin;
}

export function  getEstimatedWholesalesBonusCost (consumerPrice, minimumOrder, margin){
    return consumerPrice * minimumOrder * margin;
}

export function  getFactoryPriceByConsumberPrice (consumerPrice){
    return (consumerPrice / ((gameParameters.pgen.wholesale_Markup + 1) * (gameParameters.pgen.retail_Markup + 1)) );
}*/
function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var pwd = '';
    var i = 0;
    for (; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
//# sourceMappingURL=utility.js.map