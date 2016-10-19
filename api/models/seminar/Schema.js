"use strict";
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var reportPurchaseStatusSchema = mongoose.Schema({
    period: Number
});
var playerDecisionCommitStatusSchema = mongoose.Schema({
    period: Number,
    //isPortfolioDecisionCommitted       : Boolean,//step 1
    //isContractDeal                     : Boolean, //step 2
    //isContractFinalized                : Boolean, //step 
    isDecisionCommitted: Boolean,
});
var memberSchema = mongoose.Schema({
    name: String,
    description: String
});
var playerSchema = mongoose.Schema({
    playerID: Number,
    password: String,
    decisionReadyPeriod: Number,
    members: [memberSchema],
    decisionCommitStatus: [playerDecisionCommitStatusSchema],
    // we should think to remove it as it depend on game
    reportPurchaseStatus: [reportPurchaseStatusSchema],
});
var facilitatorSchema = mongoose.Schema({
    facilitatorDescription: String,
    password: String
});
var seminarSchema = mongoose.Schema({
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
    },
    playersNb: {
        type: Number,
        default: 8
    },
    players: [playerSchema],
    facilitator: [facilitatorSchema],
    //Kernel communicate parameters 
    simulationScenarioID: String,
    simulationSpan: {
        type: Number,
        default: 9
    },
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
module.exports = seminarSchema;
//# sourceMappingURL=Schema.js.map