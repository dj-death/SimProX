import { CentralBank } from '../../engine/ComputeEngine/Environnement';


let BKAM = {
    baseTreasuryBondsInterestRate: 3.249,

    treasuryBondsInterestRateStats: [ // quarterly
        3.249, 3.585, 3.58, 3.423, // 2015
        3.14, 2.82, 3.08 // 2016
    ],

    baseInterestBaseRate: 2.5,

    interestBaseRateStats: [ // quarterly
        3.25, 3.25, 3.25, 3.25, // 2010
        3.25, 3.25, 3.25, 3.25, // 2011
        3, 3, 3, 3, // 2012
        3, 3, 3, 3, // 2013
        2.75, 2.75, 2.75, 2.75, // 2014
        2.5, 2.5, 2.5, 2.5, // 2015
        2.25, 2.25 // 2016
    ]
}



let BCE = {

    baseInterestBaseRate: 1.25,

    interestBaseRateStats: [
        1, 1, 1, 1, // 2010,
        1, 1.25, 1.5, 1, // 2011
        1, 1, 0.75, 0.75, // 2012 
        0.75, 0.5, 0.5, 0.25, // 2013
        0.25, 0.15, 0.05, 0.05, // 2014
        0.05, 0.05, 0.05, 0.05, // 2015
        0, 0 // 2016
    ],
}


let economy1_bank = BKAM;
let economy2_bank = BCE;




let ECB = new CentralBank({
    id: "centralBank2",
    label: "centralBank2",

    centralBankID: "1",

    economyID: "1",

    isMoneyMarketStable: false,

    baseInterestBaseRate: economy1_bank.baseInterestBaseRate,
    interestBaseRateStats: economy1_bank.interestBaseRateStats,

    baseTreasuryBondsInterestRate: economy1_bank.baseTreasuryBondsInterestRate,
    treasuryBondsInterestRateStats: economy1_bank.treasuryBondsInterestRateStats
});



let FED = new CentralBank({
    id: "centralBank1",
    label: "centralBank1",

    centralBankID: "0",

    economyID: "0",

    isMoneyMarketStable: false,

    baseInterestBaseRate: economy1_bank.baseInterestBaseRate,
    interestBaseRateStats: economy1_bank.interestBaseRateStats
});

export = [ECB, FED];
