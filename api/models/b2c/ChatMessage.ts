/*!
 * Module dependencies
 */
let mongoose = require('mongoose-q')(require('mongoose'), {spread:true});
let Schema = mongoose.Schema;
let schemaObjectId = Schema.Types.ObjectId;
let Q = require('q');
let mongooseTimestamps = require('mongoose-timestamp');

import userRoleModel = require('../user/UserRole');

/**
 * Mongoose schema
 */
let chatMessageSchema = new Schema({

    text: { type: String },

    creator: { type: schemaObjectId, ref: 'User' },

    room : {
        roomNumber : { type: String},
        description: { type: String }
    }

});


/**
 * Mongoose plugin
 */
chatMessageSchema.plugin(mongooseTimestamps);


/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */



/**
 * Statics
 */

chatMessageSchema.statics.createValidations = function(req, userRoleId){

    req.checkBody('message', 'Chat Message should be 2-300 characters').notEmpty().len(2, 300);

    if(userRoleModel.roleList.facilitator.id === userRoleId){
        req.checkBody('seminarRoom', 'seminar socket Room Number be string characters').notEmpty().len(5, 9);
    }

    //req.checkBody('activated', 'Campaign activated should Boolean true or false').notEmpty();

    return req.validationErrors();
};


/**
 * Methods
 */



/**
 * Register Model
 */


let chatMessage = mongoose.model("Chatmessage", chatMessageSchema);
export = chatMessage;
