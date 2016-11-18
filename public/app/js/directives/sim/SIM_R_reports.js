(function () {
    'use strict';

	angular.module('marksimos.websitecomponent').directive('tableReportCompanyStatusSku', function() {
        return {
            scope: {
                data : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportcompanystatussku.html'
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportCompanyStatusBrand', function() {
        return {
            scope: {
                data : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportcompanystatusbrand.html'
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportCompanyStatusGlobal', function() {
        return {
            scope: {
                data : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportcompanystatusglobal.html'
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportFinancialReportBrand', function() {
        return {
            scope: {
                data : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportfinancialreportbrand.html'
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportFinancialReportAllBrand', function() {
        return {
            scope: {
                data : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportfinancialreportallbrand.html'
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportProfitabilityEvolutionSku', function() {
        return {
            scope: {
                data : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportprofitabilityevolutionsku.html'
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportProfitabilityEvolutionBrand', function() {
        return {
            scope: {
                data : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportprofitabilityevolutionbrand.html'
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportProfitabilityEvolutionGlobal', function() {
        return {
            scope: {
                data : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportprofitabilityevolutionglobal.html'
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportCompetitorIntelligence', function() {
        return {
            scope: {
                data : '=',
                unit : '=',
                chartdata : '=',
                chartconfig : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportcompetitorintelligence.html',
            link: function (scope, element, attrs) {

                scope.plus = 1;
                scope.display = 'line';

                if(angular.isUndefined(scope.unit)) {
                    scope.unit = '';
                }else if (scope.unit === "%"){
                    scope.plus = 1;
                }

                scope.display = 'line';

            }
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportSegmentDistribution', function() {
        return {
            scope: {
                data : '=',
                unit : '=',
                chartdata : '=',
                chartconfig : '=',
                showAllSegments : '=allsegments'
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportsegmentdistribution.html',
            link: function (scope, element, attrs) {

                scope.plus = 1;
                scope.display = 'line';

                if(angular.isUndefined(scope.unit)) {
                    scope.unit = '';
                }else if (scope.unit === "%"){
                    scope.plus = 1;
                }

                attrs.$observe('showAllSegments', function(value){
                    if (angular.isUndefined(value)) {
                        value = false;
                    }
                });

            }
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportMarketTrendsSku', function() {
        return {
            scope: {
                data : '=',
                unit : '=',
                chartdata : '=',
                chartconfig : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportmarkettrendssku.html',
            link: function (scope, element, attrs) {

                scope.plus = 1;
                scope.display = 'line';

                if(angular.isUndefined(scope.unit)) {
                    scope.unit = '';
                }

            }
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportMarketTrendsBrand', function() {
        return {
            scope: {
                data : '=',
                unit : '=',
                chartdata : '=',
                chartconfig : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportmarkettrendsbrand.html',
            link: function (scope, element, attrs) {

                scope.plus = 1;
                scope.display = 'line';

                if(angular.isUndefined(scope.unit)) {
                    scope.unit = '';
                }
            }
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportMarketTrendsGlobal', function() {
        return {
            scope: {
                data : '=',
                unit : '=',
                chartdata : '=',
                chartconfig : '='
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportmarkettrendsglobal.html',
            link: function (scope, element, attrs) {

                scope.plus = 1;
                scope.display = 'line';

                if(angular.isUndefined(scope.unit)) {
                    scope.unit = '';
                }

            }
        };
    });


    angular.module('marksimos.websitecomponent').directive('tableReportMarketIndicator', [ function() {
        return {
            scope: {
                data : '=',
                unit : '@'
            },
            restrict: 'AE',
            templateUrl: '/app/partials/sim/reports/tablereportmarketindicator.html',
            link: function (scope, element, attrs) {

                if(angular.isUndefined(scope.unit)) {
                    scope.unit = '';
                }

            }
        };
    }]);


    angular.module('marksimos.websitecomponent').directive('tableReportFinalScore', [function() {
        return {
            scope: {
                data: '=',
                showScaled:'='
            },

            restrict: 'AEC',
            templateUrl: '/app/partials/sim/reports/tablereportfinalscore.html',
            link: function(scope, element, attrs) {

                if (scope.data && scope.data.length) {
                    scope.selectedIndex = scope.data.length - 1;
                }

                attrs.$observe('showScaled', function(value){
                    if (value === undefined) {
                        value = true;
                    }
                });

                scope.changeIndex = function(index) {
                    scope.selectedIndex = index;
                };
            }
        }; 
    }]);


})();