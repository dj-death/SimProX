//let consts = require('../consts.js');

/**
 * @param {Object} onePeriodResult
 {
    p_Market: [],
    p_SKUs: [],
    p_Brands: []
 }
 */
export function clean(onePeriodResult) {
    if (!onePeriodResult) return;


    //removeEmptyBrands(onePeriodResult);
    removeEmptyCompany(onePeriodResult);
    //removeEmptySKU(onePeriodResult);


    cleanCompanyName(onePeriodResult);
    //cleanBrandName(onePeriodResult);
    //cleanSKUName(onePeriodResult);
}

function cleanBrandName(onePeriodResult) {
    let Brands = onePeriodResult.p_Brands;
    for (let i = 0; i < Brands.length; i++) {
        let brand = Brands[i];
        brand.b_BrandName = brand.b_BrandName
            .filter(function (n) { return n !== '\u0000' })
            .join('').trim();
    }
}

function cleanSKUName(onePeriodResult) {
    let SKUs = onePeriodResult.p_SKUs;
    for (let i = 0; i < SKUs.length; i++) {
        let SKU = SKUs[i];
        SKU.u_SKUName = SKU.u_SKUName
            .filter(function (n) { return n !== '\u0000' })
            .join('').trim();
    }
}

function cleanCompanyName(onePeriodResult) {
    //clean company name
    for (let i = 0; i < onePeriodResult.p_Companies.length; i++) {
        let company = onePeriodResult.p_Companies[i];
        company.c_CompanyName = company.c_CompanyName
            .filter(function (n) { return n !== '\u0000' })
            .join('').trim();
    }
}

function removeEmptyBrands(onePeriodResult) {
    let brands = [];
    for (let i = 0; i < onePeriodResult.p_Brands.length; i++) {
        let brand = onePeriodResult.p_Brands[i];
        if (brand.b_BrandID !== 0) {
            brands.push(brand);
        }
    }
    onePeriodResult.p_Brands = brands;
}

function removeEmptyCompany(onePeriodResult) {
    let companies = [];
    for (let i = 0; i < onePeriodResult.p_Companies.length; i++) {
        let company = onePeriodResult.p_Companies[i];
        if (company.c_CompanyID !== 0) {
            companies.push(company);
        }
    }
    onePeriodResult.p_Companies = companies;
}

function removeEmptySKU(onePeriodResult) {
    let SKUs = [];
    for (let i = 0; i < onePeriodResult.p_SKUs.length; i++) {
        let SKU = onePeriodResult.p_SKUs[i];
        if (SKU.u_SKUID !== 0) {
            SKUs.push(SKU);
        }
    }
    onePeriodResult.p_SKUs = SKUs;
}