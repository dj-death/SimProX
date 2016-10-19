"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var IObject = require('../IObject');
var ENUMS = require('../ENUMS');
var console = require('../../../utils/logger');
var Utils = require('../../../utils/Utils');
var Atelier = (function (_super) {
    __extends(Atelier, _super);
    function Atelier(params) {
        _super.call(this, params);
        this.departmentName = "production";
    }
    Object.defineProperty(Atelier.prototype, "workedHoursNb", {
        get: function () {
            var hoursNb = this._workedMinutesNb / 60;
            return parseFloat(hoursNb.toFixed(2));
        },
        enumerable: true,
        configurable: true
    });
    // helper
    Atelier.prototype.init = function (worker, machinery, factory) {
        _super.prototype.init.call(this);
        this.worker = worker;
        this.machinery = machinery;
        this.factory = factory;
        var self = this;
        this.factory.on("Ready", function () {
            console.silly("factory ready fired");
            machinery && machinery.on("BeforeReady", function () {
                console.silly("machinery before ready fired");
                var machinesNb = machinery.machinesNb;
                // because of the need for decommissioning, the space vacated on removal could not become immediately available 
                var decommissionedNb = (machinery.params.decommissioningTime > ENUMS.DELIVERY.IMMEDIATE) ? machinery.effectiveSoldNb : 0;
                // TODO: develop it
                var avgSpaceNeededByUnit = Utils.sums(machinery.machinesParams, "spaceNeeded") / machinery.machinesParams.length;
                var installedMachinesNb = self.install(machinesNb + decommissionedNb, avgSpaceNeededByUnit, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.MACHINES]);
                installedMachinesNb -= decommissionedNb;
                machinery.onMachinesInstall(installedMachinesNb);
            }, self);
            worker && worker.on("BeforeReady", function () {
                console.silly("worker before ready fired");
                // install workers
                var workersNb = worker.employeesNb;
                var spaceNeededByPerson = worker.params.spaceNeeded;
                worker.installedWorkersNb = self.install(workersNb, spaceNeededByPerson, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.WORKERS]);
            }, self);
        });
    };
    // return installed units nb
    Atelier.prototype.install = function (unitsNb, spaceNeededByUnit, usage) {
        if (!this.factory) {
            console.warn("Factory not attached to this atelier");
            return 0;
        }
        var isSpaceAvailable;
        var count = 0;
        for (var i = 0; i < unitsNb; i++) {
            isSpaceAvailable = this.factory.useSpace(spaceNeededByUnit, usage);
            if (!isSpaceAvailable) {
                break;
            }
            ++count;
        }
        return count;
    };
    Atelier.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this._workedMinutesNb = 0;
    };
    Atelier.prototype.getNeededTimeForProd = function (quantity, manufacturingUnitTime) {
        var needed = {};
        var effectiveManufacturingTotalTime = quantity * manufacturingUnitTime / 60;
        effectiveManufacturingTotalTime = parseFloat(effectiveManufacturingTotalTime.toFixed(2));
        if (this.machinery) {
            effectiveManufacturingTotalTime /= this.machinery.machinesEfficiencyAvg;
            needed[this.machinery.params.id] = effectiveManufacturingTotalTime;
        }
        if (this.worker) {
            needed[this.worker.params.id] = effectiveManufacturingTotalTime;
        }
        return needed;
    };
    // actions
    Atelier.prototype.work = function (minutesNb) {
        if (!this.isInitialised()) {
            return false;
        }
        var success;
        // power machinerys
        success = this.machinery && this.machinery.power(minutesNb);
        if (!success && this.machinery) {
            console.debug("Votre demande dépasse la capacité périodique des machinerys");
            return false;
        }
        // everything is ok now order workers to do their job
        // let's see if the machinery do some trouble and need some extra time due to its depreciation
        if (this.machinery) {
            var efficiency = this.machinery.machinesNb;
            if (isFinite(efficiency) && efficiency > 0) {
                minutesNb = Utils.ceil(minutesNb / efficiency);
            }
        }
        success = this.worker && this.worker.work(minutesNb);
        if (!success && this.worker) {
            console.debug("Votre demande dépasse la capacité périodique des ouvriers ", this.worker.params.label);
            console.debug("Nous lui avons demandés de travailler ", minutesNb, " hours");
            return false;
        }
        // now increment
        this._workedMinutesNb += minutesNb;
        return success;
    };
    return Atelier;
}(IObject.IObject));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Atelier;
//# sourceMappingURL=Atelier.js.map