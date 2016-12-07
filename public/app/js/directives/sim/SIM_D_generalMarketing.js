(function () {
    'use strict';

	angular.module('marksimos.websitecomponent').directive('generalMarketing', ['Label', '$http', '$location', '$filter', '$q',
        function(Label, $http, $location, $filter, $q) {
            return {
                scope: {
                    isPageShown: '=',
                    isPageLoading: '=',
                    selectedPlayer: '=',
                    selectedPeriod: '=',
                    
                    products: '=',
                    productsRefs: '=',
                    markets: '=',
                    marketsRefs: '=',
                    agents: '=',
                    eCommerces: '=',

                    isPortfolioDecisionCommitted:'=',
                    isContractDeal:'=',
                    isContractFinalized:'=',
                    isDecisionCommitted:'=',
                    isDecisionLocked:'='
                },

                restrict: 'E',
                templateUrl: '/app/partials/sim/decisions/SD_generalMarketing.html',
                link: function(scope, element, attrs) {

                    var initializePage = function() {
                        console.log('initializePage some small...');
                        scope.isPageLoading = true;
                        scope.isResultShown = false;
                        scope.Label = Label;

                        scope.currentPeriod = scope.selectedPeriod;
                        
                        /*ProducerDecisionBase.reload({
                            producerID: parseInt(scope.selectedPlayer),
                            period: scope.selectedPeriod,
                            seminar: SeminarInfo.getSelectedSeminar().seminarCode
                        }).then(function(base) {
                            scope.pageBase = base;
                        }).then(function() {
                            return showView();
                        }),
                        function(reason) {
                            console.log('from ctr: ' + reason);
                        },
                        function(update) {
                            console.log('from ctr: ' + update);
                        };*/

                        showView();
                    }

                    var loadSelectCategory = function(category) {
                        /*var d = $q.defer();
                        var count = 0;
                        var brands = new Array();
                        var allProCatDecisions = _.filter(scope.pageBase.proCatDecision, function(obj) {
                            if (category == "HealthBeauty") {
                                return (obj.categoryID == 2);
                            } else {
                                return (obj.categoryID == 1);
                            }
                        });
                        for (var i = 0; i < allProCatDecisions.length; i++) {
                            for (var j = 0; j < allProCatDecisions[i].proBrandsDecision.length; j++) {
                                if (allProCatDecisions[i].proBrandsDecision[j] != undefined && allProCatDecisions[i].proBrandsDecision[j].brandID != undefined && allProCatDecisions[i].proBrandsDecision[j].brandID != 0) {
                                    allProCatDecisions[i].proBrandsDecision[j].advertisingOffLine[0] = allProCatDecisions[i].proBrandsDecision[j].advertisingOffLine[0].toFixed(2);
                                    allProCatDecisions[i].proBrandsDecision[j].advertisingOffLine[1] = allProCatDecisions[i].proBrandsDecision[j].advertisingOffLine[1].toFixed(2);
                                    allProCatDecisions[i].proBrandsDecision[j].advertisingOnLine = allProCatDecisions[i].proBrandsDecision[j].advertisingOnLine.toFixed(2);
                                    allProCatDecisions[i].proBrandsDecision[j].supportTraditionalTrade[0] = allProCatDecisions[i].proBrandsDecision[j].supportTraditionalTrade[0].toFixed(2);
                                    allProCatDecisions[i].proBrandsDecision[j].supportTraditionalTrade[1] = allProCatDecisions[i].proBrandsDecision[j].supportTraditionalTrade[1].toFixed(2);
                                    brands.push(allProCatDecisions[i].proBrandsDecision[j]);
                                    count++;
                                }
                            }
                        }
                        if (count != 0) {
                            result = 1;
                            d.resolve();
                        } else {
                            d.reject(Label.getContent('load brands fail'));
                        }
                        if (category == "Elecssories") {
                            scope.brandes = brands;
                        } else {
                            scope.brandhs = brands;
                        }
                        */
                    }

                    scope.checkData = function(category, brandName, location, tep, index, value) {
                        /*var d = $q.defer();
                        var categoryID, max, ContractExpend, reportExpend, producerExpend, availableBudgetLeft;
                        var filter = /^[0-9]+([.]{1}[0-9]{1,2})?$/;
                        if (!filter.test(value)) {
                            d.resolve(Label.getContent('Input a number'));
                        }
                        var url = "/companyHistoryInfo/" + SeminarInfo.getSelectedSeminar().seminarCode + '/' + (scope.selectedPeriod - 1) + '/P/' + parseInt(scope.selectedPlayer);
                        $http({
                            method: 'GET',
                            url: url
                        }).then(function(data) {
                            max = data.data.budgetAvailable;
                            url = '/getContractExpend/' + SeminarInfo.getSelectedSeminar().seminarCode + '/' + scope.selectedPeriod + '/' + scope.selectedPlayer + '/brandName/varName/ignoreItem/1';
                            return $http({
                                method: 'GET',
                                url: url
                            });
                        }).then(function(data) {
                            ContractExpend = data.data.result;
                            url = '/getPlayerReportOrderExpend/' + SeminarInfo.getSelectedSeminar().seminarCode + '/' + scope.selectedPeriod + '/P/' + scope.selectedPlayer;
                            return $http({
                                method: 'GET',
                                url: url
                            });
                        }).then(function(data) {
                            reportExpend = data.data.result;
                            url = "/producerExpend/" + SeminarInfo.getSelectedSeminar().seminarCode + '/' + (scope.selectedPeriod) + '/' + parseInt(scope.selectedPlayer) + '/' + brandName + '/' + location + '/' + tep;
                            return $http({
                                method: 'GET',
                                url: url
                            });
                        }).then(function(data) {
                            producerExpend = data.data.result;
                            availableBudgetLeft = max - ContractExpend  - reportExpend - producerExpend;
                            console.log(availableBudgetLeft);
                            if(value>availableBudgetLeft){
                                d.resolve(Label.getContent('Input range') + ':0~' + (Math.floor(availableBudgetLeft * 100) / 100));
                            }else{
                                d.resolve();
                            }
                        }, function(data) {
                            d.resolve(Label.getContent('fail'));
                        });
                        return d.promise;
                        */
                    }

                    scope.updateProducerDecision = function(category, brandName, location, tep, index) {
                        /*var categoryID;
                        if (category == "Elecssories") {
                            categoryID = 1;
                            if (location == "supportTraditionalTrade" || location == "advertisingOffLine") {
                                ProducerDecisionBase.setProducerDecisionBrand(categoryID, brandName, location, tep, scope.brandes[index][location][tep],'supplierGeneralMarketing');
                            } else {
                                ProducerDecisionBase.setProducerDecisionBrand(categoryID, brandName, location, tep, scope.brandes[index][location],'supplierGeneralMarketing');
                            }
                        } else {
                            categoryID = 2;
                            if (location == "supportTraditionalTrade" || location == "advertisingOffLine") {
                                ProducerDecisionBase.setProducerDecisionBrand(categoryID, brandName, location, tep, scope.brandhs[index][location][tep],'supplierGeneralMarketing');
                            } else {
                                ProducerDecisionBase.setProducerDecisionBrand(categoryID, brandName, location, tep, scope.brandhs[index][location],'supplierGeneralMarketing');
                            }
                        }
                        */
                    }

                    var showView = function() {
                        var d = $q.defer();

                        loadSelectCategory('Elecssories');
                        loadSelectCategory('HealthBeauty');

                        scope.isResultShown = true;
                        scope.isPageLoading = false;

                        return d.promise;
                    }

                    scope.$watch('isPageShown', function(newValue, oldValue) {
                        if (newValue == true) {
                            initializePage();
                        }
                    });


                    scope.$on('producerDecisionBaseChangedFromServer', function(event, data, newBase) {
                        //decision base had been updated, re-render the page with newBase
                        if(data.page=="supplierGeneralMarketing"){
                            scope.pageBase = newBase;
                            showView();
                        }
                    });

                }
            }
        }
    ]);
	
		

})();