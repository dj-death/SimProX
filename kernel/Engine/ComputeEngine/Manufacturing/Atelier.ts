import * as IObject from '../IObject';

import Worker from './Worker';
import Machinery from './Machinery';
import Factory from './Factory';

import ENUMS = require('../ENUMS');
import console = require('../../../utils/logger');
import Utils = require('../../../utils/Utils');



interface AtelierCosts {
    power: number;
    fixedExpenses: number;
    maintenance: number;
}

interface AtelierParams extends IObject.ObjectParams {
    atelierID?: string;
    spaceNeeded: number;

    unity: number;
    costs: AtelierCosts;

    factoryID: string;
}

export default class Atelier extends IObject.IObject {
    departmentName = "production";

    public params: AtelierParams;

    constructor(params: AtelierParams) {
        super(params);
    }

    worker: Worker;
    machinery: Machinery;

    factory: Factory;

    // results

    private _workedMinutesNb: number;

    get workedHoursNb(): number {
        var hoursNb = this._workedMinutesNb / 60;

        return parseFloat(hoursNb.toFixed(2));
    }

    // helper
    init(worker: Worker, machinery: Machinery, factory: Factory) {
        super.init();

        this.worker = worker;
        this.machinery = machinery;
        this.factory = factory;

        var self = this;
        this.factory.on("Ready", function  () {
            console.silly("factory ready fired");

            machinery && machinery.on("BeforeReady", function  () {
                console.silly("machinery before ready fired");

                let machinesNb = machinery.machinesNb;

                // because of the need for decommissioning, the space vacated on removal could not become immediately available 
                let decommissionedNb = (machinery.params.decommissioningTime > ENUMS.DELIVERY.IMMEDIATE) ? machinery.effectiveSoldNb : 0;

                // TODO: develop it
                var avgSpaceNeededByUnit = Utils.sums(machinery.machinesParams, "spaceNeeded") / machinery.machinesParams.length;

                var installedMachinesNb = self.install(machinesNb + decommissionedNb, avgSpaceNeededByUnit, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.MACHINES]);

                installedMachinesNb -= decommissionedNb;

                machinery.onMachinesInstall(installedMachinesNb);
            }, self);

            worker && worker.on("BeforeReady", function  () {
                console.silly("worker before ready fired");

                // install workers
                var workersNb = worker.employeesNb;
                var spaceNeededByPerson = worker.params.spaceNeeded;

                worker.installedWorkersNb = self.install(workersNb, spaceNeededByPerson, ENUMS.SPACE_USAGES[ENUMS.SPACE_USAGES.WORKERS]);

            }, self);

        });

        
    }


    // return installed units nb

    install(unitsNb: number, spaceNeededByUnit: number, usage: string): number {
        if (!this.factory) {
            console.warn("Factory not attached to this atelier");
            return 0;
        }

        var isSpaceAvailable: boolean;
        var count = 0;

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


    getNeededTimeForProd(quantity, manufacturingUnitTime: number): any {
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
    }


    // actions
    work(minutesNb: number): boolean {
        if (!this.isInitialised()) {
            return false;
        }

        var success: boolean;

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
    }

}
