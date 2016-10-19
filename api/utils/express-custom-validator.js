"use strict";
function _between(value, min, max, option) {
    switch (option) {
        case "g":
            return (value > min && value <= max);
        case "l":
            return (value >= min && value < max);
        case "gl":
        case "lg":
            return (value > min && value < max);
        default:
            return (value >= min && value <= max);
    }
}
function _minMax(num1, num2) {
    var min, max;
    if (num1 > num2) {
        min = num2;
        max = num1;
    }
    else {
        min = num1;
        max = num2;
    }
    return { min: min, max: max };
}
function _toBeInt(value) {
    return value << 0 === value;
}
function _isEqualInt(value) {
    return value << 0 == value;
}
function isArray(value) {
    return Array.isArray(value);
}
exports.isArray = isArray;
function isArrayLen(value, num) {
    if (!Array.isArray(value)) {
        return false;
    }
    return value.length === num;
}
exports.isArrayLen = isArrayLen;
function equal(value, num) {
    return value == num;
}
exports.equal = equal;
function toBe(value, num) {
    return value === num;
}
exports.toBe = toBe;
function gt(value, num) {
    return value > num;
}
exports.gt = gt;
function gte(value, num) {
    return value >= num;
}
exports.gte = gte;
function lt(value, num) {
    return value < num;
}
exports.lt = lt;
function lte(value, num) {
    return value <= num;
}
exports.lte = lte;
function between(value, num1, num2, option) {
    var minMax = _minMax(num1, num2);
    return _between(value, minMax.min, minMax.max, option);
}
exports.between = between;
function eachBetween(value, num1, num2, option) {
    var minMax = _minMax(num1, num2);
    if (value) {
        for (var i = 0; i < value.length; i++) {
            if (!_between(value[i], minMax.min, minMax.max, option)) {
                return false;
            }
        }
    }
    return true;
}
exports.eachBetween = eachBetween;
function eachInt(value) {
    if (value) {
        for (var i = 0; i < value.length; i++) {
            if (!_toBeInt(value[i])) {
                return false;
            }
        }
    }
    return true;
}
exports.eachInt = eachInt;
function eachEqualInt(value) {
    if (value) {
        for (var i = 0; i < value.length; i++) {
            if (!_isEqualInt(value[i])) {
                return false;
            }
        }
    }
    return true;
}
exports.eachEqualInt = eachEqualInt;
//# sourceMappingURL=express-custom-validator.js.map