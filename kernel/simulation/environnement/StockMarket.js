"use strict";
const Environnement_1 = require('../../engine/ComputeEngine/Environnement');
// casa
let BVC = {
    stockMarketReturnBaseRate: 10.7,
    stockMarketReturnRateStats: [
        10.7, 11.55, 11.52, 11.45,
        10.53, 10.09 // 2016 
    ]
};
let stockMarket = new Environnement_1.StockMarket({
    id: 'stockMarket1',
    stockMarketID: '0',
    label: 'Bourse des Valeurs de Casablanca',
    projectionFuturePeriodsNb: 3,
    stockMarketReturnBaseRate: BVC.stockMarketReturnBaseRate,
    stockMarketReturnRateStats: BVC.stockMarketReturnRateStats
});
module.exports = [stockMarket];
//# sourceMappingURL=StockMarket.js.map