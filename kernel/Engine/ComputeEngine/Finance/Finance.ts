
import * as Fin from './';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');

import Q = require('q');


export default class Finance {
    departmentName = "Finance";

    get Proto(): Finance {
        return Finance.prototype;
    }

    private insurances: Fin.Insurance[];

    private bankAccounts: Fin.BankAccount[];

    capital: Fin.Capital;

    init() {
        this.insurances = [];
        this.bankAccounts = [];

        this.capital = null;
    }


    register(objects: any[]) {

        var i = 0,
            len = objects.length,
            object;

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

    calcOverdraftLimit(company_BankFile): number {
        var sums = 0;

        this.bankAccounts.forEach(function  (account) {
            sums += account.calcOverdraftLimit(company_BankFile);

        });

        return sums;
    }
    
    get insurancesPremiumsCost(): number {
        return Utils.sums(this.insurances, "premiumsCost");
    }

    get insurancesClaimsForLosses(): number {
        return Utils.sums(this.insurances, "claimsForLosses");
    }

    get insurancesReceipts(): number {
        return Utils.sums(this.insurances, "receipts");
    }

    get insurancesPrimaryNonInsuredRisk(): number {
        return Utils.sums(this.insurances, "primaryNonInsuredRisk");
    }

    get interestPaid(): number {
        return Utils.sums(this.bankAccounts, "interestPaid");
    }

    get interestReceived(): number {
        return Utils.sums(this.bankAccounts, "interestReceived");
    }

    get banksOverdraft(): number {
        return Utils.sums(this.bankAccounts, "overdraft");
    }

    get termDeposit(): number {
        return Utils.sums(this.bankAccounts, "termDeposit");
    }

    get termLoansValue(): number {
        return Utils.sums(this.bankAccounts, "termLoans");
    }

    get additionalLoans(): number {
        return Utils.sums(this.bankAccounts, "additionalLoans");
    }

    get balance(): number {
        return Utils.sums(this.bankAccounts, "balance");
    }

    get cashValue(): number {
        return Utils.sums(this.bankAccounts, "cash");
    }

    get interestBearingDebts(): number {
        return this.termLoansValue + this.banksOverdraft;
    }

    get dividendRate(): number {
        return this.capital.dividendRate;
    }


    getEndState(prefix?: string): Q.Promise<any> {
        let deferred = Q.defer();


        var endState = {};

        let that: Object = this;

        let deptName = this.departmentName;

        setImmediate(function  () {

            for (var key in that) {
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

                } catch (e) {
                    console.error(e, "exception @ %s", deptName);
                    deferred.reject(e);
                }
            }

            deferred.resolve(endState);
        });

        return deferred.promise;

    }

}