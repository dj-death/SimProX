var __dirname = __dirname || process.cwd();

var config = {
    port: 1337,
    ip: "127.0.0.1",

    //"mongodb://127.0.0.1:27017/engine"
    mongo_conn: !process.env.OPENSHIFT_MONGODB_DB_URL ? "mongodb://localhost" : process.env.OPENSHIFT_MONGODB_DB_URL + "engine",

    defaultScenario: "14C1",
    maxRounds: 5,

    periodsStr: ["13Q4", "14Q1", "14Q2", "14Q3", "14Q4"],

    scenariosDbPath: __dirname + "/data/scenarios",
    downloadsDir: __dirname + "/data/downloads",
    templatesDir: __dirname + "/data/templates",

    simulationDbPath: __dirname + "/data/simulation",

    decisionsTestPath: __dirname + "/data/scenarios",


    defaultLang: "fr",

    getReportModelPath: function (lang) {
        if (!lang) {
            lang = config.defaultLang;
        }

        return config.templatesDir + "/" + lang + "/report_model.xlsx";
    }

};

export = config;