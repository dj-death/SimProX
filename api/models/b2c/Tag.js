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
var tagSchema = new Schema({
    name: { type: String },
    description: { type: String }
});
/**
 * Mongoose plugin
 */
tagSchema.plugin(mongooseTimestamps);
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
/**
 * Statics
 */
tagSchema.statics.addTags = function (tagsCreateOriginalTextArray) {
    var that = this;
    var tagsCreateCopy = tagsCreateOriginalTextArray.slice();
    var tagsCreateResult = [];
    return that.findQ({ name: { $in: tagsCreateOriginalTextArray } }).then(function (tagResult) {
        if (tagResult.length > 0) {
            tagResult.forEach(function (tagResult) {
                for (var i = tagsCreateCopy.length - 1; i >= 0; i--) {
                    if (tagResult.name === tagsCreateCopy[i]) {
                        tagsCreateCopy.splice(i, 1);
                    }
                }
            });
        }
        tagsCreateCopy.forEach(function (tagname) {
            tagsCreateResult.push({
                name: tagname
            });
        });
        return that.createQ(tagsCreateResult);
    });
};
tagSchema.statics.addValidations = function (req) {
    req.checkBody('name', 'Tag name should be 2-100 characters').notEmpty().len(2, 100);
    //req.checkBody('description', 'Campaign description should be 2-10000 characters').notEmpty().len(2, 10000);
    //req.checkBody('activated', 'Campaign activated should Boolean true or false').notEmpty();
    return req.validationErrors();
};
tagSchema.statics.selectFields = function () {
    return '-createdAt -updatedAt -__v';
};
/**
 * Methods
 */
/**
 * Register Model
 */
var tag = mongoose.model("Tag", tagSchema);
module.exports = tag;
//# sourceMappingURL=Tag.js.map