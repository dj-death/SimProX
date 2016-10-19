/**
 * Created by jinwyp on 4/28/14.
 */

/**
 * recommended
 *
 * no globals are left behind
 */


(function () {
    'use strict';



    /********************  Create New Module For Controllers ********************/
    angular.module('marksimoslogin', [ 'pascalprecht.translate', 'marksimos.config', 'marksimos.websitecomponent', 'marksimos.model', 'marksimos.filter',  'marksimos.translation']);



    /********************  Use This Module To Set New Controllers  ********************/
    angular.module('marksimoslogin').controller('userLoginController', ['$scope', '$http', '$window', 'Student', function  ($scope, $http, $window, Student) {
        $scope.css = {
            newUser : {
                passwordPrompt : false
            }
        };

        $scope.data = {
            newUser : {
                username : '',
                email : '',
                password : ''
            }
        };


        $scope.login = function(form){
            if(form.$valid){
                Student.login($scope.data.newUser).then(function(){

                    $window.location.href = "/stratege/intro" ;

                }, function(err){
                    form.password.$valid = false;
                    form.password.$invalid = true;
                    $scope.css.newUser.passwordPrompt = true;
                });
            }
        };

    }]);




    angular.module('marksimoslogin').controller('userIntroController',['$scope', '$http', '$window', 'Student',  'Company', function($scope, $http, $window, Student, Company) {

        $scope.css = {
            showBox : 'seminar'
        };

        $scope.data = {
            brandNumber : 0,
            skuNumber : 0,
            currentStudent : null,
            currentStudentSeminar : null,
            currentCompany : null,
            seminars : [],
            selectSeminar : {
                seminar_id : 0
            }
        };

        $scope.initSeminar = function() {


            Student.getStudent().then(function(data, status, headers, config){
                $scope.data.currentStudent = data;
            });

            Student.getSeminarList().then(function(data, status, headers, config){
                $scope.data.seminars = data;
            });
        };

        $scope.initSeminar();


        $scope.chooseSeminar = function(seminarid){

            $scope.data.selectSeminar.seminar_id = seminarid;

            if($scope.data.selectSeminar.seminar_id !== 0 ){

                Student.chooseSeminar($scope.data.selectSeminar).success(function(data, status, headers, config){

                    Student.getStudent().success(function(data, status, headers, config){
                        $scope.data.currentStudentSeminar = data.currentMarksimosSeminar;

                        // 处理最后比赛是否结束 跳过Who am I 页面
                        if($scope.data.currentStudentSeminar.isSimulationFinished === false){
                            $scope.css.showBox = 'whoami';

                            Company.getCompany($scope.data.currentStudentSeminar.currentCompany.companyId).then(function(data, status, headers, config){
                                angular.forEach(data.d_BrandsDecisions, function(brand){
                                    $scope.data.brandNumber++;

                                    angular.forEach(brand.d_SKUsDecisions, function(sku){
                                        $scope.data.skuNumber++;
                                    });
                                });

                                $scope.data.currentCompany = data;
                            });
                        }else{
                            $window.location.href = "/stratege/home" ;
                        }
                    });

                }).error(function(data, status, headers, config){
                    console.log(data);
                });
            }
        };

        $scope.whoamiNext = function(){
            $window.location.href = "/stratege/home" ;
        };

    }]);






}());