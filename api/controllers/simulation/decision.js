"use strict";
var companyDecisionModel = require('../../models/decision/CompanyDecision');
//let brandDecisionModel = require('../../../models/marksimos/brandDecision.js');
//let SKUDecisionModel = require('../../../models/marksimos/SKUDecision.js');
var simulationResultModel = require('../../models/simulation/Result');
var seminarModel = require('../../models/Seminar');
var userRoleModel = require('../../models/user/UserRole');
var decisionAssembler = require('../../assemblers/decision');
var gameParameters; // = require('../../../gameParameters.js').parameters;
/*
let productPortfolioAssembler = require('../../../dataAssemblers/productPortfolio.js');
let spendingDetailsAssembler = require('../../../dataAssemblers/spendingDetails.js');
let SKUInfoAssembler = require('../../../dataAssemblers/SKUInfo.js');
*/
var spendingDetailsAssembler = require('../../assemblers/spendingDetails');
var logger = require('../../../kernel/utils/logger');
var socketio = require('../../utils/socketio');
var url = require('url');
var util = require('util');
var Q = require('q');
/**
 * Sumit decision to CGI service  Not Used Now
 */
function submitDecision(req, res, next) {
    var companyId = +req.query.companyId;
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    var period = req.gameMarksimos.currentStudentSeminar.currentPeriod;
    if (!companyId) {
        return res.json({ message: "Invalid companyId" });
    }
    if (period === undefined) {
        return res.json({ message: "Invalid period" });
    }
    if (!seminarId) {
        return res.json({ message: "Invalid seminarId" });
    }
    var result = {};
    companyDecisionModel.findOne(seminarId, period, companyId).then(function (decision) {
        if (!decision) {
            throw new Error("decision doesn't exist.");
        }
        result.d_CID = decision.d_CID;
        result.d_CompanyName = decision.d_CompanyName;
        result.d_BrandsDecisions = [];
        result.d_IsAdditionalBudgetAccepted = decision.d_IsAdditionalBudgetAccepted;
        result.d_RequestedAdditionalBudget = decision.d_RequestedAdditionalBudget;
        result.d_InvestmentInEfficiency = decision.d_InvestmentInEfficiency;
        result.d_InvestmentInTechnology = decision.d_InvestmentInTechnology;
        result.d_InvestmentInServicing = decision.d_InvestmentInServicing;
        result.decision = decision.decision;
        res.statut(200).send(result);
    })
        .fail(function (err) {
        logger.error(err);
        res.send(500, { message: "submit decision failed." });
    })
        .done();
}
exports.submitDecision = submitDecision;
;
function getDecision(req, res, next) {
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    var period = req.gameMarksimos.currentStudentSeminar.currentPeriod;
    var companyId = +req.query.companyId;
    if (!seminarId || !companyId || !period) {
        return res.status(400).send({ message: "You don't choose a seminar." });
    }
    decisionAssembler.getDecision(seminarId, period, companyId).then(function (result) {
        res.status(200).send(result);
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.getDecision = getDecision;
;
function getDecisionForFacilitator(req, res, next) {
    var seminarId = req.params.seminar_id;
    if (!seminarId) {
        return res.send(400, { message: "Please choose a seminar ID." });
    }
    else {
        seminarModel.findOneQ({ seminarId: seminarId }).then(function (dbSeminar) {
            if (!dbSeminar) {
                throw { message: "Cancel promise chains. Because " + "seminar " + seminarId + " doesn't exist." };
            }
            return decisionAssembler.getAllCompanyDecisionsOfAllPeriod(dbSeminar.seminarId);
        }).then(function (result) {
            return res.send(result);
        }).fail(function (err) {
            next(err);
        }).done();
    }
}
exports.getDecisionForFacilitator = getDecisionForFacilitator;
;
/**
 *   SKU Decisions
 */
/*
export function addSKU (req, res, next) {
    let seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    let period = req.gameMarksimos.currentStudentSeminar.currentPeriod;

    if (!seminarId) {
        return res.send(400, { message: "You don't choose a seminar." });
    }

    let companyId = +req.body.companyId;

    let brand_id = req.body.brand_id;
    let sku_name = req.body.sku_name;

    if (!sku_name) {
        return res.send(400, { message: "Invalid parameter sku_name." })
    }

    SKUDecisionModel.create({
        seminarId: seminarId,
        period: period,
        d_CID: companyId,
        d_BrandID: brand_id,
        d_SKUName: '_' + sku_name
    })
        .then(function (result) {
            socketio.emitMarksimosDecisionUpdate(req.gameMarksimos.socketRoom.company, req.user);
            res.send(result);
        })
        .fail(function (err) {
            let message = JSON.stringify(err, ['message'], 2);
            res.send(400, message)
        })
        .done();
};


export function deleteSKU (req, res, next) {
    let seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    let period = req.gameMarksimos.currentStudentSeminar.currentPeriod;

    if (!seminarId) {
        return res.send(400, { message: "You don't choose a seminar." });
    }

    let companyId = +req.params.company_id;
    let brand_id = req.params.brand_id;
    let sku_id = req.params.sku_id;

    if (!brand_id) {
        return res.send(400, { message: "Invalid parameter brand_id." });
    }

    if (!sku_id) {
        return res.send(400, { message: "Invalid parameter sku_id." })
    }

    SKUDecisionModel.remove(seminarId, period, companyId, brand_id, sku_id)
        .then(function (result) {
            socketio.emitMarksimosDecisionUpdate(req.gameMarksimos.socketRoom.company, req.user);
            res.send(result);
        })
        .fail(function (err) {
            next(err);
        })
        .done();
};


export function updateSKUDecision (req, res, next) {
    let companyId = +req.body.companyId;
    let brandId = req.body.brand_id;
    let SKUID = req.body.sku_id;
    let SKU = req.body.sku_data;

    let seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    let period = req.gameMarksimos.currentStudentSeminar.currentPeriod;


    if (req.user.role !== userRoleModel.roleList.student.id) {
        period = req.body.periodId;
        seminarId = req.body.seminarId;
    }

    if (!seminarId) {
        return res.send(400, { message: "You don't choose a seminar." });
    }


    if (!brandId) {
        return res.send(400, { message: "Invalid parameter brand_id." });
    }

    if (!SKUID) {
        return res.send(400, { message: "Invalid parameter sku_id." });
    }

    if (!SKU) {
        return res.send(400, { message: "Invalid parameter skudata" });
    }

    if (!companyId) {
        return res.send(400, { message: "Invalid companyId." });
    }

    if (period === undefined) {
        return res.send(400, { message: "Invalid period in session." });
    }

    let jsonSKU = SKU;
    //create a SKU object using the data posted by the client
    let tempSKU = filterSKUField(jsonSKU);



    SKUDecisionModel.updateSKU(seminarId, period, companyId, brandId, SKUID, tempSKU)
        .then(function (doc) {
            socketio.emitMarksimosDecisionUpdate(req.gameMarksimos.socketRoom.company, req.user);
            res.status(200).send({ status: 1, message: 'update success.' });
        })
        .fail(function (err) {

            let message = JSON.stringify(err, ['message', 'lower', 'upper', 'modifiedField'], 2);

            logger.log('!!!!: ' + message);
            res.send(400, message);
        })
        .done();

    //res.send(400, 'bad request');
    function filterSKUField(postedSKU) {
        let result = {};

        let fields = ['d_SKUName', 'd_Advertising', 'd_AdditionalTradeMargin', 'd_FactoryPrice', 'd_RepriceFactoryStocks', 'd_IngredientsQuality', 'd_PackSize', 'd_ProductionVolume', 'd_PromotionalBudget', 'd_PromotionalEpisodes', 'd_TargetConsumerSegment', 'd_Technology', 'd_ToDrop', 'd_TradeExpenses', 'd_WholesalesBonusMinVolume', 'd_WholesalesBonusRate', 'd_WarrantyLength'];
        fields.forEach(function (field) {
            if (postedSKU[field] !== undefined) {
                result[field] = postedSKU[field];

            }
        });

        return result;
    }
};




/**
 *   Brand Decisions
 */
/*
export function addBrand (req, res, next) {
    let seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    let period = req.gameMarksimos.currentStudentSeminar.currentPeriod;

    if (!seminarId) {
        return res.send(400, { message: "You don't choose a seminar." });
    }

    let companyId = +req.body.companyId;

    let brand_name = req.body.brand_name;
    let sku_name = req.body.sku_name;

    if (!brand_name) {
        return res.send(400, { message: "Invalid parameter brand_name." });
    }

    if (!sku_name) {
        return res.send(400, { message: "Invalid parameter sku_name." })
    }

    brandDecisionModel.create({
        seminarId: seminarId,
        period: period,
        d_CID: companyId,
        d_BrandName: brand_name,
        d_SKUsDecisions: []
    })
        .then(function (newBrandID) {
            return SKUDecisionModel.create({
                seminarId: seminarId,
                period: period,
                d_CID: companyId,
                d_BrandID: newBrandID,
                d_SKUName: '_' + sku_name
            });
        })
        .then(function () {
            socketio.emitMarksimosDecisionUpdate(req.gameMarksimos.socketRoom.company, req.user);
            res.send({ message: "add brand and sku success." });
        })
        .fail(function (err) {
            let message = JSON.stringify(err, ['message'], 2);
            res.send(400, message);
        })
        .done();


    // brandDecisionModel.findAllInCompany(seminarId, period, companyId)
    // .then(function(allBrands){
    //     let maxBrandId = 0;
    //     allBrands.forEach(function(brand){
    //         if(brand.d_BrandID>maxBrandId){
    //             maxBrandId = brand.d_BrandID;
    //         }
    //     })

    //     if(maxBrandId===0 || maxBrandId % 10 > 4){
    //         return res.send(400, {message: "you alread have 5 brands."});
    //     }

    //     let nextBrandId = maxBrandId +1;
    //     let firstSKUID = (maxBrandId+1)*10 + 1;//SKUID =  brandID * 10 + 1

    //     return SKUDecisionModel.create({
    //         seminarId: seminarId,
    //         period: period,
    //         d_CID: companyId,
    //         d_BrandID: nextBrandId,
    //         d_SKUID: firstSKUID,
    //         d_SKUName: sku_name
    //     })
    //     .then(function(){
    //         return brandDecisionModel.save({
    //             seminarId: seminarId,
    //             period: period,
    //             d_CID: companyId,
    //             d_BrandID: nextBrandId,
    //             d_BrandName     : brand_name,
    //             d_SKUsDecisions : [firstSKUID]
    //         })
    //     })
    // })
    // .then(function(){
    //     res.send({message: "add brand success."});
    // })
    // .fail(function(err){
    //     logger.error(err);
    //     res.send(500, {message: "addBrand failed."})
    // })
    // .done();


};



export function updateBrandDecision (req, res, next) {

    let brandId = req.body.brand_id;
    let brand_data = req.body.brand_data;

    let companyId = +req.body.companyId;

    let seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    let period = req.gameMarksimos.currentStudentSeminar.currentPeriod;


    if (req.user.role !== userRoleModel.roleList.student.id) {
        period = req.body.periodId;
        seminarId = req.body.seminarId;
    }

    if (!brandId) {
        return res.send(400, { message: "Invalid parameter brand_id." });
    }

    if (!brand_data) {
        return res.send(400, { message: "Invalid parameter brand_data" });
    }

    if (!seminarId) {
        return res.send(400, { message: "Invalid seminarId in session." });
    }

    if (!companyId) {
        return res.send(400, { message: "Invalid companyId." });
    }

    if (period === undefined) {
        return res.send(400, { message: "Invalid period in session." });
    }

    let tempBrand = filterBrandField(brand_data);

    brandDecisionModel.updateBrand(seminarId, period, companyId, brandId, tempBrand)
        .then(function (doc) {
            socketio.emitMarksimosDecisionUpdate(req.gameMarksimos.socketRoom.company, req.user);
            res.send({ status: 1, message: 'update success.' });
        })
        .fail(function (err) {
            let message = JSON.stringify(err, ['message', 'lower', 'upper', 'modifiedField'], 2);
            res.send(400, message);
        })
        .done();

    function filterBrandField(postedBrand) {
        let result = {};

        let fields = ['d_SalesForce'];
        fields.forEach(function (field) {
            if (postedBrand[field] !== undefined) {
                result[field] = postedBrand[field];
            }
        });

        return result;
    }
};

*/
/**
 *   Company Decisions
 */
function updateCompanyDecision(req, res, next) {
    var company_data = req.body.company_data;
    var companyId = +req.body.companyId;
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    var period = req.gameMarksimos.currentStudentSeminar.currentPeriod;
    if (req.user.role !== userRoleModel.roleList.student.id) {
        period = req.body.periodId;
        seminarId = req.body.seminarId;
    }
    if (!company_data) {
        return res.send(400, { message: "Invalid parameter company_data" });
    }
    if (!seminarId) {
        return res.send(400, { message: "Invalid seminarId in session." });
    }
    if (!companyId) {
        return res.send(400, { message: "Invalid companyId ." });
    }
    if (period === undefined) {
        return res.send(400, { message: "Invalid period in session." });
    }
    var tempCompanyDecision = company_data.decision; //filterCompanyDecision(company_data);
    //logger.log('tempCompanyDecision:' + util.inspect(tempCompanyDecision));
    companyDecisionModel.updateCompanyDecision(seminarId, period, companyId, tempCompanyDecision)
        .then(function (result) {
        socketio.emitMarksimosDecisionUpdate(req.gameMarksimos.socketRoom.company, req.user);
        res.send({ message: 'update success.' });
    })
        .fail(function (err) {
        var message = JSON.stringify(err, ['message', 'lower', 'upper', 'modifiedField'], 2);
        res.send(400, message);
    })
        .done();
    function filterCompanyDecision(postedCompanyDecision) {
        var result = {};
        var fields = ['d_CompanyName', 'd_IsAdditionalBudgetAccepted', 'd_RequestedAdditionalBudget', 'd_InvestmentInEfficiency', 'd_InvestmentInTechnology', 'd_InvestmentInServicing'];
        fields.forEach(function (field) {
            if (postedCompanyDecision[field] !== undefined) {
                result[field] = postedCompanyDecision[field];
            }
        });
        return result;
    }
}
exports.updateCompanyDecision = updateCompanyDecision;
;
function lockCompanyDecision(req, res, next) {
    var company = {};
    for (var i = 0; i < req.gameMarksimos.currentStudentSeminar.companies.length; i++) {
        //if this student is in this company
        if (req.gameMarksimos.currentStudentSeminar.companies[i].studentList.indexOf(req.user.email) > -1) {
            company = {
                companyId: req.gameMarksimos.currentStudentSeminar.companies[i].companyId,
                companyName: req.gameMarksimos.currentStudentSeminar.companies[i].companyName,
                numOfTeamMember: req.gameMarksimos.currentStudentSeminar.companies[i].studentList.length
            };
        }
    }
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    var period = req.gameMarksimos.currentStudentSeminar.currentPeriod;
    seminarModel.findOneQ({
        seminarId: seminarId
    }).then(function (resultSeminar) {
        if (!resultSeminar) {
            throw new Error("Cancel promise chains. Because seminar not found.");
        }
        var roundTime = resultSeminar.roundTime[resultSeminar.currentPeriod - 1];
        var decisionTime = roundTime && roundTime.lockDecisionTime[company.companyId - 1];
        if (decisionTime) {
            var startTime = typeof decisionTime.startTime === 'date' ? decisionTime.startTime : new Date();
            resultSeminar.roundTime[resultSeminar.currentPeriod - 1].lockDecisionTime[company.companyId - 1].lockStatus = true;
            resultSeminar.roundTime[resultSeminar.currentPeriod - 1].lockDecisionTime[company.companyId - 1].lockTime = new Date();
            resultSeminar.roundTime[resultSeminar.currentPeriod - 1].lockDecisionTime[company.companyId - 1].spendHour = decisionTime.lockTime - startTime;
        }
        return resultSeminar.saveQ();
    }).then(function (result) {
        if (result[1] === 0) {
            throw new Error("Cancel promise chains. update seminar failed, No seminar update.");
        }
        if (result[1] > 1) {
            throw new Error("Cancel promise chains. update seminar failed, More than one seminar update.");
        }
        socketio.emitMarksimosDecisionUpdate(req.gameMarksimos.socketRoom.company, req.user);
        return res.status(200).send(result);
    }).fail(function (err) {
        next(err);
    }).done();
}
exports.lockCompanyDecision = lockCompanyDecision;
;
/*

export function getProductPortfolio (req, res, next) {
    let seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    let period = req.gameMarksimos.currentStudentSeminar.currentPeriod;


    if (!seminarId) {
        return res.send(400, { message: "You don't choose a seminar." });
    }

    let companyId = +req.query.companyId;

    productPortfolioAssembler.getProductPortfolioForOneCompany(seminarId, period, companyId)
        .then(function (productPortfolioForOneCompany) {
            res.send(productPortfolioForOneCompany);
        })
        .fail(function (err) {
            logger.error(err);
            res.send(500, { message: "get product portfolio failed." });
        })
        .done();
}
*/
function getSpendingDetails(req, res, next) {
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    var period = req.gameMarksimos.currentStudentSeminar.currentPeriod;
    if (!seminarId) {
        return res.send(400, { message: "You don't choose a seminar." });
    }
    var companyId = +req.query.companyId;
    spendingDetailsAssembler.getSpendingDetails(seminarId, period, companyId)
        .then(function (spendingDetails) {
        res.send(spendingDetails);
    })
        .fail(function (err) {
        logger.error(err);
        res.send(500, { message: "get spending details failed." });
    })
        .done();
}
exports.getSpendingDetails = getSpendingDetails;
/*

export function getSKUInfoFutureProjection (req, res, next) {
    let seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    let period = req.gameMarksimos.currentStudentSeminar.currentPeriod;

    if (!seminarId) {
        return res.send(400, { message: "You don't choose a seminar." });
    }

    let companyId = +req.query.companyId;

    let SKUID = req.params.sku_id;

    if (!SKUID) {
        return res.send(400, { message: "Invalid parameter sku_id." });
    }

    SKUInfoAssembler.getSKUInfo(seminarId, period, companyId, SKUID)
        .then(function (SKUInfo) {
            res.send(SKUInfo);
        })
        .fail(function (err) {
            logger.error(err);
            res.send(500, { message: "get SKUInfo failed." });
        })
        .done();
}
*/
function getOtherinfo(req, res, next) {
    var seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;
    var period = req.gameMarksimos.currentStudentSeminar.currentPeriod;
    if (!seminarId) {
        return res.send(400, { message: "You don't choose a seminar." });
    }
    var companyId = +req.query.companyId;
    Q.all([
        spendingDetailsAssembler.getSpendingDetails(seminarId, period, companyId),
        simulationResultModel.findOne(seminarId, period - 1)
    ])
        .spread(function (spendingDetails, lastPeriodResult) {
        /*
        let totalInvestment = spendingDetails.companyData.totalInvestment;
        let companyResult = utility.findCompany(lastPeriodResult, companyId);

        let totalAvailableBudget = parseFloat(
            (
                (companyResult.c_TotalInvestmentBudget - companyResult.c_CumulatedInvestments - totalInvestment
                ) / (companyResult.c_TotalInvestmentBudget)
            ).toFixed(2)
        );
        let totalAvailableBudgetValue = companyResult.c_TotalInvestmentBudget - companyResult.c_CumulatedInvestments - totalInvestment;

        let normalCapacity = parseFloat((spendingDetails.companyData.normalCapacity / companyResult.c_Capacity).toFixed(2));
        let normalCapacityValue = spendingDetails.companyData.normalCapacity;

        let overtimeCapacity = parseFloat(((spendingDetails.companyData.availableOvertimeCapacityExtension
        ) / (companyResult.c_Capacity * gameParameters.pgen.firm_OvertimeCapacity)).toFixed(2));

        let overtimeCapacityValue = spendingDetails.companyData.availableOvertimeCapacityExtension;

        //if normal capacity is not totally used, set overtime capacity to 1
        if (normalCapacityValue > 0) {
            overtimeCapacity = 1;
            overtimeCapacityValue = companyResult.c_Capacity * gameParameters.pgen.firm_OvertimeCapacity;
            //overtimeCapacityValue = companyResult.c_Capacity;
        }
        */
        res.send({
            totalAvailableBudget: 100000,
            normalCapacity: 100000,
            overtimeCapacity: 100000,
            totalAvailableBudgetValue: 100000,
            normalCapacityValue: 100000,
            overtimeCapacityValue: 100000 //overtimeCapacityValue
        });
    })
        .fail(function (err) {
        logger.error(err);
        res.send(500, { message: "get otherInfo failed." });
    })
        .done();
}
exports.getOtherinfo = getOtherinfo;
//# sourceMappingURL=decision.js.map