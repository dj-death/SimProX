"use strict";
/*!
 * Module dependencies
 */
var mongoose = require('mongoose-q')(require('mongoose'), { spread: true });
var Schema = mongoose.Schema;
var schemaObjectId = Schema.Types.ObjectId;
var Q = require('q');
var mongooseTimestamps = require('mongoose-timestamp');
/**
 * Mongoose schema
 */
var teamSchema = new Schema({
    name: { type: String },
    description: { type: String },
    creator: { type: schemaObjectId, ref: 'User' },
    memberList: [{ type: schemaObjectId, ref: 'User' }],
    joinCampaignTime: { type: Date }
});
/**
 * Mongoose plugin
 */
teamSchema.plugin(mongooseTimestamps);
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
/**
 * Statics
 */
teamSchema.statics.updateValidations = function (req) {
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
var Team = mongoose.model("Team", teamSchema);
module.exports = Team;
//# sourceMappingURL=Team.js.map