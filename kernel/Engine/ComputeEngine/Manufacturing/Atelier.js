"use strict";
const IObject = require('../IObject');
const ENUMS = require('../ENUMS');
const console = require('../../../utils/logger');
const Utils = require('../../../utils/Utils');
class Atelier extends IObject.IObject {
    constructor(params) {
        super(params);
        this.departmentName = "production";
    }
    get workedHoursNb() {
        let hoursNb = this._workedMinutesNb / 60;
        return parseFloat(hoursNb.toFixed(2));
    }
    // helper
    init(worker, machinery, factory) {
        super.init();
        this.worker = worker;
        this.machinery = machinery;
        this.factory = factory;
        let self = this;
        this.factory.on("Ready", function () {
            console.silly("factory ready fired");
            machinery && machinery.on("BeforeReady", function () {
                console.silly("machinery before ready fired");
                let machinesNb = machinery.machinesNb;
                // because of the need for decommissioning, the space vacated on removal could not become immediately available 
                let decommissionedNb = (machinery.params.decommissioningTime > ENUMS.DELIVERY.IMMEDIATE) ? machinery.effectiveSoldNb : 0;
                // TODO: develop it
                let avgSpaceNeededByUnit = Utils.sums(machinery.machinesParams, "spaceNeeded") / machinery.machinesParams.length;
                let installedMachinesNb = self.install(machinesNb + decommissionedNb, avgSpaceNeededByUnit, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.MACHINES]);
                installedMachinesNb -= decommissionedNb;
                machinery.onMachinesInstall(installedMachinesNb);
            }, self);
            worker && worker.on("BeforeReady", function () {
                console.silly("worker before ready fired");
                // install workers
                let workersNb = worker.employeesNb;
                let spaceNeededByPerson = worker.params.spaceNeeded;
                worker.installedWorkersNb = self.install(workersNb, spaceNeededByPerson, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.WORKERS]);
            }, self);
        });
    }
    // return installed units nb
    install(unitsNb, spaceNeededByUnit, usage) {
        if (!this.factory) {
            console.warn("Factory not attached to this atelier");
            return 0;
        }
        let isSpaceAvailable;
        let count = 0;
        for (let i = 0; i < unitsNb; i++) {
            isSpaceAvailable = this.factory.useSpace(spaceNeededByUnit, usage);
            if (!isSpaceAvailable) {
                break;
            }
            ++count;
        }
        return count;
    }
    reset() {
        super.reset();
        this._workedMinutesNb = 0;
    }
    getNeededTimeForProd(quantity, manufacturingUnitTime) {
        let needed = {};
        let effectiveManufacturingTotalTime = quantity * manufacturingUnitTime / 60;
        effectiveManufacturingTotalTime = parseFloat(effectiveManufacturingTotalTime.toFixed(2));
        if (this.machinery) {
            effectiveManufacturingTotalTime /= this.machinery.machinesEfficiencyAvg;
            needed[this.machinery.params.id] = effectiveManufacturingTotalTime;
        }
        if (this.worker) {
            needed[this.worker.params.id] = effectiveManufacturingTotalTime;
        }
        return needed;
    }
    // actions
    work(minutesNb) {
        if (!this.isInitialised()) {
            return false;
        }
        let success;
        // power machinerys
        success = this.machinery && this.machinery.power(minutesNb);
        if (!success && this.machinery) {
            console.debug("Votre demande dépasse la capacité périodique des machinerys");
            return false;
        }
        // everything is ok now order workers to do their job
        // let's see if the machinery do some trouble and need some extra time due to its depreciation
        if (this.machinery) {
            let efficiency = this.machinery.machinesNb;
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
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Atelier;
//# sourceMappingURL=Atelier.js.map