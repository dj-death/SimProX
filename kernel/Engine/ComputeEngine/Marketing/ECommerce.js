"use strict";
const IObject = require('../IObject');
const Game = require('../../../simulation/Games');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
let extraString = require('string');
let $jStat = require("jstat");
let jStat = $jStat.jStat;
class ECommerce extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "marketing";
    }
    restoreLastState(lastResults, lastDecs) {
        let i = 0;
        let len = Math.max(lastResults.length, lastDecs.length);
        let lastPDec;
        let lastPRes;
        this.lastWebsiteLevels = [];
        for (; i < len; i++) {
            lastPDec = lastDecs[i];
            lastPRes = lastResults[i];
            let websiteLevel = lastPRes.websiteLevel;
            if (isNaN(websiteLevel)) {
                console.warn("websiteLevel NaN");
                websiteLevel = 0;
            }
            this.lastWebsiteLevels.push(websiteLevel);
        }
        if (isNaN(lastPRes.websiteVisitsNb)) {
            console.warn("lastPRes.websiteVisitsNb NaN");
            lastPRes.websiteVisitsNb = this.params.initialVisitsNb;
        }
        this.lastPWebsiteVisitsNb = lastPRes.websiteVisitsNb;
    }
    init(activeLastPeriodWebsitePortsNb, internetMarket, distributor, economy, lastResults, lastDecs) {
        super.init();
        this.restoreLastState(lastResults, lastDecs);
        // begin from the last period
        this.activeWebsitePortsNb = activeLastPeriodWebsitePortsNb;
        this.initialActiveWebsitePortsNb = activeLastPeriodWebsitePortsNb;
        this.distributor = distributor;
        this.internetMarket = internetMarket;
        if (this.internetMarket !== null) {
            this.internetMarket.eCommerce = this;
        }
        this.economy = economy;
    }
    reset() {
        super.reset();
        //this.websiteVisitsNb = 0;
        //this.failedWebsiteVisitsNb = 0;
        //this.potentialWebsiteVisitsNb = 0;
        //this.serviceComplaintsNb = 0;
    }
    get isOnline() {
        return this.activeWebsitePortsNb > 0;
    }
    /*
     * This section gives performance statistics relating to your internet operation.
     * If you are not operating a web-site the statistics will show as 0.
     *
     */
    /*
     * Number of visits to your web-site:
     *  The number of successful visits made to your web-site last quarter.
     *  This shows the degree of interest in your web-site.
     *  Your success in converting these visits into orders for products will depend on the effectiveness of your web-site
     *  and on the marketing image of your products.
     *  This statistic is provided by your ISP.
     */
    get websiteVisitsNb() {
        return this.potentialWebsiteVisitsNb - this.failedWebsiteVisitsNb;
    }
    get failedWebsiteVisitsNb() {
        let failedVisitsNb = 0;
        let periodicity = Game.daysNbByPeriod * 24;
        let visitorsAvgNbByHour = this.potentialWebsiteVisitsNb / periodicity;
        let possibleVisitsNb = this.practicalWorkingCapacity;
        let i = 0;
        // demand on website will vary considerably from day to day, and also throughout the day
        for (; i < periodicity; i++) {
            let visitorsReelNbByHour = jStat.poisson.sample(visitorsAvgNbByHour);
            if (visitorsReelNbByHour > possibleVisitsNb) {
                failedVisitsNb += (visitorsReelNbByHour - possibleVisitsNb);
            }
        }
        return failedVisitsNb;
    }
    // depends on Corporate advertising
    get newComersNb() {
        let internetUsersNb = this.internetMarket.economy.internetUsersNb;
        let potentielNewInternetUsersNb = internetUsersNb - this.lastPWebsiteVisitsNb;
        let potentielNewVisitsNb = potentielNewInternetUsersNb * 4.15; // 4.15 visits per personne
        let visitsNb = Math.round(potentielNewVisitsNb * Math.exp(this.internetMarket.corporateComBudget * 0.0316 / 1000) / Math.pow(10, 6));
        if (visitsNb > potentielNewInternetUsersNb) {
            visitsNb = potentielNewInternetUsersNb;
        }
        return visitsNb;
    }
    get potentialWebsiteVisitsNb() {
        let visitsNb;
        let attendanceRate = this.params.attendanceRate;
        visitsNb = Math.round(attendanceRate * this.lastPWebsiteVisitsNb) + this.newComersNb;
        return visitsNb;
    }
    /*
     *  Estimated level of failed visits (%):
     *  the number of failed attempts to visit your web-site last quarter divided by the total number of potential visits.
     *  This performance statistic is provided by your ISP.
     */
    get failedWebsiteVisitsRate() {
        if (this.potentialWebsiteVisitsNb === 0) {
            return 0;
        }
        return this.failedWebsiteVisitsNb / this.potentialWebsiteVisitsNb;
    }
    /*
     *  Internet service complaints:
     *  The number of complaints received by your internet distributor because of poor packaging,
     *  incorrect addressing, or other delivery problems. It is an indication of the efficiency of your internet distributor's operation,
     *  and affects your marketing image.
     */
    get serviceComplaintsNb() {
        let totalSoldQ = this.internetMarket.soldUnitsNb;
        let distributorEff = this.internetMarket.salesForceGlobalEfficiency;
        let problemsRate = (1 - distributorEff) * 0.045 / 0.5;
        let deliveryProblems = Math.round(totalSoldQ * problemsRate);
        return deliveryProblems;
    }
    /*
     * Software determines the quality of your website (attractiveness, ease of use, etc.)
     * and you decide how much to spend on website development, which is mainly for such software.
     * Regular, independent surveys give "Star Ratings" which show how customers rate your web-site.
     * Five stars are the best possible; one star is the worst. Such information incurs an additional cost.
     *
     * Each website level requires different investments to maintain the exact number of stars.
     * The higher level of the website, the greater cost of its maintenance.
     */
    get websiteLevel() {
        let level;
        let devBudget = this.websiteDevBudget;
        if (devBudget < 1000) {
            level = 0;
        }
        else if (devBudget < 2000) {
            level = 1;
        }
        else if (devBudget < 6000) {
            level = 2;
        }
        else if (devBudget < 15000) {
            level = 3;
        }
        else if (devBudget < 40000) {
            level = 4;
        }
        else {
            level = 5;
        }
        // If you are not able to give quick and efficient service to visitors at peak times 
        // your marketing image may decline quite sharply.
        level *= (1 - this.failedWebsiteVisitsRate);
        return level;
    }
    get websiteConsumerStarRatings() {
        let starsNb = Math.round(this.websiteLevel);
        return extraString('').padLeft(starsNb, '*').s;
    }
    /*
     * your website should have the capacity to cope with the volume of traffic that it might attract.
     * This capacity is defined in terms of the number of visits per hour
     */
    get theoreticalAvgCapacity() {
        return this.activeWebsitePortsNb * 12;
    }
    get practicalWorkingCapacity() {
        let capacity = -0.0022 * Math.pow(this.activeWebsitePortsNb, 3) + 0.1893 * Math.pow(this.activeWebsitePortsNb, 2) + 6.947 * this.activeWebsitePortsNb - 6.6122;
        if (capacity < 0) {
            capacity = 0;
        }
        if (this.activeWebsitePortsNb === 1) {
            capacity = 2;
        }
        return capacity;
    }
    get requiredPortsNb() {
        let portsNb = 0.0091 * Math.pow(this.potentialWebsiteVisitsNb, 0.6582);
        return Math.round(portsNb);
    }
    // costs
    get websiteDevelopmentCost() {
        return this.websiteDevBudget;
    }
    get feesCost() {
        let fees;
        let inflationImpact = this.economy.PPIServices;
        let closingDownFees = Math.round(this.params.costs.closingDownFees * inflationImpact);
        let initialJoiningFees = Math.round(this.params.costs.initialJoiningFees * inflationImpact);
        if (this.isClosingDown) {
            fees = closingDownFees;
        }
        if (this.isInitialJoining) {
            fees = initialJoiningFees;
        }
        return fees || 0;
    }
    get websiteOperatingCost() {
        let inflationImpact = this.economy.PPIServices;
        let websiteOnePortOperating = Math.round(this.params.costs.websiteOnePortOperating * inflationImpact);
        return this.activeWebsitePortsNb * websiteOnePortOperating;
    }
    get serviceCost() {
        let inflationImpact = this.economy.PPIServices;
        let serviceCostRate = Math.round(this.params.costs.serviceCostRate * inflationImpact);
        return Math.ceil(this.internetMarket.salesRevenue * serviceCostRate);
    }
    get ISPCost() {
        return this.websiteOperatingCost + this.serviceCost;
    }
    get internetDistributionCost() {
        return this.distributor.totalCost + this.feesCost;
    }
    // actions
    developWebsite(budget) {
        if (!this.isInitialised()) {
            return false;
        }
        this.websiteDevBudget = budget;
    }
    operateOn(portsNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Utils.isInteger(portsNb)) {
            portsNb = Math.round(portsNb);
        }
        this.wantedWebsitePortsNb = portsNb;
        this.isInitialJoining = this.activeWebsitePortsNb === 0 && portsNb > 0;
        this.isClosingDown = this.activeWebsitePortsNb > 0 && portsNb === 0;
        if (this.isClosingDown) {
            this.distributor.dismiss(this.params.distributorsNb);
        }
        if (this.isInitialJoining) {
            this.distributor.recruit(this.params.distributorsNb);
        }
        if (this.params.capacityChangeEffectiveness === ENUMS.FUTURES.IMMEDIATE) {
            this.activeWebsitePortsNb = portsNb;
        }
    }
    onFinish() {
        this.CashFlow.addPayment(this.ISPCost, this.params.payments.ISP, 'ISP');
        this.CashFlow.addPayment(this.feesCost, this.params.payments.ISP, 'fees');
        this.CashFlow.addPayment(this.websiteDevelopmentCost, this.params.payments.websiteDev, 'websiteDevelopment');
    }
    get state() {
        return {
            "initialActiveWebsitePortsNb": this.initialActiveWebsitePortsNb,
            "wantedWebsitePortsNb": this.wantedWebsitePortsNb,
            "activeWebsitePortsNb": this.activeWebsitePortsNb,
            "websiteVisitsNb": this.websiteVisitsNb,
            "successfulWebsiteVisitsPerThousand": (1 - this.failedWebsiteVisitsRate) * 1000,
            "serviceComplaintsNb": this.serviceComplaintsNb,
            "distributionCost": this.internetDistributionCost,
            "ISPCost": this.ISPCost,
            "websiteDevelopmentCost": this.websiteDevelopmentCost,
            "websiteConsumerStarRatings": this.websiteConsumerStarRatings
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ECommerce;
//# sourceMappingURL=ECommerce.js.map