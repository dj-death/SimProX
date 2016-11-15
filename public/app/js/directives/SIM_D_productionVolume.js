(function () {
    'use strict';

	angular.module('marksimos.websitecomponent').directive('productionVolume', ['$http','$location','$filter','$q', 'Label', function ($http,$location,$filter,$q, Label){

        return {
            scope : {
                isPageShown : '=',
                isPageLoading : '=',
				products: '=',
				productsRefs: '=',
                selectedPlayer: '=',
                selectedPeriod: '=',
                isPortfolioDecisionCommitted:'=',
                isContractDeal:'=',
                isContractFinalized:'=',
                isDecisionCommitted:'=',
				isDecisionLocked:'='
            },
            restrict : 'E',
            templateUrl : '/app/partials/decisions/SD_productionVolume.html',

            link : function(scope, element, attrs){                   

                var initializePage = function(){
                    console.log('initializePage some small...');                    
                    scope.isPageLoading = true;
                    scope.isResultShown = false;                    
                    scope.Label = Label;

                    scope.currentPeriod=scope.selectedPeriod;
                    
                    /*ProducerDecisionBase.reload({producerID:parseInt(scope.selectedPlayer),period:scope.selectedPeriod,seminar:SeminarInfo.getSelectedSeminar().seminarCode}).then(function(base){
                        scope.pageBase = base; 
                    }).then(function(){
                        return showView();
                    }), function(reason){
                        console.log('from ctr: ' + reason);
                    }, function(update){
                        console.log('from ctr: ' + update);
                    };*/                 
                };

                scope.checkProduction=function(category,brandName,varName,location,additionalIdx,index,value){
                    /*
					var d = $q.defer(); 
                    var categoryID,max,result;
                    var filter=/^[0-9]+([.]{1}[0-9]{1,2})?$/;
                    if(!filter.test(value)){
                        d.resolve(Label.getContent('Input a number'));
                    }
                    if(category=="Elecssories"){
                        categoryID=1;
                    }else{
                        categoryID=2;
                    }   
                    var url="/companyHistoryInfo/"+SeminarInfo.getSelectedSeminar().seminarCode+'/'+(scope.selectedPeriod-1)+'/P/'+parseInt(scope.selectedPlayer);
                    $http({
                        method:'GET',
                        url:url
                    }).then(function(data){
                        max=data.data.productionCapacity[categoryID-1];
                        url="/productionResult/"+SeminarInfo.getSelectedSeminar().seminarCode+'/'+scope.selectedPeriod+'/'+parseInt(scope.selectedPlayer)+'/'+brandName+'/'+varName;
                        return $http({
                            method:'GET',
                            url:url
                        });
                    }).then(function(data){
                        if(parseInt(data.data.result)+parseInt(value)>max){
                            d.resolve(Label.getContent('Input range')+':0~'+(Math.floor((max-parseInt(data.data.result)) * 100) / 100));
                        }else{
                            d.resolve();
                        }
                    },function(){
                        d.resolve(Label.getContent('fail'));
                    })

                    return d.promise;
					*/
                }

                scope.checkchannelPreference=function(value){
                    /*
					var d = $q.defer(); 
                    var categoryID,max,result;
                    var filter=/^[0-9]+([.]{1}[0-9]{1,2})?$/;
                    if(!filter.test(value)){
                        d.resolve(Label.getContent('Input a number'));
                    }
                    if(value>100||value<0){
                        d.resolve(Label.getContent('Input range')+':0~100');
                    }else{
                        d.resolve();
                    }
                    
                    return d.promise;
					*/
                }

                var loadSelectCategory=function(category){
					/*
                    var count=0;
                    var products=new Array();
                    var allProCatDecisions=_.filter(scope.pageBase.proCatDecision,function(obj){
                        if(category=="HealthBeauty"){
                            return (obj.categoryID==2);
                        }else{
                            return (obj.categoryID==1);
                        }
                    });
                    for(var i=0;i<allProCatDecisions.length;i++){
                        for(var j=0;j<allProCatDecisions[i].proBrandsDecision.length;j++){
                            if(allProCatDecisions[i].proBrandsDecision[j].brandID!=undefined&&allProCatDecisions[i].proBrandsDecision[j].brandID!=0){
                                for(var k=0;k<allProCatDecisions[i].proBrandsDecision[j].proVarDecision.length;k++){
                                    if(allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID!=0&&allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k].varID!=undefined){
                                        products.push(allProCatDecisions[i].proBrandsDecision[j].proVarDecision[k]);
                                        products[count].category=category;
                                        products[count].parentBrandName=allProCatDecisions[i].proBrandsDecision[j].brandName;
                                        if(products[count].packFormat=="ECONOMY"){
                                            products[count].packFormat=1;
                                        }
                                        else if(products[count].packFormat=="STANDARD"){
                                            products[count].packFormat=2;
                                        }
                                        else if(products[count].packFormat=="PREMIUM"){
                                            products[count].packFormat=3;
                                        }
                                        products[count].currentPriceBM=parseFloat(products[count].currentPriceBM).toFixed(2);
                                        if(products[count].channelPreference==undefined){
                                            products[count].channelPreference=0;
                                        }else{
                                            products[count].channelPreference=parseFloat(products[count].channelPreference*100).toFixed(2);
                                        }
                                        count++;
                                    }
                                }
                            }
                        }
                    }
                    if(category=="Elecssories"){
                        scope.productes=products;
                    }else{
                        scope.producths=products;
                    }
					*/
                }

                var selectPacks = function(category,parentBrandName,varName) {
					/*
                    var selected,postion=-1;
                    scope.packs = [{
                        value: 1, text: Label.getContent('ECONOMY')
                    },{
                        value: 2, text: Label.getContent('STANDARD')
                    },{
                        value: 3, text: Label.getContent('PREMIUM')
                    }]; 
                    if(category=="Elecssories"){
                        for(var i=0;i<scope.productes.length;i++){
                            if(scope.productes[i].parentBrandName==parentBrandName&&scope.productes[i].varName==varName){
                                selected = $filter('filter')(scope.packs, {value: scope.productes[i].packFormat});
                                postion=i;
                                break;
                            }
                        }
                        if(postion!=-1){
                            return (scope.productes[postion].packFormat && selected.length) ? selected[0].text : Label.getContent('Not set'); 
                        }
                        else{
                            return Label.getContent('Not set'); 
                        }
                    }else{
                        for(var i=0;i<scope.producths.length;i++){
                            if(scope.producths[i].parentBrandName==parentBrandName&&scope.producths[i].varName==varName){
                                selected = $filter('filter')(scope.packs, {value: scope.producths[i].packFormat});
                                postion=i;
                                break;
                            }
                        }
                        if(postion!=-1){
                            return (scope.producths[postion].packFormat && selected.length) ? selected[0].text : Label.getContent('Not set'); 
                        }
                        else{
                            return Label.getContent('Not set'); 
                        }
                    }
					*/
                }

                var loadByCategory=function(category){
					/*
                    return _.filter(scope.pageBase.proCatDecision,function(obj){
                        if(category=="HealthBeauty"){
                            return (obj.categoryID==2);
                        }else{
                            return (obj.categoryID==1);
                        }
                    });
					*/
                }

                scope.updateProducerDecision = function(category, brandName, varName, location, additionalIdx, index, value) {
					/*
                    var categoryID;
                    if(category=="Elecssories"){
                        categoryID=1;
                        if(location=="channelPreference"){
                            ProducerDecisionBase.setProducerDecisionValue(categoryID,brandName,varName,location,additionalIdx,value/100,'supplierProductionVolume');                                                    
                        }else{
                            ProducerDecisionBase.setProducerDecisionValue(categoryID,brandName,varName,location,additionalIdx,value,'supplierProductionVolume');                                                    
                        }
                    }
                    else{
                        categoryID=2;
                        if(location=="channelPreference"){
                            ProducerDecisionBase.setProducerDecisionValue(categoryID,brandName,varName,location,additionalIdx,value/100,'supplierProductionVolume');                                                    
                        }else{
                            ProducerDecisionBase.setProducerDecisionValue(categoryID,brandName,varName,location,additionalIdx,value,'supplierProductionVolume');                                                    
                        }                                                 
                    }
					*/
                }

                var showView=function(){
                    var d=$q.defer();

                    loadSelectCategory('Elecssories');
                    loadSelectCategory('HealthBeauty');

                    scope.selectPacks=selectPacks;
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
                    if(data.page=="supplierProductionVolume"){
                            scope.pageBase = newBase;
                            showView();
                        }
                });

            }
        }
    }]);
	
		

})();