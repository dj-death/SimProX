"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var Game = require('../../../simulation/Games');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var extraString = require('string');
var $jStat = require("jstat");
var jStat = $jStat.jStat;
var ECommerce = (function (_super) {
    __extends(ECommerce, _super);
    function ECommerce(params) {
        _super.call(this, params);
        this.departmentName = "marketing";
    }
    ECommerce.prototype.restoreLastState = function (lastResults, lastDecs) {
        var i = 0;
        var len = Math.max(lastResults.length, lastDecs.length);
        var lastPDec;
        var lastPRes;
        this.lastWebsiteLevels = [];
        for (; i < len; i++) {
            lastPDec = lastDecs[i];
            lastPRes = lastResults[i];
            var websiteLevel = lastPRes.websiteLevel;
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
    };
    ECommerce.prototype.init = function (activeLastPeriodWebsitePortsNb, internetMarket, distributor, economy, lastResults, lastDecs) {
        _super.prototype.init.call(this);
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
    };
    ECommerce.prototype.reset = function () {
        _super.prototype.reset.call(this);
        //this.websiteVisitsNb = 0;
        //this.failedWebsiteVisitsNb = 0;
        //this.potentialWebsiteVisitsNb = 0;
        //this.serviceComplaintsNb = 0;
    };
    Object.defineProperty(ECommerce.prototype, "isOnline", {
        get: function () {
            return this.activeWebsitePortsNb > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "websiteVisitsNb", {
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
        get: function () {
            return this.potentialWebsiteVisitsNb - this.failedWebsiteVisitsNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "failedWebsiteVisitsNb", {
        get: function () {
            var failedVisitsNb = 0;
            var periodicity = Game.daysNbByPeriod * 24;
            var visitorsAvgNbByHour = this.potentialWebsiteVisitsNb / periodicity;
            var possibleVisitsNb = this.practicalWorkingCapacity;
            var i = 0;
            // demand on website will vary considerably from day to day, and also throughout the day
            for (; i < periodicity; i++) {
                var visitorsReelNbByHour = jStat.poisson.sample(visitorsAvgNbByHour);
                if (visitorsReelNbByHour > possibleVisitsNb) {
                    failedVisitsNb += (visitorsReelNbByHour - possibleVisitsNb);
                }
            }
            return failedVisitsNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "newComersNb", {
        // depends on Corporate advertising
        get: function () {
            var internetUsersNb = this.internetMarket.economy.internetUsersNb;
            var potentielNewInternetUsersNb = internetUsersNb - this.lastPWebsiteVisitsNb;
            var potentielNewVisitsNb = potentielNewInternetUsersNb * 4.15; // 4.15 visits per personne
            var visitsNb = Math.round(potentielNewVisitsNb * Math.exp(this.internetMarket.corporateComBudget * 0.0316 / 1000) / Math.pow(10, 6));
            if (visitsNb > potentielNewInternetUsersNb) {
                visitsNb = potentielNewInternetUsersNb;
            }
            return visitsNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "potentialWebsiteVisitsNb", {
        get: function () {
            var visitsNb;
            var attendanceRate = this.params.attendanceRate;
            visitsNb = Math.round(attendanceRate * this.lastPWebsiteVisitsNb) + this.newComersNb;
            return visitsNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "failedWebsiteVisitsRate", {
        /*
         *  Estimated level of failed visits (%):
         *  the number of failed attempts to visit your web-site last quarter divided by the total number of potential visits.
         *  This performance statistic is provided by your ISP.
         */
        get: function () {
            if (this.potentialWebsiteVisitsNb === 0) {
                return 0;
            }
            return this.failedWebsiteVisitsNb / this.potentialWebsiteVisitsNb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "serviceComplaintsNb", {
        /*
         *  Internet service complaints:
         *  The number of complaints received by your internet distributor because of poor packaging,
         *  incorrect addressing, or other delivery problems. It is an indication of the efficiency of your internet distributor's operation,
         *  and affects your marketing image.
         */
        get: function () {
            var totalSoldQ = this.internetMarket.soldUnitsNb;
            var distributorEff = this.internetMarket.salesForceGlobalEfficiency;
            var problemsRate = (1 - distributorEff) * 0.045 / 0.5;
            var deliveryProblems = Math.round(totalSoldQ * problemsRate);
            return deliveryProblems;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "websiteLevel", {
        /*
         * Software determines the quality of your website (attractiveness, ease of use, etc.)
         * and you decide how much to spend on website development, which is mainly for such software.
         * Regular, independent surveys give "Star Ratings" which show how customers rate your web-site.
         * Five stars are the best possible; one star is the worst. Such information incurs an additional cost.
         *
         * Each website level requires different investments to maintain the exact number of stars.
         * The higher level of the website, the greater cost of its maintenance.
         */
        get: function () {
            var level;
            var devBudget = this.websiteDevBudget;
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "websiteConsumerStarRatings", {
        get: function () {
            var starsNb = Math.round(this.websiteLevel);
            return extraString('').padLeft(starsNb, '*').s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "theoreticalAvgCapacity", {
        /*
         * your website should have the capacity to cope with the volume of traffic that it might attract.
         * This capacity is defined in terms of the number of visits per hour
         */
        get: function () {
            return this.activeWebsitePortsNb * 12;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "practicalWorkingCapacity", {
        get: function () {
            var capacity = -0.0022 * Math.pow(this.activeWebsitePortsNb, 3) + 0.1893 * Math.pow(this.activeWebsitePortsNb, 2) + 6.947 * this.activeWebsitePortsNb - 6.6122;
            if (capacity < 0) {
                capacity = 0;
            }
            if (this.activeWebsitePortsNb === 1) {
                capacity = 2;
            }
            return capacity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "requiredPortsNb", {
        get: function () {
            var portsNb = 0.0091 * Math.pow(this.potentialWebsiteVisitsNb, 0.6582);
            return Math.round(portsNb);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "websiteDevelopmentCost", {
        // costs
        get: function () {
            return this.websiteDevBudget;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "feesCost", {
        get: function () {
            var fees;
            var inflationImpact = this.economy.PPIServices;
            var closingDownFees = Math.round(this.params.costs.closingDownFees * inflationImpact);
            var initialJoiningFees = Math.round(this.params.costs.initialJoiningFees * inflationImpact);
            if (this.isClosingDown) {
                fees = closingDownFees;
            }
            if (this.isInitialJoining) {
                fees = initialJoiningFees;
            }
            return fees || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "websiteOperatingCost", {
        get: function () {
            var inflationImpact = this.economy.PPIServices;
            var websiteOnePortOperating = Math.round(this.params.costs.websiteOnePortOperating * inflationImpact);
            return this.activeWebsitePortsNb * websiteOnePortOperating;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "serviceCost", {
        get: function () {
            var inflationImpact = this.economy.PPIServices;
            var serviceCostRate = Math.round(this.params.costs.serviceCostRate * inflationImpact);
            return Math.ceil(this.internetMarket.salesRevenue * serviceCostRate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "ISPCost", {
        get: function () {
            return this.websiteOperatingCost + this.serviceCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ECommerce.prototype, "internetDistributionCost", {
        get: function () {
            return this.distributor.totalCost + this.feesCost;
        },
        enumerable: true,
        configurable: true
    });
    // actions
    ECommerce.prototype.developWebsite = function (budget) {
        if (!this.isInitialised()) {
            return false;
        }
        this.websiteDevBudget = budget;
    };
    ECommerce.prototype.operateOn = function (portsNb) {
        if (!this.isInitialised()) {
            return false;
        }
        if (!Number.isInteger(portsNb)) {
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
    };
    ECommerce.prototype.onFinish = function () {
        this.CashFlow.addPayment(this.ISPCost, this.params.payments.ISP, 'ISP');
        this.CashFlow.addPayment(this.feesCost, this.params.payments.ISP, 'fees');
        this.CashFlow.addPayment(this.websiteDevelopmentCost, this.params.payments.websiteDev, 'websiteDevelopment');
    };
    Object.defineProperty(ECommerce.prototype, "state", {
        get: function () {
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
        },
        enumerable: true,
        configurable: true
    });
    return ECommerce;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ECommerce;
//# sourceMappingURL=ECommerce.js.map