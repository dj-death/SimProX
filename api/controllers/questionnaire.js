"use strict";
var questionnaireModel = require('../models/Questionnaire');
var seminarModel = require('../models/Seminar');
var Q = require('q');
var util = require('util');
function getQuestionnaire(req, res, next) {
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    var email = req.gameMarksimos.currentStudent.email;
    if (!seminarId) {
        return res.status(400).send({ message: "You don't choose a seminar." });
    }
    if (!email) {
        return res.status(400).send({ message: "Invalid email." });
    }
    questionnaireModel.findOneQ({
        seminarId: seminarId,
        email: email
    }).then(function (result) {
        if (result) {
            return res.send(result);
        }
        else {
            return res.send({
                "seminarId": seminarId,
                "q_FeelAboutMarkSimos": "",
                "q_ReasonForRecommendOrNot": "",
                "q_WillRecommend": true,
                "q_MostBenefit": 1,
                "q_TeachingSupport": [5, 5],
                "q_Interpreter": 5,
                "q_Product": [5, 5, 5, 5],
                "q_TeachingTeam": [5, 5, 5],
                "q_OverallSatisfactionWithTheProgram": [5, 5, 5, 5, 5, 5]
            });
        }
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.getQuestionnaire = getQuestionnaire;
;
function submitQuestionnaire(req, res, next) {
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    var email = req.gameMarksimos.currentStudent.email;
    var questionnaire = req.body.questionnaire;
    var errorMsg = "";
    //客户端提交的变量验证 
    //q_OverallSatisfactionWithTheProgram   
    req.checkBody(['questionnaire', 'q_OverallSatisfactionWithTheProgram'], 'Ivalid q_OverallSatisfactionWithTheProgram.').isArrayLen(6).eachEqualInt().eachBetween(1, 5);
    //q_TeachingTeam    
    req.checkBody(['questionnaire', 'q_TeachingTeam',], 'Ivalid q_TeachingTeam.').isArrayLen(3).eachEqualInt().eachBetween(1, 5);
    //q_Product   
    req.checkBody(['questionnaire', 'q_Product',], 'Ivalid q_Product.').isArrayLen(4).eachEqualInt().eachBetween(1, 5);
    //q_Product   
    req.checkBody(['questionnaire', 'q_Interpreter',], 'Ivalid q_Interpreter.').isInt().between(1, 5);
    //q_TeachingSupport    
    req.checkBody(['questionnaire', 'q_TeachingSupport',], 'Ivalid q_TeachingSupport.').isArrayLen(2).eachEqualInt().eachBetween(1, 5);
    //q_TeachingSupport    
    req.checkBody(['questionnaire', 'q_MostBenefit',], 'Ivalid q_MostBenefit.').isInt().between(1, 3);
    var errors = req.validationErrors() || errorMsg;
    if (errors) {
        return res.status(400).send('There have been validation errors: ' + util.inspect(errors));
    }
    questionnaireModel.update({ seminarId: seminarId, email: email }, questionnaire, { upsert: true }, function (err, numAffected) {
        if (err) {
            var message = Array.isArray(err);
            res.status(400).send(message);
        }
        else {
            res.status(200).send({ message: 'Update success.' });
        }
    });
}
exports.submitQuestionnaire = submitQuestionnaire;
;
function getQuestionnaireListForAdmin(req, res, next) {
    //去除非法的seminarId
    var seminarId = +req.params.seminarId || 0;
    //查询数据库
    Q.all([
        seminarModel.findOne({ seminarId: seminarId }).select({ 'companyAssignment': true }).execQ(),
        questionnaireModel.find({ seminarId: seminarId }).execQ()
    ]).spread(function (seminarResult, questionnaireResult) {
        if (seminarResult) {
            var result_1 = [];
            var questionDic_1 = {};
            //生成字典
            questionnaireResult.forEach(function (question) {
                questionDic_1[question.email] = question;
            });
            //拼接数据
            seminarResult.companyAssignment.forEach(function (company, index) {
                var resultCompany = {
                    companyId: company.companyId,
                    companyName: company.companyName,
                    studentList: []
                };
                (company.studentList || []).forEach(function (email) {
                    if (typeof questionDic_1[email] !== 'undefined') {
                        resultCompany.studentList.push({
                            email: email,
                            questionnaire: questionDic_1[email]
                        });
                    }
                });
                result_1.push(resultCompany);
            });
            //返回成功的数据
            res.status(200).send(result_1);
        }
        else {
            //未得到seminar，则很有可能是输入的seminarId无效
            res.status(400).send({ message: "Invalid seminarId." });
        }
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.getQuestionnaireListForAdmin = getQuestionnaireListForAdmin;
;
//# sourceMappingURL=questionnaire.js.map