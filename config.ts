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
        port: process.env.SERVER_PORT || 80,
        host: process.env.SERVER_HOST || "localhost",
        mongo_conn: process.env.MONGO_CONN || 'mongodb://127.0.0.1:27017/iEtales'
    },

	domain: process.env.DOMAIN || 'bridgeplus.cn',

    // Secrets are read from the environment first. The literal fallbacks are
    // legacy values kept only so existing dev setups keep working; configure
    // BBS_TOKEN / MESSAGE_APPKEY in production and rotate these.
    bbs: {
        service: process.env.BBS_SERVICE || 'http://community.hcd.com:4567/',
        token: process.env.BBS_TOKEN || '7d70d2de-4b09-4bf8-baf7-cd506e52f1ac'
    },

    messageConfig: {
        appid : process.env.MESSAGE_APPID || 10129,
		appkey : process.env.MESSAGE_APPKEY || '4868d6fa40cd727640518011e3549b29',
		signtype : 'normal'
    }
};


export = config;