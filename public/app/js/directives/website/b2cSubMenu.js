(function () {
    'use strict';

	angular.module('marksimos.websitecomponent').directive('b2cSubMenu', ['$location' , function ($location){
        return {
            restrict   : 'AE',
            templateUrl: '/app/partials/website/b2csubmenu.html',
            link       : function (scope, element, attrs) {
                scope.menu = [
                    {
                        title: '关于我们',
                        link : 'about'
                    },
                    {
                        title: '项目介绍',
                        link : 'intro'
                    },
                    {
                        title: '最新活动',
                        link : 'activity'
                    },
                    {
                        title: '媒体报道',
                        link : 'media'
                    },
                    {
                        title: '企业合作',
                        link : 'cooperate'
                    },
                    {
                        title: '联系我们',
                        link : 'contact'
                    }
                ];

                scope.isActive = function (route) {
                    return $location.$$absUrl.indexOf(route) >= 1;
                };
            }
        };
    }]);
	
		

})();