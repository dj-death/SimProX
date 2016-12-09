"use strict";
const Fin = require('./');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
const Q = require('q');
class Finance {
    constructor() {
        this.departmentName = "Finance";
    }
    get Proto() {
        return Finance.prototype;
    }
    init() {
        this.insurances = [];
        this.bankAccounts = [];
        this.capital = null;
    }
    register(objects) {
        let i = 0, len = objects.length, object;
        for (; i < len; i++) {
            object = objects[i];
            if (object instanceof Fin.Insurance) {
                this.insurances.push(object);
            }
            else if (object instanceof Fin.BankAccount) {
                this.bankAccounts.push(object);
            }
            else if (object instanceof Fin.Capital) {
                this.capital = object;
            }
        }
    }
    calcOverdraftLimit(company_BankFile) {
        let sums = 0;
        this.bankAccounts.forEach(function (account) {
            sums += account.calcOverdraftLimit(company_BankFile);
        });
        return sums;
    }
    get insurancesPremiumsCost() {
        return Utils.sums(this.insurances, "premiumsCost");
    }
    get insurancesClaimsForLosses() {
        return Utils.sums(this.insurances, "claimsForLosses");
    }
    get insurancesReceipts() {
        return Utils.sums(this.insurances, "receipts");
    }
    get insurancesPrimaryNonInsuredRisk() {
        return Utils.sums(this.insurances, "primaryNonInsuredRisk");
    }
    get interestPaid() {
        return Utils.sums(this.bankAccounts, "interestPaid");
    }
    get interestReceived() {
        return Utils.sums(this.bankAccounts, "interestReceived");
    }
    get banksOverdraft() {
        return Utils.sums(this.bankAccounts, "overdraft");
    }
    get termDeposit() {
        return Utils.sums(this.bankAccounts, "termDeposit");
    }
    get termLoansValue() {
        return Utils.sums(this.bankAccounts, "termLoans");
    }
    get additionalLoans() {
        return Utils.sums(this.bankAccounts, "additionalLoans");
    }
    get balance() {
        return Utils.sums(this.bankAccounts, "balance");
    }
    get cashValue() {
        return Utils.sums(this.bankAccounts, "cash");
    }
    get interestBearingDebts() {
        return this.termLoansValue + this.banksOverdraft;
    }
    get dividendRate() {
        return this.capital.dividendRate;
    }
    getEndState(prefix) {
        let deferred = Q.defer();
        let endState = {};
        let that = this;
        let deptName = this.departmentName;
        setImmediate(function () {
            for (let key in that) {
                console.silly("fin GES @ %s of %s", key);
                if (!Finance.prototype.hasOwnProperty(key)) {
                    continue;
                }
                try {
                    let value = that[key];
                    if (!Utils.isBasicType(value)) {
                        continue;
                    }
                    if (isNaN(value)) {
                        console.warn("GES @ %s: %s is NaN", deptName, key);
                    }
                    key = prefix ? (prefix + key) : key;
                    endState[key] = value;
                }
                catch (e) {
                    console.error(e, "exception @ %s", deptName);
                    deferred.reject(e);
                }
            }
            deferred.resolve(endState);
        });
        return deferred.promise;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Finance;
//# sourceMappingURL=Finance.js.map