import * as IObject from '../IObject';

import { Management } from '../Personnel/';

import { Economy } from '../Environnement';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



interface InsurancePlanOptions {
    primaryRiskRate: number;
    premiumRate: number;
}

interface InsurancePlans {
    [index: string]: InsurancePlanOptions;
}

interface InsuranceParams extends IObject.ObjectParams {
    insuranceID?: string;

    plans: InsurancePlans;

    forceMajeureSequence: number[];

    // at this level risk is 0
    optimalManagementBudget: number;
    normalManagementBudget: number;

    payments: ENUMS.PaymentArray;
}

export default class Insurance extends IObject.IObject {
    departmentName = "finance";


    public params: InsuranceParams;

    constructor(params: InsuranceParams) {
        super(params);
    }

    premiumsBase: number;

    private forceMajeure: number;

    management: Management;

    economy: Economy;

    init(premiumsBase: number, currPeriod: number, management: Management, economy: Economy) {
        super.init();

        if (isNaN(premiumsBase)) {
            console.warn("premiumsBase NaN");

            premiumsBase = 0;
        }

        if (isNaN(currPeriod)) {
            console.warn("currPeriod NaN");

            currPeriod = 0;
        }



        this.management = management;

        this.premiumsBase = premiumsBase;

        this.economy = economy;

        this.forceMajeure = this.params.forceMajeureSequence[currPeriod - 1] || 0;
    }

    reset() {
        super.reset();

        this._claimsForLosses = 0;
    }

    // decision
    private insurancePlanTakenout: InsurancePlanOptions;

    private _claimsForLosses: number;


    // action
    takeoutInsurance(insurancePlanRef: number|string) {
        this.insurancePlanTakenout = this.params.plans[insurancePlanRef];
    }

    claims(value: number) {
        this._claimsForLosses += value;
    }

    cover(...collections: any[]) {
        let self = this;

        collections.forEach(function  (objects) {
            if (objects.length) {
                objects.forEach(function  (obj) {
                    obj.insurance = self;
                });

            } else {
                objects.insurance = self;
            }
        });
    }

    // result

    get claimsForLosses(): number {
        if (this.insurancePlanTakenout.primaryRiskRate === 0) {
            return 0;
        }

        if (this._claimsForLosses > 0) {
            return this._claimsForLosses;
        }

        let risks = this.forceMajeure;
        let risksAlphaFactors;

        let managementBudget = this.management.budget;


        if (managementBudget >= this.params.optimalManagementBudget) {
            risksAlphaFactors = 0;

        } else {
            if (managementBudget === this.params.normalManagementBudget) {
                risksAlphaFactors = 1;
            } else {
                // TODO fix it
                risksAlphaFactors = (this.params.normalManagementBudget - managementBudget) / this.params.normalManagementBudget;
            }
        }

        return risks * risksAlphaFactors;
    }

    get primaryNonInsuredRisk(): number {
        return Utils.round(this.premiumsBase * this.insurancePlanTakenout.primaryRiskRate);
    }

    get premiumsCost(): number {
        let inflationImpact = this.economy.PPIServices;

        let premiumRate = Utils.round(this.insurancePlanTakenout.premiumRate * inflationImpact, 4);

        let insurancePremiums = premiumRate * this.premiumsBase;

        return Utils.round(insurancePremiums);
    }



    get receipts(): number {
        let diff = this.claimsForLosses - this.primaryNonInsuredRisk;

        if (diff > 0) {
            return diff;

        } else {
            return 0;
        }
    }

    onFinish() {
        this.CashFlow.addPayment(this.premiumsCost, this.params.payments, 'premiums');

        this.CashFlow.addReceipt(this.receipts, this.params.payments);
    }

    get state(): any {
        return {
            "premiumsCost": this.premiumsCost,
            "claimsForLosses": this.claimsForLosses,
            "receipts": this.receipts,
            "primaryNonInsuredRisk": this.primaryNonInsuredRisk
        };

    }
}
