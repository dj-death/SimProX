import * as IObject from '../IObject';

import * as Employee from './Employee';

import { Economy } from '../Environnement';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



interface ManagementParams extends IObject.ObjectParams {
    minDailyTrainedEmployeesNb: number;
    maxDailyTrainedEmployeesNb: number;

    budget: {
        decreaseEffectiveness: ENUMS.FUTURES;
        decreaseLimitRate: number;
    }

    costs: {
        trainingConsultantDayRate: number;
    }

    payments: {
        management: ENUMS.PaymentArray;
        personnel: ENUMS.PaymentArray;
    }
}


export default class Management extends IObject.IObject {
    departmentName = "management";

    params: ManagementParams;

    employees: Employee.Employee[] = [];

    constructor(params: ManagementParams) {
        super(params);
    }

    lastBudgetRef: number;
    nextBudgetRef: number;

    controlAlreadyDone: boolean;

    economy: Economy;

    init(lastBudget: number, employees: Employee.Employee[], economy: Economy) {
        super.init();

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
    }

    reset() {
        super.reset();

        this.controlAlreadyDone = false;
    }

    controlRemunerations() {
        if (this.controlAlreadyDone) {
            return;
        }

        this.controlAlreadyDone = true;

        var machinist: Employee.Employee;
        var machinistAvgEarnings;

        var assemblyWorkerAvgEarnings;
        var assemblyWorker: Employee.Employee;

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
        
    }

    // decisions
    trainingDaysNb: number;
    budget: number;

    // results
    get minTrainedEmployeesNb(): number {
        return this.trainingDaysNb * this.params.minDailyTrainedEmployeesNb;
    }

    get maxTrainedEmployeesNb(): number {
        return this.trainingDaysNb * this.params.maxDailyTrainedEmployeesNb;
    }

    get employeesNb(): number {
        return Utils.sums(this.employees, "employeesNb");
    }


    get trainingDaysPerEmployee(): number {
        let trainedNbByDay = Utils.randomInt(this.params.minDailyTrainedEmployeesNb, this.params.maxDailyTrainedEmployeesNb);
        let totalTrained = this.trainingDaysNb * trainedNbByDay;

        return totalTrained / this.employeesNb;

    }

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
    get trainingImpactOnProductivity(): number {
        let productivity: number;

        let base = -0.005;
        let asymptote = 0.25; // a.k.a max value
        let reaction = 15;
        let inflection = 0.8;

        let trainingDaysPerEmp = this.trainingDaysPerEmployee;

        productivity = base + (asymptote - base) / (1 + Math.exp(-(asymptote - base) * reaction * (trainingDaysPerEmp - inflection)));

        return productivity;
    }

    // costs
    get trainingCost(): number {
        let inflationImpact = this.economy.PPIOverheads;

        let trainingConsultantDayRate = Math.round(this.params.costs.trainingConsultantDayRate * inflationImpact);

        return this.trainingDaysNb * trainingConsultantDayRate;
    }

    get personnelCost(): number {
        return Utils.sums(this.employees, "personnelCost") + this.trainingCost;
    }

    get managementCost(): number {
        return this.budget;
    }

    // actions

    train(trainingDaysNb: number) {
        if (!this.isInitialised()) {
            return false;
        }

        this.trainingDaysNb = trainingDaysNb;
    }

    allocateBudget(budget: number) {
        if (!this.isInitialised()) {
            return false;
        }

        let change = budget - this.lastBudgetRef,
            minBudget = this.lastBudgetRef * (1 - this.params.budget.decreaseLimitRate);


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
    }

    onFinish() {
        this.CashFlow.addPayment(this.personnelCost, this.params.payments.personnel, 'personnel');
        this.CashFlow.addPayment(this.managementCost, this.params.payments.management, 'management');
    }

    getEndState(prefix?: string): any {
        var result = {};

        try {
            var state = {
                "managementCost": this.managementCost,
                "personnelCost": this.personnelCost,
                "employeesNb": this.employeesNb
            };

            for (var key in state) {

                let value = state[key];

                key = prefix ? (prefix + key) : key;
                result[key] = value;
            }

        } catch (e) {
            console.error(e, "exception @ Mng");
        }

        return result;

    }


}