"use strict";
let mongoose = require('mongoose');
let Scenario = mongoose.Schema({
    scenarioID: String,
    initialSituation: mongoose.Schema.Types.Mixed
});
module.exports = Scenario;
//# sourceMappingURL=Schema.js.map