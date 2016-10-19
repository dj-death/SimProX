"use strict";
var mongoose = require('mongoose');
var Scenario = mongoose.Schema({
    scenarioID: String,
    initialSituation: mongoose.Schema.Types.Mixed
});
module.exports = Scenario;
//# sourceMappingURL=Schema.js.map