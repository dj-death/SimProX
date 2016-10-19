

/*!
 * Module dependencies
 */
let mongoose = require('mongoose-q')(require('mongoose'));
let Schema = mongoose.Schema;
let schemaObjectId = Schema.Types.ObjectId;

let Q = require('q');
let mongooseTimestamps = require('mongoose-timestamp');

import config = require('../../../config');
import logger = require('../../../utils/logger');

let multer = require('multer');
let mkdirp = require('mkdirp');
let fs = require('fs');

let basePath = config.fileUploadDirectory;
let uploadPath = '/uploadimage/';

let defaultPath = uploadPath + 'default_file_path';
let tempPath = uploadPath + 'temp';

let targetPath = defaultPath;

mkdirp.sync(basePath + defaultPath);
mkdirp.sync(basePath + tempPath);




/**
 * Mongoose schema
 */
let fileStorageSchema = new Schema({

    name: { type: String },
    path:{ type: String },
    physicalAbsolutePath:{ type: String },
    uploadOriginalName: { type: String },
    uploadOriginalFileSize: { type: Number },

    mimetype: { type: String },
    encoding: { type: String },
    extension: { type: String },
    truncated: { type: Boolean , default: false},

    description: { type: String }

});

/**
 * Mongoose plugin
 */
fileStorageSchema.plugin(mongooseTimestamps);


/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */



/**
 * Statics
 */


fileStorageSchema.statics.creatFile = function  (file, fieldname) {
    if( typeof file[fieldname] !== 'undefined' ) {

        return FileStorage.createQ({
            name: file[fieldname].name,
            path: file[fieldname].path,
            physicalAbsolutePath: file[fieldname].pathAbsolute,

            uploadOriginalName: file[fieldname].originalname,
            uploadOriginalFileSize : file[fieldname].size,
            description : file[fieldname].fieldname,

            mimetype: file[fieldname].mimetype,
            encoding: file[fieldname].encoding,
            extension: file[fieldname].extension,
            truncated: file[fieldname].truncated
        });

    }else{
        throw new Error('Cancel. Because Upload File failed !');
    }

};


fileStorageSchema.statics.updateValidations = function (req){

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


let FileStorage = mongoose.model("FileStorage", fileStorageSchema);
export = FileStorage;



let mimeTypeLimit = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/bmp',
    'image/gif',

];

let uploadFeatureList = [
    {
        name : 'studentProfile',
        prefix : 'student_profile',
        postBodyField : [
            {
                name : 'studentavatar',
                filePath : 'avatar'
            }
        ]
    },

    {
        name : 'adminCampaignInfo',
        prefix : 'admin_campaign',
        postBodyField : [
            {
                name : 'uploadListCover',
                filePath : 'listcover'
            },
            {
                name : 'uploadFirstCover',
                filePath : 'firstcover'
            },
            {
                name : 'uploadBenefit1',
                filePath : 'benefit'
            },
            {
                name : 'uploadBenefit2',
                filePath : 'benefit'
            },
            {
                name : 'uploadBenefit3',
                filePath : 'benefit'
            },
            {
                name : 'uploadQualification',
                filePath : 'qualification'
            },
            {
                name : 'uploadProcess',
                filePath : 'process'
            }
        ]
    }

];




let uploadFieldsLimit = [];

uploadFeatureList.forEach(function (feature){
    feature.postBodyField.forEach(function (field){
        uploadFieldsLimit.push(field.name);
        mkdirp.sync(basePath + uploadPath +  feature.prefix + '_' + field.filePath);
    });
});




FileStorage.multerUpload = function (fieldname){
    fieldname = fieldname || '';

    return multer({
        dest : basePath + tempPath,
        limits: {
            fieldNameSize: 100,
            fields : 30,
            fieldSize : 1024,

            files: 2,
            fileSize: 1 * 1024 * 1024
        },
        rename: function  (fieldname, filename, req, res) {
            let datenow = new Date();
            let datenowString = datenow.getFullYear() + '_' + datenow.getMonth() + '_' + datenow.getDate() + '_' + datenow.getHours() + '_' + datenow.getMinutes() + '_' + datenow.getSeconds() + '_';
            return datenowString + filename.replace(/\W+/g, '_').toLowerCase() +  '_' + datenow.getTime();
        },

        onFileUploadStart: function  (file, req, res) {

            if (mimeTypeLimit.indexOf(file.mimetype) === -1 ) {
                return false;
            }

            if (uploadFieldsLimit.indexOf(file.fieldname) === -1 ) {
                logger.log('Upload file failed! Form fieldname: ' + file.fieldname + '. File name: ' + file.originalname);
                return false;
            }

            if(fieldname !== '' && fieldname !== file.fieldname){
                logger.log('Upload file failed! Form fieldname: ' + file.fieldname + '. File name: ' + file.originalname);
                return false;
            }

            //logger.log('Starting upload ... Form fieldname: '+ file.fieldname + '. File name: ' + file.originalname);

        },

        onFileUploadComplete: function  (file, req, res) {
            uploadFeatureList.forEach(function (feature){
                feature.postBodyField.forEach(function (field){

                    if(field.name ===  file.fieldname){
                        targetPath =  uploadPath +  feature.prefix + '_' + field.filePath + '/';
                    }
                });
            });

            // move to new folder path
            fs.renameSync(file.path, basePath + targetPath + file.name);

            file.path = targetPath + file.name;
            file.pathAbsolute = basePath + targetPath + file.name;

            //logger.log('Upload Finished. File name ' + file.originalname + ' uploaded to  ' + file.path);
        }
    });
}