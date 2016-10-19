"use strict";
var tagModel = require('../../models/b2c/Tag');
function addTag(req, res, next) {
    var validationErrors = tagModel.addValidations(req);
    if (validationErrors) {
        return res.status(400).send({ message: validationErrors });
    }
    tagModel.createQ({
        name: req.body.name || '',
        description: req.body.description || ''
    }).then(function (resultTag) {
        if (!resultTag) {
            throw new Error("Cancel promise chains. save tag to db failed.");
        }
        return res.status(200).send(resultTag);
    }).fail(next).done();
}
exports.addTag = addTag;
;
function updateTag(req, res, next) {
}
exports.updateTag = updateTag;
;
function searchTag(req, res, next) {
    var keywordSearch = req.query || '';
    var keywordTag = '';
    for (var prop in keywordSearch) {
        // important check that this is objects own property
        // not from prototype prop inherited
        if (keywordSearch.hasOwnProperty(prop)) {
            keywordTag = keywordTag + keywordSearch[prop];
        }
    }
    var query = {};
    if (keywordTag) {
        var strRegex = ".*[" + keywordTag.split('').join('][') + "].*";
        var regex = { $regex: strRegex, $options: 'i' }; // $options : 'i' Means case insensitivity to match upper and lower cases. 不区分大小写
        query.$or = [
            { 'name': regex }
        ];
    }
    tagModel.find(query).sort({ updatedAt: -1 }).select(tagModel.selectFields()).execQ().then(function (results) {
        var tagResultTextArray = [];
        if (results) {
            results.forEach(function (tag) {
                tagResultTextArray.push(tag.name);
            });
            return res.status(200).send(tagResultTextArray);
        }
    }).fail(next).done();
}
exports.searchTag = searchTag;
;
//# sourceMappingURL=tag.js.map