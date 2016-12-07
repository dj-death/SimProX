let config: any = {

    fileUploadDirectory: __dirname + "/kernel/data/",

    engine: {
        scenariosDbPath: __dirname + "/kernel/data/scenarios",
        downloadsDir: __dirname + "/kernel/data/downloads",
        templatesDir: __dirname + "/kernel/data/templates",
        simulationDbPath: __dirname + "/kernel/data/simulation",
        decisionsTestPath: __dirname + "/kernel/data/scenarios",

        defaultLang: "fr",

        getReportModelPath: function (lang: string) {
            if (!lang) {
                lang = config.engine.defaultLang;
            }

            return config.engine.templatesDir + "/" + lang + "/report_model.xlsx";
        }
    }, 

    server: {
        port: 80,
        host: "localhost",
        mongo_conn: 'mongodb://127.0.0.1:27017/iEtales'
    },

	domain: 'bridgeplus.cn',
	
    bbs: {
        service: 'http://community.hcd.com:4567/',
        token: '7d70d2de-4b09-4bf8-baf7-cd506e52f1ac'
    },

    messageConfig: {
        appid : 10129,
		appkey : '4868d6fa40cd727640518011e3549b29',
		signtype : 'normal'
    }
};


export = config;