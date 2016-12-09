import console = require('../../kernel/utils/logger');

let testIfObject = require('lodash.isobject');
let testIfBuffer = require('is-buffer');


String.prototype["endsWith"] = function  (searchString, position) {
    let subjectString = this.toString();
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
    }
    position -= searchString.length;
    let lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
};


function  makeNewKey(key, isArray, isArrayItem) {
    let newKey;
    let isPlural = key.endsWith("s") && isArray;
    let isEndingYPlural = key.endsWith("ies");
    let charsNb = key.length;
    newKey = key;
    if (isPlural) {
        if (isEndingYPlural) {
            newKey = key.slice(0, charsNb - 3);
            newKey += "y";
        }
        else {
            newKey = key.slice(0, charsNb - 1);
        }
    }
    if (isArrayItem && !isNaN(key)) {
        newKey = (parseInt(key) + 1).toString();
    }
    return newKey;
}


export function  flatten(target, opts, output?, prev?) {
    output = output || {};
    opts = opts || {
        delimiter: '_',
        prefix: undefined
    };
    let optDelimiter = opts.delimiter;
    let prefix = opts.prefix ? opts.prefix + '' + optDelimiter : '';
    let isArrayItem = Array.isArray(target);

    Object.keys(target).forEach(function  (key) {
        let value = target[key];

        if (typeof value === "function ") {
            return;
        }

        let isObject = testIfObject(value) && (Object.keys(value).length > 0);
        let isArray = Array.isArray(value);
        let delimiter = isArrayItem ? '' : optDelimiter;
        let newKey = (typeof prev === 'string') ? prev + delimiter : '';
        newKey += makeNewKey(key, isArray, isArrayItem);
        if (isObject) {
            return flatten(value, opts, output, newKey);
        }

        else {
            output[prefix + '' + newKey] = value;
        }
    });
    return output;
}


export function  unflatten(target, opts) {
    opts = opts || {};
    let delimiter = opts.delimiter || '.';
    let result = {};
    let parentObj = result;
    let keys = Object.keys(target);
    function  convertToCollectionName(str) {
        let numberPattern = /\d+$/g;
        let collectionName;
        let collMatches = str.match(numberPattern);
        let numberStartIdx = str.search(numberPattern);
        let collIndx;
        if (collMatches && collMatches.length) {
            collectionName = str.substr(0, numberStartIdx);
            if (collectionName.endsWith("y")) {
                collectionName = collectionName.slice(0, collectionName.length - 1) + 'ies';
            }
            else {
                collectionName += (collectionName.endsWith("s") ? "es" : "s");
            }
            collIndx = parseInt(collMatches[0]) - 1;
            return [collectionName, collIndx.toString()];
        }
        return [str];
    }
    function  __process(key) {
        let result = [];
        let split = key.split(delimiter);
        if (!split.length) {
            return result;
        }
        for (let i = 0, len = split.length; i < len; i++) {
            let elm = split[i];
            let newStrs = convertToCollectionName(elm);
            result = result.concat(newStrs);
        }
        return result;
    }
    for (let i = 0; i < keys.length; ++i) {
        let key = keys[i];
        let subkeys = __process(key); //key.split(delimiter);
        let last = subkeys.pop();
        for (let ii = 0, len = subkeys.length; ii < len; ++ii) {
            let subkey = subkeys[ii];
            let newObj = (ii < len) && !isNaN(subkeys[ii + 1]) ? [] : {};
            parentObj[subkey] = typeof parentObj[subkey] === 'undefined' ? newObj : parentObj[subkey];
            parentObj = parentObj[subkey];
        }
        parentObj[last] = target[key];
        parentObj = result;
    }
    return result;
}

/*
export function  unflatten(target, opts) {
    opts = opts || {};
    let delimiter = opts.delimiter || '.';
    let overwrite = opts.overwrite || false;
    let result = {};
    let optDelimiter = opts.delimiter || '.';
    let usedPrefixes = opts.prefix;
    let isbuffer = testIfBuffer(target);
    if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
        return target;
    }
    // safely ensure that the key is
    // an integer.
    function  getkey(key) {
        let parsedKey = Number(key);
        return (isNaN(parsedKey) || (key.indexOf('.') !== -1)) ? key : parsedKey;
    }
    function  convertToCollectionName(str) {
        let numberPattern = /\d+$/g;
        let collectionName;
        let collMatches = str.match(numberPattern);
        let numberStartIdx = str.search(numberPattern);
        let collIndx;
        if (collMatches && collMatches.length) {
            collectionName = str.substr(0, numberStartIdx);
            if (collectionName.endsWith("y")) {
                collectionName = collectionName.slice(0, collectionName.length - 1) + 'ies';
            }
            else {
                collectionName += (collectionName.endsWith("s") ? "es" : "s");
            }
            collIndx = parseInt(collMatches[0]) - 1;
            return [collectionName, collIndx.toString()];
        }
        return [str];
    }
    function  process(key) {
        let result = [];
        let split = key.split(optDelimiter);
        if (!split.length) {
            return result;
        }
        split.forEach(function  (elm, idx) {
            let newStrs = convertToCollectionName(elm);
            result = result.concat(newStrs);
        });
        return result;
    }
    Object.keys(target).forEach(function  (key) {
        let split = process(key);
        let key1 = getkey(split.shift());
        let key2 = getkey(split[0]);
        let recipient = result;
        while (key2 !== undefined) {
            let type = Object.prototype.toString.call(recipient[key1]);
            console.log('type', type);
            let isobject = (type === "[object Object]" ||
                type === "[object Array]");
            let isArray = (type === "[object Array]");
            // do not write over falsey, non-undefined values if overwrite is false
            if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
                return;
            }
            if ((overwrite && !isobject) || (!overwrite && recipient[key1] === null)) {
                recipient[key1] = (typeof key2 === 'number' && !opts.object) ? [] : {};
            }
            recipient = recipient[key1];
            if (split.length > 0) {
                key1 = getkey(split.shift());
                key2 = getkey(split[0]);
            }
        }
        // unflatten again for 'messy objects'
        recipient[key1] = unflatten(target[key], opts);
    });
    return result;
}*/