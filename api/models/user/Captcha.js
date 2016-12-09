"use strict";
/**
 * Created by pengchengbi on 3/30/15.
 */
/*!
 * Module dependencies
 */
let mongoose = require('mongoose-q')(require('mongoose'), { spread: true });
let Schema = mongoose.Schema;
let Q = require('q');
let mongooseTimestamps = require('mongoose-timestamp');
/**
 * Mongoose schema
 */
let captchaSchema = new Schema({
    txt: { type: String, required: true }
});
/**
 * Mongoose plugin
 */
captchaSchema.plugin(mongooseTimestamps);
/**
 * Register Model
 */
let Captcha = mongoose.model("Captcha", captchaSchema);
module.exports = Captcha;
//# sourceMappingURL=Captcha.js.map