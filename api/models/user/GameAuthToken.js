/**
 * Created by jinwyp on 1/7/15.
 */
"use strict";
/**
 * Game Auth Token Model module.
 * @module Model Game Auth Token
 * @see module: api/model/user/gameauthtoken.js
 */
var mongoose = require('mongoose-q')(require('mongoose'));
var Schema = mongoose.Schema;
var Q = require('q');
var mongooseTimestamps = require('mongoose-timestamp');
var userRoleModel = require('./UserRole');
var gameAuthTokenSchema = new Schema({
    // system field
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: true },
    gameId: { type: Number, required: true, select: true },
    seminarId: { type: String, select: true }
});
gameAuthTokenSchema.plugin(mongooseTimestamps);
gameAuthTokenSchema.virtual('gameName').get(function () {
    return userRoleModel.gameList[this.gameId].name;
});
var gameAuthToken = mongoose.model("gameauthtoken", gameAuthTokenSchema);
module.exports = gameAuthToken;
//# sourceMappingURL=GameAuthToken.js.map