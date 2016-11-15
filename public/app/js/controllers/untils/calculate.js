//calculate.js
define([], function() {
	var calculateBrandID=function(proBrandsDecision,producerID){
		var result=0,min=10*producerID+1,max=producerID*10+5;
		var nums=new Array();
		for(var i=0;i<proBrandsDecision.proBrandsDecision.length;i++){
			if(proBrandsDecision.proBrandsDecision[i].brandID!=undefined){
				nums.push(proBrandsDecision.proBrandsDecision[i].brandID);
			}
		}
		nums.sort(function(a,b){return a>b?1:-1});
		//未到最大值
		if(max!=nums[nums.length-1]){
			result=nums[nums.length-1]+1;
		}
		//已经到最大值 最小值删除
		else if(min!=nums[0]){
			result=min;
		}
		else{
			for(var i=0;i<nums.length-1;i++){
				if(nums[i+1]-nums[i]!=1){
					result=nums[i]+1;
					break;
				}
			}
		}
		return result;
    }

    var calculateVarID=function(proVarDecision,parentBrandID){
    	var result=0;min=parentBrandID*10+1,max=parentBrandID*10+3;
    	var nums=new Array();
    	for(var i=0;i<proVarDecision.proVarDecision.length;i++){
			if(proVarDecision.proVarDecision[i].varID!=undefined){
				nums.push(proVarDecision.proVarDecision[i].varID);
			}
		}
		nums.sort(function(a,b){return a>b?1:-1});
		//未到最大值
		if(max!=nums[nums.length-1]){
			result=nums[nums.length-1]+1;
		}
		//已经到最大值 最小值删除
		else if(min!=nums[0]){
			result=min;
		}
		else{
			result=min+1;
		}
		return result;
    }
    return {
    	calculateBrandID : calculateBrandID,//,
    	calculateVarID	: calculateVarID
    };
});
