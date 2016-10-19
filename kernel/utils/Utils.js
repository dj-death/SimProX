/**
* Utils
* @name Utils
* @namespace
*
* Cloud Module
*
* Copyright 2015 DIDI Mohamed, Inc.
*/
"use strict";
/**
 * Get the version of the module.
 * @return {String}
 */
//require('cloud/Engine/es6-shim.js');
var enumerables = ['valueOf', 'toLocaleString', 'toString', 'constructor'];
var Game = require('../simulation/Games');
function populateArray(value, length) {
    var arr = [], i = 0;
    for (; i < length; i++) {
        arr.push(value);
    }
    return arr;
}
function getValueAtAdress(object, property) {
    var splits = property.split("."), j = 0, splitsNb = splits.length, value;
    for (; j < splitsNb; j++) {
        if (value === undefined) {
            value = object[splits[j]];
        }
        else {
            value = value[splits[j]];
        }
    }
    return value;
}
function sums(collection, property, filterProp, filterValue, coefficients, roundType, precision) {
    if (roundType === void 0) { roundType = ">"; }
    if (precision === void 0) { precision = 0; }
    var len = collection.length || collection.size(), sum = 0, value, item;
    if (!coefficients || typeof coefficients === 'number') {
        coefficients = populateArray(coefficients || 1, len);
    }
    var i = 0;
    collection.forEach(function (item) {
        if (filterProp) {
            value = getValueAtAdress(item, filterProp);
            if (filterValue !== undefined) {
                if (value !== filterValue) {
                    return true;
                }
            }
            else {
                if (!value) {
                    return true;
                }
            }
        }
        var propertyValue = item[property];
        if (isNaN(propertyValue)) {
            return true;
        }
        sum = correctFloat(sum + propertyValue * coefficients[i]);
        ++i;
    });
    switch (roundType) {
        case ">":
            return ceil(sum, precision);
        case "<":
            return floor(sum, precision);
        default:
            return round(sum, precision);
    }
}
exports.sums = sums;
function aggregate(collection, property, operation, coefficients) {
    var i, len = collection.length, aggregation = 0;
    if (!coefficients || typeof coefficients === 'number') {
        coefficients = populateArray(coefficients || 1, len);
    }
    for (i = 0; i < len; i++) {
        var properyValue = collection[i][property];
        if (isNaN(properyValue)) {
            continue;
        }
        aggregation = correctFloat(aggregation + operation.call(null, properyValue, coefficients[i]));
    }
    return aggregation;
}
exports.aggregate = aggregate;
function cloneFn(item) {
    if (item === null || item === undefined) {
        return item;
    }
    // DOM nodes
    // TODO proxy this to Ext.Element.clone to handle automatic id attribute changing
    // recursively
    if (item.nodeType && item.cloneNode) {
        return item.cloneNode(true);
    }
    var type = toString.call(item), i, j, k, clone, key;
    // Date
    if (type === '[object Date]') {
        return new Date(item.getTime());
    }
    // Array
    if (type === '[object Array]') {
        i = item.length;
        clone = [];
        while (i--) {
            clone[i] = cloneFn(item[i]);
        }
    }
    else if (type === '[object Object]' && item.constructor === Object) {
        clone = {};
        for (key in item) {
            clone[key] = cloneFn(item[key]);
        }
        if (enumerables) {
            for (j = enumerables.length; j--;) {
                k = enumerables[j];
                if (item.hasOwnProperty(k)) {
                    clone[k] = item[k];
                }
            }
        }
    }
    return clone || item;
}
function ObjectApply(destination) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    var i = 1, ln = arguments.length, object, key, value, sourceKey;
    for (; i < ln; i++) {
        object = arguments[i];
        for (key in object) {
            value = object[key];
            if (value && value.constructor === Object) {
                sourceKey = destination[key];
                if (sourceKey && sourceKey.constructor === Object) {
                    ObjectApply(sourceKey, value);
                }
                else {
                    destination[key] = cloneFn(value);
                }
            }
            else {
                destination[key] = value;
            }
        }
    }
    return destination;
}
exports.ObjectApply = ObjectApply;
function makeID(decision) {
    var ID = "";
    ID += decision.seminarId;
    ID += decision.groupId;
    ID += decision.d_CID;
    ID += decision.period;
    return ID;
}
exports.makeID = makeID;
/**
         * Corrects floating point numbers that overflow to a non-precise
         * value because of their floating nature, for example `0.1 + 0.2`
         * @param {Number} n The number
         * @return {Number} The correctly rounded number
         */
function correctFloat(n) {
    if (isNaN(n)) {
        throw "Utils:correctFloat @ Not a number arg";
    }
    // This is to correct the type of errors where 2 floats end with 
    // a long string of decimals, eg 0.1 + 0.2. When they overflow in this 
    // manner, they usually go to 15-16 decimals, so we cut it off at 14. 
    return parseFloat(n.toPrecision(14));
}
exports.correctFloat = correctFloat;
function round(value, precision) {
    if (precision === void 0) { precision = 0; }
    value = correctFloat(value);
    var base = Math.pow(10, precision);
    return Math.round(value * base) / base;
}
exports.round = round;
function ceil(value, precision) {
    if (precision === void 0) { precision = 0; }
    value = correctFloat(value);
    var base = Math.pow(10, precision);
    return Math.ceil(value * base) / base;
}
exports.ceil = ceil;
function floor(value, precision) {
    if (precision === void 0) { precision = 0; }
    value = correctFloat(value);
    var base = Math.pow(10, precision);
    return Math.floor(value * base) / base;
}
exports.floor = floor;
function roundMultiplier(value, multiplier) {
    if (multiplier === void 0) { multiplier = 0; }
    value = correctFloat(value);
    var mod = value % multiplier, result = value - mod;
    if (mod >= 0.5 * multiplier) {
        result += multiplier;
    }
    return Math.round(result);
}
exports.roundMultiplier = roundMultiplier;
// utils m3a negatif -0.5 => -1 instead of normal 0
function trunc(value, precision) {
    if (precision === void 0) { precision = 0; }
    return value < 0 ? ceil(value, precision) : floor(value, precision);
}
exports.trunc = trunc;
function testIfAllParamsIsNumeric(array) {
    return array.every(function (element, index, array) {
        return !isNaN(element);
    });
}
exports.testIfAllParamsIsNumeric = testIfAllParamsIsNumeric;
/**
* Checks whether or not the passed number is within a desired range.  If the number is already within the
* range it is returned, otherwise the min or max value is returned depending on which side of the range is
* exceeded. Note that this method returns the constrained value but does not change the current number.
*/
function constrain(value, min, max) {
    // (x < Nan) || (x < undefined) == false 
    // same for (x > NaN) || (x > undefined) 
    // sadly this is not true of null - (1 > null) 
    if (min === null) {
        min = value;
    }
    if (max === null) {
        max = value;
    }
    return (value < min) ? min : ((value > max) ? max : value);
}
exports.constrain = constrain;
/**
* Returns a random integer between the specified range (inclusive)
* @param {Number} from Lowest value to return.
* @param {Number} to Highest value to return.
* @return {Number} A random integer within the specified range.
*/
function randomInt(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}
exports.randomInt = randomInt;
/**
* Validate that a value is numeric and convert it to a number if necessary. Returns the specified default value if
* it is not.
*/
function from(value, defaultValue) {
    if (defaultValue === void 0) { defaultValue = 0; }
    if (isFinite(value)) {
        value = parseFloat(value);
    }
    return !isNaN(value) ? value : defaultValue;
}
exports.from = from;
/**
* Determines if two numbers `n1` and `n2` are equal within a given
* margin of precision `epsilon`. > 0 < +infinty
*/
function compare(n1, sens, n2, epsilon) {
    epsilon = isNumericValid(epsilon) ? epsilon : 2.220446049250313e-16;
    n1 = correctFloat(n1);
    n2 = correctFloat(n2);
    var diff = correctFloat(n1 - n2);
    var isEqual = Math.abs(diff) < epsilon;
    switch (sens) {
        case "<<":
            return !epsilon ? diff < 0 : n1 < correctFloat(n2 - epsilon);
        case "<=":
            return !epsilon ? diff <= 0 : (n1 < n2 || isEqual);
        case ">>":
            return !epsilon ? diff > 0 : n1 > correctFloat(n2 + epsilon);
        case ">=":
            return !epsilon ? diff >= 0 : (n1 > n2 || isEqual);
        case "=":
            return !epsilon ? diff === 0 : isEqual;
        case "><":
            return !epsilon ? diff != 0 : !isEqual;
        default:
            throw Error("symbol unknown for comparison");
    }
}
exports.compare = compare;
/**
* Returns the sign of the given number. See also MDN for Math.sign documentation
* for the standard method this method emulates.

*/
function sign(x) {
    x = +x; // force to a Number 
    if (x === 0 || isNaN(x)) {
        return x;
    }
    return (x > 0) ? 1 : -1;
}
exports.sign = sign;
/**
* Snaps the passed number between stopping points based upon a passed increment value.
*
* The difference between this and {@link #snap} is that {@link #snap} does not use the minValue
* when calculating snap points:
*
*     r = Ext.Number.snap(56, 2, 55, 65);        // Returns 56 - snap points are zero based
*
*     r = Ext.Number.snapInRange(56, 2, 55, 65); // Returns 57 - snap points are based from minValue
*
* @param {Number} value The unsnapped value.
* @param {Number} increment The increment by which the value must move.
* @param {Number} [minValue=0] The minimum value to which the returned value must be constrained.
* @param {Number} [maxValue=Infinity] The maximum value to which the returned value must be constrained.
* @return {Number} The value of the nearest snap target.
*/
function snapInRange(value, increment, minValue, maxValue) {
    if (minValue === void 0) { minValue = 0; }
    if (maxValue === void 0) { maxValue = Infinity; }
    var tween;
    // default minValue to zero 
    minValue = (minValue || 0);
    // If value is undefined, or less than minValue, use minValue 
    if (value === undefined || value < minValue) {
        return minValue;
    }
    // Calculate how many snap points from the minValue the passed value is. 
    if (increment && (tween = ((value - minValue) % increment))) {
        value -= tween;
        tween *= 2;
        if (tween >= increment) {
            value += increment;
        }
    }
    // If constraining within a maximum, ensure the maximum is on a snap point 
    if (maxValue !== undefined) {
        if (value > (maxValue = snapInRange(maxValue, increment, minValue))) {
            value = maxValue;
        }
    }
    return value;
}
exports.snapInRange = snapInRange;
function isNumericValid(value) {
    return !isNaN(value) && isFinite(value) && value >= 0;
}
exports.isNumericValid = isNumericValid;
function getDecimalPart(value) {
    var decimals = value.toString().split("."), len = decimals.length;
    if (len < 2) {
        return 0;
    }
    return decimals[1].length;
}
exports.getDecimalPart = getDecimalPart;
function NODE_ENV() {
    var nodeEnv = (process.env.NODE_ENV || '').toLowerCase();
    var env;
    if (nodeEnv === 'prod' || nodeEnv === 'production') {
        env = 'prod';
    }
    else if (nodeEnv === 'dev' || nodeEnv === 'development' || nodeEnv === '') {
        env = 'dev';
    }
    else {
        throw new Error('Unknown environment name: NODE_ENV=' + nodeEnv);
    }
    return env;
}
exports.NODE_ENV = NODE_ENV;
function getPoisson(lambda) {
    var L = Math.exp(-lambda), p = 1.0, k = 0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}
exports.getPoisson = getPoisson;
function isBasicType(obj) {
    return (typeof obj !== "object") && (typeof obj !== "function");
}
exports.isBasicType = isBasicType;
function getStat(stats, currPeriod, statsPeriodicity) {
    if (statsPeriodicity === void 0) { statsPeriodicity = 1; }
    var period = (currPeriod + Game.configs.historicPeriodsNb - 1) * statsPeriodicity;
    var end = stats.length - 1;
    if (stats[period] === undefined && stats.length) {
        console.warn("There is no stats for for the period %d", period, stats);
    }
    // to not have a problem
    if (period < 0) {
        period = 0;
    }
    if (period > end) {
        period = end;
    }
    return stats[period];
}
exports.getStat = getStat;
function simpleexpSmooth(data, alpha) {
    if (!Array.isArray(data)) {
        return null;
    }
    if (data.length < 2) {
        return data[0];
    }
    var smoothedVal;
    var i = 1;
    var len = data.length;
    for (; i < len; i++) {
        smoothedVal = data[i] * alpha + data[i - 1] * (1 - alpha);
        data[i] = correctFloat(smoothedVal);
    }
    return data[data.length - 1];
}
exports.simpleexpSmooth = simpleexpSmooth;
function normalize(value, range) {
    var normalizedValue;
    var threshold = range.threshold;
    var wearout = range.wearout;
    var mediane = range.mediane;
    // extrem situation
    if (threshold === wearout) {
        if (value < threshold) {
            return value - threshold;
        }
        else if (value === threshold) {
            return 1;
        }
        else {
            return 1 + (value - threshold);
        }
    }
    if (!mediane || mediane === wearout || mediane === threshold) {
        mediane = (wearout + threshold) / 2;
    }
    if (value < mediane) {
        normalizedValue = (value - threshold) / (mediane - threshold) / 2;
    }
    else if (value === mediane) {
        normalizedValue = 0.5;
    }
    else {
        normalizedValue = (wearout - value) / (wearout - mediane) / 2;
    }
    return normalizedValue;
}
exports.normalize = normalize;
//# sourceMappingURL=Utils.js.map