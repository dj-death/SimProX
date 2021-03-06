import userModel = require('../../models/user/User');
import userRoleModel = require('../../models/user/UserRole');
import teamModel = require('../../models/user/Team');

import seminarModel = require('../../models/Seminar');
import campaignModel = require('../../models/b2c/Campaign');

import utility = require('../../utils/utility');
import MKError = require('../../utils/error-code');


export function  addDistributor (req, res, next){
    let validationErrors = userModel.registerValidations(req, userRoleModel.roleList["distributor"].id);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    let newDistributor = {
        username     : req.body.username,
        email        : req.body.email,
        password     : req.body.password,

        mobilePhone  : req.body.mobilePhone,
        idcardNumber : req.body.idcardNumber,

        country  : req.body.country,
        state    : req.body.state,
        city     : req.body.city,
        district : req.body.district || '',
        street   : req.body.street || '',

        role           : userRoleModel.roleList["distributor"].id,
        activated      : true,
        numOfLicense   : req.body.numOfLicense

    };

    userModel.register(newDistributor).then(function (result){
        if(!result){
            throw new Error('Save new distributor to database error.');
        }

        return res.status(200).send({message: 'Register new distributor success'});

    }).fail(function (err){
        next(err);
    }).done();

};


export function  updateDistributor(req, res, next){
    if(!req.body.id){
        return res.send(400, {message: "distributor_id can't be empty."})
    }

    let validationErrors = userModel.registerValidations(req, userRoleModel.roleList["distributor"].id);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }


    let distributor = {
        username: req.body.name,
        mobilePhone: req.body.mobilePhone,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        role: userRoleModel.roleList["distributor"].id,
        numOfLicense: req.body.num_of_license_granted,
        district: req.body.district || '',
        street: req.body.street || '',
        idcardNumber: req.body.idcardNumber || ''
    };

    userModel.updateQ({_id: req.body.id}, distributor).then(function (result){
        let numberAffected = result.nModified;
        if(numberAffected !== 1){
            throw new Error('Cancel promise chains. Because Update user failed. More or less than 1 record is updated. it should be only one !');
        }
        return res.send({message: 'update success.'});
    }).fail(function (err){
        next(err);
    }).done();
};



export function  searchDistributor (req, res, next){
    let name = req.query.username;
    let email = req.query.email;
    let country = req.query.country;
    let state = req.query.state;
    let city = req.query.city;
    let activated = req.query.user_status;

    let query: any = {
        role: userRoleModel.roleList["distributor"].id
    };

    if(name) query.username = name;
    if(email) query.email = email;
    if(country) query.country = country;
    if(state) query.state = state;
    if(city) query.city = city;
    if(activated) query.activated = activated;

    userModel.findQ(query, userModel.selectFields()).then(function (result){
        res.status(200).send(result);
    }).fail(function (err){
        next(err);
    }).done();
};


export function  addFacilitator (req, res, next){
    let validationErrors = userModel.registerValidations(req, userRoleModel.roleList["facilitator"].id);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    let distributorId = req.user._id;


    let newFacilitator = {
        username     : req.body.username,
        email        : req.body.email,
        password     : req.body.password,

        mobilePhone  : req.body.mobilePhone,
        idcardNumber : req.body.idcardNumber,

        country  : req.body.country,
        state    : req.body.state,
        city     : req.body.city,
        district : req.body.district || '',
        street   : req.body.street || '',

        role           : userRoleModel.roleList["facilitator"].id,
        activated      : true,
        numOfLicense   : req.body.numOfLicense, //update distributor license when you update this field.

        distributorId: distributorId

    };

    userModel.findOneQ({ _id: newFacilitator.distributorId}).then(function (resultDistributor){

        if(!resultDistributor){
            throw new Error("Cancel promise, Can't find this distributor: " + newFacilitator.distributorId);
        }else {

            if(resultDistributor.numOfLicense - parseInt(newFacilitator.numOfLicense) <= 0){
                throw new Error("Cancel promise, You don't have enough license to create a new facilitator.");
            }

            resultDistributor.numOfLicense = resultDistributor.numOfLicense - parseInt(newFacilitator.numOfLicense);
            resultDistributor.numOfUsedLicense = resultDistributor.numOfUsedLicense + parseInt(newFacilitator.numOfLicense);


            resultDistributor.saveQ().then(function (resultUpdatedDistributor){
                return userModel.register(newFacilitator);

            }).then(function (resultFacilitator){
                if(!resultFacilitator) {
                    throw new Error('Save new facilitator to database error.');
                }

                return res.status(200).send({message: 'Register new facilitator success'});

            }).fail(function (err){
                next(err);
            }).done();
        }

    }).fail(function (err){
        next(err);
    }).done();

};

export function  updateFacilitator (req, res, next){
    let validateResult = userModel.createValidations(req);

    if(validateResult){
        return res.send(400, {message: validateResult});
    }

    let facilitator: any = {};

    if(req.body.username) facilitator.username = req.body.username;
    if(req.body.mobilePhone) facilitator.mobilePhone = req.body.mobilePhone;
    if(req.body.country) facilitator.country = req.body.country;
    if(req.body.state) facilitator.state = req.body.state;
    if(req.body.city) facilitator.city = req.body.city;
    if(req.body.password) facilitator.password = userModel.generateHashPassword(req.body.password);

    let userRole = req.user.roleId;

    if(req.body.num_of_license_granted && (userRole === userRoleModel.roleList["admin"].id || userRole === userRoleModel.roleList["distributor"].id)){
        facilitator.numOfLicense = req.body.num_of_license_granted;
    }

    if(req.body.district) facilitator.district = req.body.district;
    if(req.body.street) facilitator.street = req.body.street;
    if(req.body.idcardNumber) facilitator.idcardNumber = req.body.idcardNumber;

    if(Object.keys(facilitator).length === 0){
        return res.send(400, {message: "you have to provide at least one field to update."});
    }

    let distributorId = req.user._id;

    let p;

    //if the num_of_license is changed, we need to add or remove certain licenses
    //from the distributor
    if(req.body.num_of_license_granted > 0){
        //find the facilitor to be updated.
        p = userModel.findOneQ({
            _id: req.body.id
        })
        .then(function (dbFacilitator){
            //if this facilitator belongs to the current distributor
            if(dbFacilitator.distributorId === distributorId){
                let addedLicense = parseInt(req.body.num_of_license_granted) - dbFacilitator.numOfLicense;
                return userModel.findOneQ({
                    _id: distributorId
                })
                .then(function (dbDistributor){
                    //if the distributor has enough license
                    if(dbDistributor.numOfLicense > addedLicense){
                        return userModel.updateQ({
                            _id: distributorId
                        }, {
                            numOfUsedLicense: dbDistributor.numOfUsedLicense + addedLicense,
                            numOfLicense: dbDistributor.numOfLicense - addedLicense
                        })
                        .then(function (result){
                            let numAffected = result.nModified;
                            if(numAffected!==1){
                                throw {httpStatus: 400, message: 'failed to update distributor ' + distributorId + ' during updating facilitator ' + req.body.id};
                            }else{
                                return userModel.updateQ({_id: req.body.id}, facilitator);
                            }
                        })
                    }else{
                        throw {httpStatus: 400, message: "you don't have enought license, you need " + addedLicense
                        + " more licenses, but you only have " + dbDistributor.numOfUsedLicense}
                    }
                })
            }else{
                throw {httpStatus: 400, message: "You are not authorized to update this facilitator."}
            }
        })
    }else{
        p = userModel.updateQ({_id: req.body.id}, facilitator);
    }

    p.then(function (result){
        let numAffected = result.nModified;
        if(numAffected!==1){
            return res.send(400, {message: 'user does not exist.'});
        }
        return res.send({message: 'update success.'});
    }).fail(function (err){
        next(err);
    }).done();
};


export function  searchFacilitator (req, res, next){
    let name = req.query.username;
    let email = req.query.email;
    let country = req.query.country;
    let state = req.query.state;
    let city = req.query.city;
    let activated = req.query.user_status;

    let query: any = {
        role: userRoleModel.roleList["facilitator"].id
    };

    //only distributor and admin can search facilitators
    //distributor can only view its own facilitators
    if(req.user.roleId !== userRoleModel.roleList["admin"].id){
        query.distributorId = req.user._id;
    }

    if(name) query.username = name;
    if(email) query.email = email;
    if(country) query.country = country;
    if(state) query.state = state;
    if(city) query.city = city;
    if(activated) query.activated = activated;

    userModel.findQ(query, userModel.selectFields()).then(function (allFacilitator){
        if(allFacilitator.length === 0){
            return res.send([]);
        }

        allFacilitator = JSON.parse(JSON.stringify(allFacilitator));

        return userModel.findQ({role: userRoleModel.roleList["distributor"].id}).then(function (allDistributor){
            for(let i=0; i< allFacilitator.length; i++){
                let facilitator = allFacilitator[i];
                let distributor = findDistributor(facilitator.distributorId, allDistributor);
                if(!distributor){
                    return res.send(500, {message: "distributor " + facilitator.distributorId + " doesn't exist."})
                }
                facilitator.distributorName = distributor.username;
            }

            res.send(allFacilitator);
        })
    }).fail(function (err){
        next(err);
    }).done();

    function  findDistributor(distributorId, allDistributor){
        for(let i=0; i< allDistributor.length; i++){
            if(allDistributor[i]._id.toString() === distributorId){
                return allDistributor[i];
            }
        }
    }
}


export function  addStudent (req, res, next){
    req.body.organizationOrUniversity = req.body.university;

    let validationErrors = userModel.registerValidations(req, req.body.userRole || userRoleModel.roleList["student"].id, req.body.studentType || userModel.getStudentType().B2B);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    let facilitatorId = req.user._id;

    let newStudent: any = {
        username: req.body.username,

        firstName: req.body.firstName,
        lastName: req.body.lastName,

        email    : req.body.email,
        password : req.body.password,

        gender      : req.body.gender,

        facilitatorId : facilitatorId,

        studentType : req.body.studentType,

        activated : true
    };

    console.info(req.body.userRole);

    if (req.body.userRole === userRoleModel.roleList["student"].id) {

        newStudent.role = userRoleModel.roleList["student"].id;
        newStudent.majorsDegree = req.body.majorsDegree;
        newStudent.qq = req.body.qq;
        newStudent.organizationOrUniversity = req.body.organizationOrUniversity;
        newStudent.occupation = req.body.occupation;

    } else if (req.body.userRole === userRoleModel.roleList["enterprise"].id) {

        newStudent.role = userRoleModel.roleList["enterprise"].id;
        newStudent.companyName = req.body.companyName;
        newStudent.companyAddress = req.body.companyAddress;
        newStudent.companyContactPerson = req.body.companyContactPerson;
        newStudent.companyContactPersonPosition = req.body.companyContactPersonPosition;
        newStudent.companyOfficeTelephone = req.body.companyOfficeTelephone;
    }

    userModel.register(newStudent).then(function (result){
        if (!result) {
            throw new MKError('Cancel promise chains. Because Create new B2B student or Enterprise failed.', MKError.errorCode["common"].alreadyExist);
        }

        return res.status(200).send({message: 'Create new B2B student or Enterprise success'});

    }).fail(function (err){
        next(err);
    }).done();

};




export function  updateStudent (req, res, next){
    let validateResult = userModel.userInfoValidations(req);

    if(validateResult){
        return res.send(400, {message: validateResult});
    }

    let student: any = {};

    if(req.body.username) student.username = req.body.username;
    if(req.body.mobilePhone) student.mobilePhone = req.body.mobilePhone;
    if(req.body.country) student.country = req.body.country;
    if(req.body.state) student.state = req.body.state;
    if(req.body.city) student.city = req.body.city;
    if(req.body.password) student.password = userModel.generateHashPassword(req.body.password);
    if(req.body.idcardNumber) student.idcardNumber = req.body.idcardNumber;
    if(req.body.gender) student.gender = req.body.gender;
    if(req.body.occupation) student.occupation = req.body.occupation;
    if(req.body.firstname) student.firstName = req.body.firstname;
    if(req.body.lastname) student.lastName = req.body.lastname;
    if(req.body.university) student.organizationOrUniversity = req.body.university;
    if(req.body.majorsDegree) student.majorsDegree = req.body.majorsDegree;

    if(Object.keys(student).length === 0){
        return res.send(400, {message: "You should at least provide one field to update."})
    }

    let student_id = req.body.id;
    if(!student_id){
        return res.send(400, {message: "student_id can't be empty."})
    }

    userModel.findOneQ({
        _id: student_id
    }).then(function (dbStudent){
        if(!dbStudent){
            throw {httpStatus: 400, message: "student doesn't exist."}
        }

        if(dbStudent.facilitatorId !== req.user._id){
            throw {httpStatus: 400, message: "You are not authorized to update this student."}
        }

        return userModel.updateQ({_id: student_id}, student);
    }).then(function (result){
        let numAffected = result.nModified;

        if(numAffected !== 1){
            if(numAffected > 1){
                throw {httpStatus:400, message: "more than one row are updated."};
            }else{
                throw {httpStatus:400, message: "no student is updated." + student_id};
            }
        }
        res.send({message: "update student success."});
    }).fail(function (err){
        next(err);
    }).done();
};


export function removeStudent(req, res, next) {

    let student_id = req.body._id;

    if (!student_id) {
        return res.send(400, { message: "student_id can't be empty." })
    }

    userModel.findOneQ({
        _id: student_id
    }).then(function (studentResult) {
        if (!studentResult) {
            throw { httpStatus: 400, message: "student doesn't exist." }
        }

        if (studentResult.facilitatorId !== req.user._id) {
            throw { httpStatus: 400, message: "You are not authorized to update this student." }
        }

        return studentResult.removeQ();

    }).then(function (result) {
        if (!result) {
            throw new Error("Cancel promise chains. remove seminar failed, No seminar or more than one seminar removed.");
        }

        return res.status(200).send(result);

    }).fail(function (err) {
        next(err);
    }).done();
};


export function  resetStudentPassword (req, res, next){

    let validationErrors = userModel.userIdValidations(req, userRoleModel.roleList["student"].id, userModel.getStudentType().B2B);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }

    req.body.passwordNew = 'hcd1234';

    userModel.findOneQ({
        _id: req.body.student_id

    }).then(function (resultStudent){
        if(!resultStudent) {
            throw new Error('Cancel promise chains. Because student does not exist.');
        }

        resultStudent.password = req.body.passwordNew;

        return resultStudent.saveQ();

    }).then(function (savedDoc){

        return res.status(200).send({message: 'Student password reset success. Password is ' + req.body.passwordNew + '.'});

    }).fail(function (err){
        next(err);
    }).done();
};



export function searchStudent(req, res, next) {
    let validationErrors = userModel.searchQueryValidations(req);

    if(validationErrors){
        return res.status(400).send( {message: validationErrors} );
    }


    let quantity = req.query.quantity || 5000;

    let query: any = {};

    /*if(req.query.user_status) query.activated = req.query.user_status;

    query.role = userRoleModel.roleList["student"].id;
    if(req.query.role) query.role = req.query.role;

    if(req.query.student_type) query.studentType = req.query.student_type;

    if(req.query.username) query.username = req.query.username;
    if(req.query.email) query.email = req.query.email;
    if(req.query.mobilePhone) query.mobilePhone = req.query.mobilePhone;*/

    //only facilitator and admin can search students
    //facilitator can only view its own students
    if(req.user.roleId !== userRoleModel.roleList["admin"].id){
        query.facilitatorId = req.user._id;
    }


    let dataUserList;
    let userIdList = [];
    let teamIdList = [];
    let userIdTeamMap = {};
    let userIdUserMap = {};
    let teamIdCampaignMap = {};
    let memberIdCampaignMap = {};

    global.debug_data.userModel = userModel;

    userModel.find(query, userModel.selectFields()).sort({createdAt: -1}).limit(quantity).lean().execQ().then(function (result){
        if(result.length === 0) {
            throw new MKError('Cancel promise chains. Because user list not found.', MKError.errorCode.common.notFound);
        }

        dataUserList = result;

        userIdList = result.map(function (user){
            userIdUserMap[user._id] = user;
            return user._id;
        });

        return teamModel.find({creator: {$in:userIdList} }).populate('memberList').execQ();

    }).then(function (resultTeam) {

        if(resultTeam.length === 0) {
            //throw new MKError('Cancel promise chains. Because team of user not found.', MKError.errorCode.common.notFound);
        }

        resultTeam.forEach(function (team, index){
            userIdTeamMap[team.creator] = team;
            teamIdList.push(team._id);
        });

        dataUserList.forEach(function (user){
            if(typeof userIdTeamMap[user._id] !== 'undefined'){
                user.team = userIdTeamMap[user._id];
            }
        });

        return campaignModel.find({teamList: {$elemMatch: {$in:teamIdList} }}).execQ();

    }).then(function (resultCampaign) {
        if(resultCampaign.length === 0) {
            //throw new MKError('Cancel promise chains. Because campaign of user not found.', MKError.errorCode.common.notFound);
        }

        resultCampaign.forEach(function (campaign, index){

            teamIdList.forEach(function (teamid){
                teamIdCampaignMap[teamid] = teamIdCampaignMap[teamid] || [];
                if(campaign.teamList.indexOf(teamid) > -1){
                    teamIdCampaignMap[teamid].push(campaign) ;
                }
            });
        });

        dataUserList.forEach(function (user){
            if(typeof user.team !== 'undefined'){
                let campaign = teamIdCampaignMap[user.team._id];

                if(campaign && campaign.length){
                    user.joinedCampaign = teamIdCampaignMap[user.team._id];
                    user.joinCampaignTimes = user.joinCampaignTimes || [];
                    // place the joined time when the user as a creator to the head
                    user.joinCampaignTimes.unshift(user.team.joinCampaignTime);

                    if(Array.isArray(user.team.memberList)){
                        user.team.memberList.forEach(function (member){
                            memberIdCampaignMap[member._id] = teamIdCampaignMap[user.team._id];
                            member = userIdUserMap[member._id];
                            if (!member) return;
                            member.joinCampaignTimes = member.joinCampaignTimes || [];
                            member.joinCampaignTimes.push(user.team.joinCampaignTime);
                        });
                    }

                }
            }
        });

        dataUserList.forEach(function (user){
            if(typeof memberIdCampaignMap[user._id] !== 'undefined'){
                user.joinedCampaignAsMember = memberIdCampaignMap[user._id];
            }
        });


        res.status(200).send(dataUserList);
    }).fail(function (err){
        next(err);
    }).done();
};



export function  listStudentNumberByDay (req, res, next){

    let query: any = {
        role : userRoleModel.roleList["student"].id
    };

    query.studentType = req.query.student_type || userModel.getStudentType().B2C;


    //only facilitator and admin can search students
    //facilitator can only view its own students
    if(req.user.roleId !== userRoleModel.roleList["admin"].id){
        query.facilitatorId = req.user._id;
    }


    let now = new Date();

    let dd = now.getDate();
    let mm = now.getMonth(); //January is 0!
    let yyyy = now.getFullYear();


    query.createdAt = {
        "$gte": new Date(yyyy, mm, dd - 1),
        "$lt": new Date(yyyy, mm, dd)
    };

    let resultData = [];

    userModel.findQ(query, userModel.selectFields()).then(function (result1){

        resultData.push ({
            date : yyyy + '/' + (mm+1) + '/' + (dd-1),
            userList : result1,
            count : result1.length
        });


        query.createdAt = {
            "$gte": new Date(yyyy, mm, dd),
            "$lt": new Date(yyyy, mm, dd + 1)
        };

        return userModel.findQ(query, userModel.selectFields());

    }).then(function (result2) {

        resultData.push({
            date     : yyyy + '/' + (mm + 1) + '/' + dd,
            userList : result2,
            count    : result2.length
        });

        query.createdAt = {
            "$gte": new Date(2013, 1, 1),
            "$lt": new Date(yyyy, mm, dd + 1)
        };

        return userModel.findQ(query, userModel.selectFields());

    }).then(function (result3){

        resultData.push({
            date     : '2013/01/01',
            userList : result3,
            count    : result3.length
        });

        res.status(200).send(resultData);

    }).fail(function (err){
        next(err);
    }).done();
};





