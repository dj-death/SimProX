import { Currency } from '../../engine/ComputeEngine/Environnement';

let EUR2MAD_stats = [ // from 2010Q1 to 2016Q2
    0.089, 0.09, 0.091, 0.089, 0.09, 0.089, 0.089, 0.09, 0.09, 0.09, 0.091, 0.09, 0.09, 0.09, 0.09, 0.09, 0.089, 0.089, 0.089, 0.091, 0.092, 0.094, 0.092, 0.093, 0.092, 0.092
];

let euro = new Currency({
    id: "currency1",
    currencyID: "0",

    economyID: "0",

    label: "EURO",
    sign: "€",
    isLocal: true,

    isStable: true
});

let dollar = new Currency({
    id: "currency2",
    currencyID: "1",

    economyID: "1",

    label: "USD",
    sign: "$",
    isLocal: false,

    currencyRateStats: EUR2MAD_stats,

    isStable: false
});

export = [euro, dollar];


