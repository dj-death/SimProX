import util = require('util');

let express = require('express');
let apiRouter = express.Router();

import * as User from '../api/models/user/User';
import * as Scenario from '../api/models/scenario/Scenario';
import * as fileUploadModel from '../api/models/user/fileupload';


import * as iAuth from '../api/controllers/user/authentication';
import * as administratorController from '../api/controllers/user/admin';
import * as studentController from '../api/controllers/user/student';


import * as seminarController from '../api/controllers/simulation/seminar';
import * as decisionController from '../api/controllers/simulation/decision';
import * as chartController from '../api/controllers/simulation/chart';
import * as reportController from '../api/controllers/simulation/report';
import * as initController from '../api/controllers/simulation/init';


import * as campaignController from '../api/controllers/b2c/campaign';
import * as glossaryController from '../api/controllers/b2c/glossary';
import * as tagController from '../api/controllers/b2c/tag';

import * as questionnaireController from '../api/controllers/questionnaire';
import * as faqController from '../api/controllers/faq';

import * as Auth from '../api/auth';



let expressJwt = require('express-jwt');


import userRoleModel = require('../api/models/user/UserRole');
let strategeRight = userRoleModel.right.stratege;


import console = require('../kernel/utils/logger');


/**********     Init Passport Auth     **********/
iAuth.initAuth();


export function get(io) {


    // protect our api
    apiRouter.use(iAuth.authLoginToken().unless({
        path: ['/', '/admin', '/e4e/login', '/e4e/emailverify/registration', '/e4e/campaigns', '/stratege/help', '/e4e/forgotpassword', '/stratege/login', '/stratege/admin', '/stratege/api/admin/login', '/stratege/api/login']
    }));

    /**********     Routes for rendering templates HCD Learning Website     **********/

    apiRouter.get('/', function (req, res, next) {
        console.log("Website Host:", req.headers.host);

        if (req.headers.host.indexOf('bridgeplus.cn') !== -1) {
            return res.redirect('/e4e');
        } else {
            return res.redirect('/cn');
        }

    });

    apiRouter.get('/admin', function (req, res, next) {
        res.redirect('/stratege/admin');
    });


    /**********     Routes for rendering templates E4E Website     **********/

    apiRouter.get('/e4e', function (req, res, next) {
        res.render('b2c/registration/indexreg.ejs', { title: 'Welcome to Bridge+ ' });
    });

    apiRouter.get('/e4e/emailverify/registration', iAuth.activateRegistrationEmail);


    apiRouter.get('/e4e/login', function (req, res, next) {
        res.render('b2c/login.ejs', { title: 'Bridge+ Sign in to Your Account | Bridge+' });
    });


    apiRouter.get('/e4e/forgotpassword', function (req, res, next) {
        res.render('b2c/forgotpassword/forgotpassword.ejs', { title: 'Forgotten Your Password? | Bridge+' });
    });
    apiRouter.get('/e4e/emailverify/changepassword', iAuth.forgotPasswordStep2);


    apiRouter.get('/e4e/profile', iAuth.authRole(strategeRight.studentLogin, { failureRedirect: '/e4e/login' }), function (req, res, next) {
        res.render('b2c/profile.ejs', { title: 'Bridge+ User Home | Bridge+' });
    });

    apiRouter.get('/e4e/campaigns', campaignController.campaignListPage);
    apiRouter.get('/e4e/campaign/:campaignId', iAuth.authRole(strategeRight.studentLogin, { failureRedirect: '/e4e/login' }), campaignController.campaignSingleInfoPage);

    apiRouter.get('/e4e/about', function (req, res, next) {
        res.render('b2c/about/about.ejs', { title: 'About Bridge+ | Bridge+' });
    });

    apiRouter.get('/e4e/intro', function (req, res, next) {
        res.render('b2c/about/intro.ejs', { title: 'Project Introduction | Bridge+' });
    });

    apiRouter.get('/e4e/activity', function (req, res, next) {
        res.render('b2c/about/activity.ejs', { title: 'Newest Activities | Bridge+' });
    });

    apiRouter.get('/e4e/contact', function (req, res, next) {
        res.render('b2c/about/contact.ejs', { title: 'Contact | Bridge+' });
    });

    apiRouter.get('/e4e/media', function (req, res, next) {
        res.render('b2c/about/unfinished.ejs', { title: 'Media Reports | Bridge+' });
    });

    apiRouter.get('/e4e/cooperate', function (req, res, next) {
        res.render('b2c/about/cooperate.ejs', { title: 'Cooperation | Bridge+' });
    });






    /**********     Routes for rendering templates MarkSimos User/Student     **********/

    apiRouter.get('/stratege', iAuth.authRole(strategeRight.studentLogin, { failureRedirect: '/stratege/login' }), function (req, res, next) {
        res.redirect('/stratege/intro');
    });

    apiRouter.get('/stratege/login', function (req, res, next) {
        res.render('player/userlogin.ejs', { title: 'MarkSimos - Sign In | HCD Learning' });
    });

    apiRouter.get('/stratege/intro', iAuth.authRole(strategeRight.studentLogin, { failureRedirect: '/stratege/login' }), function (req, res, next) {
        res.render('player/userintroduction.ejs', { title: 'MarkSimos - Introduction Videos | HCD Learning' });
    });

    apiRouter.get('/stratege/home', iAuth.authRole(strategeRight.studentLogin, { failureRedirect: '/stratege/login' }), function (req, res, next) {
        res.render('player/userhome.ejs', { title: 'MarkSimos - User Home | HCD Learning' });
    });


    apiRouter.get('/stratege/help', function (req, res, next) {
        res.render('player/userhelp.ejs', { title: 'MarkSimos - Help | HCD Learning' });
    });

    //download file
    apiRouter.get('/stratege/download/manualeng', function (req, res, next) {
        res.download('./public/app/file/stratege_Participants_Manual.pdf');
    });

    apiRouter.get('/stratege/download/manualchs', function (req, res, next) {
        res.download('./public/app/file/stratege_Participants_Manual_chs.pdf');
    });

    apiRouter.get('/stratege/manual/zh_CN', function (req, res, next) {
        res.render('player/help/manual_cn.md', { layout: false });
    });

    apiRouter.get('/stratege/manual/en_US', function (req, res, next) {
        res.render('player/help/manual_en.md', { layout: false });
    });











    /**********     Routes for rendering templates Administrator     **********/

    apiRouter.get('/stratege/admin', function (req, res, next) {
        res.render('admin/adminlogin.ejs', { title: 'Admin | Log in' });
    });

    apiRouter.get('/stratege/adminhome', iAuth.authRole(strategeRight.adminLogin, { failureRedirect: '/stratege/admin' }), function (req, res, next) {
        res.render('admin/adminhome.ejs', { title: 'Admin | Dashboard' });
    });

    apiRouter.get('/stratege/adminhomereport/:seminar_id', iAuth.authRole(strategeRight.adminLogin, { failureRedirect: '/stratege/admin' }), seminarController.seminarInfoForFacilitator);






    /********** Change Reactor ******************************/
    apiRouter.get('/changeReactor', function (req, res, next) {
        res.render('changeReactor/index.ejs', { title: 'Change Reactor' });
    });
    apiRouter.get('/changeReactor/result', function (req, res, next) {
        res.render('changeReactor/result.ejs', { title: 'Verify Result' });
    });




   
    /**********     Set Content-Type for all API JSON response     **********/
    // protect our api
    apiRouter.all("/stratege/api/*", function (req, res, next) {
        res.set('Content-Type', 'application/json; charset=utf-8');
        next();
    });


    /**********     API For E4E Student     **********/
    apiRouter.post('/e4e/api/registercompany', iAuth.registerB2CEnterprise);
    apiRouter.post('/e4e/api/registerstudent', iAuth.registerB2CStudent);

    apiRouter.post('/e4e/api/register/username', iAuth.verifyUsername);
    apiRouter.post('/e4e/api/register/email', iAuth.verifyEmail);
    apiRouter.post('/e4e/api/register/mobilePhone', iAuth.verifyMobilePhone);

    // comment-captcha-start
    apiRouter.get('/e4e/api/captcha', iAuth.generateRegistrationCaptcha);
    // comment-captcha-end

    apiRouter.post('/e4e/api/forgotpasswordstep1', iAuth.sendResetPasswordEmail);
    apiRouter.post('/e4e/api/forgotpasswordstep2', iAuth.verifyResetPasswordCode);
    apiRouter.post('/e4e/api/forgotpasswordstep3', iAuth.resetNewPassword);

    
    apiRouter.put('/e4e/api/student/password', iAuth.authRole(strategeRight.studentInfoSingleCUD), studentController.updateStudentB2CPassword);
    apiRouter.put('/e4e/api/student', iAuth.authRole(strategeRight.studentInfoSingleCUD), studentController.updateStudentB2CInfo);

    //apiRouter.post('/e4e/api/student/avatar', iAuth.authRole(strategeRight.studentInfoSingleCUD), fileUploadModel.multerUpload('studentavatar'), studentController.uploadStudentAvatar);

    apiRouter.get('/e4e/api/student/phoneverifycode', iAuth.authRole(strategeRight.studentInfoSingleCUD), iAuth.generatePhoneVerifyCode);
    apiRouter.post('/e4e/api/student/phoneverifycode', iAuth.authRole(strategeRight.studentInfoSingleCUD), iAuth.verifyPhoneVerifyCode);

    apiRouter.post('/e4e/api/team', iAuth.authRole(strategeRight.teamInfoSingleCUD), studentController.updateTeam);
    apiRouter.post('/e4e/api/team/student', iAuth.authRole(strategeRight.teamInfoSingleGet), studentController.addStudentToTeam);
    apiRouter.delete('/e4e/api/team/student/:student_id', iAuth.authRole(strategeRight.teamInfoSingleCUD), studentController.removeStudentToTeam);

    apiRouter.get('/e4e/api/campaigns/:campaignId', iAuth.authRole(strategeRight.campaignSingleGet), campaignController.campaignSingleInfo);
    apiRouter.post('/e4e/api/campaigns/teams', iAuth.authRole(strategeRight.campaignSingleGet), campaignController.addTeamToCampaign);
    apiRouter.post('/e4e/api/campaigns/teams/remove', iAuth.authRole(strategeRight.campaignSingleGet), campaignController.removeTeamFromCampaign);





    /**********     API For MarkSimos Student     **********/
    apiRouter.post('/stratege/api/login', iAuth.studentLogin);
    apiRouter.get('/stratege/api/logout', iAuth.logout);


    // get seminar
    apiRouter.get('/stratege/api/user', iAuth.authRole(strategeRight.studentInfoSingleGet), iAuth.getUserInfo);
    apiRouter.get('/stratege/api/student/seminar', iAuth.authRole(strategeRight.seminarListOfStudentGet), seminarController.getSeminarList);
    apiRouter.get('/stratege/api/choose_seminar', iAuth.authRole(strategeRight.seminarListOfStudentGet), seminarController.chooseSeminarForStudent);


    
    //report
    apiRouter.get('/stratege/api/report/:report_name', iAuth.authRole(strategeRight.seminarSingleDecisionGet), reportController.getReport);

    // excel report
    apiRouter.get('/stratege/api/downloadReport', iAuth.authRole(strategeRight.seminarSingleDecisionGet), reportController.exportToExcel);

    //chart
    apiRouter.get('/stratege/api/chart/:chart_name', iAuth.authRole(strategeRight.seminarSingleDecisionGet), chartController.getChart);

    //final score
    apiRouter.get('/stratege/api/finalscore', iAuth.authRole(strategeRight.seminarSingleDecisionGet), reportController.getStudentFinalScore);
 

    //company info
    apiRouter.get('/stratege/api/company', iAuth.authRole(strategeRight.seminarSingleDecisionGet), decisionController.getDecision);
    //apiRouter.get('/stratege/api/product_portfolio', iAuth.authRole(strategeRight.seminarSingleDecisionGet), decisionController.getProductPortfolio);
    apiRouter.get('/stratege/api/spending_details', iAuth.authRole(strategeRight.seminarSingleDecisionGet), decisionController.getSpendingDetails);
    //apiRouter.get('/stratege/api/future_projection_calculator/:sku_id', iAuth.authRole(strategeRight.seminarSingleDecisionGet), decisionController.getSKUInfoFutureProjection);
    apiRouter.get('/stratege/api/company/otherinfo', iAuth.authRole(strategeRight.seminarSingleDecisionGet), decisionController.getOtherinfo);

    //make decision page
    //apiRouter.put('/stratege/api/sku/decision', iAuth.authRole(strategeRight.seminarSingleDecisionCUD), decisionController.updateSKUDecision);
    //apiRouter.post('/stratege/api/sku/decision', iAuth.authRole(strategeRight.seminarSingleDecisionCUD), decisionController.addSKU);
    //apiRouter.delete('/stratege/api/sku/decision/:company_id/:brand_id/:sku_id', iAuth.authRole(strategeRight.seminarSingleDecisionCUD), decisionController.deleteSKU);

    //apiRouter.put('/stratege/api/brand/decision', iAuth.authRole(strategeRight.seminarSingleDecisionCUD), decisionController.updateBrandDecision);
    //apiRouter.post('/stratege/api/brand/decision', iAuth.authRole(strategeRight.seminarSingleDecisionCUD), decisionController.addBrand);
    
    apiRouter.put('/stratege/api/company/decision', iAuth.authRole(strategeRight.seminarSingleDecisionCUD), decisionController.updateCompanyDecision);
    apiRouter.put('/stratege/api/company/decision/lock', iAuth.authRole(strategeRight.seminarSingleDecisionCUD), decisionController.lockCompanyDecision);

    
    //getQuestionnaire
    apiRouter.get('/stratege/api/questionnaire', iAuth.authRole(strategeRight.seminarSingleDecisionGet), questionnaireController.getQuestionnaire);
    apiRouter.put('/stratege/api/questionnaire', iAuth.authRole(strategeRight.seminarSingleDecisionCUD), questionnaireController.submitQuestionnaire);
    
    //getFaq
    apiRouter.get('/stratege/api/faq', faqController.getFAQ);


    //seminar online chat
    apiRouter.post('/stratege/api/seminar/chat/seminar', seminarController.sendChatMessageSeminar);
    apiRouter.post('/stratege/api/seminar/chat/company', seminarController.sendChatMessageSeminarCompany);

    //get Glossary
    apiRouter.post('/stratege/api/glossaries', iAuth.authRole(strategeRight.glossaryInfoListGet), glossaryController.searchGlossaryWithWord);



    


    /**********     API For Administrator     **********/
    apiRouter.post('/stratege/api/admin/login', iAuth.adminLogin);

    // get current admin role
    apiRouter.get('/stratege/api/admin/user', iAuth.authRole(strategeRight.adminLogin), iAuth.getUserInfo);

    apiRouter.get('/stratege/api/admin/distributors', iAuth.authRole(strategeRight.distributorInfoListGet), administratorController.searchDistributor);
    apiRouter.post('/stratege/api/admin/distributors', iAuth.authRole(strategeRight.distributorInfoSingleCUD), administratorController.addDistributor);
    apiRouter.put('/stratege/api/admin/distributors/:distributor_id', iAuth.authRole(strategeRight.distributorInfoSingleCUD), administratorController.updateDistributor);


    apiRouter.get('/stratege/api/admin/facilitators', iAuth.authRole(strategeRight.facilitatorInfoListGet), administratorController.searchFacilitator);
    apiRouter.post('/stratege/api/admin/facilitators', iAuth.authRole(strategeRight.facilitatorInfoSingleCUD), administratorController.addFacilitator);
    apiRouter.put('/stratege/api/admin/facilitators/:facilitator_id', iAuth.authRole(strategeRight.facilitatorInfoSingleCUD), administratorController.updateFacilitator);


    apiRouter.get('/stratege/api/admin/students', iAuth.authRole(strategeRight.studentInfoListGet), administratorController.searchStudent);
    apiRouter.get('/stratege/api/admin/students/byday', iAuth.authRole(strategeRight.studentInfoListGet), administratorController.listStudentNumberByDay);
    apiRouter.post('/stratege/api/admin/students', iAuth.authRole(strategeRight.studentInfoSingleCUD), administratorController.addStudent);
    apiRouter.put('/stratege/api/admin/students/:student_id', iAuth.authRole(strategeRight.studentInfoSingleCUD), administratorController.updateStudent);
    apiRouter.delete('/stratege/api/admin/students/:student_id', iAuth.authRole(strategeRight.studentInfoSingleCUD), administratorController.removeStudent);



    apiRouter.post('/stratege/api/admin/students/reset_password', iAuth.authRole(strategeRight.studentInfoSingleCUD), administratorController.resetStudentPassword);


    //Facilitator manager Campaign
    apiRouter.get('/stratege/api/admin/campaigns', iAuth.authRole(strategeRight.campaignInfoListGet), campaignController.searchCampaign);
    apiRouter.post('/stratege/api/admin/campaigns', iAuth.authRole(strategeRight.campaignSingleCUD), campaignController.addCampaign);
    apiRouter.put('/stratege/api/admin/campaigns', iAuth.authRole(strategeRight.campaignSingleCUD), campaignController.updateCampaign);
    apiRouter.delete('/stratege/api/admin/campaigns/:id', iAuth.authRole(strategeRight.campaignSingleCUD), campaignController.removeCampaign);

    apiRouter.get('/stratege/api/admin/campaigns/score', iAuth.authRole(strategeRight.campaignInfoListGet), campaignController.searchTeamMarksimosScore);
    apiRouter.get('/stratege/api/admin/campaigns/teamcount', iAuth.authRole(strategeRight.campaignInfoListGet), campaignController.countTeamJoinCampaign);
    //apiRouter.post('/stratege/api/admin/campaigns/upload', iAuth.authRole(strategeRight.campaignSingleCUD), fileUploadModel.multerUpload(), campaignController.uploadCampaignPics);


    apiRouter.post('/stratege/api/admin/campaigns/seminars', iAuth.authRole(strategeRight.campaignSingleCUD), campaignController.addSeminarToCampaign);
    apiRouter.post('/stratege/api/admin/campaigns/seminars/remove', iAuth.authRole(strategeRight.campaignSingleCUD), campaignController.removeSeminarFromCampaign);

    apiRouter.post('/stratege/api/admin/campaigns/teams', iAuth.authRole(strategeRight.campaignSingleCUD), campaignController.addTeamToCampaign);
    apiRouter.post('/stratege/api/admin/campaigns/teams/remove', iAuth.authRole(strategeRight.campaignSingleCUD), campaignController.removeTeamFromCampaign);




    //Facilitator manager seminars
    apiRouter.get('/stratege/api/admin/facilitator/seminar', iAuth.authRole(strategeRight.seminarListOfFacilitatorGet), seminarController.getSeminarOfFacilitator);
    apiRouter.post('/stratege/api/admin/seminar', iAuth.authRole(strategeRight.seminarSingleCUD), seminarController.addSeminar);
    apiRouter.put('/stratege/api/admin/seminar', iAuth.authRole(strategeRight.seminarSingleCUD), seminarController.updateSeminar);
    apiRouter.delete('/stratege/api/admin/seminar/:seminar_id', iAuth.authRole(strategeRight.seminarSingleCUD), seminarController.removeSeminar);


    apiRouter.post('/stratege/api/admin/assign_student_to_seminar', iAuth.authRole(strategeRight.seminarAssignStudentCUD), seminarController.assignStudentToSeminar);
    apiRouter.post('/stratege/api/admin/remove_student_from_seminar', iAuth.authRole(strategeRight.seminarAssignStudentCUD), seminarController.removeStudentFromSeminar);

    apiRouter.post('/stratege/api/admin/seminar/:seminar_id/init', iAuth.authRole(strategeRight.seminarInit), initController.init(io));

    apiRouter.post('/stratege/api/admin/seminar/:seminar_id/runsimulation', iAuth.authRole(strategeRight.seminarRunRound), initController.runSimulation());
    apiRouter.post('/stratege/api/admin/seminar/:seminar_id/unlockDecision', iAuth.authRole(strategeRight.seminarRunRound), seminarController.updateSeminarUnlockDecision);

    //apiRouter.get('/stratege/api/admin/delphi_cgi', iAuth.authRole(strategeRight.seminarInit), initController.getCgiStatus);



    //facilitator decisions, report, chart
    //note : To get full version of some reports, plz make sure user role != student
    apiRouter.get('/stratege/api/admin/seminar/:seminar_id/decisions', iAuth.authRole(strategeRight.seminarListOfFacilitatorGet), decisionController.getDecisionForFacilitator);

    apiRouter.get('/stratege/api/admin/report/:report_name', iAuth.authRole(strategeRight.seminarListOfFacilitatorGet), reportController.getReport);
    apiRouter.get('/stratege/api/admin/chart/:chart_name', iAuth.authRole(strategeRight.seminarListOfFacilitatorGet), chartController.getChart);
    apiRouter.get('/stratege/api/admin/finalscore/:seminarId', iAuth.authRole(strategeRight.seminarListOfFacilitatorGet), reportController.getStudentFinalScore);

    apiRouter.get('/stratege/api/admin/questionnaire/:seminarId', iAuth.authRole(strategeRight.seminarListOfFacilitatorGet), questionnaireController.getQuestionnaireListForAdmin);

    //apiRouter.put('/stratege/api/admin/sku/decision', iAuth.authRole(strategeRight.seminarDecisionsOfFacilitatorCUD), decisionController.updateSKUDecision);
    //apiRouter.put('/stratege/api/admin/brand/decision', iAuth.authRole(strategeRight.seminarDecisionsOfFacilitatorCUD), decisionController.updateBrandDecision);
    apiRouter.put('/stratege/api/admin/company/decision', iAuth.authRole(strategeRight.seminarDecisionsOfFacilitatorCUD), decisionController.updateCompanyDecision);

    //seminar online chat
    apiRouter.post('/stratege/api/admin/seminar/chat/seminar', iAuth.authRole(strategeRight.seminarListOfFacilitatorGet), seminarController.sendChatMessageSeminar);



    //Facilitator manager Glossary
    apiRouter.get('/stratege/api/admin/glossaries', iAuth.authRole(strategeRight.glossaryInfoListGet), glossaryController.searchGlossary);
    apiRouter.post('/stratege/api/admin/glossaries', iAuth.authRole(strategeRight.glossarySingleCUD), glossaryController.addGlossary);
    apiRouter.put('/stratege/api/admin/glossaries', iAuth.authRole(strategeRight.glossarySingleCUD), glossaryController.updateGlossary);

    apiRouter.get('/stratege/api/admin/tags', iAuth.authRole(strategeRight.glossaryInfoListGet), tagController.searchTag);




    /**********     Database Init     **********/
    //apiRouter.get('/stratege/api/initfaq', faqController.initFAQ);
    apiRouter.get('/stratege/setup/load_scenario', Scenario.createScenario);

    apiRouter.get('/stratege/setup/create_admin', function (req, res, next) {

            let userList = [
                {
                    "username": "admin",
                    "password": "admin",
                    "email": "ceo.mohamed.didi@gmail.com",
                    "country": "Morocco",
                    "city": "Meknes",
                    "role": userRoleModel.roleList.admin.id,
                    "activated": true,
                    "emailActivated": true,
                    "emailActivateToken": "efe5ceba-fd21-445e-86b6-c5fa64f3c694"
                },
                {
                    "username": "distributor",
                    "password": "distributor",
                    "email": "hcd_distributor@hcdlearning.com",
                    "country": "China",
                    "state": "shanghai",
                    "city": "shanghai",
                    "district": "Ren Min Lu",
                    "street": "",
                    "idcardNumber": "",
                    "numOfUsedLicense": 0,
                    "numOfLicense": 500000,
                    "role": userRoleModel.roleList.distributor.id,
                    "activated": true,
                    "emailActivated": true,
                    "emailActivateToken": "efe5ceba-fd21-445e-86b6-c5fa64f3c694"
                },
                {
                    "username": "facilitator",
                    "password": "facilitator",
                    "email": "hcd_facilitator@hcdlearning.com",
                    "country": "China",
                    "state": "shanghai",
                    "city": "shanghai",
                    "distributorId": "54609f0c700a570813b1353f",
                    "numOfUsedLicense": 0,
                    "numOfLicense": 100000,
                    "role": userRoleModel.roleList.facilitator.id,
                    "activated": true,
                    "emailActivated": true,
                    "emailActivateToken": "efe5ceba-fd21-445e-86b6-c5fa64f3c694"
                },
                {
                    "username": "b2c_facilitator",
                    "password": "hcdfacilitator@9876",
                    "email": "b2c_facilitator@hcdlearning.com",
                    "mobilePhone": "13564568304",
                    "country": "China",
                    "state": "shanghai",
                    "city": "shanghai",
                    "distributorId": "54609f0c700a570813b1353f",
                    "numOfUsedLicense": 0,
                    "numOfLicense": 1000000000,
                    "role": userRoleModel.roleList.facilitator.id,
                    "activated": true,
                    "emailActivated": true,
                    "emailActivateToken": "efe5ceba-fd21-445e-86b6-c5fa64f3c694"
                },
                {
                    "username": "sunyun",
                    "email": "yunsun@hcdlearning.com",
                    "mobilePhone": "13817304511",
                    "country": "China",
                    "state": "shanghai",
                    "city": "shanghai",
                    "password": "123456",
                    "facilitatorId": "54609fb2700a570813b13540",
                    "idcardNumber": "321181198502273515",
                    "occupation": "Student",
                    "firstName": "yun",
                    "lastName": "sun",
                    "organizationOrUniversity": "",
                    "majorsDegree": "",
                    "studentType": 10,
                    "role": userRoleModel.roleList.student.id,
                    "activated": true,
                    "emailActivated": false
                },
                {
                    "username": "jinwang",
                    "email": "jinwang@hcdlearning.com",
                    "mobilePhone": "13564568304",
                    "country": "China",
                    "state": "shanghai",
                    "city": "shanghai",
                    "password": "123456",
                    "facilitatorId": "54609fb2700a570813b13540",
                    "idcardNumber": "321181198502273515",
                    "occupation": "Student",
                    "firstName": "jin",
                    "lastName": "wang",
                    "organizationOrUniversity": "",
                    "majorsDegree": "",
                    "studentType": 10,
                    "role": userRoleModel.roleList.student.id,
                    "activated": true,
                    "emailActivated": false
                },
                {
                    "username": "sunhao",
                    "email": "haosun@hcdlearning.com",
                    "mobilePhone": "18019419955",
                    "country": "China",
                    "state": "shanghai",
                    "city": "shanghai",
                    "password": "123456",
                    "facilitatorId": "54609fb2700a570813b13540",
                    "idcardNumber": "321181198502273515",
                    "occupation": "Student",
                    "firstName": "hao",
                    "lastName": "sun",
                    "organizationOrUniversity": "",
                    "majorsDegree": "",
                    "studentType": 10,
                    "role": userRoleModel.roleList.student.id,
                    "activated": true,
                    "emailActivated": false
                },
                {
                    "username": "anilraparla",
                    "email": "anilraparla@hcdlearning.com",
                    "mobilePhone": "13916502743",
                    "country": "China",
                    "state": "shanghai",
                    "city": "shanghai",
                    "password": "123456",
                    "facilitatorId": "54609fb2700a570813b13540",
                    "idcardNumber": "321181198502273515",
                    "occupation": "Student",
                    "firstName": "anil",
                    "lastName": "anil",
                    "organizationOrUniversity": "",
                    "majorsDegree": "",
                    "studentType": 10,
                    "role": userRoleModel.roleList.student.id,
                    "activated": true,
                    "emailActivated": false
                },
                {
                    "username": "yuekecheng",
                    "email": "clarkyue@hcdlearning.com",
                    "mobilePhone": "15900719671",
                    "country": "China",
                    "state": "shanghai",
                    "city": "shanghai",
                    "password": "123456",
                    "facilitatorId": "54609fb2700a570813b13540",
                    "idcardNumber": "321181198502273515",
                    "occupation": "Student",
                    "firstName": "clark",
                    "lastName": "yue",
                    "organizationOrUniversity": "",
                    "majorsDegree": "",
                    "studentType": 10,
                    "role": userRoleModel.roleList.student.id,
                    "activated": true,
                    "emailActivated": false
                }
            ];
            

		User.find({role: userRoleModel.roleList.admin.id}).execQ().then(function (userResult) {
			if (userResult.length) {

				// b2c_facilitator
				User.findOne({"username": "b2c_facilitator"}).execQ().then(function (userB2CResult) {
					console.log(userB2CResult);
					if(userB2CResult){
						return res.status(400).send ({message: "already added."});
					}else{
						User.create(userList[3], function (err, b2cFacilitatorResults) {
							if (err) {
								return res.status(400).send( {message: "add default admin and users failed."});
							} else {
								//for (let i=1; i<arguments.length; ++i) {
								//    let user = arguments[i];
								//    // do some stuff with candy
								//}

								return res.status(200).send(b2cFacilitatorResults);
							}
						});
					}
				}).fail(function(err){
					next (err);
				}).done();


			}else {
				
				User.create(userList, function (err) {
					if (err) {
						return res.status(400).send( {message: "add default admin and users failed."});
					} else {
						//for (let i=1; i<arguments.length; ++i) {
						//    let user = arguments[i];
						//    // do some stuff with candy
						//}

						let userListResults = Array.prototype.slice.call(arguments, 1);
						return res.status(200).send(userListResults);
					}
				});
			}
		}).fail(function(err){
			next (err);
		}).done();
	});


    return apiRouter;
}