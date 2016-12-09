"use strict";
const Environnement_1 = require('../../engine/ComputeEngine/Environnement');
let BKAM = {
    baseTreasuryBondsInterestRate: 3.249,
    treasuryBondsInterestRateStats: [
        3.249, 3.585, 3.58, 3.423,
        3.14, 2.82, 3.08 // 2016
    ],
    baseInterestBaseRate: 2.5,
    interestBaseRateStats: [
        3.25, 3.25, 3.25, 3.25,
        3.25, 3.25, 3.25, 3.25,
        3, 3, 3, 3,
        3, 3, 3, 3,
        2.75, 2.75, 2.75, 2.75,
        2.5, 2.5, 2.5, 2.5,
        2.25, 2.25 // 2016
    ]
};
let BCE = {
    baseInterestBaseRate: 1.25,
    interestBaseRateStats: [
        1, 1, 1, 1,
        1, 1.25, 1.5, 1,
        1, 1, 0.75, 0.75,
        0.75, 0.5, 0.5, 0.25,
        0.25, 0.15, 0.05, 0.05,
        0.05, 0.05, 0.05, 0.05,
        0, 0 // 2016
    ],
};
let economy1_bank = BKAM;
let economy2_bank = BCE;
let ECB = new Environnement_1.CentralBank({
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
let FED = new Environnement_1.CentralBank({
    id: "centralBank1",
    label: "centralBank1",
    centralBankID: "0",
    economyID: "0",
    isMoneyMarketStable: false,
    baseInterestBaseRate: economy1_bank.baseInterestBaseRate,
    interestBaseRateStats: economy1_bank.interestBaseRateStats
});
module.exports = [ECB, FED];
//# sourceMappingURL=CentralBanks.js.map