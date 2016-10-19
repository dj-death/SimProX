"use strict";
var Environnement_1 = require('../../engine/ComputeEngine/Environnement');
var EUR2MAD_stats = [
    0.089, 0.09, 0.091, 0.089, 0.09, 0.089, 0.089, 0.09, 0.09, 0.09, 0.091, 0.09, 0.09, 0.09, 0.09, 0.09, 0.089, 0.089, 0.089, 0.091, 0.092, 0.094, 0.092, 0.093, 0.092, 0.092
];
var euro = new Environnement_1.Currency({
    id: "currency1",
    currencyID: "0",
    economyID: "0",
    label: "EURO",
    sign: "€",
    isLocal: true,
    isStable: true
});
var dollar = new Environnement_1.Currency({
    id: "currency2",
    currencyID: "1",
    economyID: "1",
    label: "USD",
    sign: "$",
    isLocal: false,
    currencyRateStats: EUR2MAD_stats,
    isStable: false
});
module.exports = [euro, dollar];
//# sourceMappingURL=Currencies.js.map