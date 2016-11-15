"use strict";
var reportModel = require('../../models/simulation/Report');
var simulationResult = require('../../models/simulation/Result');
var companyDecisionModel = require('../../models/decision/CompanyDecision');
var seminarModel = require('../../models/Seminar');
var userRoleModel = require('../../models/user/UserRole');
var teamModel = require('../../models/user/Team');
var teamScoreModel = require('../../models/b2c/TeamScore');
var logger = require('../../../kernel/utils/logger');
var Utils = require('../../../kernel/utils/Utils');
var Flat = require('../../utils/Flat');
var Excel = require('../../utils/ExcelUtils');
var Q = require('q');
var _ = require('underscore');
var extraString = require("string");
function getStudentFinalScore(req, res, next) {
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    if (req.user.role !== userRoleModel.roleList.student.id) {
        seminarId = +req.params.seminarId;
    }
    if (!seminarId) {
        return res.send(400, { message: "You don't choose a seminar." });
    }
    var tempRoundTime = {};
    var seminarData = {};
    var teamIdList = [];
    var teamHashMap = {};
    var companyHashMap = {};
    var scoreData = [];
    seminarModel.findOneQ({ seminarId: seminarId }).then(function (resultSeminar) {
        if (!resultSeminar) {
            throw new Error("Cancel promise chains. seminar not found.");
        }
        seminarData = resultSeminar;
        return getFinalScore(seminarId);
    }).then(function (result) {
        //成功操作
        //获取并处理分数
        // 处理每个小组的提交锁定决策的时间
        if (seminarData.roundTime.length > 0) {
            seminarData.roundTime.forEach(function (period) {
                tempRoundTime['p' + period.period] = {};
                if (period.lockDecisionTime && period.lockDecisionTime.length) {
                    period.lockDecisionTime.forEach(function (company) {
                        var time = {
                            days: 0,
                            leftDays: 0,
                            hours: 0,
                            leftHours: 0,
                            minutes: 0,
                            leftMinutes: 0,
                            seconds: 0
                        };
                        time.days = Math.floor(company.spendHour / (24 * 3600 * 1000));
                        //计算出小时数
                        time.leftDays = company.spendHour % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
                        time.hours = Math.floor(time.leftDays / (3600 * 1000));
                        //计算相差分钟数
                        time.leftHours = time.leftDays % (3600 * 1000); //计算小时数后剩余的毫秒数
                        time.minutes = Math.floor(time.leftHours / (60 * 1000));
                        //计算相差秒数
                        time.leftMinutes = time.leftHours % (60 * 1000); //计算分钟数后剩余的毫秒数
                        time.seconds = Math.round(time.leftMinutes / 1000);
                        tempRoundTime['p' + period.period]['c' + company.companyId] = {
                            lockStatus: company.lockStatus,
                            spendHour: company.spendHour || 0,
                            lockTime: company.lockTime || 0,
                            startTime: period.startTime,
                            hours: time.hours || 0,
                            minutes: time.minutes || 0,
                            seconds: time.seconds || 0
                        };
                    });
                }
            });
            result.scoreData.forEach(function (period, pindex) {
                // 排除 起始的-3 -2 -1 0 阶段
                if (period.period > 0) {
                    period.scores.forEach(function (score, sindex) {
                        score.lockStatus = tempRoundTime['p' + period.period]['c' + score.companyId].lockStatus;
                        score.spendHour = tempRoundTime['p' + period.period]['c' + score.companyId].spendHour;
                        score.lockTime = tempRoundTime['p' + period.period]['c' + score.companyId].lockTime;
                        score.startTime = tempRoundTime['p' + period.period]['c' + score.companyId].startTime;
                        score.hours = tempRoundTime['p' + period.period]['c' + score.companyId].hours;
                        score.minutes = tempRoundTime['p' + period.period]['c' + score.companyId].minutes;
                        score.seconds = tempRoundTime['p' + period.period]['c' + score.companyId].seconds;
                    });
                }
            });
        }
        // 保存比赛结果到teamScoreModel 里面
        if (seminarData.isSimulationFinished === true) {
            var finalScoreList = _.sortBy(result.scoreData[result.scoreData.length - 1].scores, 'finalScore').reverse();
            var teamScoreList_1 = [];
            var companyRoundTimeMap_1 = {};
            // 处理每个小组的所有回合提交锁定决策的总时间
            if (Array.isArray(seminarData.roundTime)) {
                seminarData.roundTime.forEach(function (period) {
                    period.lockDecisionTime.forEach(function (company) {
                        companyRoundTimeMap_1[company.companyId] = companyRoundTimeMap_1[company.companyId] || 0;
                        if (company.lockStatus) {
                            companyRoundTimeMap_1[company.companyId] = companyRoundTimeMap_1[company.companyId] + company.spendHour;
                        }
                        else {
                            companyRoundTimeMap_1[company.companyId] = companyRoundTimeMap_1[company.companyId] + period.roundTimeHour * 1000 * 60 * 60;
                        }
                    });
                });
            }
            finalScoreList.forEach(function (score, sindex) {
                score.ranking = sindex + 1;
                seminarData.companyAssignment.forEach(function (company) {
                    if (company.companyId === score.companyId) {
                        if (company.teamList.length > 0) {
                            score.teamid = company.teamList[0];
                        }
                    }
                });
                var companyScore = {
                    ranking: score.ranking,
                    marksimosScore: score.finalScore,
                    timeCost: companyRoundTimeMap_1[score.companyId],
                    marksimosSeminar: seminarData._id
                };
                if (score.teamid) {
                    companyScore.team = score.teamid;
                }
                if (seminarData.belongToCampaign) {
                    companyScore.campaign = seminarData.belongToCampaign;
                }
                if (score.lockStatus) {
                    companyScore.timeCostStatus = 1;
                }
                else {
                    companyScore.timeCostStatus = 0;
                }
                teamScoreList_1.push(companyScore);
            });
            teamScoreModel.findQ({ marksimosSeminar: seminarData._id }).then(function (resultTeamScores) {
                if (resultTeamScores.length === 0) {
                    teamScoreModel.createQ(teamScoreList_1);
                }
            }).fail(next).done();
        }
        scoreData = result;
        seminarData.companyAssignment.forEach(function (company) {
            if (company.teamList.length > 0) {
                teamIdList.push(company.teamList[0]);
            }
        });
        return teamModel.find({ _id: { $in: teamIdList } }).populate('creator').execQ();
    }).then(function (resultTeam) {
        resultTeam.forEach(function (team) {
            teamHashMap[team._id] = team;
        });
        seminarData.companyAssignment.forEach(function (company) {
            if (company.teamList.length > 0) {
                companyHashMap[company.companyId] = teamHashMap[company.teamList[0]];
            }
        });
        scoreData.scoreData.forEach(function (period) {
            period.scores.forEach(function (score) {
                score.team = companyHashMap[score.companyId];
            });
        });
        if (req.user.role === userRoleModel.roleList.student.id && !scoreData.showLastPeriodScore) {
            //如果不显示最后一阶段的分数，则数据length-1,原数据为排过序的数据  注意需要排除第一阶段,第一阶段不能隐藏结果
            if (scoreData.scoreData && scoreData.scoreData.length > 1) {
                return res.status(200).send(scoreData.scoreData.slice(0, scoreData.scoreData.length - 1));
            }
        }
        return res.status(200).send(scoreData.scoreData);
    }).fail(next).done();
}
exports.getStudentFinalScore = getStudentFinalScore;
;
function getReport(req, res, next) {
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    if (req.user.role !== userRoleModel.roleList.student.id) {
        seminarId = +req.query.seminarId;
    }
    if (!seminarId) {
        return res.status(400).send({ message: "You don't choose a seminar." });
    }
    var companyId = +req.query.companyId;
    var reportName = req.params.report_name;
    if (!reportName) {
        return res.status(400).send({ message: "Invalid parameter reportName." });
    }
    reportModel.findOne(seminarId, reportName)
        .then(function (report) {
        if (report === null || report === undefined) {
            return res.status(400).send({ message: "Report doesn't exist." });
        }
        if (req.user.role === userRoleModel.roleList.student.id && isReportNeedFilter(reportName)) {
            return res.send(extractReportOfOneCompany(report, companyId));
        }
        res.send(report.reportData);
    })
        .fail(function (err) {
        logger.error(err);
        res.status(500).send({ message: "fail to get report." });
    })
        .done();
}
exports.getReport = getReport;
;
function getFinalScore(seminarId) {
    return Q.all([
        simulationResult.findAll(seminarId),
        seminarModel.findOneQ({ seminarId: seminarId })
    ]).spread(function (requestedPeriodResultArr, seminarInfo) {
        var resultArr = {
            scoreData: [],
            showLastPeriodScore: seminarInfo.showLastPeriodScore
        };
        var initialPeriodResult;
        requestedPeriodResultArr.forEach(function (requestedPeriodResult) {
            if (requestedPeriodResult.period == 0) {
                //原来作为比较的阶段0
                initialPeriodResult = requestedPeriodResult;
            }
            if (requestedPeriodResult.period >= 0) {
                var period = requestedPeriodResult.period;
                var scores = [];
                var highest_SOM = void 0, lowest_SOM_1, highest_Profit = void 0, lowest_Profit_1;
                var a_1, b_1, c_1, d_1;
                for (var i = 0; i < requestedPeriodResult.p_Companies.length; i++) {
                    var originalSOM = void 0, originalProfit = void 0, originalBudget = void 0;
                    var scaledSOM = void 0, scaledProfit = void 0, scaledBudget = void 0, finalScore = void 0;
                    originalSOM = 100 * (requestedPeriodResult.p_Companies[i].c_ValueSegmentShare[6] - initialPeriodResult.p_Companies[i].c_ValueSegmentShare[6]);
                    originalProfit = requestedPeriodResult.p_Companies[i].c_CumulatedNetResults;
                    originalBudget = (period / seminarInfo.simulation_span) * requestedPeriodResult.p_Companies[i].c_TotalInvestmentBudget;
                    if (originalBudget > 0) {
                        originalBudget = 100 * requestedPeriodResult.p_Companies[i].c_CumulatedInvestments / originalBudget;
                    }
                    else {
                        originalBudget = 0;
                    }
                    scores.push({
                        companyId: requestedPeriodResult.p_Companies[i].c_CompanyID,
                        originalSOM: originalSOM,
                        originalProfit: originalProfit,
                        originalBudget: originalBudget
                    });
                }
                highest_SOM = _.max(scores, function (companyScore) { return companyScore.originalSOM; }).originalSOM;
                lowest_SOM_1 = _.min(scores, function (companyScore) { return companyScore.originalSOM; }).originalSOM;
                highest_Profit = _.max(scores, function (companyScore) { return companyScore.originalProfit; }).originalProfit;
                lowest_Profit_1 = _.min(scores, function (companyScore) { return companyScore.originalProfit; }).originalProfit;
                a_1 = highest_SOM - lowest_SOM_1;
                c_1 = highest_Profit - lowest_Profit_1;
                scores.forEach(function (companyScore) {
                    if (lowest_SOM_1 < 0) {
                        companyScore.scaledSOM = companyScore.originalSOM + a_1;
                    }
                    else {
                        companyScore.scaledSOM = companyScore.originalSOM;
                    }
                    if (lowest_Profit_1 < 0) {
                        companyScore.scaledProfit = companyScore.originalProfit + c_1;
                    }
                    else {
                        companyScore.scaledProfit = companyScore.originalProfit;
                    }
                });
                if (lowest_SOM_1 < 0) {
                    lowest_SOM_1 = lowest_SOM_1 + a_1;
                    highest_SOM = highest_SOM + a_1;
                }
                if (lowest_Profit_1 < 0) {
                    lowest_Profit_1 = lowest_Profit_1 + c_1;
                    highest_Profit = highest_Profit + c_1;
                }
                if (highest_SOM > lowest_SOM_1) {
                    a_1 = 100 / (highest_SOM - lowest_SOM_1);
                    b_1 = 100 - (a_1 * highest_SOM);
                }
                else {
                    a_1 = 0;
                    b_1 = 50;
                }
                if (highest_Profit > lowest_Profit_1) {
                    c_1 = 100 / (highest_Profit - lowest_Profit_1);
                    d_1 = 100 - (c_1 * highest_Profit);
                }
                else {
                    c_1 = 0;
                    d_1 = 50;
                }
                scores.forEach(function (companyScore) {
                    companyScore.scaledSOM = a_1 * companyScore.scaledSOM + b_1;
                    if (companyScore.scaledSOM < 0) {
                        companyScore.scaledSOM = 0;
                    }
                    companyScore.scaledProfit = c_1 * companyScore.scaledProfit + d_1;
                    if (companyScore.scaledProfit < 0) {
                        companyScore.scaledProfit = 0;
                    }
                    if (companyScore.originalBudget <= 100) {
                        companyScore.scaledBudget = 0;
                    }
                    else {
                        companyScore.scaledBudget = 100 - companyScore.originalBudget;
                    }
                    companyScore.finalScore = initialPeriodResult.p_Market.m_fs_DeltaSOM_Weight * companyScore.scaledSOM + initialPeriodResult.p_Market.m_fs_Profits_Weight * companyScore.scaledProfit;
                    companyScore.finalScore = companyScore.finalScore + 2 * companyScore.scaledBudget;
                });
                resultArr.scoreData.push({ period: period, seminarId: seminarId, scores: scores });
            }
        });
        return resultArr;
    });
}
function isReportNeedFilter(report_name) {
    return report_name === 'financial_report' || report_name === 'profitability_evolution';
}
/**
 * Filter out data of other companies
 */
function extractReportOfOneCompany(report, companyId) {
    if (!report || !report.reportData)
        return;
    var reportData = report.reportData;
    var tempReportData = [];
    for (var i = 0; i < reportData.length; i++) {
        if (reportData[i].companyId === companyId) {
            tempReportData.push(reportData[i]);
        }
    }
    return tempReportData;
}
function exportToExcel(req, res, next) {
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    if (req.user.role !== userRoleModel.roleList.student.id) {
        seminarId = +req.query.seminarId;
    }
    if (!seminarId) {
        return res.status(400).send({ message: "You don't choose a seminar." });
    }
    var companyId = +req.query.companyId;
    var period = +req.query.period;
    return Q.all([
        simulationResult.findOne(seminarId, period),
        companyDecisionModel.findOne(seminarId, period, companyId)
    ]).spread(function (allPeriodResults, companyDecision) {
        companyDecision = companyDecision.toObject();
        allPeriodResults = allPeriodResults.toObject();
        if (!allPeriodResults || !companyDecision) {
            return res.status(400).send({ message: "Report doesn't exist." });
        }
        var companyResult = allPeriodResults.companies[companyId - 1];
        var options = {
            lang: 'fr' //req.params.lang
        };
        var aboutInfos = {
            "reportDate": (new Date()).toLocaleDateString(),
            "playerName": 'Entreprise ' + companyDecision.d_CompanyName,
            "playerID": companyDecision.d_CID,
            "seminar": companyDecision.seminarCode,
            "scenarioID": '',
            "periodYear": companyDecision.period,
            "periodQuarter": companyDecision.period,
            "period": companyDecision.period
        };
        var fileName = extraString("Report {{seminar}}{{playerID}} - {{periodYear}}Q{{periodQuarter}}.xlsx").template(aboutInfos).s;
        var flattenDec = Flat.flatten(companyDecision.decision, {
            delimiter: '_',
            prefix: 'dec'
        });
        var flattenRes = companyResult.report || Flat.flatten(companyResult, {
            delimiter: '_',
            prefix: 'res'
        });
        var reportData = Utils.ObjectApply(aboutInfos, flattenDec, flattenRes);
        Excel.excelExport(reportData, options, function (err, binary) {
            if (err) {
                console.error(err);
                res.status(404).send('error converting to excel');
                return false;
            }
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
            res.end(binary, 'binary');
        });
    }).fail(function (err) {
        res.status(404).send('error exporting');
    }).done();
}
exports.exportToExcel = exportToExcel;
//# sourceMappingURL=report.js.map