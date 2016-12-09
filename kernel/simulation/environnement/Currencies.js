"use strict";
const Environnement_1 = require('../../engine/ComputeEngine/Environnement');
let EUR2MAD_stats = [
    0.089, 0.09, 0.091, 0.089, 0.09, 0.089, 0.089, 0.09, 0.09, 0.09, 0.091, 0.09, 0.09, 0.09, 0.09, 0.09, 0.089, 0.089, 0.089, 0.091, 0.092, 0.094, 0.092, 0.093, 0.092, 0.092
];
let euro = new Environnement_1.Currency({
    id: "currency1",
    currencyID: "0",
    economyID: "0",
    label: "EURO",
    sign: "€",
    isLocal: true,
    isStable: true
});
let dollar = new Environnement_1.Currency({
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