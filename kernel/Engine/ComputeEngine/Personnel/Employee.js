"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Employee = (function (_super) {
    __extends(Employee, _super);
    function Employee(params) {
        _super.call(this, params);
        this.resignedNb = 0;
        this._adjustedAvgEarnings = 0;
    }
    // helpers
    Employee.prototype.init = function (availablesEmployeesNb, labourPool, economy) {
        _super.prototype.init.call(this);
        if (isNaN(availablesEmployeesNb)) {
            console.warn("availablesEmployeesNb NaN");
            availablesEmployeesNb = 0;
        }
        this.availablesAtStartNb = availablesEmployeesNb;
        this.employeesNb = availablesEmployeesNb;
        this.labourPool = labourPool;
        this.economy = economy;
    };
    Employee.prototype.reset = function () {
        _super.prototype.reset.call(this);
        // Urgent: init them the case we will not affect them
        this.recruitedNb = 0;
        this.recruitedEffectiveNb = 0;
        this.trainedEffectiveNb = 0;
        this.trainedNb = 0;
        this.dismissedEffectiveNb = 0;
        this.dismissedNb = 0;
        this.salary = 0;
        this._adjustedAvgEarnings = 0;
        this.onPay = function () { };
    };
    Employee.prototype.onPay = function () { };
    Object.defineProperty(Employee.prototype, "availablesNextPeriodNb", {
        get: function () {
            return this.availablesAtStartNb + this.recruitedEffectiveNb + this.trainedEffectiveNb - this.dismissedEffectiveNb - this.resignedNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "recruitCost", {
        // costs
        get: function () {
            var inflationImpact = this.economy.PPIOverheads;
            var recruitment = Math.round(this.params.costs.recruitment * inflationImpact);
            // even for try
            return this.recruitedNb * recruitment;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "dismissalCost", {
        get: function () {
            var inflationImpact = this.economy.PPIOverheads;
            var dismissal = Math.round(this.params.costs.dismissal * inflationImpact);
            // just on effective 
            return this.dismissedEffectiveNb * dismissal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "trainingCost", {
        get: function () {
            var inflationImpact = this.economy.PPIOverheads;
            var training = Math.round(this.params.costs.training * inflationImpact);
            return this.trainedEffectiveNb * training;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "personnelCost", {
        get: function () {
            var sums = 0;
            sums += this.recruitCost;
            sums += this.dismissalCost;
            sums += this.trainingCost;
            return sums;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "wages", {
        get: function () {
            var wages = this.salary * this.employeesNb;
            return wages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "adjustedWages", {
        get: function () {
            if (this.adjustedAvgEarnings === this.avgEarnings) {
                return this.wages;
            }
            return this.adjustedAvgEarnings * this.employeesNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "adjustedAvgEarnings", {
        get: function () {
            return this._adjustedAvgEarnings || this.avgEarnings;
        },
        set: function (value) {
            this._adjustedAvgEarnings = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "maxDismissedNb", {
        // helpers
        get: function () {
            return this.params.maxDismissedNb || Number.POSITIVE_INFINITY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "minRecruitedNb", {
        get: function () {
            return this.params.minRecruitedNb || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "maxRecruitedNb", {
        get: function () {
            return this.params.maxRecruitedNb || Number.POSITIVE_INFINITY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "maxTrainedNb", {
        get: function () {
            return this.params.maxTrainedNb || Number.POSITIVE_INFINITY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Employee.prototype, "minTrainedNb", {
        get: function () {
            return this.params.minTrainedNb || 0;
        },
        enumerable: true,
        configurable: true
    });
    // TODO: implement
    Employee.prototype._calcResignedNb = function () {
        return 0;
    };
    Object.defineProperty(Employee.prototype, "newHiresProductivity", {
        /*
            Recruitment serves primarily to raise the productivity of new hires. As recruitment cost rises, the productivity of new hires
            should rise also, but at a diminishing rate until it finally
            levels off. These characteristics can be captured by a
            concave exponential function moderated by three
            parameters: base productivity, recruitment asymptote, and
            recruitment reaction.
        */
        get: function () {
            var productivity;
            var base = 0.07;
            var asymptote = 18;
            var reaction = 0.0004;
            var salary = this.adjustedAvgEarnings;
            productivity = base * (1 + (asymptote - 1) * (1 - 1 / Math.exp(salary * reaction)));
            return productivity;
        },
        enumerable: true,
        configurable: true
    });
    /*get productivity(): number {
        let productivity: number;

        let base = 0.07;
        let asymptote = 18;
        let reaction = 0.0004;
        let salary = this.adjustedAvgEarnings;

        productivity = base * (1 + (asymptote - 1) * (1 - 1 / Math.exp(salary * reaction))) * (1 + this.);

        return productivity;
    }*/
    /*
        Benefits serve primarily to lower attrition. As benefits cost
        rises, the rate of attrition should decrease, but at a
        diminishing rate until it finally levels off. These
        characteristics can be captured by a convex exponential
        function moderated by three parameters: attrition asymptote,
        attrition reaction, and attrition base.
    */
    Employee.prototype.attritionRate = function () {
        var rate;
        var minRate = 0.01;
        var reaction = -0.0006;
        var earningsPerEmp = this.adjustedAvgEarnings;
        rate = minRate + (1 - minRate) * Math.exp(earningsPerEmp * reaction);
        return rate;
    };
    // actions
    Employee.prototype.recruit = function (recruitedNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Number.isInteger(recruitedNb)) {
            recruitedNb = Math.round(recruitedNb);
        }
        // decision
        this.recruitedNb = recruitedNb;
        if (recruitedNb < this.minRecruitedNb) {
            recruitedNb = this.minRecruitedNb;
        }
        if (recruitedNb > this.maxRecruitedNb) {
            recruitedNb = this.maxRecruitedNb;
        }
        this.recruitedEffectiveNb = this.labourPool.employ(recruitedNb, this.params.isUnskilled);
        if (this.params.recruitedAvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.employeesNb += this.recruitedEffectiveNb;
        }
    };
    Employee.prototype.train = function (trainedNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Number.isInteger(trainedNb)) {
            trainedNb = Math.round(trainedNb);
        }
        this.trainedNb = trainedNb;
        if (trainedNb < this.minTrainedNb) {
            trainedNb = this.minTrainedNb;
        }
        if (trainedNb > this.maxTrainedNb) {
            trainedNb = this.maxTrainedNb;
        }
        // TODO implment
        this.trainedEffectiveNb = this.labourPool.train(trainedNb, !this.params.isUnskilled);
        if (this.params.trainedAvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.employeesNb += this.trainedEffectiveNb;
        }
    };
    Employee.prototype.dismiss = function (dismissedNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Number.isInteger(dismissedNb)) {
            dismissedNb = Math.round(dismissedNb);
        }
        this.dismissedNb = dismissedNb;
        if (dismissedNb > this.maxDismissedNb) {
            dismissedNb = this.maxDismissedNb;
        }
        // TODO implment
        this.dismissedEffectiveNb = Math.min(dismissedNb, this.availablesAtStartNb);
        if (this.params.dismissedUnvailability === ENUMS.FUTURES.IMMEDIATE) {
            this.employeesNb -= this.dismissedEffectiveNb;
        }
    };
    Employee.prototype.pay = function (salary) {
        if (!this.isInitialised()) {
            return false;
        }
        this.salary = salary;
    };
    Object.defineProperty(Employee.prototype, "avgEarnings", {
        // interface
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    return Employee;
}(IObject.IObject));
exports.Employee = Employee;
//# sourceMappingURL=Employee.js.map