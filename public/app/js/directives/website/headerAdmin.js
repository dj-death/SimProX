(function () {
    'use strict';

	angular.module('marksimos.websitecomponent').directive('headerAdmin', ['$window', '$translate', 'Student', function ($window, $translate, Student){
        return {
            scope: {
                currentuser : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/website/adminheader.html',
            link: function (scope, element, attrs) {
                scope.changeLanguage = function (langKey) {
                    $translate.use(langKey);
                };

                scope.clickLogout = function () {
                    Student.logOut().then(function(data){

                        $window.location.href = "/stratege/admin/" ;

                    });
                };

            }
        };
    }]);
	
		

})();