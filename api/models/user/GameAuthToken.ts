/**
 * Created by jinwyp on 1/7/15.
 */

/**
 * Game Auth Token Model module.
 * @module Model Game Auth Token
 * @see module: api/model/user/gameauthtoken.js
 */

let mongoose = require('mongoose-q')(require('mongoose'));
let Schema = mongoose.Schema;
let Q = require('q');
let mongooseTimestamps = require('mongoose-timestamp');

let userRoleModel = require('./UserRole');


let gameAuthTokenSchema = new Schema({

    // system field
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: true },
    gameId: { type: Number, required: true, select: true },
    seminarId: { type: String, select: true}

});

gameAuthTokenSchema.plugin(mongooseTimestamps);


gameAuthTokenSchema.virtual('gameName').get(function  () {
    return userRoleModel.gameList[this.gameId].name ;
});


let gameAuthToken = mongoose.model("gameauthtoken", gameAuthTokenSchema);

export = gameAuthToken;