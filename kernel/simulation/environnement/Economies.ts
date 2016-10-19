import { Economy,World } from '../../engine/ComputeEngine/Environnement';
import ENUMS = require('../../engine/ComputeEngine/ENUMS');

var maroc_stats = {
    population: [// year from 2010 to 2015
        32.11, 32.53, 32.98, 33.45,	33.92,	34.38
    ],

    populationBaseGrowth: 1.34, // %

    internetAccessBasePercent: [41.3, 52, 46.11, 55.42, 56, 56.8],

    inflationBaseRate: 1.5,

    unemploymentBaseRate: 8.6,

    externalTradeBalance: -16.66, // Mrd MAD

    GDP: [// billions USD
        93.22, 101.37, 98.27, 107.24, 110.01, 100.36
    ],

    GDPbaseGrowthRate: 4.4,

    IPCStats: [
        109, 107.6, 109.5, 108.6, 109.6, 108.3, 110.4, 109.6, 109.7, 110.4, 111.7, 112.4, 112.3, 112.9, 113.6, 112.9, 112.7, 112.8, 113.7, 114.7, 114.5, 115, 115.5, 115.4, 116.6, 117.6
    ]
};


var europe_stats = {
    population: [ // year 2010 in millio
        336.14, 336.94, 336.16, 338.76, 338.62, 339.43
    ],

    populationBaseGrowth: 0.24, // %

    unemploymentBaseRate: 10.8,

    inflationBaseRate: 0.80,

    internetAccessBasePercent: [67.12, 71.02, 72.06, 74.08, 75.81,	78.30],

    GDP: [
        12640.4, 13621.19,	12634.45, 13184.57,	13407.42,	11539.74
    ],

    GDPbaseGrowthRate: 1.66,

    IPCInflationStats: [ // from 2010Q1 to 2016Q2
        1.733333, 2.033333, 2.133333, 2.466667, 2.9, 3.2, 3.033333, 3.2, 2.9, 2.6, 2.666667, 2.466667, 2, 1.566667, 1.5, 0.9666666, 0.7666667, 0.7, 0.4666667, 0.2666667, -0.3, 0.1333333, 0.03333334, 0.1, 0.06666667, -0.1
    ],

    PPIInflationStats: [
        1.35098, 3.490618, 3.745654, 4.273651, 5.43364, 4.982669, 4.831591, 4.213714, 3.36175, 2.196895, 2.076541, 1.838456, 0.5166511, -0.114939, -0.1178404, -0.6544868, -1.439807, -1.032531, -1.167376, -1.701636, -1.991769, -1.084156, -2.158138, -2.210717, -2.525884, 2.066667
    ],

    GDPGrowthRateStats: [
        0.432543, 0.966121, 0.675442, 0.62982, -0.386237, 0.727759, 0.210146, 1.126416, 0.662923, 0.466941, 0.119773, 0.022756, 0.699414, 0.191713, 0.771183, 0.975622, -0.29695, 0.976694, 1.218178, 0.572867, 0.508442, 0.646629, 0.492849, 0.217564, 0.207996, 0.303177
    ],

    externalTradeBalances: [ // mrd USD 2010-2015
        167.90, 285.37, 470.46, 519.63, 523.32, 511.42
    ]
};

var usa_stats = {
    IPCInflationStats: [ // usa from 2010Q1  to 2016Q2 %
        2.360525, 1.767765, 1.175609, 1.270248, 2.141127, 3.430395, 3.756174, 3.293777, 2.815192, 1.889765, 1.697784, 1.889365, 1.681829, 1.39285, 1.553359, 1.233471, 1.405456, 2.050846, 1.783154, 1.248028, -0.06269593, -0.03827201, 0.1095034, 0.4662646, 1.080267, 1.05085
    ],

    PPIInflationStats: [
        5.635809, 5.557785, 4.038804, 4.741379, 6.25963, 8.952671, 9.210276, 6.696596, 4.676455, 1.186322, 1.080328, 1.595372, 0.8311688, 0.3275862, 0.4826754, 0.01725626, 0.5667182, 1.718508, 1.492537, -0.5175983, -4.952186, -4.916371, -5.375254, -5.064169, -3.305785, -3.056148
    ],

    GDPGrowthRateStats: [ // usa 2010Q1 to 2016Q2
        0.432543, 0.966121, 0.675442, 0.62982, -0.386237, 0.727759, 0.210146, 1.126416, 0.662923, 0.466941, 0.119773, 0.022756, 0.699414, 0.191713, 0.771183, 0.975622, -0.29695, 0.976694, 1.218178, 0.572867, 0.508442, 0.646629, 0.492849, 0.217564, 0.207996, 0.303177
    ],

    externalTradeBalances: [ // million USD 2010-2015
        -512657, - 515164.59, - 503147.06,  - 472697.47, - 500225.20
    ]
};

var OECD_stats = {

    population: [
        1241.45	, 1249.55,	1256,	1265.80, 1272.99, 1281
    ],

    populationBaseGrowth: 0.63, // %

    unemploymentBaseRate: 6.8,

    internetAccessBasePercent: [65.32, 67.62, 68.55, 72.2, 75.75, 78.05],

    GDP: [
        44291.11,	47552.55,	47426.27,	47918.30,	48764.57,	45837.98
    ],

    GDPbaseGrowthRate: 1.97,


    inflationBaseRate: 1.01,

    IPCInflationStats: [ // 
        2.2, 2.93, 3.466667, 4.7, 5.066667, 5.733333, 6.266667, 4.6, 3.766667, 2.866667, 1.9, 2.066667, 2.433333, 2.4, 2.8, 2.9, 2.3, 2.2, 1.966667, 1.5, 1.2, 1.366667, 1.733333, 1.466667, 2.133333, 2.066667
    ],

    GDPGrowthRateStats: [//OECD
        0.681629, 1.07998, 0.70758, 0.637832, 0.136387, 0.347993, 0.587949, 0.483711, 0.371109, 0.185047, 0.068285, -0.020368, 0.433002, 0.399926, 0.610711, 0.558165, 0.32488, 0.374567, 0.618679, 0.576463, 0.691524, 0.4236, 0.529929, 0.326414, 0.404741
    ],


    externalTradeBalances: [ // million USD 2010-2015
        -191499.55, - 126985, 82755.73, 165875.77, 185578.76
    ]


};

var reports = [
    "The green policies promoted by the European Union are impacting on energy costs. initially the claim was that these policies would help to reduce costs. Now the subsidies required are being past on to consumers.",
    "There is a recovery in construction in the US.It is hoped this may will continue into the future.The dollar should rise in value if this happens.",
    "The International Monetary Fund is suggesting that advanced economies should borrow to spend on key infrastructure projects. The say that the Eurozone would benefit most.",
    "Moving a brand upmarket without listening to customers can risk losing them. Increasing the quality of material can cause such a shift possibly leading to loss of sales.",
    "The Eurozone continues to struggle. There seems to some optimism that the peripheral economies are controlling public expenditure and showing some growth. The core countries are still struggling.",
    "The global economy has seen some extreme disruptions. Inflation fears have caused governments to suddenly increase their interest rates. Exchange rates have also been affected.",
    "financial interactions among regions in the global economy are complex. Politics and government power struggles can be as influential as the economic factors.",
    "The absence of essential reforms in some European countries is holding back required developments. The combination of an inefficient public sector and a shortage of private sector companies prevents them competing successfully in EU markets. this can affect company valuations.",
    "This is the traditional shopping season around the world. Countries expect to achieve increased sales. However increased interest rates can have a bigger impact in some countries than in others.",
    "The US dollar has gained against the Euro. This can be attributed to a growing confidence in the American economy."
];

var economie1_stats = maroc_stats;

var europe = new Economy({
    id: "economy1",
    label: "economy1",

    economyID: "0",

    isLocal: true,

    name: "Maroc",
    initialPopulation: economie1_stats.population[0],
    annualPopulationBaseGrowthRate: economie1_stats.populationBaseGrowth,
    internetAccessPercent: economie1_stats.internetAccessBasePercent[0],

    unemploymentBaseRate: economie1_stats.unemploymentBaseRate,

    initialGDP: economie1_stats.GDP[0],

    initialBalanceTrade: economie1_stats.externalTradeBalance,

    currencyID: "0",
    labourPoolID: "0",
    centralBankID: "0",
    stockMarketID: "0",

    //inflationBaseRate: 0.015,

    avgCreditLongTermRating: ENUMS.CREDIT_LONGTERM_RATING.AA_PLUS,
    avgCreditShortTermRating: ENUMS.CREDIT_SHORTTERM_RATING.A1_PLUS,

    avgDaysSalesOutstanding: 66,
    avgLatePaymentsRate: 0.01,

    corporateInsolvency: 12.29 / 100,

    IPCStats: economie1_stats.IPCStats,

    annualGDPBaseGrowthRate: economie1_stats.GDPbaseGrowthRate,

    businessReports: reports
    
});


var economie2_stats = europe_stats;

var northAmerica = new Economy({
    id: "economy2",
    label: "economy2",


    economyID: "1",

    isLocal: false,

    name: "Zone Euro",
    initialPopulation: economie2_stats.population[0],
    annualPopulationBaseGrowthRate: economie2_stats.populationBaseGrowth,
    internetAccessPercent: economie2_stats.internetAccessBasePercent[0],

    initialGDP: economie2_stats.GDP[0],
    initialBalanceTrade: economie2_stats.externalTradeBalances[0],

    unemploymentBaseRate: economie2_stats.unemploymentBaseRate,

    currencyID: "1",
    labourPoolID: "1",
    centralBankID: "1",
    stockMarketID: "",

    //inflationBaseRate: 0.0175,

    avgCreditLongTermRating: ENUMS.CREDIT_LONGTERM_RATING.AA_PLUS,
    avgCreditShortTermRating: ENUMS.CREDIT_SHORTTERM_RATING.A1_PLUS,

    avgDaysSalesOutstanding: 55,
    avgLatePaymentsRate: 0,

    corporateInsolvency: 33.212 / 100,

    IPCInflationStats: europe_stats.IPCInflationStats,
    PPIInflationStats: europe_stats.PPIInflationStats,
    GDPGrowthRateStats: europe_stats.GDPGrowthRateStats
});


var economie3_stats = OECD_stats;

var restOfDevelopedWorld = new Economy({
    id: "economy3",
    label: "economy3",

    economyID: "2",

    isLocal: false,

    name: "Other major economies",

    initialPopulation: economie3_stats.population[0],
    annualPopulationBaseGrowthRate: economie3_stats.populationBaseGrowth,

    internetAccessPercent: economie3_stats.internetAccessBasePercent[0],

    initialGDP: economie3_stats.GDP[0],
    initialBalanceTrade: economie3_stats.externalTradeBalances[0],

    unemploymentBaseRate: economie3_stats.unemploymentBaseRate,

    currencyID: "1",
    labourPoolID: "",
    centralBankID: "1",
    stockMarketID: "",

    //inflationBaseRate: 0.02,

    avgCreditLongTermRating: ENUMS.CREDIT_LONGTERM_RATING.BBB_MINUS,
    avgCreditShortTermRating: ENUMS.CREDIT_SHORTTERM_RATING.A3,

    avgDaysSalesOutstanding: 69,
    avgLatePaymentsRate: 0,

    corporateInsolvency: 7.37 / 10,

    IPCInflationStats: OECD_stats.IPCInflationStats,
    GDPGrowthRateStats: OECD_stats.GDPGrowthRateStats
});

var economies = [europe, northAmerica, restOfDevelopedWorld];




var world = new World({
    id: "economy4",
    label: "economy4",

    economyID: "3",

    name: "World",

    currencyID: "0" // euro

},
    economies
);

export = {
    economies: economies,

    world: world
};