"use strict";
var Environnement_1 = require('../../engine/ComputeEngine/Environnement');
var game = require('../Games');
var yearsNbByPeriod = Math.ceil(game.daysNbByPeriod / 360);
// casa
var BVC = {
    stockMarketReturnBaseRate: 10.7,
    stockMarketReturnRateStats: [
        10.7, 11.55, 11.52, 11.45,
        10.53, 10.09 // 2016 
    ]
};
var stockMarket = new Environnement_1.StockMarket({
    id: 'stockMarket1',
    stockMarketID: '0',
    label: 'Bourse des Valeurs de Casablanca',
    projectionFuturePeriodsNb: 3 * yearsNbByPeriod,
    stockMarketReturnBaseRate: BVC.stockMarketReturnBaseRate,
    stockMarketReturnRateStats: BVC.stockMarketReturnRateStats
});
module.exports = [stockMarket];
//# sourceMappingURL=StockMarkets.js.map