
/**
 * User Role Model module.
 * @module Model User Role
 * @see module: api/model/user/userrole.js
 */

let mongoose = require('mongoose-q')(require('mongoose'));
let Schema = mongoose.Schema;
let Q = require('q');
let mongooseTimestamps = require('mongoose-timestamp');


interface IRole {
    id;
    name;
}

/**
 * Resource Permission Name Have Two Type : Resource Get(Read) and Resource CUD(create, update and delete)
 */

let appResource = {

    stratege : {
        studentLogin : 'studentLogin',  // For Render ejs views of student
        adminLogin : 'adminLogin',      // For Render ejs views of admin

        studentInfoSingleGet : 'studentInfoSingleGet',  // For student
        studentInfoSingleCUD : 'studentInfoSingleCUD',  // For student
        studentInfoListGet   : 'studentInfoListGet',    // For admin facilitator

        distributorInfoSingleGet : 'distributorInfoSingleGet',
        distributorInfoSingleCUD : 'distributorInfoSingleCUD',
        distributorInfoListGet   : 'distributorInfoListGet',

        facilitatorInfoSingleGet : 'facilitatorInfoSingleGet',
        facilitatorInfoSingleCUD : 'facilitatorInfoSingleCUD',
        facilitatorInfoListGet   : 'facilitatorInfoListGet',


        glossarySingleGet   : 'glossarySingleGet',        // For  facilitator
        glossarySingleCUD   : 'glossarySingleCUD',        // For  facilitator
        glossaryInfoListGet : 'glossaryInfoListGet',      // For  facilitator


        teamInfoSingleGet : 'teamInfoSingleGet',  // For student
        teamInfoSingleCUD : 'teamInfoSingleCUD',  // For student
        teamInfoListGet   : 'teamInfoListGet',    // For student


        campaignSingleGet   : 'campaignSingleGet',        // For  facilitator
        campaignSingleCUD   : 'campaignSingleCUD',        // For  facilitator
        campaignInfoListGet : 'campaignInfoListGet',      // For  facilitator

        seminarSingleGet         : 'seminarSingleGet',        // For  facilitator
        seminarSingleCUD         : 'seminarSingleCUD',        // For  facilitator

        seminarSingleDecisionGet : 'seminarSingleDecisionGet',  // For student
        seminarSingleDecisionCUD : 'seminarSingleDecisionCUD',  // For student

        seminarAssignStudentCUD : 'seminarAssignStudentCUD',  // For  facilitator
        seminarInit             : 'seminarInit',              // For  facilitator
        seminarRunRound         : 'seminarRunRound',          // For  facilitator

        seminarListOfStudentGet          : 'seminarListOfStudentGet',      // For student
        seminarListOfFacilitatorGet      : 'seminarListOfFacilitatorGet',  // For  facilitator
        seminarDecisionsOfFacilitatorCUD : 'seminarDecisionsOfFacilitatorCUD'  // For  facilitator

    }

};





/**
 * UserRoles  (Will Store in Schema)
 */

let roles = [
    {
        id : 1,
        name : 'admin',
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
        id : 2,
        name : 'distributor',
        permissions :[
            appResource.stratege.adminLogin,

            appResource.stratege.distributorInfoSingleGet,
            appResource.stratege.distributorInfoSingleCUD,

            appResource.stratege.facilitatorInfoSingleGet,
            appResource.stratege.facilitatorInfoSingleCUD,
            appResource.stratege.facilitatorInfoListGet

        ]
    },
    {
        id : 3,
        name : 'facilitator',
        permissions :[
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
        id : 4,
        name : 'student',
        permissions :[
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
        id : 9,
        name : 'enterprise',
        permissions :[]
    },

    {
        id : 10,
        name : 'mentor',
        permissions :[]
    }

];


let roleListResult = {};

let getRoleList = function  (): any {

    roles.forEach(function (role){
        roleListResult[role.name] = role ;
        roleListResult[role.id] = role ;
    });

    return roleListResult;
};


/**
 * Authorize Resource Permission of specified Role.
 * @constructor
 * @param {string} resource - The resource  of the Resource Permission.
 * @param {string} userroleid - The userroleid of the user.
 */

let authorizeRolePermission = function (resource, userRoleId){
    if (userRoleId > 0) {
        let role = roleListResult[userRoleId];

        if(role.permissions.indexOf(resource) > -1){
            return true
        }
    }

    return false;
};




/**
 * GameList  (Will Store in Schema)
 */

let games = [
    {
        id : 10,
        name : 'stratege'
    }
];

let gameListResult = {};
let getGameList = function  (): any {
    games.forEach(function (game){
        gameListResult[game.name] = game ;
        gameListResult[game.id] = game ;
    });

    return gameListResult
};


let config = {
    games: games,
    gameList: getGameList(),
    right: appResource,
    roles: roles,
    roleList: getRoleList(),
    authRolePermission: authorizeRolePermission
};


export = config;