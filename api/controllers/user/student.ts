import userModel = require('../../models/user/User');
import userRoleModel = require('../../models/user/UserRole');
import teamModel = require('../../models/user/Team');
import fileUploadModel = require('../../models/user/fileupload');
import MKError = require('../../utils/error-code');

let _ = require('lodash');
let request = require('request');
let Q = require('q');

import config = require('../../../config');
import nodeBB = require('../../utils/nodeBB');
//let ObjectId = require('mongoose').Types.ObjectId;


let pickedUpdatedKeys = ['gender', 'birthday', 'firstName', 'lastName', 'idcardNumber',  'mobilePhone', 'qq', 'gameMarksimosPosition',
    'majorsDegree', 'dateOfEnterCollege', 'dateOfGraduation', 'organizationOrUniversity', 'occupation', 'currentLocation',
    'country', 'state', 'city', 'district', 'street', 'websiteLanguage', 'workExperiences', 'LanguageSkills', 'eductionBackgrounds', 'societyExperiences'];


export function  updateStudentB2CInfo (req, res, next){
    let validationErrors = userModel.userInfoValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    let updatedUser = _.pick(req.body, pickedUpdatedKeys);

    let promise = Q();

    if(updatedUser.mobilePhone && req.user.mobilePhone !== updatedUser.mobilePhone) {
        updatedUser.phoneVerified = false;
        promise = userModel.findOneQ({mobilePhone : req.body.mobilePhone})
        .then(function (resultUser) {
            if (resultUser) {
                throw new MKError('Cancel promise chains. Because this mobilePhone is taken by other user.', MKError.errorCode.userInfo);
            }
        });
    }

    promise.then(function (){
        _.extend(req.user, updatedUser);
        return req.user.saveQ();
    })
    .then(function (savedDoc) {

        return res.status(200).send({message: 'Student update success'});
    })
    .fail(next).done();
};



export function  uploadStudentAvatar (req, res, next){

    fileUploadModel.creatFile(req.files, 'studentavatar').then(function (result){

        if(!result ){
            throw new Error('Cancel promise chains. Because Create New File failed !');
        }

        return userModel.findOneAndUpdateQ({ _id : req.user._id} , {avatar : result._id});

    }).then(function ( savedDoc){

        if(!savedDoc ){
            throw new Error('Cancel promise chains. Because Update User failed. More or less than 1 record is updated. it should be only one !');
        }
        return res.status(200).send({message: 'Upload Avatar picture success'});


    }).fail(next).done();

};


export function  updateStudentB2CPassword (req, res, next){

    let validationErrors = userModel.passwordValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    userModel.findByIdQ(req.user._id).then(function (resultUser){

        if(!resultUser){
            throw new Error('Cancel promise chains. Because user not found !');
        }

        if (!userModel.verifyPassword(req.body.passwordOld, resultUser.password)) {
            throw new Error('Cancel promise chains. Because Old password wrong!');
        }

        resultUser.password = req.body.passwordNew;
        return resultUser.saveQ();

    }).then(function (savedDoc){


        if(savedDoc[0].bbsUid){
            nodeBB.resetNodeBBPassword(savedDoc[0].bbsUid, req.body.passwordNew);
        }

        return res.status(200).send({message: 'Student password update success'});

    }).fail(function (err){
        next(err);
    }).done();
};







export function  updateTeam (req, res, next){

    let validationErrors = teamModel.updateValidations(req);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }


    teamModel.findOneQ({ name:req.body.name }).then(function (result){
        if (result) {
            throw new MKError('Cancel promise chains. Because team name exist', MKError.errorCode.common.alreadyExist);
        }

        return teamModel.findOneAndUpdateQ(
            { creator : req.user._id },
            { name:req.body.name, description:req.body.description||''  },
            { upsert : true}
        );
    }).then(function (resultTeam){

        if(!resultTeam){
            throw new Error('Cancel promise chains. Because Update Team failed. more or less than 1 record is updated. it should be only one !');
        }

        return res.status(200).send({message: 'Team update success'});

    }).fail(function (err){
        next(err);
    }).done();
};


export function  addStudentToTeam (req, res, next){

    let validationErrors = userModel.usernameValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    let userData: any = {};

    userModel.findOneQ({$or : [
        { 'username': req.body.username},
        { 'email': req.body.email}
    ]}).then(function (resultUser) {

        if (!resultUser) {
            throw new MKError('Cancel promise chains. Because User not found!', MKError.errorCode.common.notFound);
        }

        if (resultUser._id.equals(req.user._id)) {
            throw new Error('Cancel promise chains. Because User can not add himself in his own team !');
        }

        userData = resultUser;
        return teamModel.findOneQ({ creator: req.user._id });

    }).then(function (resultTeam){
        if(resultTeam){

            if(resultTeam.memberList.indexOf(userData._id) > -1){
                throw new Error('Cancel promise chains. Because This user is already in the Team !');
            }

            resultTeam.memberList.push(userData._id);
            resultTeam.saveQ().then(function (result){

                return res.status(200).send({message: 'Add student to team success'});

            }).fail(function (err){
                next(err);
            }).done();

        }else{
            teamModel.createQ({
                name: req.user.username,
                creator: req.user._id,
                memberList : [userData._id]
            }).then(function (resultNewTeam){

                if(!resultNewTeam ){
                    throw new Error('Cancel promise chains. Because Create New Team failed !');
                }

                return res.status(200).send({message: 'Create New Team success'});

            }).fail(function (err){
                next(err);
            }).done();
        }
    }).fail(function (err){
        next(err);
    }).done();
};


export function  removeStudentToTeam (req, res, next){

    let validationErrors = userModel.userIdValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    let userData: any = {};

    userModel.findByIdQ(req.params._id).then(function (resultUser) {

        if (!resultUser) {
            throw new Error('Cancel promise chains. Because User not found!');
        }

        userData = resultUser;
        return teamModel.findOneQ({ creator: req.user._id });

    }).then(function (resultTeam){

        if(!resultTeam){
            throw new Error('Cancel promise chains. Because Team not found!');
        }

        resultTeam.memberList.forEach(function (member, index){
            if(member.toString() === userData.id){
                resultTeam.memberList.splice(index, 1);
            }
        });

        return resultTeam.saveQ();

    }).then(function (result){

        return res.status(200).send({message: 'Remove student to team success'});

    }).fail(function (err){
        next(err);
    }).done();
};



