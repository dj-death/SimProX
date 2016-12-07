var mongoose = require('mongoose');

let Scenario = mongoose.Schema({
    scenarioID: String,

    initialSituation: mongoose.Schema.Types.Mixed
});


export = Scenario;

