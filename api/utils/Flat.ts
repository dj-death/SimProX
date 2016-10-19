import console = require('../../kernel/utils/logger');

let testIfObject = require('lodash.isobject');
let testIfBuffer = require('is-buffer');


String.prototype["endsWith"] = function  (searchString, position) {
    var subjectString = this.toString();
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
};


function  makeNewKey(key, isArray, isArrayItem) {
    var newKey;
    var isPlural = key.endsWith("s") && isArray;
    var isEndingYPlural = key.endsWith("ies");
    var charsNb = key.length;
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
    var optDelimiter = opts.delimiter;
    var prefix = opts.prefix ? opts.prefix + '' + optDelimiter : '';
    var isArrayItem = Array.isArray(target);

    Object.keys(target).forEach(function  (key) {
        var value = target[key];

        if (typeof value === "function ") {
            return;
        }

        var isObject = testIfObject(value) && (Object.keys(value).length > 0);
        var isArray = Array.isArray(value);
        var delimiter = isArrayItem ? '' : optDelimiter;
        var newKey = (typeof prev === 'string') ? prev + delimiter : '';
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
    var delimiter = opts.delimiter || '.';
    var result = {};
    var parentObj = result;
    var keys = Object.keys(target);
    function  convertToCollectionName(str) {
        var numberPattern = /\d+$/g;
        var collectionName;
        var collMatches = str.match(numberPattern);
        var numberStartIdx = str.search(numberPattern);
        var collIndx;
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
        var result = [];
        var split = key.split(delimiter);
        if (!split.length) {
            return result;
        }
        for (var i = 0, len = split.length; i < len; i++) {
            var elm = split[i];
            var newStrs = convertToCollectionName(elm);
            result = result.concat(newStrs);
        }
        return result;
    }
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var subkeys = __process(key); //key.split(delimiter);
        var last = subkeys.pop();
        for (var ii = 0, len = subkeys.length; ii < len; ++ii) {
            var subkey = subkeys[ii];
            var newObj = (ii < len) && !isNaN(subkeys[ii + 1]) ? [] : {};
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
    var delimiter = opts.delimiter || '.';
    var overwrite = opts.overwrite || false;
    var result = {};
    var optDelimiter = opts.delimiter || '.';
    var usedPrefixes = opts.prefix;
    var isbuffer = testIfBuffer(target);
    if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
        return target;
    }
    // safely ensure that the key is
    // an integer.
    function  getkey(key) {
        var parsedKey = Number(key);
        return (isNaN(parsedKey) || (key.indexOf('.') !== -1)) ? key : parsedKey;
    }
    function  convertToCollectionName(str) {
        var numberPattern = /\d+$/g;
        var collectionName;
        var collMatches = str.match(numberPattern);
        var numberStartIdx = str.search(numberPattern);
        var collIndx;
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
        var result = [];
        var split = key.split(optDelimiter);
        if (!split.length) {
            return result;
        }
        split.forEach(function  (elm, idx) {
            var newStrs = convertToCollectionName(elm);
            result = result.concat(newStrs);
        });
        return result;
    }
    Object.keys(target).forEach(function  (key) {
        var split = process(key);
        var key1 = getkey(split.shift());
        var key2 = getkey(split[0]);
        var recipient = result;
        while (key2 !== undefined) {
            var type = Object.prototype.toString.call(recipient[key1]);
            console.log('type', type);
            var isobject = (type === "[object Object]" ||
                type === "[object Array]");
            var isArray = (type === "[object Array]");
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