import {IObject} from './IObject';

import console = require('./../../utils/logger');
import Utils = require('./../../utils/Utils');

import Q = require('q');


class IDepartment {
    public departmentName: string;

    init(...params: any[]) {

    }

    register(objects: IObject[]) {

    }

    get Proto(): IDepartment {
        return IDepartment.prototype;
    }

    getEndState(prefix?: string): Q.Promise<any> {
        let deferred = Q.defer();

        let endState = {};

        let that = this;
        let Proto = this.Proto;

        let deptName = this.departmentName;

        console.warn("Proto", Proto);

        setImmediate(function () {

            for (let key in that) {
                console.silly("GES @ %s of %s", key, deptName);

                if (Proto.hasOwnProperty(key) || key === "departmentName") {
                    continue;
                }

                try {
                    let value = that[key];

                    if (!Utils.isBasicType(value)) {
                        continue;
                    }

                    if (isNaN(value)) {
                        console.warn("GES @ %s : %s is NaN", deptName, key);
                    }

                    let newKey = prefix ? (prefix + key) : key;
                    endState[newKey] = value;

                } catch (e) {
                    console.error(e, "exception @ Fin");

                    deferred.reject(e);
                }

            
            }

            deferred.resolve(endState);
        });

        return deferred.promise;

    }

}


export = IDepartment;