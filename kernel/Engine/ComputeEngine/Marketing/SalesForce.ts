import { Employee, EmployeeParams, EmployeeCosts } from '../Personnel';

import Market from './Market';

import { LabourPool, Economy } from '../Environnement';

import * as Scenario from '../../Scenario';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



interface SalesForceCost extends EmployeeCosts {
    minSupportPerAgent: number;
}


interface SalesForceParam extends EmployeeParams {
    agentID?: string;

    isCommissionsBasedOnOrders: boolean;

    isECommerceDistributor: boolean;
    costs: SalesForceCost;
    payments: ENUMS.PaymentArray;

    marketID: string;
    eCommerceID?: string;
}


export default class SalesForce extends Employee {
    departmentName = "marketing";

    // params
    public params: SalesForceParam;

    market: Market;

    lastStaffs: number[];
    lastCommissionRates: number[];
    lastSupports: number[];
    
    // decision
    appointedNb: number;
    commissionRate: number;

    supportPerAgent: number;

    constructor(params: SalesForceParam) {
        super(params);
    }

    // helpers
    restoreLastState(lastResults: Scenario.agentRes[], lastDecs: Scenario.agent[]) {
        let i = 0;
        let len = Math.max(lastResults.length, lastDecs.length);

        this.lastCommissionRates = [];
        this.lastStaffs = [];
        this.lastSupports = [];

        for (; i < len; i++) {
            let lastPDec = lastDecs[i];
            let lastPRes = lastResults[i];


            if (isNaN(lastPDec.commissionRate)) {
                console.warn("lastPDec.commissionRate NaN @ period %d", i);

                lastPDec.commissionRate = 0;
            }

            if (isNaN(lastPDec.support )) {
                console.warn("lastPDec.support  NaN @ period %d", i);

                lastPDec.support  = 0;
            }

            
            this.lastCommissionRates.push(lastPDec.commissionRate / 100);
            this.lastSupports.push(lastPDec.support * 1000);

            let staff = this.params.isECommerceDistributor ? this.availablesAtStartNb : lastPRes.effectiveAppointedNb;

            if (isNaN(staff)) {
                console.warn("staff  NaN @ period %d", i);

                staff = 0;
            }

            this.lastStaffs.push(staff);
        }
        
    }


    // optionnal params are force due to the heritage
    // first param is due to regression
    init(lastEmployeesNb: number, labourPool: LabourPool, economy: Economy, market?: Market, lastResults?: Scenario.agentRes[], lastDecs?: Scenario.agent[]) {        

        super.init(lastEmployeesNb, labourPool, economy);

        this.market = market;

        this.restoreLastState(lastResults, lastDecs);
    }

    // result

    // costs
    get supportCost(): number {
        return this.supportPerAgent * this.employeesNb;
    }

    get totalCost(): number {
        return this.supportCost + this.commissionsCost + this.personnelCost;
    }

    get commissionsCost(): number {
        var commissionsBase: number,
            salesRevenue: number,
            ordersValue: number,
            commissions: number;

        salesRevenue = this.market.salesRevenue;
        ordersValue = this.market.ordersValue;

        commissionsBase = this.params.isCommissionsBasedOnOrders ? ordersValue : salesRevenue;

        commissions = Math.ceil(commissionsBase * this.commissionRate);

        return commissions;
    }

    // actions
    appoint(appointedNb: number, supportPerAgent: number, commissionRate: number): boolean {
        if (!this.isInitialised()) {
            return false;
        }

        this.appointedNb = appointedNb;
        this.commissionRate = commissionRate;
        this.supportPerAgent = supportPerAgent < this.params.costs.minSupportPerAgent ? this.params.costs.minSupportPerAgent : supportPerAgent;

        if (this.employeesNb < appointedNb) {
            this.recruit(appointedNb - this.employeesNb);
        }

        if (this.employeesNb > appointedNb) {
            this.dismiss(this.employeesNb - appointedNb);
        }

        return true;
    }

    onFinish() {
        this.CashFlow.addPayment(this.totalCost, this.params.payments, 'salesForce');
    }

    get state(): any {

        return  {
            "effectiveAppointedNb": this.appointedNb,
            "resignedNb": this.resignedNb,
            "availablesNextPeriodNb": this.availablesNextPeriodNb
        };

    }

}