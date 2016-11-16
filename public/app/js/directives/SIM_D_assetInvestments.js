(function () {
    'use strict';

	angular.module('marksimos.websitecomponent').directive('assetInvestments', ['Label', '$http','$location','$filter', '$q', function(Label, $http,$location,$filter, $q){
        return {
            scope : {
                isPageShown : '=',
                isPageLoading : '=',
                selectedPlayer: '=',
                selectedPeriod: '=',
                isPortfolioDecisionCommitted:'=',
                isContractDeal:'=',
                isContractFinalized:'=',
                isDecisionCommitted:'='
            },

            restrict : 'E',
            templateUrl : '/app/partials/decisions/SD_assetInvestments.html',            
            link : function(scope, element, attrs){                   

                var initializePage = function(){
                    console.log('initializePage some small...');                    
                    scope.isPageLoading = true;
                    scope.isResultShown = false;                    
                    scope.Label = Label;

                    scope.currentPeriod = scope.selectedPeriod;
                    
                    /*ProducerDecisionBase.reload({producerID:parseInt(scope.selectedPlayer),period:scope.selectedPeriod,seminar:SeminarInfo.getSelectedSeminar().seminarCode}).then(function(base){
                        scope.pageBase = base; 
                    }).then(function(){
                        return showView();
                    }), function(reason){
                        console.log('from ctr: ' + reason);
                    }, function(update){
                        console.log('from ctr: ' + update);
                    };*/

                    showView();           
                }


                var loadSelectCategory=function(category){
                    /*var d=$q.defer();
                    var count=0;
                    var brands=new Array();
                    var allProCatDecisions=_.filter(scope.pageBase.proCatDecision,function(obj){
                        if(category=="HealthBeauty"){
                            return (obj.categoryID==2);
                        }else{
                            return (obj.categoryID==1);
                        }
                    });

                    for(var i=0;i<allProCatDecisions.length;i++){
                        for(var j=0;j<allProCatDecisions[i].proBrandsDecision.length;j++){
                            if(allProCatDecisions[i].proBrandsDecision[j]!=undefined&&allProCatDecisions[i].proBrandsDecision[j].brandID!=undefined&&allProCatDecisions[i].proBrandsDecision[j].brandID!=0){
                                brands.push(allProCatDecisions[i].proBrandsDecision[j]);
                                count++;
                            }
                        }
                    }

                    if(count!=0){
                        result=1;
                        d.resolve();
                    }else{
                        d.reject(Label.getContent('load brands fail'));
                    }
                    if(category=="Elecssories"){
                        scope.brandes=brands;
                    }else{
                        scope.brandhs=brands;
                    }
                    */
                }


                scope.checkCapacity=function(categoryID,value){
                    /*var d=$q.defer();
                    var MaxCapacityReduction,MaxCapacityIncrease,max,acLeft;
                    var filter=/^-?[0-9]+([.]{1}[0-9]{1,2})?$/;
                    if(!filter.test(value)){
                        d.resolve(Label.getContent('Input Number'));
                    }else{
                        var url='/getOneQuarterExogenousData/'+SeminarInfo.getSelectedSeminar().seminarCode+'/'+categoryID+'/1' + '/' + scope.selectedPeriod;
                        $http({
                            method:'GET',
                            url:url
                        }).then(function(data){
                            MaxCapacityReduction=data.data.MaxCapacityReduction;
                            MaxCapacityIncrease=data.data.MaxCapacityIncrease;
                            url = "/companyHistoryInfo/" + SeminarInfo.getSelectedSeminar().seminarCode + '/' + (scope.selectedPeriod - 1) + '/P/' + parseInt(scope.selectedPlayer);
                            return $http({
                                method: 'GET',
                                url: url
                            });
                        }).then(function(data){
                            max=data.data.productionCapacity[categoryID-1];
                            if(value<max*MaxCapacityReduction||value>max*MaxCapacityIncrease){
                                d.resolve(Label.getContent('Input range')+':'+(Math.floor(max*MaxCapacityReduction * 100) / 100)+'~'+(Math.floor(max*MaxCapacityIncrease * 100) / 100));
                            }else{
                                d.resolve();
                            }
                        },function(data){
                            d.resolve(Label.getContent('Check Error'));
                        })
                    }

                    return d.promise;
                    */
                }


                scope.checkData=function(categoryID,value){
                    /*var d=$q.defer();
                    var filter=/^[0-9]+([.]{1}[0-9]{1,2})?$/;
                    if(!filter.test(value)){
                        d.resolve(Label.getContent('Input a number'));
                    }else{
                        var url='/getScrplSales/'+SeminarInfo.getSelectedSeminar().seminarCode+'/'+(scope.selectedPeriod-1)+'/'+scope.selectedPlayer+'/'+categoryID;
                        $http({
                            method:'GET',
                            url:url
                        }).then(function(data){
                            if(value>data.data[0]){
                                d.resolve(Label.getContent('Input range')+':0~'+Math.floor(data.data[0] * 100) / 100);
                            }else{
                                d.resolve();
                            }
                        },function(){
                            d.resolve(Label.getContent('Check Error'));
                        })
                    }
                    return d.promise;
                    */
                }

                scope.updateProducerDecision=function(categoryID,location,index){
                    //ProducerDecisionBase.setProducerDecisionCategory(categoryID,location,scope.categorys[index][location],'supplierAssetInvestments');
                }

                scope.updateVariantDecision=function(category,brandName,varName,location,additionalIdx,index,value){
                    console.log(value);
                    /*
                    var categoryID;
                    if(category=="Elecssories"){
                        categoryID=1;
                    }else{
                        categoryID=2;
                    }
                    ProducerDecisionBase.setProducerDecisionValue(categoryID,brandName,varName,location,additionalIdx,value,'supplierAssetInvestments');                         
                    */
                }


                var showView=function(){
                    var d=$q.defer();
                    var count=0;
                    var categorys=new Array();

                    /*
                    for(var i=0;i<scope.pageBase.proCatDecision.length;i++){
                        scope.pageBase.proCatDecision[i].capacityChange=scope.pageBase.proCatDecision[i].capacityChange.toFixed(2);
                        scope.pageBase.proCatDecision[i].investInDesign=scope.pageBase.proCatDecision[i].investInDesign.toFixed(2);
                        scope.pageBase.proCatDecision[i].investInProductionFlexibility=scope.pageBase.proCatDecision[i].investInProductionFlexibility.toFixed(2);
                        scope.pageBase.proCatDecision[i].investInTechnology=scope.pageBase.proCatDecision[i].investInTechnology.toFixed(2);
                        categorys.push(scope.pageBase.proCatDecision[i]);
                        count++;
                    }
                    */

                    scope.categorys=categorys;
                    scope.isResultShown = true;
                    scope.isPageLoading = false;
                    
                    return d.promise;       
                }

                scope.$watch('isPageShown', function(newValue, oldValue){
                    if(newValue==true) {
                        initializePage();
                    }
                });
                
                scope.$on('producerDecisionBaseChangedFromServer', function(event, data, newBase) {                    
                        //decision base had been updated, re-render the page with newBase
                    if(data.page=="supplierAssetInvestments"){
                        scope.pageBase = newBase;
                        showView();
                    }
                });

            }
        }
    }]);
	
		

})();