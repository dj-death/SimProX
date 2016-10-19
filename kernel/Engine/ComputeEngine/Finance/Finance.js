"use strict";
var Fin = require('./');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Q = require('q');
var Finance = (function () {
    function Finance() {
        this.departmentName = "Finance";
    }
    Object.defineProperty(Finance.prototype, "Proto", {
        get: function () {
            return Finance.prototype;
        },
        enumerable: true,
        configurable: true
    });
    Finance.prototype.init = function () {
        this.insurances = [];
        this.bankAccounts = [];
        this.capital = null;
    };
    Finance.prototype.register = function (objects) {
        var i = 0, len = objects.length, object;
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
    };
    Finance.prototype.calcOverdraftLimit = function (company_BankFile) {
        var sums = 0;
        this.bankAccounts.forEach(function (account) {
            sums += account.calcOverdraftLimit(company_BankFile);
        });
        return sums;
    };
    Object.defineProperty(Finance.prototype, "insurancesPremiumsCost", {
        get: function () {
            return Utils.sums(this.insurances, "premiumsCost");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "insurancesClaimsForLosses", {
        get: function () {
            return Utils.sums(this.insurances, "claimsForLosses");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "insurancesReceipts", {
        get: function () {
            return Utils.sums(this.insurances, "receipts");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "insurancesPrimaryNonInsuredRisk", {
        get: function () {
            return Utils.sums(this.insurances, "primaryNonInsuredRisk");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "interestPaid", {
        get: function () {
            return Utils.sums(this.bankAccounts, "interestPaid");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "interestReceived", {
        get: function () {
            return Utils.sums(this.bankAccounts, "interestReceived");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "banksOverdraft", {
        get: function () {
            return Utils.sums(this.bankAccounts, "overdraft");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "termDeposit", {
        get: function () {
            return Utils.sums(this.bankAccounts, "termDeposit");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "termLoansValue", {
        get: function () {
            return Utils.sums(this.bankAccounts, "termLoans");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "additionalLoans", {
        get: function () {
            return Utils.sums(this.bankAccounts, "additionalLoans");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "balance", {
        get: function () {
            return Utils.sums(this.bankAccounts, "balance");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "cashValue", {
        get: function () {
            return Utils.sums(this.bankAccounts, "cash");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "interestBearingDebts", {
        get: function () {
            return this.termLoansValue + this.banksOverdraft;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Finance.prototype, "dividendRate", {
        get: function () {
            return this.capital.dividendRate;
        },
        enumerable: true,
        configurable: true
    });
    Finance.prototype.getEndState = function (prefix) {
        var deferred = Q.defer();
        var endState = {};
        var that = this;
        var deptName = this.departmentName;
        setImmediate(function () {
            for (var key in that) {
                console.silly("fin GES @ %s of %s", key);
                if (!Finance.prototype.hasOwnProperty(key)) {
                    continue;
                }
                try {
                    var value = that[key];
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
    };
    return Finance;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Finance;
//# sourceMappingURL=Finance.js.map