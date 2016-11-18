(function () {
    'use strict';

	angular.module('marksimos.websitecomponent').directive('menuAdmin', [function (){
        return {
            scope: {
                currentMenu : '=',
                showtab : '=',
                currentuser : '=',
                changemenu : '&'
            },
            restrict: 'AE',
            templateUrl: '/app/partials/website/adminmenu.html',
            link : function(scope, element){

                scope.css = {
                    menuexpand : [false, false, true, true, true, true, true, true, true, true] // menus control expand
                };

                scope.clickTab = function(tab){

                    scope.css.menuexpand[tab] = !scope.css.menuexpand[tab];
                };

                scope.clickMenu = function(currentmenu){					
                    scope.currentMenu = currentmenu;
                    scope.changemenu();
                };

            }
        };
    }]);
	
		

})();