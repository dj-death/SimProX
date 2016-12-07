import * as IObject from '../IObject';

import { LabourPool, Economy} from '../Environnement';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



export interface EmployeeCosts {
    recruitment: number;
    dismissal: number;
    training: number;
}

export interface EmployeeParams extends IObject.ObjectParams {
    category: string;

    labourPoolID?: string;

    isUnskilled: boolean;

    skilledRateOfPay?: number;

    trainedAvailability?: ENUMS.FUTURES;

    recruitedAvailability: ENUMS.FUTURES;
    dismissedUnvailability: ENUMS.FUTURES;

    maxDismissedNb?: number;

    minRecruitedNb?: number;
    maxRecruitedNb?: number;

    maxTrainedNb?: number;
    minTrainedNb?: number;

    attritionBaseRate: number;

    costs: EmployeeCosts;
}


export class Employee extends IObject.IObject {

    // params
    params: EmployeeParams;

    labourPool: LabourPool;

    economy: Economy;

    // decision
    dismissedNb: number;
    recruitedNb: number;
    trainedNb: number;

    salary: number;

    
    recruitedEffectiveNb: number;
    trainedEffectiveNb: number;
    dismissedEffectiveNb: number;    

    constructor(params: EmployeeParams) {
        super(params);
    }

    // helpers

    init(availablesEmployeesNb: number, labourPool: LabourPool, economy: Economy): void {
        super.init();


        if (isNaN(availablesEmployeesNb)) {
            console.warn("availablesEmployeesNb NaN");

            availablesEmployeesNb = 0;
        }

        this.availablesAtStartNb = availablesEmployeesNb;
        this.employeesNb = availablesEmployeesNb;

        this.labourPool = labourPool;

        this.economy = economy;
    }

    reset() {
        super.reset();

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
    }

    onPay() { }


    //result
    employeesNb: number;

    availablesAtStartNb: number;

    resignedNb: number = 0;


    get availablesNextPeriodNb(): number {
        return this.availablesAtStartNb + this.recruitedEffectiveNb + this.trainedEffectiveNb - this.dismissedEffectiveNb - this.resignedNb;
    }

    
    // costs
    get recruitCost(): number {
        let inflationImpact = this.economy.PPIOverheads;

        let recruitment = Math.round(this.params.costs.recruitment * inflationImpact);

        // even for try
        return this.recruitedNb * recruitment;
    }

    get dismissalCost(): number {
        let inflationImpact = this.economy.PPIOverheads;

        let dismissal = Math.round(this.params.costs.dismissal * inflationImpact);

        // just on effective 
        return this.dismissedEffectiveNb * dismissal;
    }

    get trainingCost(): number {
        let inflationImpact = this.economy.PPIOverheads;

        let training = Math.round(this.params.costs.training * inflationImpact);

        return this.trainedEffectiveNb * training;
    }

    get personnelCost(): number {
        var sums = 0;

        sums += this.recruitCost;
        sums += this.dismissalCost;
        sums += this.trainingCost;

        return sums;
    }

    get wages(): number {
        var wages = this.salary * this.employeesNb;
        return wages;
    }

    get adjustedWages(): number {
        if (this.adjustedAvgEarnings === this.avgEarnings) {
            return this.wages;
        }

        return this.adjustedAvgEarnings * this.employeesNb;
    }

    protected _adjustedAvgEarnings: number = 0;

    set adjustedAvgEarnings(value: number) {
        this._adjustedAvgEarnings = value;
    }

    get adjustedAvgEarnings(): number {
        return this._adjustedAvgEarnings || this.avgEarnings;
    }


    // helpers
    protected get maxDismissedNb(): number {
        return this.params.maxDismissedNb || Number.POSITIVE_INFINITY;
    }

    protected get minRecruitedNb(): number {
        return this.params.minRecruitedNb || 0;
    }

    protected get maxRecruitedNb(): number {
        return this.params.maxRecruitedNb || Number.POSITIVE_INFINITY;
    }

    protected get maxTrainedNb(): number {
        return this.params.maxTrainedNb || Number.POSITIVE_INFINITY;
    }

    protected get minTrainedNb(): number {
        return this.params.minTrainedNb || 0;
    }

    // TODO: implement
    _calcResignedNb(): number {
        return 0;
    }



    /*
        Recruitment serves primarily to raise the productivity of new hires. As recruitment cost rises, the productivity of new hires
        should rise also, but at a diminishing rate until it finally
        levels off. These characteristics can be captured by a
        concave exponential function moderated by three
        parameters: base productivity, recruitment asymptote, and
        recruitment reaction.
    */
    get newHiresProductivity(): number {
        let productivity: number;

        let base = 0.07;
        let asymptote = 18;
        let reaction = 0.0004;
        let salary = this.adjustedAvgEarnings;

        productivity = base * (1 + (asymptote - 1) * (1 - 1 / Math.exp(salary * reaction)));

        return productivity;
    }


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



    attritionRate(): number {
        let rate: number;

        let minRate = 0.01;
        let reaction = - 0.0006;
        let earningsPerEmp = this.adjustedAvgEarnings;

        rate = minRate + (1 - minRate) * Math.exp(earningsPerEmp * reaction);

        return rate;
    }
    

    // actions

    recruit(recruitedNb: number) {
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

    }

    train(trainedNb: number) {
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
    }

    dismiss(dismissedNb: number) {
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
    }

    pay(salary: number) {
        if (!this.isInitialised()) {
            return false;
        }

        this.salary = salary;
    }

    // interface
    get avgEarnings(): number {
        return 0;
    }

    
}
