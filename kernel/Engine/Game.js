/**
* Paramètres Générales
*
*
* Copyright 2015 DIDI Mohamed, Inc.
*/
"use strict";
class Game {
    constructor(configs) {
        this.initialised = false;
        this.configs = configs;
    }
    init() {
        // let's begin
        this.initialised = true;
    }
    get weeksNbByPeriod() {
        let monthWeeksNb = 4;
        return this.configs.stage.duration * monthWeeksNb;
    }
    get daysNbByPeriod() {
        let monthDaysNb = 30;
        return this.configs.stage.duration * monthDaysNb;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Game;
//# sourceMappingURL=Game.js.map