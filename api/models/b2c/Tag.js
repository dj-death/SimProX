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
let tagSchema = new Schema({
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
    let that = this;
    let tagsCreateCopy = tagsCreateOriginalTextArray.slice();
    let tagsCreateResult = [];
    return that.findQ({ name: { $in: tagsCreateOriginalTextArray } }).then(function (tagResult) {
        if (tagResult.length > 0) {
            tagResult.forEach(function (tagResult) {
                for (let i = tagsCreateCopy.length - 1; i >= 0; i--) {
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
let tag = mongoose.model("Tag", tagSchema);
module.exports = tag;
//# sourceMappingURL=Tag.js.map