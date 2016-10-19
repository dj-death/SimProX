"use strict";
var mongoose = require('mongoose-q')(require('mongoose'));
function Numeric(key, options) {
    mongoose.SchemaType.call(this, key, options, 'Numeric');
}
Numeric.prototype = Object.create(mongoose.SchemaType.prototype);
// `cast()` takes a parameter that can be anything. You need to
// validate the provided `val` and throw a `CastError` if you
// can't convert it.
Numeric.prototype.cast = function (val) {
    var _val = !isNaN(val) ? Number(val) : 0;
    if (isNaN(_val)) {
        throw new mongoose.SchemaType.CastError('Numeric', val + ' is not a number');
    }
    return _val;
};
// Don't forget to add Numeric to the type registry
mongoose.Schema.Types.Numeric = Numeric;
// default -1 means repeat
var manufacturingTime = mongoose.Schema({
    time: {
        type: Numeric,
        default: -1,
        max: 999
    },
});
var subProduct = mongoose.Schema({
    subcontractQ: {
        type: Numeric,
        min: 0,
        max: 9999
    },
    premiumMaterialPropertion: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 1
    }
});
var product = mongoose.Schema({
    //manufacturingTime: [manufacturingTime],
    manufacturingTime: {
        type: Numeric,
        default: -1,
        max: 999
    },
    assemblyTime: {
        type: Numeric,
        default: -1,
        max: 999
    },
    improvementsTakeup: {
        type: Boolean,
        default: false
    },
    developmentBudget: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 99000
    },
    premiumMaterialPropertion: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 1
    }
});
var machineType = mongoose.Schema({
    boughtNb: {
        type: Numeric,
        default: 0,
        min: 0,
        max: 99
    },
    soldNb: {
        type: Numeric,
        default: 0,
        min: 0,
        max: 99
    }
});
var machinery = mongoose.Schema({
    maintenanceHours: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 99
    },
    types: [machineType]
});
var futures = mongoose.Schema({
    term: Numeric,
    quantity: {
        type: Numeric,
        default: 0,
        min: 0,
        max: 99000
    }
});
var material = mongoose.Schema({
    purchases: [futures]
});
var factory = mongoose.Schema({
    extension: {
        type: Numeric,
        default: 0,
        min: 0,
        max: 9999
    }
});
var worker = mongoose.Schema({
    hourlyWageRate: {
        type: Numeric,
        default: -1,
        min: 900,
        max: 9999
    },
    hire: {
        type: Numeric,
        default: 0,
        min: -9,
        max: 99
    },
    trainedNb: {
        type: Numeric,
        default: 0,
        min: 0,
        max: 9
    }
});
var subMarket = mongoose.Schema({
    advertisingBudget: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 99000
    },
    price: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 999
    },
    deliveredQ: {
        type: Numeric,
        default: -1,
        min: -999,
        max: 9999
    },
});
var agent = mongoose.Schema({
    appointedNb: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 99
    },
    commissionRate: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 0.99
    },
    support: {
        type: Numeric,
        default: -1,
        min: 5000,
        max: 99000
    }
});
var market = mongoose.Schema({
    corporateComBudget: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 99000
    },
    //agents: [agent],
    products: [subMarket]
});
var eCommerce = mongoose.Schema({
    websitePortsNb: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 99
    },
    websiteDevBudget: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 999000
    }
});
var insurance = mongoose.Schema({
    plan: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 4
    }
});
var bankAccount = mongoose.Schema({
    termLoans: Numeric,
    termDeposit: Numeric
});
var playerDecisionSchema = mongoose.Schema({
    seminarId: String,
    period: Number,
    d_CID: Number,
    d_CompanyName: String,
    d_BrandsDecisions: [Number],
    d_IsAdditionalBudgetAccepted: { type: Boolean, default: true },
    d_RequestedAdditionalBudget: { type: Number, default: 0 },
    d_InvestmentInEfficiency: { type: Number, default: 0 },
    d_InvestmentInTechnology: { type: Number, default: 0 },
    d_InvestmentInServicing: { type: Number, default: 0 },
    bs_AdditionalBudgetApplicationCounter: { type: Number, default: 0 },
    bs_BlockBudgetApplication: { type: Boolean, default: false },
    markets: [market],
    agents: [agent],
    subProducts: [subProduct],
    products: [product],
    materials: [material],
    machineries: [machinery],
    shiftLevel: {
        type: Numeric,
        default: -1,
        min: 1,
        max: 3
    },
    factories: [factory],
    eCommerces: [eCommerce],
    bankAccounts: [bankAccount],
    insurances: [insurance],
    sharesVariation: {
        type: Numeric,
        default: 0,
        min: -999000,
        max: 999000
    },
    dividend: {
        type: Numeric,
        default: 0,
        min: 0,
        max: 0.99
    },
    orderMarketSharesInfo: {
        type: Boolean,
        default: false
    },
    orderCorporateActivityInfo: {
        type: Boolean,
        default: false
    },
    staffTrainingDays: {
        type: Numeric,
        default: -1,
        min: 0,
        max: 90
    },
    managementBudget: {
        type: Numeric,
        default: -1,
        min: 30000,
        max: 999000
    },
    workers: [worker]
});
module.exports = playerDecisionSchema;
//# sourceMappingURL=CompanyDecSchema.js.map