/**
 * Clean the decision data got from CGI service
 * Include:
 *   remove empty SKU
 *   change array of char to string
 * 
 * @method clean
 * @param {Object} decision
 {
    d_BrandsDecisions : [],
    d_CompanyName: '',
    d_CID: 1
 }
 */
export function clean (decision) {
    if (!decision) return;

    /*removeEmptyBrand(decision);
    removeEmptySKU(decision);

    cleanSKUName(decision);
    cleanBrandName(decision);*/

    decision.d_CompanyName = decision.d_CompanyName
        .filter(function (n) { return n !== '\u0000' })
        .join('').trim();
}

function removeEmptyBrand(decision) {
    let tempBrand = [];
    for (let j = 0; j < decision.d_BrandsDecisions.length; j++) {
        let brand = decision.d_BrandsDecisions[j];

        if (brand.d_BrandID !== 0) {
            tempBrand.push(brand);
        }
    }
    decision.d_BrandsDecisions = tempBrand;
}

function cleanBrandName(decision) {
    for (let j = 0; j < decision.d_BrandsDecisions.length; j++) {
        let brand = decision.d_BrandsDecisions[j];
        brand.d_BrandName = brand.d_BrandName
            .filter(function (n) { return n !== '\u0000' })
            .join('').trim();
    }
}

function removeEmptySKU(decision) {
    for (let j = 0; j < decision.d_BrandsDecisions.length; j++) {
        let brand = decision.d_BrandsDecisions[j];

        if (brand.d_BrandID !== 0) {
            //clean SKU data
            let tempSku = [];
            for (let i = 0; i < brand.d_SKUsDecisions.length; i++) {
                let sku = brand.d_SKUsDecisions[i];
                if (sku.d_SKUID !== 0) {
                    tempSku.push(sku);
                }
            }
            brand.d_SKUsDecisions = tempSku;
        }
    }
}

function cleanSKUName(decision) {
    for (let j = 0; j < decision.d_BrandsDecisions.length; j++) {
        let brand = decision.d_BrandsDecisions[j];
        for (let i = 0; i < brand.d_SKUsDecisions.length; i++) {
            let sku = brand.d_SKUsDecisions[i];
            sku.d_SKUName = sku.d_SKUName
                .filter(function (n) { return n !== '\u0000' })
                .join('').trim();
        }
    }
}