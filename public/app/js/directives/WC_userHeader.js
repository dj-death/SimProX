(function () {
    'use strict';

	angular.module('marksimos.websitecomponent').directive('userHeader', ['$window', '$translate', 'Student', function ($window, $translate, Student){
        return {
            scope: {
                showmenu     : '=',
                showlogout   : '=',
                menuhome     : '&clickHome',
                menureport   : '&clickReport',
                menuscore    : '&clickScore',
                menudecision : '&clickDecision',
                currentMenu : '=',
                seminarFinished : '=',
                currentRound : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/websitecomponent/userheader.html',
            link: function (scope, element, attrs) {

                scope.clickMenu = function(currentmenu){
                    scope.currentMenu = currentmenu;
                };

                scope.clickHelpMenu = function(){
                    if($window.location.href.indexOf('/stratege/help')==-1)
                        $window.location.href='/stratege/help';
                };

                scope.changeLanguage = function (langKey) {

                    $translate.use(langKey);
                    Student.updateStudentB2CInfo({ 'websiteLanguage':langKey });
                };

                scope.clickLogout = function () {
                    Student.logOut().then(function(data){
                        $window.location.href = "/stratege/login" ;
                    });
                };

            }
        };
    }]);
	
		

})();