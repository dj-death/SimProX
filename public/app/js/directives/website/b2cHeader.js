(function () {
    'use strict';

	angular.module('marksimos.websitecomponent').directive('b2cHeader', ['$window', '$translate', '$timeout', 'Student', function ($window, $translate, $timeout, Student){
        return {
            scope: {
                showlogin  : '=',
                currentuser   : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/website/b2cheader.html',

            link: function (scope, element, attrs) {

                //scope.clickHelpMenu = function(){
                //    if($window.location.href.indexOf('/stratege/help')==-1)
                //        $window.location.href='/stratege/help';
                //};

                scope.css = {
                    language : 'fr_FR'
                };

                scope.css.language = $translate.use();


                scope.changeLanguage = function (langKey) {
                    scope.css.language = langKey;
                    $translate.use(langKey);

                    if(!angular.isUndefined(scope.currentuser)){
                        Student.updateStudentB2CInfo({ 'websiteLanguage':langKey });
                    }
                };

                scope.newUser = {
                    username : '',
                    password : '',
                    rememberMe : false
                };

                //scope.$watch('currentuser', function(newValue, oldValue) {
                //    if ( newValue !== oldValue ) {
                //        // Only increment the counter if the value changed
                //        //scope.currentuser = newValue;
                //        console.log(scope.currentuser);
                //    }
                //
                //}, true);


                scope.clickLogin = function () {

                    if(typeof scope.newUser.username === 'undefined' || typeof scope.newUser.password === 'undefined' ){
                        return false;
                    }else {
                        if(scope.newUser.username !== '' && scope.newUser.password !== ''){

                            Student.login(scope.newUser).then(function(){

                                $window.location.href = "/e4e/profile" ;

                            }, function(err){
                                $window.location.href = "/e4e/login#!/?username=" + scope.newUser.username ;
                            });
                        }
                    }


                };

                scope.clickLogout = function () {
                    Student.logOut().then(function(data){
                        $window.location.href = "/e4e/login" ;
                    });
                };

            }
        };
    }]);
		

})();