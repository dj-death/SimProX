import ENUMS = require('./ENUMS');
import console = require('../../utils/logger');
import Utils = require('../../utils/Utils');

import Q = require('q');


interface IObjects {
    [index: string]: any[];
}

interface IPlayers {
    [index: string]: IObjects;
}




function _finish(objects: IObjects): Q.Promise<any> {
    let deferred = Q.defer();

    let deptObj;


    if (typeof objects !== "object") {
        let err = new Error("No IObjects");

        console.error(err);

        deferred.reject(err);

        return deferred.promise;
    }

    for (let dept in objects) {
        if (!objects.hasOwnProperty(dept)) {
            continue;
        }

        deptObj = objects[dept];

        let i = 0,
            len = deptObj.length;

        let item;

        for (; i < len; i++) {

            try {
                item = deptObj[i];
                item.onFinish && item.onFinish();

            } catch (e) {
                console.error(e, "Trigger finish @", item);

                deferred.reject(e);
            }

        }
    }

    deferred.resolve();


    return deferred.promise;
}


function _getEndState(objects: IObjects, result = {}): Q.Promise<any> {
    let defered = Q.defer();

    let deptObj;

    if (typeof objects !== "object") {
        let err = new Error("No IObjects");

        console.error(err);

        defered.reject(err);

        return defered.promise;
    }

    setImmediate(function () {

        try {
            for (let dept in objects) {
                if (!objects.hasOwnProperty(dept)) {
                    continue;
                }

                deptObj = objects[dept];

                let i = 0,
                    len = deptObj.length;

                if (!len) {
                    continue;
                }


                for (; i < len; i++) {

                    try {
                        let item = deptObj[i];

                        if (typeof item.getEndState !== "function") {
                            continue;
                        }

                        let endState = item.getEndState();

                        Utils.ObjectApply(result, endState);

                    } catch (e) {
                        console.error(e);
                        defered.reject(e);
                    }

                }
            }

            defered.resolve(result);

        } catch (e) {
            console.error(e);
            defered.reject(e);
        }

    });


    return defered.promise;
}

export default class ObjectsManager {
    private static _instance: ObjectsManager = null;

    private static currPlayerID: string | number;

    private objects: IPlayers = {};

    private static persistents: IObjects = {};
    private static persistentsEndState;

    constructor() {
        if (ObjectsManager._instance) {
            throw new Error("Error: Instantiation failed: Use getInstance() instead of new.");
        }

        ObjectsManager._instance = this;
    }


    public static init(doRestorePersistents: boolean = true) {
        let that = this.getInstance();
        let persistents = ObjectsManager.persistents;

        if (ObjectsManager._instance) {
            delete ObjectsManager._instance;
        }

        ObjectsManager._instance = new ObjectsManager();

        // restore
        if (!doRestorePersistents) {
            this.persistentsEndState = null;
        }
    }

    public static setCurrentPlayer(currPlayerID: string | number) {
        this.currPlayerID = currPlayerID;
    }

    public static getInstance(): ObjectsManager {
        if (ObjectsManager._instance === null) {
            ObjectsManager._instance = new ObjectsManager();
        }

        return ObjectsManager._instance;
    }


    public static register(object: any, department: string, persistent: boolean = false) {
        let that = this.getInstance();
        let currPlayerID = this.currPlayerID;

        if (currPlayerID === undefined && !persistent) {
            console.warn('trying to register object without player init');
            return false;
        }

        if (!department) {
            console.warn('trying to register object with dept empty');
            return false;
        }

        if (object === null || typeof object !== "object" ) {
            console.warn('trying to register not reel object');
            return false;
        }


        if (persistent) {

            if (ObjectsManager.persistents[department] === undefined) {
                ObjectsManager.persistents[department] = [];
            }

            ObjectsManager.persistents[department].push(object);

        } else {

            if (that.objects[currPlayerID] === undefined) {
                that.objects[currPlayerID] = {};
            }

            if (that.objects[currPlayerID][department] === undefined) {
                that.objects[currPlayerID][department] = [];
            }

            that.objects[currPlayerID][department].push(object);
        }
    }

    public static retrieve(currPlayerID: string | number, department: string, isPersistent = false): any[] {
        if (isPersistent) {
            return ObjectsManager.persistents[department];
        }

        return ObjectsManager._instance.objects[currPlayerID][department];
    }

    public static clean(currPlayerID?: string | number): Q.Promise<any> {
        let that = this;

        let deferred = Q.defer();

        setImmediate(function () {
            if (currPlayerID === undefined) {
                delete that.getInstance().objects;

            } else {
                that.getInstance().objects[currPlayerID] = undefined;
            }

            deferred.resolve();

        });

        return deferred.promise;
    }


    public static finish(currPlayerID: string | number): Q.Promise<any> {
        let that = this;
        let self = that.getInstance();

        let objects: IObjects = self.objects[currPlayerID];


        let deferred = Q.defer();


        Q.fcall(function () {
            if (!that.persistentsEndState) {
                return _finish(that.persistents);
            }

            return ;

        }).then(function () {
            return _finish(objects);

        }).done(function () {
                deferred.resolve();

        }, function (err) {

            deferred.reject(err);
        });



        return deferred.promise;
    }


    public static getObjectsEndState(currPlayerID: string | number): Q.Promise<any> {
        let that = this;
        let self = that.getInstance();

        let objects: IObjects = self.objects && self.objects[currPlayerID];

        let deferred = Q.defer();

        Q(undefined).then(function () {
            if (!that.persistentsEndState && that.persistents) {
                return _getEndState(that.persistents);
            }

            return {};

        }).then(function (result) {


            if (objects) {
                return _getEndState(objects, result);
            }


            let msg = "no objects @ OM of player " + currPlayerID;
            console.warn(msg);

            let err = new Error(msg);

            deferred.reject(err);

            return {};

        }).done(function (result) {
                deferred.resolve(result);

        }, function (err) {
            console.error(err);
            deferred.reject(err);
        });


        return deferred.promise;
    }


    public static getPersistedObjectsEndState(): Q.Promise<any> {
        let that = this;
        let self = that.getInstance();


        let deferred = Q.defer();

        Q(null).then(function () {
            if (!that.persistentsEndState && that.persistents) {
                return _getEndState(that.persistents);
            }

            return {};

        }).done(function (result) {
            deferred.resolve(result);

        }, function (err) {
            console.error(err);
            deferred.reject(err);
        });


        return deferred.promise;
    }
}