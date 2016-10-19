import tagModel = require('../../models/b2c/Tag');




export function addTag (req, res, next){
    let validationErrors = tagModel.addValidations(req);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    tagModel.createQ({
        name : req.body.name || '',
        description : req.body.description || ''

    }).then(function(resultTag){
        if(!resultTag){
            throw new Error( "Cancel promise chains. save tag to db failed.");
        }

        return res.status(200).send(resultTag);
    }).fail(next).done();


};




export function updateTag (req, res, next){

};





export function searchTag (req, res, next){

    let keywordSearch = req.query || '';
    let keywordTag = '';

    for (let prop in keywordSearch) {
        // important check that this is objects own property
        // not from prototype prop inherited
        if(keywordSearch.hasOwnProperty(prop)){
            keywordTag = keywordTag + keywordSearch[prop];
        }
    }



    let query: any = {};


    if (keywordTag) {
        let strRegex = ".*[" + keywordTag.split('').join('][') + "].*";
        let regex = { $regex: strRegex , $options: 'i' }; // $options : 'i' Means case insensitivity to match upper and lower cases. 不区分大小写

        query.$or = [
            { 'name': regex }
        ];
    }

    tagModel.find(query).sort({updatedAt:-1}).select(tagModel.selectFields()).execQ().then(function(results){

        let tagResultTextArray = [];
        if(results){

            results.forEach(function(tag){
                tagResultTextArray.push(tag.name);
            });


            return res.status(200).send(tagResultTextArray);
        }


    }).fail(next).done();

};