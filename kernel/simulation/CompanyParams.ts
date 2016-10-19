import * as Company from '../engine/ComputeEngine/Company';



// http://www.analyse-sectorielle.fr/2011/09/betas-des-secteurs-de-linformatique/

let ungearedBetaBySector = {
    beverage: 0.51,
    buildingMaterials: 0.85,
    constructionSupplies: 1.05,
    services: 0.9,
    autoTrucks: 0.96,
    chemicalBasic: 0.76,
    chemicalDiversified: 1.5,
    computersPeripherals: 1.36,
    pharmaceutical: 1.17,
    electricalEquipment: 1.27,
    electronicsForConsumer: 1.5,
    foodProcessing: 0.82,
    homeFurnishings: 0.92,
    healthcareProducts: 0.94,
    machinery: 1.18,
    shoe: 0.89,
    utilityGeneral: 0.77
};


let CompanyParams: Company.CompanyParams = {
    taxAnnumRate: 0.3,
    taxAssessedPaymentQuarter: 2,

    capitalCostInterpSchedules: {
        debtToEquityRatio: [0.1111, 0.125, 0.4333, 0.6667, 1,     1.5,   2.333, 4,    9,     10],
        debtCapitalCost:   [0.08,   0.082, 0.084,  0.088,  0.091, 0.096, 0.102, 0.12, 0.18,  0.26],
        equityCapitalCost: [0.12,   0.121,  0.122,  0.123,  0.126, 0.13,  0.14,  0.16, 0.235, 0.27]
    },

    ungearedBeta: ungearedBetaBySector.electronicsForConsumer,
};


export = CompanyParams;
