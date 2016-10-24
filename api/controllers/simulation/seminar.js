"use strict";
var seminarModel = require('../../models/Seminar');
var gameTokenModel = require('../../models/user/GameAuthToken');
var userModel = require('../../models/user/User');
var userRoleModel = require('../../models/user/UserRole');
var teamModel = require('../../models/user/Team');
var chatmessageModel = require('../../models/b2c/ChatMessage');
var console = require('../../../kernel/utils/logger');
//let consts = require('../../../consts.js');
var utility = require('../../utils/utility');
var socketio = require('../../utils/socketio');
var util = require('util');
/**
 * Seminar API for Facilitator
 */
function addSeminar(req, res, next) {
    var validationErrors = seminarModel.createValidations(req);
    if (validationErrors) {
        return res.status(400).send({ message: validationErrors });
    }
    if (!Array.isArray(req.body.roundTime)) {
        return res.status(400).send({ message: 'round time is wrong format, should be int' });
    }
    var facilitatorId = req.user._id;
    var seminar = {
        facilitatorId: facilitatorId,
        isInitialized: false,
        seminarCode: req.body.seminarCode,
        description: req.body.description,
        simulation_span: req.body.simulation_span,
        company_num: req.body.company_num,
        simulationScenarioID: req.body.simulationScenarioID,
        companies: [],
        roundTime: []
    };
    var companyNameList = utility.createCompanyArray(seminar.company_num);
    for (var i = 0; i < seminar.company_num; i++) {
        seminar.companies.push({
            companyId: i + 1,
            companyName: companyNameList[i],
            studentList: [],
            teamList: []
        });
    }
    var tempRoundTime = {};
    req.body.roundTime.forEach(function (time, index) {
        if (typeof time.period !== 'undefined' && typeof time.hour !== 'undefined') {
            tempRoundTime[time.period] = time.hour;
        }
    });
    console.warn('seminar.simulation_span', seminar.simulation_span);
    for (var j = 1; j <= seminar.simulation_span; j++) {
        var oneRoundTime = {
            period: j,
            roundTimeHour: tempRoundTime[j] || 0,
            lockDecisionTime: seminar.companies
        };
        seminar.roundTime.push(oneRoundTime);
    }
    console.warn(seminar.roundTime);
    userModel.findOneQ({ _id: facilitatorId })
        .then(function (dbFacilitator) {
        if (!dbFacilitator) {
            throw new Error("Cancel promise chains. Can't find facilitator.");
        }
        if (dbFacilitator.numOfLicense <= 0) {
            throw new Error("Cancel promise chains. You don't have enough licenses.");
        }
        return userModel.updateQ({ _id: facilitatorId }, {
            numOfLicense: dbFacilitator.numOfLicense - 1,
            numOfUsedLicense: dbFacilitator.numOfUsedLicense + 1
        });
    }).then(function (result) {
        var numAffected = result.nModified;
        if (numAffected !== 1) {
            throw new Error("Cancel promise chains. update facilitator failed, or update more than one facilitator.");
        }
        //get all seminar, create the next seminar id
        return seminarModel.find({}).sort({ seminarId: "desc" }).execQ();
    }).then(function (allSeminars) {
        if (!allSeminars || allSeminars.length === 0) {
            seminar.seminarId = "10000";
        }
        else {
            seminar.seminarId = parseInt(allSeminars[0].seminarId) + 1;
        }
        return seminarModel.createQ(seminar);
    }).then(function (result) {
        if (!result) {
            throw new Error("Cancel promise chains. save seminar to db failed.");
        }
        return res.status(200).send(result);
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.addSeminar = addSeminar;
;
function updateSeminar(req, res, next) {
    var validationErrors = seminarModel.updateValidations(req);
    if (validationErrors) {
        return res.status(400).send({
            message: validationErrors, success: false
        });
    }
    var seminarId = req.body._id;
    seminarModel.findOneQ({ _id: seminarId }).then(function (resultSeminar) {
        if (!resultSeminar) {
            throw new Error("Cancel promise chains. seminar not found.");
        }
        resultSeminar.showLastPeriodScore = req.body.showLastPeriodScore;
        return resultSeminar.saveQ();
    }).then(function (result) {
        return res.status(200).send(result);
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.updateSeminar = updateSeminar;
;
function removeSeminar(req, res, next) {
    var validationErrors = seminarModel.removeValidations(req);
    if (validationErrors) {
        return res.status(400).send({
            message: validationErrors, success: false
        });
    }
    var seminarId = req.params.seminar_id;
    seminarModel.findOneQ({ seminarId: seminarId }).then(function (resultSeminar) {
        if (!resultSeminar) {
            throw new Error('Cancel promise chains. Because Seminar not found !');
        }
        return resultSeminar.removeQ();
    }).then(function (result) {
        if (!result) {
            throw new Error("Cancel promise chains. remove seminar failed, No seminar or more than one seminar removed.");
        }
        return res.status(200).send(result);
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.removeSeminar = removeSeminar;
;
function updateSeminarUnlockDecision(req, res, next) {
    var validationErrors = seminarModel.seminarIdValidations(req);
    if (validationErrors) {
        return res.status(400).send({ message: validationErrors });
    }
    if (!Array.isArray(req.body.unlockDecision)) {
        return res.status(400).send({ message: 'Unlock Decision is not a array' });
    }
    seminarModel.findOneQ({ seminarId: req.params.seminarId }).then(function (resultSeminar) {
        if (!resultSeminar) {
            throw new Error("Cancel promise chains. seminar not found.");
        }
        if (resultSeminar.roundTime.length > 0) {
            resultSeminar.roundTime.forEach(function (period) {
                if (period.period === resultSeminar.currentPeriod) {
                    period.lockDecisionTime.forEach(function (company) {
                        if (req.body.unlockDecision[company.companyId - 1] === true) {
                            company.lockStatus = false;
                        }
                    });
                }
            });
        }
        return resultSeminar.saveQ();
    }).then(function (result) {
        return res.status(200).send(result);
    }).fail(next).done();
}
exports.updateSeminarUnlockDecision = updateSeminarUnlockDecision;
;
function assignStudentToSeminar(req, res, next) {
    req.checkBody('seminar_id', 'Invalid seminar id.').notEmpty().isInt();
    req.checkBody('company_id', 'Invalid company id.').notEmpty().isInt();
    var seminarId = req.body.seminar_id;
    var companyId = +req.body.company_id;
    //let validationErrors = req.validationErrors();
    var validationErrors = seminarModel.studentEmailValidations(req);
    if (validationErrors) {
        return res.status(400).send({ message: validationErrors });
    }
    var userData;
    userModel.findOneQ({ $or: [
            { username: req.body.username },
            { email: req.body.email }
        ] }).then(function (resultUser) {
        if (!resultUser) {
            throw new Error('Cancel promise chains. Because User not found !');
        }
        userData = resultUser;
        return seminarModel.findOneQ({ seminarId: seminarId });
    }).then(function (resultSeminar) {
        if (!resultSeminar) {
            throw new Error('Cancel promise chains. Because Seminar not found !');
        }
        var companies = resultSeminar.companies;
        var isStudentAssignedToSeminar = false;
        var isTeamAssignedToSeminar = false;
        if (req.body.studentemail !== '') {
            for (var i = 0; i < companies.length; i++) {
                if (companies[i].studentList.indexOf(userData.email) > -1) {
                    isStudentAssignedToSeminar = true;
                    throw new Error('Cancel promise chains. Because email have already assigned to this seminar!');
                }
            }
            //if this student has not been added to this seminar, add it
            if (!isStudentAssignedToSeminar) {
                seminarModel.findOneAndUpdateQ({ 'seminarId': seminarId, 'companies.companyId': companyId }, {
                    '$addToSet': { 'companies.$.studentList': userData.email }
                }).then(function (saveDoc) {
                    if (!saveDoc) {
                        throw new Error('Cancel promise chains. Because Update seminar failed. More or less than 1 record is updated. it should be only one !');
                    }
                    return res.status(200).send({ message: "assign student to seminar success." });
                }).fail(function (err) {
                    next(err);
                }).done();
            }
        }
        else {
            teamModel.findOne({ creator: userData._id }).populate('memberList').execQ().then(function (resultTeam) {
                if (!resultTeam) {
                    throw new Error('Cancel promise chains. Because Team not found !');
                }
                companies.forEach(function (company) {
                    if (typeof company.teamList !== 'undefined') {
                        if (company.teamList.indexOf(resultTeam._id.toString()) > -1) {
                            isTeamAssignedToSeminar = true;
                            throw new Error('Cancel promise chains. Because team have already assigned to this seminar!');
                        }
                    }
                });
                if (!isTeamAssignedToSeminar) {
                    companies.forEach(function (company) {
                        if (company.companyId == companyId) {
                            company.studentList.push(userData.email);
                            resultTeam.memberList.forEach(function (student) {
                                if (company.studentList.indexOf(student.email) === -1) {
                                    company.studentList.push(student.email);
                                }
                            });
                            if (typeof company.teamList !== 'undefined') {
                                company.teamList.push(resultTeam._id.toString());
                            }
                        }
                    });
                    return seminarModel.findOneAndUpdateQ({ 'seminarId': seminarId }, {
                        companies: companies
                    });
                }
            }).then(function (saveDoc) {
                if (!saveDoc) {
                    throw new Error('Cancel promise chains. Because Update seminar failed. More or less than 1 record is updated. it should be only one !');
                }
                return res.status(200).send({ message: "assign team to seminar success." });
            }).fail(function (err) {
                next(err);
            }).done();
        }
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.assignStudentToSeminar = assignStudentToSeminar;
;
function removeStudentFromSeminar(req, res, next) {
    req.checkBody('seminarId', 'Invalid seminar id.').notEmpty().isInt();
    var email, teamid;
    if (req.body.studentemail !== '') {
        req.checkBody('studentemail', 'Invalid email.').notEmpty().isEmail();
        email = req.body.studentemail;
    }
    else {
        req.checkBody('teamid', 'User ID should be 24 characters').notEmpty().len(24, 24);
        teamid = req.body.teamid;
    }
    var validationErrors = req.validationErrors();
    if (validationErrors) {
        return res.status(400).send({ message: validationErrors });
    }
    var seminarId = req.body.seminarId;
    seminarModel.findOneQ({ seminarId: seminarId }).then(function (resultSeminar) {
        if (!resultSeminar) {
            throw new Error("seminar " + seminarId + " doesn't exist.");
        }
        var companies = resultSeminar.companies;
        if (req.body.studentemail !== '') {
            for (var i = 0; i < companies.length; i++) {
                //if this student is in this company
                if (companies[i].studentList.indexOf(email) > -1) {
                    for (var j = 0; j < companies[i].studentList.length; j++) {
                        if (companies[i].studentList[j] === email) {
                            companies[i].studentList.splice(j, 1);
                        }
                    }
                }
            }
            return seminarModel.updateQ({ seminarId: seminarId }, {
                companies: companies
            });
        }
        else {
            return teamModel.findOne({ _id: teamid }).populate('memberList').populate('creator').execQ().then(function (resultTeam) {
                if (!resultTeam) {
                    throw new Error('Cancel promise chains. Because Team not found !');
                }
                companies.forEach(function (company) {
                    if (typeof company.teamList !== 'undefined') {
                        if (company.teamList.indexOf(resultTeam._id.toString()) > -1) {
                            company.teamList.forEach(function (teamid, index) {
                                if (teamid === resultTeam._id.toString()) {
                                    company.teamList.splice(index, 1);
                                }
                            });
                            resultTeam.memberList.forEach(function (teamstudent) {
                                company.studentList.forEach(function (studentemail, studentindex) {
                                    if (teamstudent.email === studentemail) {
                                        company.studentList.splice(studentindex, 1);
                                    }
                                });
                            });
                            company.studentList.forEach(function (studentemail, studentindex) {
                                if (resultTeam.creator.email === studentemail) {
                                    company.studentList.splice(studentindex, 1);
                                }
                            });
                        }
                    }
                });
                return seminarModel.updateQ({ seminarId: seminarId }, {
                    companies: companies
                });
            });
        }
    }).then(function (result) {
        var numberAffected = result[0];
        if (numberAffected !== 1) {
            throw new Error('Cancel promise chains. Because Because Update seminar failed. More or less than 1 record is updated. it should be only one !');
        }
        return res.status(200).send({ message: "Remove team from seminar success." });
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.removeStudentFromSeminar = removeStudentFromSeminar;
;
function getSeminarOfFacilitator(req, res, next) {
    var facilitatorId = req.user._id;
    var keywordFilter = req.query.filterKey || '';
    var status = req.query.status || 'all';
    var query = {};
    query.$and = [
        { facilitatorId: facilitatorId }
    ];
    if (status !== 'all') {
        query.$and.push({ 'isInitialized': status });
    }
    if (keywordFilter) {
        var strRegex = ".*[" + keywordFilter.split('').join('][') + "].*";
        var regex = { $regex: strRegex, $options: 'i' }; // $options : 'i' Means case insensitivity to match upper and lower cases. 不区分大小写
        query.$or = [
            { 'description': regex },
            { 'seminarId': regex },
            { 'venue': regex }
        ];
    }
    seminarModel.find(query).sort({ seminarId: -1 }).execQ().then(function (allSeminars) {
        var teamList = [];
        var teamListHashTable = {};
        var companyRoundTimeMap = {};
        allSeminars.forEach(function (seminar) {
            seminar.companies.forEach(function (company) {
                if (typeof company.teamList !== 'undefined') {
                    company.teamList.forEach(function (teamid) {
                        teamList.push(teamid);
                    });
                }
            });
            if (Array.isArray(seminar.roundTime)) {
                companyRoundTimeMap[seminar.seminarId] = {};
                seminar.roundTime.forEach(function (period) {
                    period.lockDecisionTime.forEach(function (company) {
                        companyRoundTimeMap[seminar.seminarId][company.companyName] = companyRoundTimeMap[seminar.seminarId][company.companyName] || 0;
                        if (company.lockStatus) {
                            companyRoundTimeMap[seminar.seminarId][company.companyName] = companyRoundTimeMap[seminar.seminarId][company.companyName] + company.spendHour;
                        }
                        else {
                            companyRoundTimeMap[seminar.seminarId][company.companyName] = companyRoundTimeMap[seminar.seminarId][company.companyName] + period.roundTimeHour * 1000 * 60 * 60;
                        }
                    });
                });
            }
        });
        teamModel.find({ '_id': { $in: teamList } }).populate('creator', userModel.selectFields()).populate('memberList', userModel.selectFields()).execQ().then(function (results) {
            results.forEach(function (team) {
                teamListHashTable[team._id] = team;
            });
            allSeminars.forEach(function (seminar) {
                seminar.companies.forEach(function (company) {
                    company.teamListData = [];
                    company.totalRoundTime = 0;
                    company.totalRoundTime = companyRoundTimeMap[seminar.seminarId][company.companyName];
                    if (typeof company.teamList !== 'undefined') {
                        company.teamList.forEach(function (teamid) {
                            company.teamListData.push(teamListHashTable[teamid]);
                        });
                    }
                });
            });
            res.status(200).send(allSeminars);
        }).fail(function (err) {
            next(err);
        }).done();
        if (allSeminars.length > 0) {
            allSeminars.forEach(function (seminarOld) {
                if (seminarOld.companies.length > 0) {
                    if (typeof seminarOld.companies[0].companyId == 'undefined') {
                        var companyList = [];
                        for (var j = 0; j < seminarOld.companies.length; j++) {
                            if (typeof seminarOld.companies[j] !== 'undefined') {
                                var companyNew = {
                                    companyId: j + 1,
                                    companyName: String.fromCharCode('A'.charCodeAt(0) + j),
                                    studentList: []
                                };
                                for (var k = 0; k < seminarOld.companies[j].length; k++) {
                                    companyNew.studentList.push(seminarOld.companies[j][k]);
                                }
                                companyList.push(companyNew);
                            }
                        }
                        seminarModel.updateQ({ seminarId: seminarOld.seminarId }, { $set: { companies: companyList } }).then(function (result) {
                        }).done();
                    }
                }
            });
        }
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.getSeminarOfFacilitator = getSeminarOfFacilitator;
;
function seminarInfoForFacilitator(req, res, next) {
    var seminarId = req.params.seminarId;
    if (!seminarId) {
        return res.send(400, { message: "Invalid seminarId" });
    }
    seminarModel.findOneQ({ seminarId: seminarId }).then(function (dbSeminar) {
        if (!dbSeminar) {
            return res.send(400, { message: "seminar " + seminarId + " doesn't exist." });
        }
        return res.render('admin/adminmarksimosreport.ejs', {
            title: 'Admin | Report',
            seminarId: seminarId
        });
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.seminarInfoForFacilitator = seminarInfoForFacilitator;
;
/**
 * Seminar API for Student
 */
function getSeminarList(req, res, next) {
    var email = req.user.email;
    var assignedSeminars = [];
    seminarModel.find({
        companies: { $elemMatch: { studentList: { $in: [email] } } },
        isInitialized: true
    }).sort({ isSimulationFinished: 1, seminarId: -1 }).execQ().then(function (allSeminars) {
        for (var i = 0; i < allSeminars.length; i++) {
            var seminar = allSeminars[i];
            for (var j = 0; j < seminar.companies.length; j++) {
                if (typeof seminar.companies[j].studentList !== 'undefined') {
                    if (seminar.companies[j].studentList.indexOf(email) > -1) {
                        if (seminar.isInitialized) {
                            assignedSeminars.push(seminar);
                            break;
                        }
                    }
                }
            }
        }
        return res.status(200).send(assignedSeminars);
    }).fail(function (err) {
        err.message = "get seminar list failed.";
        next(err);
    }).done();
}
exports.getSeminarList = getSeminarList;
;
function chooseSeminarForStudent(req, res, next) {
    var seminarId = req.query.seminar_id;
    req.checkQuery('seminar_id', 'Invalid seminarId').isInt();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send('There have been validation errors: ' + util.inspect(errors), 400);
    }
    seminarModel.findOneQ({ seminarId: seminarId }).then(function (dbSeminar) {
        if (!dbSeminar) {
            return res.status(400).send({ message: "seminar " + seminarId + " doesn't exist." });
        }
        else {
            var newGameToken = {
                userId: req.user._id,
                gameId: userRoleModel.gameList.stratege.id,
                seminarId: dbSeminar.seminarId
            };
            gameTokenModel.findOneAndUpdateQ({ userId: req.user._id }, newGameToken, { upsert: true }).then(function (gameToken) {
                return res.status(200).send({ message: "choose seminar success." });
            }).fail(function (err) {
                err.message = "save game token failed!";
                next(err);
            }).done();
        }
    }).fail(function (err) {
        err.message = "choose seminar failed !";
        next(err);
    }).done();
}
exports.chooseSeminarForStudent = chooseSeminarForStudent;
;
/**
 * Seminar Socket.IO API
 */
function sendChatMessageSeminar(req, res, next) {
    var validationErrors = chatmessageModel.createValidations(req, req.user.role);
    if (validationErrors) {
        return res.status(400).send({ message: validationErrors });
    }
    var socketRoom;
    if (userRoleModel.roleList.facilitator.id === req.user.role) {
        socketRoom = req.body.seminarRoom;
    }
    else if (userRoleModel.roleList.student.id === req.user.role) {
        socketRoom = req.gameMarksimos.socketRoom.seminar;
    }
    chatmessageModel.createQ({
        text: req.body.message,
        creator: req.user._id,
        room: {
            roomNumber: socketRoom
        }
    }).then(function (resultMessage) {
        if (!resultMessage) {
            throw new Error('Cancel promise chains. Because Create New ChatMessage failed !');
        }
        return res.status(200).send({ message: 'Create New Chat Message success' });
    }).fail(next).done();
    socketio.emitMarksimosChatMessageSeminar(socketRoom, req.user, req.body.message);
}
exports.sendChatMessageSeminar = sendChatMessageSeminar;
;
function sendChatMessageSeminarCompany(req, res, next) {
    var validationErrors = chatmessageModel.createValidations(req, req.user.role);
    if (validationErrors) {
        return res.status(400).send({ message: validationErrors });
    }
    chatmessageModel.createQ({
        text: req.body.message,
        creator: req.user._id,
        room: {
            roomNumber: req.gameMarksimos.socketRoom.company
        }
    }).then(function (resultMessage) {
        if (!resultMessage) {
            throw new Error('Cancel promise chains. Because Create New ChatMessage failed !');
        }
        return res.status(200).send({ message: 'Create New Chat Message success' });
    }).fail(next).done();
    socketio.emitMarksimosChatMessageCompany(req.gameMarksimos.socketRoom.company, req.user, req.body.message);
}
exports.sendChatMessageSeminarCompany = sendChatMessageSeminarCompany;
;
//# sourceMappingURL=seminar.js.map