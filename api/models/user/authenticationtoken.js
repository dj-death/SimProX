/**
 * Created by jinwyp on 1/5/15.
 */
"use strict";
var mongoose = require('mongoose-q')(require('mongoose'));
var Schema = mongoose.Schema;
var uuid = require('node-uuid');
var Q = require('q');
var mongooseTimestamps = require('mongoose-timestamp');
var logger = require('../../../kernel/utils/logger');
var userModel = require('./User');
var lastClearTime = null;
var SevenDay = 1000 * 60 * 60 * 24 * 7;
var OneDay = 1000 * 60 * 60 * 24;
var OneMinute = 1000 * 60;
var expiresTime = 1000 * 60 * 60 * 48; // 48 hours 2 days 1000 * 60 * 60 * 12
var expiresTimeRememberMe = 1000 * 60 * 60 * 24 * 30 * 6; // 6 month  1000 * 60 * 60 * 24
var tokenSchema = new Schema({
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
    var expires = userInfo.expires || this.defaultExpires(userInfo.rememberMe);
    var tokenInsert = {
        token: uuid.v4(),
        userId: userInfo.userId,
        request: userInfo.request,
        expires: expires
    };
    return this.createQ(tokenInsert);
};
//清除所有过期的token,一天清理一次
tokenSchema.statics.clearToken = function (userInfo) {
    var now = new Date();
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
var Token = mongoose.model("authenticationtoken", tokenSchema);
module.exports = Token;
//# sourceMappingURL=authenticationtoken.js.map