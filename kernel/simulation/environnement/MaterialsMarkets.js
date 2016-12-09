"use strict";
const Environnement_1 = require('../../engine/ComputeEngine/Environnement');
let materialAMarket1 = new Environnement_1.MaterialMarket({
    id: "materialMarket1",
    label: "materialMarket",
    materialMarketID: "0",
    standardLotQuantity: 1000,
    arePricesStable: false,
    economyID: "1",
    materialID: "0",
    baseQuotedPrices: [37222, 33240, 30939],
    quotedPricesStats: [
        [46756, 47925, 49124, 50352, 51610, 58190, 64008, 70410, 58500, 57700],
        [46325, 46756, 47925, 49124, 50352, 56735, 62408, 68649, 55574, 54814],
        [44364, 46325, 46756, 47925, 49124, 55316, 60847, 66932, 52796, 52073] // 6mth
    ]
});
module.exports = [materialAMarket1];
//# sourceMappingURL=MaterialsMarkets.js.map