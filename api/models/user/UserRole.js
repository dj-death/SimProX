/**
 * User Role Model module.
 * @module Model User Role
 * @see module: api/model/user/userrole.js
 */
"use strict";
let mongoose = require('mongoose-q')(require('mongoose'));
let Schema = mongoose.Schema;
let Q = require('q');
let mongooseTimestamps = require('mongoose-timestamp');
/**
 * Resource Permission Name Have Two Type : Resource Get(Read) and Resource CUD(create, update and delete)
 */
let appResource = {
    stratege: {
        studentLogin: 'studentLogin',
        adminLogin: 'adminLogin',
        studentInfoSingleGet: 'studentInfoSingleGet',
        studentInfoSingleCUD: 'studentInfoSingleCUD',
        studentInfoListGet: 'studentInfoListGet',
        distributorInfoSingleGet: 'distributorInfoSingleGet',
        distributorInfoSingleCUD: 'distributorInfoSingleCUD',
        distributorInfoListGet: 'distributorInfoListGet',
        facilitatorInfoSingleGet: 'facilitatorInfoSingleGet',
        facilitatorInfoSingleCUD: 'facilitatorInfoSingleCUD',
        facilitatorInfoListGet: 'facilitatorInfoListGet',
        glossarySingleGet: 'glossarySingleGet',
        glossarySingleCUD: 'glossarySingleCUD',
        glossaryInfoListGet: 'glossaryInfoListGet',
        teamInfoSingleGet: 'teamInfoSingleGet',
        teamInfoSingleCUD: 'teamInfoSingleCUD',
        teamInfoListGet: 'teamInfoListGet',
        campaignSingleGet: 'campaignSingleGet',
        campaignSingleCUD: 'campaignSingleCUD',
        campaignInfoListGet: 'campaignInfoListGet',
        seminarSingleGet: 'seminarSingleGet',
        seminarSingleCUD: 'seminarSingleCUD',
        seminarSingleDecisionGet: 'seminarSingleDecisionGet',
        seminarSingleDecisionCUD: 'seminarSingleDecisionCUD',
        seminarAssignStudentCUD: 'seminarAssignStudentCUD',
        seminarInit: 'seminarInit',
        seminarRunRound: 'seminarRunRound',
        seminarListOfStudentGet: 'seminarListOfStudentGet',
        seminarListOfFacilitatorGet: 'seminarListOfFacilitatorGet',
        seminarDecisionsOfFacilitatorCUD: 'seminarDecisionsOfFacilitatorCUD' // For  facilitator
    }
};
/**
 * UserRoles  (Will Store in Schema)
 */
let roles = [
    {
        id: 1,
        name: 'admin',
        permissions: [
            appResource.stratege.adminLogin,
            appResource.stratege.distributorInfoSingleGet,
            appResource.stratege.distributorInfoSingleCUD,
            appResource.stratege.distributorInfoListGet,
            appResource.stratege.facilitatorInfoSingleGet,
            appResource.stratege.facilitatorInfoListGet,
            appResource.stratege.studentInfoSingleGet,
            appResource.stratege.studentInfoListGet
        ]
    },
    {
        id: 2,
        name: 'distributor',
        permissions: [
            appResource.stratege.adminLogin,
            appResource.stratege.distributorInfoSingleGet,
            appResource.stratege.distributorInfoSingleCUD,
            appResource.stratege.facilitatorInfoSingleGet,
            appResource.stratege.facilitatorInfoSingleCUD,
            appResource.stratege.facilitatorInfoListGet
        ]
    },
    {
        id: 3,
        name: 'facilitator',
        permissions: [
            appResource.stratege.adminLogin,
            appResource.stratege.facilitatorInfoSingleGet,
            appResource.stratege.facilitatorInfoSingleCUD,
            appResource.stratege.studentInfoSingleGet,
            appResource.stratege.studentInfoSingleCUD,
            appResource.stratege.studentInfoListGet,
            appResource.stratege.glossarySingleGet,
            appResource.stratege.glossarySingleCUD,
            appResource.stratege.glossaryInfoListGet,
            appResource.stratege.campaignSingleGet,
            appResource.stratege.campaignSingleCUD,
            appResource.stratege.campaignInfoListGet,
            appResource.stratege.seminarSingleGet,
            appResource.stratege.seminarSingleCUD,
            appResource.stratege.seminarAssignStudentCUD,
            appResource.stratege.seminarInit,
            appResource.stratege.seminarRunRound,
            appResource.stratege.seminarListOfFacilitatorGet,
            appResource.stratege.seminarDecisionsOfFacilitatorCUD
        ]
    },
    {
        id: 4,
        name: 'student',
        permissions: [
            appResource.stratege.studentLogin,
            appResource.stratege.studentInfoSingleGet,
            appResource.stratege.studentInfoSingleCUD,
            appResource.stratege.teamInfoSingleGet,
            appResource.stratege.teamInfoSingleCUD,
            appResource.stratege.teamInfoListGet,
            appResource.stratege.campaignSingleGet,
            appResource.stratege.seminarListOfStudentGet,
            appResource.stratege.seminarSingleDecisionGet,
            appResource.stratege.seminarSingleDecisionCUD,
            appResource.stratege.glossaryInfoListGet
        ]
    },
    {
        id: 9,
        name: 'enterprise',
        permissions: []
    },
    {
        id: 10,
        name: 'mentor',
        permissions: []
    }
];
let roleListResult = {};
let getRoleList = function () {
    roles.forEach(function (role) {
        roleListResult[role.name] = role;
        roleListResult[role.id] = role;
    });
    return roleListResult;
};
/**
 * Authorize Resource Permission of specified Role.
 * @constructor
 * @param {string} resource - The resource  of the Resource Permission.
 * @param {string} userroleid - The userroleid of the user.
 */
let authorizeRolePermission = function (resource, userRoleId) {
    if (userRoleId > 0) {
        let role = roleListResult[userRoleId];
        if (role.permissions.indexOf(resource) > -1) {
            return true;
        }
    }
    return false;
};
/**
 * GameList  (Will Store in Schema)
 */
let games = [
    {
        id: 10,
        name: 'stratege'
    }
];
let gameListResult = {};
let getGameList = function () {
    games.forEach(function (game) {
        gameListResult[game.name] = game;
        gameListResult[game.id] = game;
    });
    return gameListResult;
};
let config = {
    games: games,
    gameList: getGameList(),
    right: appResource,
    roles: roles,
    roleList: getRoleList(),
    authRolePermission: authorizeRolePermission
};
module.exports = config;
//# sourceMappingURL=UserRole.js.map