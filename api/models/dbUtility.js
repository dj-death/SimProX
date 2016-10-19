//import PlayerDecision = require('./decision/Decision');
"use strict";
var companyDecisionModel = require('./decision/CompanyDecision');
/*let brandDecisionModel = require('./marksimos/brandDecision.js');
let SKUDecisionModel = require('./marksimos/SKUDecision.js');*/
var decisionAssembler = require('../assemblers/decision');
var Q = require('q');
/**
 * @param {Number} period current period
 *
 */
function insertEmptyDecision(seminarId, period) {
    return Q.all([
        companyDecisionModel.insertEmptyCompanyDecision(seminarId, period) /*,
        brandDecisionModel.insertEmptyBrandDecision(seminarId, period),
        SKUDecisionModel.insertEmptySKUDecision(seminarId, period)*/
    ]);
}
exports.insertEmptyDecision = insertEmptyDecision;
/* decisions start */
function removeExistedDecisions(seminarId) {
    return Q.all([
        companyDecisionModel.removeAll(seminarId) /*,
        brandDecisionModel.removeAll(seminarId),
        SKUDecisionModel.removeAll(seminarId)*/
    ]);
}
exports.removeExistedDecisions = removeExistedDecisions;
/**
 * Split allDecisions into companyDecision, brandDecison, and SKUDecision,
 * then save them to db
 *
 */
function saveDecision(seminarId, allDecisions) {
    var p = Q();
    allDecisions.forEach(function (decision) {
        p = p.then(function () {
            return Q.all([
                saveCompanyDecision(decision, seminarId, decision.period) /*,
                saveBrandDecision(decision, seminarId, decision.period),
                saveSKUDecision(decision, seminarId, decision.period)*/
            ]);
        });
    });
    return p;
}
exports.saveDecision = saveDecision;
;
function saveCompanyDecision(decision, seminarId, period) {
    var companyDecision = decisionAssembler.getCompanyDecision(decision);
    companyDecision.seminarId = seminarId;
    companyDecision.period = period;
    return companyDecisionModel.save(companyDecision);
}
exports.saveCompanyDecision = saveCompanyDecision;
;
/*
export function saveBrandDecision (decision, seminarId, period) {
    let brandDecisions = decisionAssembler.getBrandDecisions(decision);

    let d = Q();
    brandDecisions.forEach(function (brandDecision) {
        brandDecision.seminarId = seminarId;
        brandDecision.period = period;
        d = d.then(function () {
            return brandDecisionModel.initCreate(brandDecision)
        });
    });
    return d;
}

export function saveSKUDecision (decision, seminarId, period) {
    let SKUDecisions = decisionAssembler.getSKUDecisions(decision);
    let d = Q();

    SKUDecisions.forEach(function (SKUDecision) {
        SKUDecision.seminarId = seminarId;
        SKUDecision.period = period;
        d = d.then(function () {
            return SKUDecisionModel.initCreate(SKUDecision)
        })
    });

    return d;
}*/ 
//# sourceMappingURL=dbUtility.js.map