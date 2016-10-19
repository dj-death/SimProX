/*!
 * Module dependencies
 */
"use strict";
var mongoose = require('mongoose-q')(require('mongoose'), { spread: true });
var Schema = mongoose.Schema;
var Q = require('q');
var mongooseTimestamps = require('mongoose-timestamp');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;
var userRoleModel = require('./UserRole');
/**
 * Mongoose schema
 */
var userSchema = new Schema({
    firstName: String,
    lastName: String,
    // system field
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, select: true },
    resetPasswordVerifyCode: { type: String },
    resetPasswordToken: { type: String, default: uuid.v4() },
    resetPasswordTokenExpires: { type: Date },
    emailActivateToken: { type: String, default: uuid.v4() },
    emailActivateTokenExpires: { type: Date },
    emailActivated: { type: Boolean, default: false },
    activated: { type: Boolean, default: false },
    role: { type: Number, default: 4, required: true },
    studentType: { type: Number, default: 10, required: true },
    // 3rd facebook auth
    facebook: {
        id: String,
        token: String,
        email: String,
        username: String
    },
    //user avatar
    avatar: { type: Schema.Types.ObjectId, ref: 'FileStorage', select: true },
    //user basic info
    gender: { type: Number, min: 0, max: 10 },
    birthday: Date,
    currentLocation: String,
    gamePosition: String,
    //user address for facilitator
    country: String,
    city: String,
    address: String,
    organization: String,
    //For B2C E4E Enterprise
    companyName: String,
    companyAddress: String,
    companyContactPerson: String,
    companyContactPersonPosition: String,
    companyContactMobileNumber: String,
    companyOfficeTelephone: String,
    //distributor and facilitator info
    numOfLicense: { type: Number, default: 0 },
    numOfUsedLicense: { type: Number, default: 0 },
    distributorId: { type: String, default: '' },
    facilitatorId: { type: String, default: '' },
    websiteLanguage: { type: String, default: 'fr_FR' },
    workExperiences: [{
            company: String,
            jobType: Number,
            industry: Number,
            position: String,
            sizeOfCompany: Number,
            startDate: Date,
            endDate: Date,
            jobExperience: String
        }],
    LanguageSkills: [{
            language: Number,
            level: Number
        }],
    eductionBackgrounds: [{
            university: String,
            degree: String,
            major: Number,
            entryDate: Date,
            graduationDate: Date,
            abroad: String,
            abroadStatus: { type: Number, default: 0 },
            achievements: [{
                    description: String
                }]
        }],
    societyExperiences: [{
            societyName: String,
            position: Number,
            sizeOfSociety: Number,
            startDate: Date,
            endDate: Date,
            societyExperience: String
        }],
    bbsUid: Number
});
/**
 * Mongoose plugin
 */
userSchema.plugin(mongooseTimestamps);
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.virtual('roleName').get(function () {
    return userRoleModel.roleList[this.role].name;
});
userSchema.virtual('roleId').get(function () {
    return this.role;
});
userSchema.pre('save', function (next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password'))
        return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err)
            return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err)
                return next(err);
            user.password = hash;
            next();
        });
    });
});
/**
 * Statics
 */
userSchema.statics.register = function (newUser) {
    if (!mongoose.connection.readyState) {
        throw new Error("mongoose is not connected.");
    }
    var deferred = Q.defer();
    var query = {
        $and: [
            { $or: [{ username: newUser.username }, { 'email': newUser.email }] }
        ]
    };
    User.findOne(query, function (err, userexisted) {
        // In case of any error return
        if (err)
            return deferred.reject(err);
        // already exists
        if (userexisted) {
            return deferred.reject(new Error('Cancel register new user, because username or email or mobilePhone is existed.'));
        }
        else {
            User.create(newUser, function (err, result) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(result);
                }
            });
        }
    });
    return deferred.promise;
};
userSchema.statics.getStudentType = function () {
    return {
        B2B: 10,
        B2C: 20,
        BothB2CAndB2B: 30
    };
};
userSchema.statics.generateHashPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR));
};
userSchema.statics.verifyPassword = function (password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
};
userSchema.statics.selectFields = function () {
    return '-password -facebook -resetPasswordVerifyCode -resetPasswordToken -resetPasswordTokenExpires -emailActivateToken -emailActivateTokenExpires -phoneVerifyCode -phoneVerifyCodeExpires';
};
userSchema.statics.registerValidations = function (req, userRoleId, studentType) {
    studentType = studentType || 20;
    req.checkBody('username', 'Username should be 5-20 characters').notEmpty().len(5, 20);
    req.checkBody('email', 'Email wrong format').notEmpty().isEmail();
    req.checkBody('password', 'Password should be 5-20 characters').notEmpty().len(5, 20);
    /*if(userRoleId === userRoleModel.roleList.student.id && studentType === 20){
        req.checkBody('mobilePhone', 'mobilePhone is required').notEmpty().isInt();
    }*/
    if (userRoleId === userRoleModel.roleList["student"].id && studentType === 10) {
        req.checkBody('firstName', 'first Name 2 to 50 characters required.').optional().len(2, 50);
        req.checkBody('lastName', 'last Name 2 to 50 characters required.').optional().len(2, 50);
    }
    if (userRoleId === userRoleModel.roleList["enterprise"].id) {
        req.checkBody('companyName', 'Company Name is required').notEmpty().len(2, 100);
        req.checkBody('companyAddress', 'Company Address is required').notEmpty().len(2, 100);
        req.checkBody('companyContactPerson', 'Company Contact Person is required').notEmpty().len(2, 100);
        req.checkBody('companyContactPersonPosition', 'Company Contact Person Position is required').notEmpty().len(2, 100);
        req.checkBody('mobilePhone', 'Company Mobile Phone wrong format').notEmpty().isMobilePhone('zh-CN');
        req.checkBody('companyOfficeTelephone', 'Company Office Telephone is required').notEmpty().len(2, 100);
    }
    if (userRoleId === userRoleModel.roleList["distributor"].id) {
        req.checkBody('mobilePhone', 'mobilePhone wrong format').notEmpty().isMobilePhone('zh-CN');
        req.checkBody('idcardNumber', 'idcardNumber 18 to 19 characters required.').matches(/^\d{17}([0-9]|X)$/);
        req.checkBody('country', 'country is required').notEmpty();
        req.checkBody('state', 'state is required').notEmpty();
        req.checkBody('city', 'city is required').notEmpty();
        req.checkBody('numOfLicense', 'License number must be between 1 to 99999 integer number.').notEmpty().isInt();
    }
    if (userRoleId === userRoleModel.roleList["facilitator"].id) {
        req.checkBody('mobilePhone', 'mobilePhone wrong format').notEmpty().isMobilePhone('zh-CN');
        req.checkBody('idcardNumber', 'idcard Number 18 to 19 characters required.').matches(/^\d{17}([0-9]|X)$/);
        req.checkBody('country', 'country is required').notEmpty();
        req.checkBody('state', 'state is required').notEmpty();
        req.checkBody('city', 'city is required').notEmpty();
        req.checkBody('numOfLicense', 'License number must be between 1 to 99999 integer number.').notEmpty().isInt();
    }
    return req.validationErrors();
};
userSchema.statics.userInfoValidations = function (req, userRoleId, studentType) {
    studentType = studentType || 20;
    //    removeProperty(req.body);
    if (userRoleId === userRoleModel.roleList["student"].id) {
        req.checkBody('gender', 'Gender wrong format').optional().isInt();
        if (req.body.birthday)
            req.checkBody('birthday', 'Birthday wrong format').optional().isDate();
        if (req.body.firstName)
            req.checkBody('firstName', 'first Name 2 to 50 characters required.').optional().len(2, 50);
        if (req.body.lastName)
            req.checkBody('lastName', 'last Name 2 to 50 characters required.').optional().len(2, 50);
    }
    return req.validationErrors();
};
userSchema.statics.emailVerifyRegistrationValidations = function (req, userRoleId, studentType) {
    studentType = studentType || 20;
    req.checkQuery('email', 'Email wrong format').notEmpty().isEmail();
    req.checkQuery('emailtoken', 'Email ActivateToken wrong format').notEmpty().isUUID(4);
    return req.validationErrors();
};
userSchema.statics.emailVerifyResetPasswordValidations = function (req, userRoleId, studentType) {
    studentType = studentType || 20;
    req.checkQuery('username', 'Username should be 6-20 characters').notEmpty().len(6, 20);
    req.checkQuery('passwordtoken', 'Reset Password Token wrong').notEmpty().isUUID(4);
    return req.validationErrors();
};
userSchema.statics.resetForgotPasswordValidations = function (req, userRoleId, studentType, step) {
    studentType = studentType || 20;
    step = step || 1;
    if (step === 1) {
        req.checkBody('email', 'Email wrong format').notEmpty().isEmail();
    }
    else if (step === 2) {
        req.checkBody('passwordResetVerifyCode', 'Reset Password Token wrong').notEmpty().len(6, 6);
    }
    else if (step === 3) {
        req.checkBody('passwordResetVerifyCode', 'Reset Password Token wrong').notEmpty().len(6, 6);
        req.checkBody('password', 'Password should be 6-20 characters').notEmpty().len(6, 20);
    }
    return req.validationErrors();
};
userSchema.statics.usernameValidations = function (req) {
    if (req.body.username.indexOf('@') > -1) {
        req.body.email = req.body.username;
        req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    }
    else {
        req.checkBody('username', 'Username should be 6-20 characters').notEmpty().len(6, 20);
    }
    return req.validationErrors();
};
userSchema.statics.emailValidations = function (req) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    return req.validationErrors();
};
userSchema.statics.passwordValidations = function (req, userRoleId, studentType) {
    studentType = studentType || 20;
    req.checkBody('passwordNew', 'Password should be 6-20 characters').notEmpty().len(6, 20);
    req.checkBody('passwordOld', 'Password should be 6-20 characters').notEmpty().len(6, 20);
    return req.validationErrors();
};
userSchema.statics.userIdValidations = function (req, userRoleId, studentType) {
    studentType = studentType || 20;
    req.assert('student_id', 'User ID should be 24 characters').notEmpty().len(24, 24);
    //req.checkParams('student_id', 'User ID should be 24 characters').notEmpty().len(24, 24);
    return req.validationErrors();
};
/*
userSchema.statics.mobilePhoneVerifyCodeValidations = function (req){
    req.checkBody('phoneVerifyCode', 'Mobile phone verify code wrong format ').notEmpty().len(6, 6);
    return req.validationErrors();
};

userSchema.statics.mobilePhoneValidations = function (req){
    req.checkBody('mobilePhone', 'mobilePhone wrong format').notEmpty().isMobilePhone('zh-CN');
    return req.validationErrors();
};
*/
userSchema.statics.searchQueryValidations = function (req) {
    //req.assert('seminarId', 'Seminar id should not be empty').notEmpty();
    return req.validationErrors();
};
/**
 * Methods
 */
function removeProperty(obj) {
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            if (obj[p] === '' || obj[p] === null) {
                delete obj[p];
            }
        }
    }
    return obj;
}
/**
 * Register Model
 */
var User = mongoose.model("User", userSchema);
module.exports = User;
//# sourceMappingURL=User.js.map