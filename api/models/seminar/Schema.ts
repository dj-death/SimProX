let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');


let reportPurchaseStatusSchema = mongoose.Schema({
    period: Number
});

let playerDecisionCommitStatusSchema = mongoose.Schema({
    period: Number,

    //isPortfolioDecisionCommitted       : Boolean,//step 1
    //isContractDeal                     : Boolean, //step 2
    //isContractFinalized                : Boolean, //step 

    isDecisionCommitted: Boolean, //step 4  
});

let memberSchema = mongoose.Schema({
    name: String,
    description: String
});


let playerSchema = mongoose.Schema({
    playerID: Number, //1,2,3 
    password: String,
    decisionReadyPeriod: Number,
    members: [memberSchema],

    decisionCommitStatus: [playerDecisionCommitStatusSchema],

    // we should think to remove it as it depend on game
    reportPurchaseStatus: [reportPurchaseStatusSchema],
});

let facilitatorSchema = mongoose.Schema({
    facilitatorDescription: String,
    password: String
});

let seminarSchema = mongoose.Schema({
    seminarCode: {
        type: String,
        require: true,
        unique: true
    },

    seminarDescription: {
        type: String,
        default: 'seminar description'
    },

    seminarDate: {
        type: Date,
        default: Date.now
    },

    currentPeriod: Number,

    isInitialise: {
        type: Boolean,
        default: false
    }, //when user login, need check this value

    playersNb: {
        type: Number,
        default: 8
    },

    players: [playerSchema],


    facilitator: [facilitatorSchema],

    //Kernel communicate parameters 
    simulationScenarioID: String,

    simulation_span: {
        type: Number,
        default: 9
    }, // round numbers
    traceActive: {
        type: Boolean,
        default: true
    },

    forceNextDecisionsOverwrite: {
        type: Boolean,
        default: true
    },


    // cr_Sup_FinalScoreWeigths     : {type:Array, default: [0.35, 0.35, 0.15, 0.15]},
    // cr_Ret_FinalScoreWeigths     : {type:Array, default: [0.35, 0.35, 0.15, 0.15]},
    //useTimeSlot                  : {type:Boolean, default:true},

    isTimerActived: {
        type: Boolean,
        default: false
    },

    // intervalle de temps

    //timeslotPortfolioDecisionCommitted : {type:Number, default: 20},
    //timeslotContractDeal               : {type:Number, default: 20},
    //timeslotContractFinalized          : {type:Number, default: 20},
    timeslotDecisionCommitted: {
        type: Number,
        default: 20
    }
});

seminarSchema.plugin(uniqueValidator);

export = seminarSchema;