import userModel = require('../../models/user/User');
import userRoleModel = require('../../models/user/UserRole');
import teamModel = require('../../models/user/Team');

import Token = require('../../models/user/authenticationtoken');


import campaignModel = require('../../models/b2c/Campaign');
import seminarModel = require('../../models/Seminar');

import emailModel = require('../../models/user/EmailContent');
import Captcha = require('../../models/user/Captcha');

import MessageXSend = require('../../utils/submail/messageXSend');
import MKError = require('../../utils/error-code');

import mailProvider = require('../../utils/sendCloud');
let mailSender = mailProvider.createEmailSender();

let _ = require('lodash');
let uuid = require('node-uuid');
let util = require('util');
let Q = require('q');
let request = require('request');
let jwt = require("jsonwebtoken");

let unless = require('express-unless');

let passportJWT = require("passport-jwt");

let JwtStrategy = passportJWT.Strategy,
    ExtractJwt = passportJWT.ExtractJwt;


import console = require('../../../kernel/utils/logger');
import utility = require('../../utils/utility');
import nodeBB = require('../../utils/nodeBB');
import config = require('../../../config');

let expiresTime = 60 * 60 * 24; // 1 days


/**
 * Passport LocalStrategy For Login and Generate Token.
 */

Token.clearToken();


//Passport
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;



/**
 * Passport LocalStrategy For Login and Generate Token.
 */

//Token.clearToken();


function UnpermissedError(code, error) {
    Error.captureStackTrace(this, this.constructor)

    this.name = this.constructor.name
    this.message = error.message

    this.code = code
    this.status = 403
    this.inner = error
}

function UnauthorizedError(code, error) {
    Error.call(this, error.message);
    Error.captureStackTrace(this, this.constructor);
    this.name = "UnauthorizedError";
    this.message = error.message;
    this.code = code;
    this.status = 401;
    this.inner = error;
}

UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;


export function initAuth() {
    /*let cookieExtractor = function (req) {

        let token = null;
        if (req && req.cookies) {
            token = req.cookies['x-access-token'];
        }

        return token;
    };

    let opts = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET
    };
    
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        userModel.findById(jwt_payload._id, function (err, user) {
            if (err) {
                return done(err);
            }

            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));*/

    
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passReqToCallback: true

    }, function  (req, username, password, done) {

        req.assert('password', '5 to 20 characters required').len(5, 20);

        if (req.body.username.indexOf('@') > -1 ){
            req.body.email = req.body.username;
            req.checkBody('email', 'Invalid email').notEmpty().isEmail();

        } else {
            req.checkBody('username', 'Username should be 5-20 characters').notEmpty().len(5, 20);
        }

        let errors = req.validationErrors();
        if (errors) {
            return done(null, false, { message: util.inspect(errors) });
        }

        let rememberMe = false;
        if(req.body.rememberMe){
            rememberMe = true;
        };


        userModel.findOne( {$or : [
            { username: req.body.username},
            { email: req.body.email}

        ]}, function  (err, user) {
            if (err) {
                return done(err);
            }
            
            if (!user) {
                return done(null, false, { message: 'User does not exist.' });
            }

            if (!userModel.verifyPassword(password, user.password)) {
                return done(null, false, { message: 'Username or password wrong.' });
            }

            Token.createToken({ userId: user._id, rememberMe: rememberMe }).then(function (tokenInfo) {
                user.token = tokenInfo.token;
                user.tokenExpires = tokenInfo.expires;

                done(null, user);
            }).fail(function (err) {
                done({ message: util.inspect(err) }, false);
            }).done();

            //done(null, user);
        });

    }));

}


export function  studentLogin (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).send({ message: info.message });
        }


        if (user.role === userRoleModel.roleList.student.id) {

            if (user.bbsUid && (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'ken' || process.env.NODE_ENV === 'jin')) {
                nodeBB.loginNodeBB(req.body.username, req.body.password, function (err, cookie) {
                    res.setHeader('Set-Cookie', cookie);
                    res.cookie('x-access-token', user.token, { maxAge: user.tokenExpires, httpOnly: true });

                    return res.status(200).send({ message: 'Login success.', token: user.token });

                    // create a token
                    /*let token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
                        expiresIn: expiresTime // in sec
                    });

                    return res.status(200).send({ 'token': token, message: 'Login success.' });*/
                });

            } else {
                res.cookie('x-access-token', user.token, { maxAge: user.tokenExpires, httpOnly: true });
                return res.status(200).send({ message: 'Login success.', token: user.token });
            }

        }


        return res.status(403).send({ message: 'Your account is a ' + user.roleName + ' account, you need a student account login' });

    })(req, res, next);
}


export function adminLogin(req, res, next) {

    passport.authenticate('local', function  (err, user, info) {

        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).send({ message: info.message });
        }


        if (user.role === userRoleModel.roleList["admin"].id || user.role === userRoleModel.roleList["distributor"].id || user.role === userRoleModel.roleList["facilitator"].id) {
            // create a token
            res.cookie('x-access-token', user.token, { maxAge: user.tokenExpires, httpOnly: true });
            return res.status(200).send({ message: 'Login success.', token: user.token });

        } else {

            return res.status(403).send({ message: 'Your account is a ' + user.roleName + ' account, you need a admin account login' });
        }

    })(req, res, next);
}



export function  logout(req, res, next){
    req.logout();
    res.clearCookie('x-access-token');

    if(config.domain){
        res.clearCookie('express.sid', {domain: '.'+config.domain});
    }

    res.status(200).send({message: 'Logout success'});
};




/**
 * Authenticate Token  For LocalStrategy.
 *
 *  * Examples:
 *
 *    authLoginToken( { successRedirect: '/',  failureRedirect: '/login',  failureFlash: true });
 *
 */


export function authLoginToken(options: any = {}) {
    
    let middleware: any = function (req, res, next) {
        options = options || {};

        if (typeof options.failureRedirect === 'undefined') {
            options.failureRedirect = false;
        }

        function lookup(obj, field) {
            if (!obj) { return null; }
            let chain = field.split(']').join('').split('[');
            for (let i = 0, len = chain.length; i < len; i++) {
                let prop = obj[chain[i]];
                if (typeof (prop) === 'undefined') { return null; }
                if (typeof (prop) !== 'object') { return prop; }
                obj = prop;
            }
            return null;
        }

        function sendFailureResponse(options, next) {

            if (options.failureRedirect) {
                return res.redirect(options.failureRedirect);
            }


            return next(new UnauthorizedError(
                'permission_denied', { message: 'Permission denied' }
            ));

        }

        function sendSuccessResponse(options, next) {
            if (options.successRedirect) {
                return res.redirect(options.successRedirect);
            }

            return next();
        }

        let tokenName = 'x-access-token';
        let token = req.headers[tokenName] || lookup(req.body, tokenName) || lookup(req.query, tokenName) || req.cookies[tokenName];


        if (token) {
            Token.verifyToken(token, function (err, user) {
                if (err) {
                    options.message = err;
                    return sendFailureResponse(options, next);
                }


                req.user = user;


                // 同时查询改用户当前所玩的Seminar
                seminarModel.findSeminarByUserId(user.id).then(function (seminarResult) {

                    if (seminarResult) {

                        req.gameMarksimos = {
                            currentStudent: user,
                            currentStudentSeminar: seminarResult,
                            socketRoom: {
                                seminar: false,
                                company: false
                            }
                        };

                        let company = _.find(seminarResult.companies, function (company) {
                            return company.studentList.indexOf(user.email) > -1;
                        });

                        if (typeof company !== 'undefined') {
                            req.gameMarksimos.socketRoom = {
                                seminar: seminarResult.seminarId.toString(),
                                company: seminarResult.seminarId.toString() + company.companyId.toString()
                            };
                        }

                        // very important, after seminar finished currentPeriod is last round
                        if (req.gameMarksimos.currentStudentSeminar.currentPeriod > req.gameMarksimos.currentStudentSeminar.simulationSpan) {
                            req.gameMarksimos.currentStudentSeminar.currentPeriod = req.gameMarksimos.currentStudentSeminar.simulationSpan;
                        }

                    } else {
                        req.gameMarksimos = {
                            currentStudent: false,
                            currentStudentSeminar: false,
                            socketRoom: {
                                seminar: false,
                                company: false
                            }
                        };
                    }


                    return sendSuccessResponse(options, next);

                }).fail(function (err) {
                    next(err);
                }).done();
            });

        } else {
            options.message = 'Token not found, pls login .';
            sendFailureResponse(options, next);
        }

    };


    middleware.unless = require('express-unless');
    middleware.UnauthorizedError = UnauthorizedError;

    return middleware;
};




/**
 * Middleware that will authorize a UserRole  with optional `options`.
 *
 * Examples:
 *
 *    authRole('twitter-authz', { successRedirect: '/',  failureRedirect: '/login',  failureFlash: true });
 *
 * @param {Object} options
 */


export function  authRole(permission: string = '', options: any = {}) {
    return function (req, res, next) {

        let user = req.user;

        if (!user) {
            return next(new UnauthorizedError(
                'permission_denied', { message: 'Permission denied' }
            ));
        }

        permission = permission || "";
        options = options || {};


        let hasPermissions = userRoleModel.authRolePermission(permission, user.roleId);

        if (hasPermissions) {
            return next();

        } else {
            if (options.failureRedirect) {
                return res.redirect(options.failureRedirect);
            } else {
                return res.status(403).send({ message: 'You are not authorized. Need ' + permission + ' permission !' });
            }
        }

    };
};







export function  getUserInfo (req, res, next){
    let userResult;

    if (req.gameMarksimos && req.gameMarksimos.currentStudent) {
        userResult = req.gameMarksimos.currentStudent.toObject();

        userResult.currentMarksimosSeminar = req.gameMarksimos.currentStudentSeminar.toObject();

        // very important, after seminar finished currentPeriod is last round
        if (userResult.currentMarksimosSeminar.currentPeriod > userResult.currentMarksimosSeminar.simulationSpan) {
            userResult.currentMarksimosSeminar.currentPeriod = userResult.currentMarksimosSeminar.simulationSpan;
        }

        userResult.currentMarksimosSeminar.numOfCompany = userResult.currentMarksimosSeminar.companyNum;
        userResult.currentMarksimosSeminar.maxPeriodRound = userResult.currentMarksimosSeminar.simulationSpan;


        for (let i = 0; i < userResult.currentMarksimosSeminar.companies.length; i++) {
            //if this student is in this company
            if (userResult.currentMarksimosSeminar.companies[i].studentList.indexOf(userResult.email) > -1) {

                userResult.currentMarksimosSeminar.currentCompany = {
                    companyId: userResult.currentMarksimosSeminar.companies[i].companyId,
                    companyName: userResult.currentMarksimosSeminar.companies[i].companyName,
                    numOfTeamMember: userResult.currentMarksimosSeminar.companies[i].studentList.length
                };
            }
        }
    } else {

        if (req.user) {

            console.warn('mmm', req.user);

            userResult = req.user.toObject();

        } else {
            return res.status(403).send();
        }
    }

    userResult.roleName = req.user.roleName;
    let teamIdList = [];

    teamModel.findOne({ creator: userResult._id }).populate('memberList', userModel.selectFields()).execQ().then(function (resultTeam) {
        userResult.team = resultTeam || [];

        return teamModel.find({ memberList: { $elemMatch: { $in: [userResult._id] } } }).populate('memberList', userModel.selectFields()).populate('creator', userModel.selectFields()).lean().execQ();

    }).then(function (resultTeam2) {
        //用户已被加入哪些团队

        userResult.belongToTeam = resultTeam2 || [];

        teamIdList = userResult.belongToTeam.map(function (team) {
            return team._id.toString();
        });

        return campaignModel.find({ teamList: { $elemMatch: { $in: teamIdList } } }).execQ();

    }).then(function (resultCampaign) {

        resultCampaign.forEach(function (campaign, cindex) {

            userResult.belongToTeam.forEach(function (team, tindex) {
                if (campaign.teamList.indexOf(team._id) > -1) {
                    team.campaign = campaign || null;
                }
            });
        });


        let teamid;
        if (typeof userResult.team._id === 'undefined') {
            teamid = null;
        } else {
            teamid = userResult.team._id;
        }

        return campaignModel.find({ teamList: { $elemMatch: { $in: [teamid] } } }).execQ();

    }).then(function (resultCampaign2) {
        //该用户所创建的组已被加入哪些活动Campaign
        userResult.joinedCampaign = resultCampaign2 || [];

        return res.status(200).send(userResult);

    }).fail(next).done();


};








/**
 * Registration
 *
 *  * Examples:
 *
 *
 *
 */


export function  registerB2CStudent(req, res, next){

    let validationErrors = userModel.registerValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }


    let newUser: any  = {
        username : req.body.username,
        email: req.body.email,
        password: req.body.password,

//        gender : req.body.gender,
        //firstName : req.body.firstName,
        //lastName : req.body.lastName,
        //birthday : req.body.birthday,
        //idcardNumber : req.body.idcardNumber,
        mobilePhone : req.body.mobilePhone,
        //qq : req.body.qq,


        //majorsDegree : req.body.majorsDegree,
        //organizationOrUniversity : req.body.university,
        //dateOfGraduation : req.body.dateOfGraduation,

        facilitatorId: "54d834bdeaf05dbd048120f8", // fixed for b2c_facilitator

        role : userRoleModel.roleList.student.id,
        studentType : userModel.getStudentType().B2C,

        emailActivateTokenExpires : new Date(new Date().getTime() + expiresTime * 30)
    };

    Captcha.findOneQ({_id: req.cookies['x-captcha-token'], mobilePhone: newUser.mobilePhone})
    .then(function (cpatcha){

        if(cpatcha) {
            cpatcha.removeQ();
        }else{
            throw new MKError('Cancel promise chains. Because cannot found captcha.', MKError.errorCode.register.captcha);
        }

        if( cpatcha.txt !== req.body.captcha.toUpperCase() ) {
            throw new MKError('Cancel promise chains. Because captcha did not match.', MKError.errorCode.register.captcha);
        }
        newUser.phoneVerified = true;
        newUser.activated = true;
        return userModel.register(newUser);
    })
    .then(function (resultUser) {
        if (!resultUser) {
            throw new Error('Cancel promise chains. Because Save new user to database error.');
        }

        let messageXSend = new MessageXSend();
        messageXSend.add_to(resultUser.mobilePhone);
        messageXSend.set_project('k0tCo3');

        let xsendQ = Q.nbind(messageXSend.xsend, messageXSend);
        xsendQ();

        let mailContent = emailModel.registration();
        //mailContent.to = resultUser.email;

        mailContent.substitution_vars.to.push(resultUser.email);
        mailContent.substitution_vars.sub['%username%'].push(resultUser.username);
        mailContent.substitution_vars.sub['%useremail%'].push(encodeURIComponent(resultUser.email));
        mailContent.substitution_vars.sub['%token%'].push(resultUser.emailActivateToken);

        //mailContent.html = mailContent.html1 + resultUser.username + mailContent.html2 + resultUser.email + mailContent.html3 + resultUser.emailActivateToken + mailContent.html4 + resultUser.email + mailContent.html5 + resultUser.emailActivateToken + mailContent.htmlend;

        mailSender.sendMailQ(mailContent).then(function  (resultSendEmail) {
            if (!resultSendEmail) {
                throw new Error('Cancel promise chains. Because Send email of new user failed !');
            }
        }).fail(function  (err) {
            next(err);
        }).done();

        //register nodeBB user
        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'ken' || process.env.NODE_ENV === 'jin')
        {
            let newUserInfo = _.pick(req.body, ['username', 'email', 'password']);
            nodeBB.registerNodeBB(newUserInfo, function (err, uid){
                if(err) {
                    console.error('NodeBB register error:');
                    console.error(newUserInfo);
                    return;
                }
                resultUser.bbsUid = uid;
                resultUser.save();
            })
        }

        return res.status(200).send({message: 'Register new user success'});

    }).fail(function (err){
        next(err);
    }).done();

};


export function  registerB2CEnterprise(req, res, next){

    let validationErrors = userModel.registerValidations(req, userRoleModel.roleList.enterprise.id);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    let newUser = {
        username : req.body.username,
        email: req.body.email,
        password: req.body.password,


        companyName : req.body.companyName,
        companyAddress : req.body.companyAddress,
        companyContactPerson : req.body.companyContactPerson,
        companyContactMobileNumber: req.body.companyContactMobileNumber,
        companyOfficeTelephone: req.body.companyOfficeTelephone,

        facilitatorId: "54d834bdeaf05dbd048120f8", // fixed for b2c_facilitator

        role : userRoleModel.roleList.enterprise.id,
        studentType : userModel.getStudentType().B2C,

        emailActivateTokenExpires : new Date(new Date().getTime() + expiresTime * 30)
    };


    userModel.register(newUser).then(function (result){
        if(!result){
            throw new Error('Cancel promise chains. Because Save new company to database error.');
        }

        return res.status(200).send({message: 'Register new company success'});

    }).fail(function (err){
        next(err);
    }).done();


};





export function  verifyUsername (req, res, next){

    let validationErrors = userModel.usernameValidations(req);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    userModel.findOneQ({ username : req.body.username}).then(function (resultUser) {
        if (resultUser) {
            throw new Error('Cancel promise chains. Because username is existed.');
        }

        return res.status(200).send({message: 'username is ok'});

    }).fail(next).done();

};

export function  verifyEmail (req, res, next){

    let validationErrors = userModel.emailValidations(req);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    userModel.findOneQ({ email : req.body.email}).then(function (resultUser) {
        if (resultUser) {
            throw new Error('Cancel promise chains. Because email is existed.');
        }

        return res.status(200).send({message: 'email is ok'});

    }).fail(next).done();

};


export function  verifyMobilePhone (req, res, next){

    let validationErrors = userModel.mobilePhoneValidations(req);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    userModel.findOneQ({ mobilePhone : req.body.mobilePhone, studentType : userModel.getStudentType().B2C }).then(function (resultUser) {
        if (resultUser) {
            throw new Error('Cancel promise chains. Because mobilePhone is existed.');
        }

        return res.status(200).send({message: 'mobilePhone is ok'});

    }).fail(next).done();

};



// http://www.hcdlearning.com/e4e/emailverify/registration?email=jinwyp@163.com&emailtoken=f70c16b5-2cf1-42d1-90ba-b2fa1bcd3db8

export function  activateRegistrationEmail (req, res, next){
    let validationErrors = userModel.emailVerifyRegistrationValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C);

    if(validationErrors){
        return next(new Error('Cancel Email Activate ! ' + validationErrors[0].msg) );
    }

    let nowDate = new Date();
    userModel.findOneQ({
        email: req.query.email,
        emailActivateToken: req.query.emailtoken,
        emailActivated: false
    }).then(function (resultUser){

        if(!resultUser) {
            throw new Error('Cancel promise chains. Because User Email Activate Token not found!');
        }

        if( resultUser.emailActivateTokenExpires < nowDate){
            throw new Error('Cancel promise chains. Because Email Activate Token Expire !');
        }

        //resultUser.emailActivated = true;
        resultUser.activated = true;

        return resultUser.saveQ();

    }).then(function (savedDoc){

        return res.render('b2c/registration/indexregsuccess.ejs', {
            title     : ' Email Activate Success ! | Bridge+',
            username  : savedDoc[0].username,
            useremail : savedDoc[0].email
        });

    }).fail(function (err){
        next(err);
    }).done();
};








export function  sendResetPasswordEmail (req, res, next){

    let validationErrors = userModel.resetForgotPasswordValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C, 1);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    userModel.findOneQ({ email: req.body.email }).then(function (resultUser) {

        if (!resultUser) {
            throw new Error('Cancel promise chains. Because User Email does not exist.');
        }

        resultUser.resetPasswordTokenExpires = new Date(new Date().getTime() + expiresTime * 2);
        resultUser.resetPasswordToken = uuid.v4();
        resultUser.resetPasswordVerifyCode = Math.floor(Math.random() * (999999 - 100000) + 100000 );

        return resultUser.saveQ();

    }).then(function (resultUser){


        let mailContent = emailModel.resetPassword();

        mailContent.substitution_vars.to.push(resultUser[0].email);
        mailContent.substitution_vars.sub['%username%'].push(resultUser[0].username);
        mailContent.substitution_vars.sub['%useremail%'].push(resultUser[0].email);
        mailContent.substitution_vars.sub['%token%'].push(resultUser[0].resetPasswordToken);
        mailContent.substitution_vars.sub['%verifycode%'].push(resultUser[0].resetPasswordVerifyCode);

        //mailContent.to = resultUser.email;
        //mailContent.html = mailContent.html1 + resultUser.username + mailContent.html2 + resultUser.email + mailContent.html3 + resultUser.emailActivateToken + mailContent.html4 + resultUser.email + mailContent.html5 + resultUser.emailActivateToken + mailContent.htmlend ;

        mailSender.sendMailQ(mailContent).then(function (resultSendEmail){
            if (!resultSendEmail) {
                throw new Error('Cancel promise chains. Because Send resetPassword email failed !');
            }else{
                console.log(resultSendEmail);
            }
        }).fail(function (err){
            next(err);
        }).done();

        return res.status(200).send({message: 'Reset Password Email Send'});

    }).fail(next).done();
};





// http://www.hcdlearning.com/e4e/e4e/emailverify/changepassword?username=jinwyp&passwordtoken=799731

export function  forgotPasswordStep2 (req, res, next){
    let validationErrors = userModel.emailVerifyResetPasswordValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C);

    if(validationErrors){
        return next(new Error('Cancel Reset password! ' + validationErrors[0].msg) );
    }

    let nowDate = new Date();

    userModel.findOneQ({
        username: req.query.username,
        resetPasswordToken: req.query.passwordtoken
    }).then(function (resultUser){

        if(!resultUser) {
            throw new Error('Cancel promise chains. Because User Reset Password Token not found!');
        }

        if( resultUser.resetPasswordTokenExpires < nowDate){
            throw new Error('Cancel promise chains. Because Reset Password Token Expire !');
        }

        return res.render('b2c/forgotpassword/step2enterpassword.ejs', {
            title     : ' Reset your password ! | Bridge+',
            username  : resultUser.username,
            useremail : resultUser.email
        });

    }).fail(function (err){
        next(err);
    }).done();
};






export function  verifyResetPasswordCode (req, res, next){

    let validationErrors = userModel.resetForgotPasswordValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C, 2);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    userModel.findOneQ({
        resetPasswordVerifyCode: req.body.passwordResetVerifyCode
    }).then(function (resultUser){

        if(!resultUser) {
            throw new Error('Cancel promise chains. Because User Reset Password Verify Code wrong!');
        }

        //resultUser.resetPasswordVerifyCode = ''; // remove PasswordVerifyCode after reset

        return res.status(200).send({message: 'Reset Password Token valid'});

    }).fail(function (err){
        next(err);
    }).done();
};



export function  resetNewPassword (req, res, next){

    let validationErrors = userModel.resetForgotPasswordValidations(req, userRoleModel.roleList.student.id, userModel.getStudentType().B2C, 3);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    userModel.findOneQ({
        resetPasswordVerifyCode: req.body.passwordResetVerifyCode
    }).then(function (resultUser){

        if(!resultUser) {
            throw new Error('Cancel promise chains. Because User Reset Password Verify Code wrong!');
        }

        resultUser.resetPasswordVerifyCode = ''; // remove PasswordVerifyCode after reset
        resultUser.resetPasswordToken = '';
        resultUser.password = req.body.password;

        return resultUser.saveQ();

    }).then(function (result){

        let savedDoc = result[0] 

        if (savedDoc.bbsUid){
            nodeBB.resetNodeBBPassword(savedDoc.bbsUid, req.body.password);
        }
        return res.status(200).send({message: 'Reset New Password Success.'});

    }).fail(function (err){
        next(err);
    }).done();
};










export function  generateRegistrationCaptcha (req, res, next) {

    Captcha.findOneAndRemove({_id: req.cookies['x-captcha-token']});

    let captcha = String(Math.floor(Math.random() * (999999 - 100000) + 100000 ));
//    let verifyCodeExpires = new Date(new Date().getTime() + 1000 * 60 * 60); // one hour

    // TODO: first verify unique phone
    let mobilePhone = req.query.mobilePhone;


    let messageXSend = new MessageXSend();
    messageXSend.add_var('code',captcha);
    messageXSend.add_to(mobilePhone);
    messageXSend.set_project('pPlo2');

    let xsendQ = Q.nbind(messageXSend.xsend, messageXSend);

    xsendQ().then(function (result) {
        let parsedRes = JSON.parse(result);
        if (parsedRes.status === "error") {
            throw new Error('Cancel promise chains. Because ' + parsedRes.msg);
        }
        return Captcha.createQ({txt: captcha, mobilePhone: req.query.mobilePhone});
    })
    .then(function (captcha) {
        if(captcha){
            res.cookie('x-captcha-token', captcha._id.toString());
            res.status(200).send({message: 'Generate MobilePhone verify code success'});
        }
    })
    .fail(next)
    .done();
};


export function  generatePhoneVerifyCode (req, res, next) {
    req.body.mobilePhone = req.user.mobilePhone || '';

    let validationErrors = userModel.mobilePhoneValidations(req);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }


    let messageXSend = new MessageXSend();

    let verifyCode = String(Math.floor(Math.random() * (999999 - 100000) + 100000 ));
    let verifyCodeExpires = new Date(new Date().getTime() + 1000 * 60 * 60); // one hour


    userModel.updateQ({_id: req.user._id}, {$set: {phoneVerifyCode: verifyCode, phoneVerifyCodeExpires:verifyCodeExpires}})
    .then(function (result){

        let numAffected = result.nModified;

        if (numAffected !== 1) {
            throw new Error('Cancel promise chains. Because Update phoneVerifyCode failed. More or less than 1 record is updated. it should be only one !');
        }

        messageXSend.add_var('code',verifyCode);
        messageXSend.add_to(req.user.mobilePhone);
        messageXSend.set_project('pPlo2');

        let xsendQ = Q.nbind(messageXSend.xsend, messageXSend);
        return xsendQ();
    })
    .then(function (result){
        let parsedRes = JSON.parse(result);
        if(parsedRes.status === "error") {
            return res.status(400).send(parsedRes);
        }
        return res.status(200).send({message: 'Generate MobilePhone verify code success'});
    })
    .fail(next)
    .done();
};



export function  verifyPhoneVerifyCode (req, res, next) {
    let validationErrors = userModel.mobilePhoneVerifyCodeValidations(req);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    let phoneVerifyCode = req.body.phoneVerifyCode;

    let nowDate = new Date();

    userModel.findOneQ({
        username: req.user.username
    }).then(function (resultUser){

        if(!resultUser) {
            throw new Error('Cancel promise chains. Because User Reset Password Token not found!');
        }

        if(resultUser.phoneVerifyCodeExpires < nowDate) {
            return res.status(400).send( {message: "PhoneVerifyCode Expired!"});
        }

        if(resultUser.phoneVerifyCode !== phoneVerifyCode) {
            return res.status(400).send( {message: "PhoneVerifyCode not match!"});
        }

        resultUser.phoneVerified = true;

        return resultUser.saveQ();


        }).then(function (result){

        return res.status(200).send({message: 'verifyPhoneCode succeed'});
    }).fail(next).done();



}









