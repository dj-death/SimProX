"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Management = (function (_super) {
    __extends(Management, _super);
    function Management(params) {
        _super.call(this, params);
        this.departmentName = "management";
        this.employees = [];
    }
    Management.prototype.init = function (lastBudget, employees, economy) {
        _super.prototype.init.call(this);
        if (isNaN(lastBudget)) {
            console.warn("lastBudget NaN");
            lastBudget = 0;
        }
        this.lastBudgetRef = lastBudget;
        this.employees = employees;
        this.economy = economy;
        var self = this;
        this.employees.forEach(function (emp) {
            emp.on("Pay", self.controlRemunerations, self);
        });
    };
    Management.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.controlAlreadyDone = false;
    };
    Management.prototype.controlRemunerations = function () {
        if (this.controlAlreadyDone) {
            return;
        }
        this.controlAlreadyDone = true;
        var machinist;
        var machinistAvgEarnings;
        var assemblyWorkerAvgEarnings;
        var assemblyWorker;
        var adjustedAvgEarnings;
        this.employees.forEach(function (emp) {
            var empParams = emp.params;
            if (empParams.isUnskilled && empParams.category === "machinist") {
                machinist = emp;
                machinistAvgEarnings = emp.avgEarnings;
            }
            if (!empParams.isUnskilled && empParams.category === "assemblyWorker") {
                assemblyWorker = emp;
                assemblyWorkerAvgEarnings = emp.avgEarnings;
            }
        });
        if (!machinist || !assemblyWorker || !machinistAvgEarnings || !assemblyWorkerAvgEarnings) {
            return false;
        }
        if (assemblyWorkerAvgEarnings >= machinistAvgEarnings) {
            return true;
        }
        adjustedAvgEarnings = Math.ceil((machinistAvgEarnings - assemblyWorkerAvgEarnings) * assemblyWorker.employeesNb);
        // fix disequilibre
        assemblyWorker.adjustedAvgEarnings = adjustedAvgEarnings;
    };
    Object.defineProperty(Management.prototype, "minTrainedEmployeesNb", {
        // results
        get: function () {
            return this.trainingDaysNb * this.params.minDailyTrainedEmployeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "maxTrainedEmployeesNb", {
        get: function () {
            return this.trainingDaysNb * this.params.maxDailyTrainedEmployeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "employeesNb", {
        get: function () {
            return Utils.sums(this.employees, "employeesNb");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "trainingDaysPerEmployee", {
        get: function () {
            var trainedNbByDay = Utils.randomInt(this.params.minDailyTrainedEmployeesNb, this.params.maxDailyTrainedEmployeesNb);
            var totalTrained = this.trainingDaysNb * trainedNbByDay;
            return totalTrained / this.employeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "trainingImpactOnProductivity", {
        /*
        Training serves primarily to raise the productivity of trained employees who remain with the firm following the period of
        training. As training cost rises, the productivity of trained
        employees should rise also. Because training cost directly affects training quality and because fatigue limits people’s ability to benefit from training, the effectiveness of training
        should be most sensitive to training cost when the training
        cost is moderate, and it should eventually level off at higher levels of training cost. These characteristics can be captured
        by a logistic function moderated by four parameters: training
        asymptote, training base, training reaction, and training
        inflection.
    */
        get: function () {
            var productivity;
            var base = -0.005;
            var asymptote = 0.25; // a.k.a max value
            var reaction = 15;
            var inflection = 0.8;
            var trainingDaysPerEmp = this.trainingDaysPerEmployee;
            productivity = base + (asymptote - base) / (1 + Math.exp(-(asymptote - base) * reaction * (trainingDaysPerEmp - inflection)));
            return productivity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "trainingCost", {
        // costs
        get: function () {
            var inflationImpact = this.economy.PPIOverheads;
            var trainingConsultantDayRate = Math.round(this.params.costs.trainingConsultantDayRate * inflationImpact);
            return this.trainingDaysNb * trainingConsultantDayRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "personnelCost", {
        get: function () {
            return Utils.sums(this.employees, "personnelCost") + this.trainingCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Management.prototype, "managementCost", {
        get: function () {
            return this.budget;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    Management.prototype.train = function (trainingDaysNb) {
        if (!this.isInitialised()) {
            return false;
        }
        this.trainingDaysNb = trainingDaysNb;
    };
    Management.prototype.allocateBudget = function (budget) {
        if (!this.isInitialised()) {
            return false;
        }
        var change = budget - this.lastBudgetRef, minBudget = this.lastBudgetRef * (1 - this.params.budget.decreaseLimitRate);
        // if decrease
        if (change < 0) {
            if (budget < minBudget) {
                budget = minBudget;
            }
            if (this.params.budget.decreaseEffectiveness !== ENUMS.FUTURES.IMMEDIATE) {
                this.nextBudgetRef = budget;
                budget = this.lastBudgetRef;
            }
        }
        this.budget = budget;
    };
    Management.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.personnelCost, this.params.payments.personnel, 'personnel');
        this.CashFlow.addPayment(this.managementCost, this.params.payments.management, 'management');
    };
    Management.prototype.getEndState = function (prefix) {
        var result = {};
        try {
            var state = {
                "managementCost": this.managementCost,
                "personnelCost": this.personnelCost,
                "employeesNb": this.employeesNb
            };
            for (var key in state) {
                var value = state[key];
                key = prefix ? (prefix + key) : key;
                result[key] = value;
            }
        }
        catch (e) {
            console.error(e, "exception @ Mng");
        }
        return result;
    };
    return Management;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Management;
//# sourceMappingURL=Management.js.map