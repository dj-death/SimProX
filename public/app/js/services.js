(function () {
    'use strict';


    /********************  Create New Module For Model ********************/

    var services = angular.module('marksimos.services', []);
	
	services.provider('Label', function(){
		var currentLanguage,
			labelBase; 

		
		this.initialiseLanguage = function(value){
			this.currentLanguage = value;
			this.labelBase = getLabelBase();
		};

		this.$get = function(){
			var self = this, item;
			var items=new Array();
			return {
				//configure default languge during angular bootstraping
				initialiseLanguage: function(value){
					self.currentLanguage = value;
					self.labelBase = getLabelBase();
				},

				getContent : function(value){
					switch(self.currentLanguage){
						case 'ENG': 
						    item = _.find(self.labelBase, function(singleItem){ return singleItem.id == value});
						    if(item){ 
								return item.ENG;
							}else{
						    	//items.push(value);
						    	//add this for debug
						    	console.log(value);
						    	return '**NotFound**';
						    }
							
						case 'CHN':
						    item = _.find(self.labelBase, function(singleItem){ return singleItem.id == value})
						    if(item){ 
								return item.CHN;
							}else {
								return '**NotFound**'
							};
							
						case 'RUS':
						    item = _.find(self.labelBase, function(singleItem){ return singleItem.id == value})
						    if(item){ 
								return item.RUS;
							}else{
								return '**NotFound**'
							};	
							
						default:
							return '**NotFound**'		
					}
				},
				changeLanguage : function(value){
					self.currentLanguage = value;
				},
				getCurrentLanguage : function() {
					return self.currentLanguage;
				}			
			}
		}
	});
	
	
	
})();