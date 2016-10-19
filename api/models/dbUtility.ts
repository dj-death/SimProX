
//import PlayerDecision = require('./decision/Decision');


import companyDecisionModel = require('./decision/CompanyDecision');


/*let brandDecisionModel = require('./marksimos/brandDecision.js');
let SKUDecisionModel = require('./marksimos/SKUDecision.js');*/

import decisionAssembler = require('../assemblers/decision');

import console = require('../../kernel/utils/logger');

let Q = require('q');


/**
 * @param {Number} period current period
 *
 */
export function insertEmptyDecision (seminarId, period) {
    return Q.all([
        companyDecisionModel.insertEmptyCompanyDecision(seminarId, period)/*,
        brandDecisionModel.insertEmptyBrandDecision(seminarId, period),
        SKUDecisionModel.insertEmptySKUDecision(seminarId, period)*/
    ])
}

/* decisions start */
export function removeExistedDecisions(seminarId) {
    return Q.all([
        companyDecisionModel.removeAll(seminarId)/*,
        brandDecisionModel.removeAll(seminarId),
        SKUDecisionModel.removeAll(seminarId)*/
    ]);
}

/**
 * Split allDecisions into companyDecision, brandDecison, and SKUDecision,
 * then save them to db
 *
 */
export function saveDecision (seminarId, allDecisions) {
    let p = Q();

    allDecisions.forEach(function (decision) {
        p = p.then(function () {

            return Q.all([
                saveCompanyDecision(decision, seminarId, decision.period)/*,
                saveBrandDecision(decision, seminarId, decision.period),
                saveSKUDecision(decision, seminarId, decision.period)*/
            ]);
        })
    });

    return p;
};

export function saveCompanyDecision(decision, seminarId, period) {

    let companyDecision: any = decisionAssembler.getCompanyDecision(decision);

    companyDecision.seminarId = seminarId;
    companyDecision.period = period;


    return companyDecisionModel.save(companyDecision);
};

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