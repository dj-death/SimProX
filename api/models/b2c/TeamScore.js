"use strict";
/*!
 * Module dependencies
 */
let mongoose = require('mongoose-q')(require('mongoose'), { spread: true });
let Schema = mongoose.Schema;
let schemaObjectId = Schema.Types.ObjectId;
let Q = require('q');
let mongooseTimestamps = require('mongoose-timestamp');
/**
 * Mongoose schema
 */
let teamScoreSchema = new Schema({
    ranking: { type: Number, default: 0 },
    marksimosScore: { type: Number, default: 0 },
    timeCost: { type: Number },
    timeCostStatus: { type: Number },
    team: { type: schemaObjectId, ref: 'Team' },
    marksimosSeminar: { type: schemaObjectId, ref: 'Seminar' },
    campaign: { type: schemaObjectId, ref: 'Campaign' }
});
/**
 * Mongoose plugin
 */
teamScoreSchema.plugin(mongooseTimestamps);
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
/**
 * Statics
 */
teamScoreSchema.statics.updateValidations = function (req) {
    req.checkBody('name', 'Team name should be 2-50 characters').notEmpty().len(2, 50);
    //req.checkBody('description', 'Team description should be 2-50 characters').notEmpty().len(2, 50);
    return req.validationErrors();
};
/**
 * Methods
 */
/**
 * Register Model
 */
let TeamScore = mongoose.model("Teamscore", teamScoreSchema);
module.exports = TeamScore;
//# sourceMappingURL=TeamScore.js.map