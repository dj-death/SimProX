"use strict";
/*!
 * Module dependencies
 */
let mongoose = require('mongoose-q')(require('mongoose'), { spread: false });
let Schema = mongoose.Schema;
let schemaObjectId = Schema.Types.ObjectId;
let Q = require('q');
let mongooseTimestamps = require('mongoose-timestamp');
//let consts = require('../../consts.js');
const gameTokenModel = require('./user/GameAuthToken');
/**
 * Mongoose schema
 */
let seminarSchema = new Schema({
    seminarId: String,
    seminarCode: String,
    description: String,
    country: String,
    city: String,
    address: String,
    currentPeriod: { type: Number, default: 1 },
    simulation_span: Number,
    simulationScenarioID: String,
    seminarDate: {
        type: Date,
        default: Date.now
    },
    company_num: Number,
    isTimerActived: Boolean,
    //roundTime: Schema.Types.Mixed,
    // intervalle de temps
    roundTime: [{
            period: { type: Number },
            roundTimeHour: { type: Number },
            startTime: { type: Date },
            endTime: { type: Date },
            lockDecisionTime: [
                {
                    companyId: { type: Number },
                    companyName: { type: String },
                    lockStatus: { type: Boolean, default: false },
                    lockTime: { type: Date },
                    spendHour: { type: Number }
                }
            ]
        }],
    companies: [],
    isInitialized: { type: Boolean, default: false },
    isSimulationFinished: { type: Boolean, default: false },
    showLastPeriodScore: { type: Boolean, default: true },
    facilitatorId: String,
    belongToCampaign: { type: schemaObjectId, ref: 'Campaign' }
});
/**
 * Mongoose plugin
 */
seminarSchema.plugin(mongooseTimestamps);
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
/**
 * Statics
 */
seminarSchema.statics.findSeminarByUserId = function (userid) {
    let that = this;
    global.debug_data.gameTokenModel = gameTokenModel;
    return gameTokenModel.findOneQ({ userId: userid }).then(function (gameToken) {
        if (gameToken) {
            return that.findOneQ({ seminarId: gameToken.seminarId });
        }
    });
};
seminarSchema.statics.createValidations = function (req) {
    req.checkBody('description', 'Description should not be empty').notEmpty();
    req.checkBody('simulation_span', 'simulation_span should be 1-20').notEmpty().isInt().gt(0).lt(21);
    return req.validationErrors();
};
seminarSchema.statics.seminarIdValidations = function (req) {
    req.assert('seminar_id', 'Seminar id should not be empty').notEmpty();
    return req.validationErrors();
};
seminarSchema.statics.updateValidations = function (req) {
    req.assert('id', 'Seminar mongoose ID should be 24 characters').notEmpty().len(24, 24);
    req.sanitize('showLastPeriodScore').toBoolean();
    return req.validationErrors();
};
seminarSchema.statics.removeValidations = function (req) {
    req.assert('seminar_id', 'Seminar id should not be empty').notEmpty();
    return req.validationErrors();
};
seminarSchema.statics.studentEmailValidations = function (req) {
    if (req.body.studentemail !== '') {
        if (req.body.studentemail.indexOf('@') > -1) {
            req.checkBody('studentemail', 'Invalid email.').notEmpty().isEmail();
            req.body.email = req.body.studentemail;
        }
        else {
            req.checkBody('studentemail', 'Username should be 6-20 characters').notEmpty().len(6, 20);
            req.body.username = req.body.studentemail;
        }
    }
    else {
        if (req.body.teamcreatoremail.indexOf('@') > -1) {
            req.checkBody('teamcreatoremail', 'Invalid email.').notEmpty().isEmail();
            req.body.email = req.body.teamcreatoremail;
        }
        else {
            req.checkBody('teamcreatoremail', 'Username should be 6-20 characters').notEmpty().len(6, 20);
            req.body.username = req.body.teamcreatoremail;
        }
    }
    return req.validationErrors();
};
/**
 * Methods
 */
/**
 * Register Model
 */
let Seminar = mongoose.model("Seminar", seminarSchema);
module.exports = Seminar;
//# sourceMappingURL=Seminar.js.map