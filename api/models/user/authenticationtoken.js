/**
 * Created by jinwyp on 1/5/15.
 */
"use strict";
let mongoose = require('mongoose-q')(require('mongoose'));
let Schema = mongoose.Schema;
let uuid = require('node-uuid');
let Q = require('q');
let mongooseTimestamps = require('mongoose-timestamp');
let logger = require('../../../kernel/utils/logger');
const userModel = require('./User');
let lastClearTime = null;
let SevenDay = 1000 * 60 * 60 * 24 * 7;
let OneDay = 1000 * 60 * 60 * 24;
let OneMinute = 1000 * 60;
let expiresTime = 1000 * 60 * 60 * 48; // 48 hours 2 days 1000 * 60 * 60 * 12
let expiresTimeRememberMe = 1000 * 60 * 60 * 24 * 30 * 6; // 6 month  1000 * 60 * 60 * 24
let tokenSchema = new Schema({
    token: { type: String, required: true },
    userId: { type: String, required: true },
    request: {
        ip: { type: String, required: false },
        userAgent: { type: String, required: false }
    },
    expires: { type: Date, required: true }
});
tokenSchema.plugin(mongooseTimestamps);
tokenSchema.statics.defaultExpires = function (rememberme) {
    if (rememberme) {
        return new Date(new Date().getTime() + expiresTimeRememberMe);
    }
    return new Date(new Date().getTime() + expiresTime);
};
//保存token
tokenSchema.statics.createToken = function (userInfo) {
    let expires = userInfo.expires || this.defaultExpires(userInfo.rememberMe);
    let tokenInsert = {
        token: uuid.v4(),
        userId: userInfo.userId,
        request: userInfo.request,
        expires: expires
    };
    return this.createQ(tokenInsert);
};
//清除所有过期的token,一天清理一次
tokenSchema.statics.clearToken = function (userInfo) {
    let now = new Date();
    lastClearTime = +now - OneMinute;
    //删除 从现在开始已过期1分钟的数据,防止边界问题
    Token.remove({ expires: { $lt: lastClearTime } }, function (err, rowNum) {
        logger.log("clear " + rowNum + " expired token.");
    });
    setTimeout(Token.clearToken, SevenDay);
};
tokenSchema.statics.verifyToken = function (token, callback) {
    Token.findOne({ token: token }, function (errToken, tokenInfo) {
        if (errToken) {
            return callback(errToken);
        }
        //token存在且未过期
        if (tokenInfo && tokenInfo.expires > new Date()) {
            userModel.findOne({ _id: tokenInfo.userId }).populate('avatar', '-physicalAbsolutePath').select(userModel.selectFields()).exec(function (err, user) {
                if (err) {
                    return callback(err);
                }
                if (!user) {
                    //token存在，用户不存在，则可能用户已被删除
                    return callback('Token existed, but user not found.');
                }
                return callback(null, user);
            });
        }
        else {
            //token过期
            callback('Token have expired.');
        }
    });
};
let Token = mongoose.model("authenticationtoken", tokenSchema);
module.exports = Token;
//# sourceMappingURL=authenticationtoken.js.map