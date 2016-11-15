var getProducerStep12Info=function(){//step1&step2
	return [{
		shortName:'Brand',
		labelENG:'Brand',
		labelRUS:'',
		labelCHN:'品类',
		infoENG:'',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'Variant',
		labelENG:'Variant',
		labelRUS:'',
		labelCHN:'单品',
		infoENG:'',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'PF',
		labelENG:'Pack Format',
		labelRUS:'',
		labelCHN:'包',
		infoENG:'is one value from the list ECONOMY, STANDARD, PREMIUM. Influences price and quality perceptions of a brand. Affects production cost. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'TL',
		labelENG:'Technology Level',
		labelRUS:'',
		labelCHN:'技术水平',
		infoENG:'an Elecsorries and Health/Beauty product attribute; an index from 1 to 20 defining quality level of a product; in Elecsorries influences quality and ease of use perceptions; in Health/Beauty allows successful merging of active agent with smoothener; affects production cost. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'DL',
		labelENG:'Design Level',
		labelRUS:'',
		labelCHN:'设计指数',
		infoENG:'an Elecsorries product attribute; an index from 1 to 20 defining design of a product; influences ease of use and quality perceptions; affects product cost. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'QORM',
		labelENG:'Quality-of-Raw-Materials ',
		labelRUS:'',
		labelCHN:'原始材料质量',
		infoENG:'an Elecsorries product attribute; an index from 1 to 22 defining quality of raw materials of a product; influences quality perception; affects product cost. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'AA',
		labelENG:'Active agent',
		labelRUS:'',
		labelCHN:'活性剂',
		infoENG:'a Health/Beauties product attribute; an index from 1 to 20; influences performance perception; affects gentleness perception and product cost. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'SL',
		labelENG:'Smoothener Level',
		labelRUS:'',
		labelCHN:'增滑技术',
		infoENG:'a Health/Beauties product attribute; an index from 1 to 20; influences gentleness perception; affects product cost. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'EPV',
		labelENG:'Estimated Production Volume',
		labelRUS:'',
		labelCHN:'估计产量',
		infoENG:'used to calculate estimated product cost with given product composition; on step 2 you will have to put final decision on order. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'DTP',
		labelENG:'Discontinue this product ',
		labelRUS:'',
		labelCHN:'停止生产',
		infoENG:'take this decision with caution: all unsold stocks of this product will be automatically returned to your warehouse and scrapped at a cost to your business. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'CPB',
		labelENG:'Current Price BM',
		labelRUS:'',
		labelCHN:'当前BM价格',
		infoENG:'list price for brick&mortar trade in current period; applicable for new launches only. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'CPE',
		labelENG:'Current Price Emall',
		labelRUS:'',
		labelCHN:'',
		infoENG:'list and wholesale price for eMall in current period; applicable for new launches only. ',
		infoRUS:'',
		infoCHN:''
	},{//step2
		shortName:'PV',
		labelENG:'Production Volume',
		labelRUS:'',
		labelCHN:'',
		infoENG:'volume you order from your factory; check your production capacity for the limits of your order.',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'NPB',
		labelENG:'Next Price BM',
		labelRUS:'',
		labelCHN:'',
		infoENG:'list price for brick&mortar trade in next period. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'NPE',
		labelENG:'Next Price Emall',
		labelRUS:'',
		labelCHN:'',
		infoENG:'list and wholesale price for eMall in next period.',
		infoRUS:'',
		infoCHN:''		
	}];	
}

var getProducerStep3Info=function(){
	return [{
		shortName:'UAO',
		labelENG:'Urban Advertising Off-Line ',
		labelRUS:'',
		labelCHN:'',
		infoENG:'budget you spend to advertise your brands in conventional media (printed and TV) in Urban market.',
		infoRUS:'',
		infoCHN:''	
	},{
		shortName:'UTTS',
		labelENG:'Urban Traditional Trade Support',
		labelRUS:'',
		labelCHN:'',
		infoENG:'budget you invest to support of Traditional Trade in Urban market; it increases visibility of your brands at Traditional Trade. ',
		infoRUS:'',
		infoCHN:''			
	},{
		shortName:'RAO',
		labelENG:'Rural Advertising Off-Line ',
		labelRUS:'',
		labelCHN:'',
		infoENG:'budget you spend to advertise your brands in conventional media (printed and TV) in Rural market. ',
		infoRUS:'',
		infoCHN:''			
	},{
		shortName:'RTTS',
		labelENG:'Rural Traditional Trade Support ',
		labelRUS:'',
		labelCHN:'',
		infoENG:'budget you invest to support of Traditional Trade in Rural market; it increases visibility of your brands at Traditional Trade. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'OA',
		labelENG:'On-line Advertising ',
		labelRUS:'',
		labelCHN:'',
		infoENG:'budget spent to advertise your brands on the Internet, including social media. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'EVI',
		labelENG:'E-mall visibility Investment ',
		labelRUS:'',
		labelCHN:'',
		infoENG:'budget invested in increasing visibility of your brands at eMall. ',
		infoRUS:'',
		infoCHN:''		
	}]
}

var getProducerStep4Info=function(){
	return [{
		shortName:'Category',
		labelENG:'Category',
		labelRUS:'',
		labelCHN:'',
		infoENG:'',
		infoRUS:'',
		infoCHN:''	
	},{		
		shortName:'Brand',
		labelENG:'Brand',
		labelRUS:'',
		labelCHN:'品类',
		infoENG:'',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'IICC',
		labelENG:'Investment in Capacity Change ',
		labelRUS:'',
		labelCHN:'',
		infoENG:"to extend your capacity you have to invest a period before it gets ready; current period extension is also possible but at 50% higher charge; your capacity increases your fixed assets and labor cost; you can't sell out or lease your capacity to other players. ",
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'ITIAT',
		labelENG:'Investment to improve Available Technology ',
		labelRUS:'',
		labelCHN:'',
		infoENG:'applies to both categories; you start with level 7 and can increase it to 20 by the session end; increases your fixed assets. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'ITIF',
		labelENG:'Investment to improve Flexibility ',
		labelRUS:'',
		labelCHN:'',
		infoENG:'applies to both categories; helps you to automatically adjust your production to correspond to orders placed by retailers; affects your fixed assets. ',
		infoRUS:'',
		infoCHN:''
	},{
		shortName:'ITIDK',
		labelENG:'Investment to improve Design Know-How ',
		labelRUS:'',
		labelCHN:'',
		infoENG:'Health/Beauties; you start with level 7 and can increase it to 20 by the session end; increases your fixed assets.',
		infoRUS:'',
		infoCHN:''
	}]
}