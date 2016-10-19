/**
 * @param {Object} decision decision got from CGI service
 */
export function convert(decision) {
    convertCompanyName(decision);
    //convert SKUName
    /*convertSKUName(decision);
    convertBrandName(decision);*/
}


function convertCompanyName(decision) {
    decision.d_CompanyName = decision.d_CompanyName.split('');
    append(decision.d_CompanyName, 16, '\u0000');
}

function convertBrandName(decision) {
    for (let j = 0; j < decision.d_BrandsDecisions.length; j++) {
        let brand = decision.d_BrandsDecisions[j];

        brand.d_BrandName = brand.d_BrandName.split('');
        append(brand.d_BrandName, 6, '\u0000');
    }
}

function convertSKUName(decision) {
    for (let j = 0; j < decision.d_BrandsDecisions.length; j++) {
        let brand = decision.d_BrandsDecisions[j];
        for (let i = 0; i < brand.d_SKUsDecisions.length; i++) {
            let sku = brand.d_SKUsDecisions[i];
            sku.d_SKUName = sku.d_SKUName.split('');
            append(sku.d_SKUName, 3, '\u0000');
        }
    }
}

/**
 * if a is shorter than width, append c to a, so that the length of a is width
 * 
 * @param {Array} a 
 */
function append(a, width, c) {
    if (!a || a.length === undefined) return a;

    let appendNum = width - a.length;
    for (let i = 0; i < appendNum; i++) {
        a.push(c);
    }
}