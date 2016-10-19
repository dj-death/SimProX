import { StockMarket } from '../../engine/ComputeEngine/Environnement';


import game = require('../Games');
let yearsNbByPeriod = Math.ceil(game.daysNbByPeriod / 360);


// casa
let BVC = {
    stockMarketReturnBaseRate: 10.7,

    stockMarketReturnRateStats: [ // quarterly estimated from 2015
        10.7, 11.55, 11.52, 11.45, //2015
        10.53, 10.09 // 2016 
    ]
};




let stockMarket = new StockMarket({
    id: 'stockMarket1',
    stockMarketID: '0',

    label: 'Bourse des Valeurs de Casablanca',

    projectionFuturePeriodsNb: 3 * yearsNbByPeriod,// ans

    stockMarketReturnBaseRate: BVC.stockMarketReturnBaseRate,
    stockMarketReturnRateStats: BVC.stockMarketReturnRateStats
    
});


export = [stockMarket];