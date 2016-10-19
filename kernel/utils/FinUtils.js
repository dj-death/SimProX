"use strict";
function IRR(values, guess) {
    // Credits: algorithm inspired by Apache OpenOffice
    // Calculates the resulting amount
    var irrResult = function (values, dates, rate) {
        var r = rate + 1;
        var result = values[0];
        for (var i = 1; i < values.length; i++) {
            result += values[i] / Math.pow(r, (dates[i] - dates[0]) / 365);
        }
        return result;
    };
    // Calculates the first derivation
    var irrResultDeriv = function (values, dates, rate) {
        var r = rate + 1;
        var result = 0;
        for (var i = 1; i < values.length; i++) {
            var frac = (dates[i] - dates[0]) / 365;
            result -= frac * values[i] / Math.pow(r, frac + 1);
        }
        return result;
    };
    // Initialize dates and check that values contains at least one positive value and one negative value
    var dates = [];
    var positive = false;
    var negative = false;
    for (var i = 0; i < values.length; i++) {
        dates[i] = (i === 0) ? 0 : dates[i - 1] + 365;
        if (values[i] > 0)
            positive = true;
        if (values[i] < 0)
            negative = true;
    }
    // Return error if values does not contain at least one positive value and one negative value
    if (!positive || !negative) {
        return;
    }
    // Initialize guess and resultRate
    guess = (typeof guess === 'undefined') ? 0.1 : guess;
    var resultRate = guess;
    // Set maximum epsilon for end of iteration
    var epsMax = 1e-10;
    // Set maximum number of iterations
    var iterMax = 50;
    // Implement Newton's method
    var newRate, epsRate, resultValue;
    var iteration = 0;
    var contLoop = true;
    do {
        resultValue = irrResult(values, dates, resultRate);
        newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
        epsRate = Math.abs(newRate - resultRate);
        resultRate = newRate;
        contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
    } while (contLoop && (++iteration < iterMax));
    if (contLoop) {
        return;
    }
    // Return internal rate of return
    return resultRate;
}
exports.IRR = IRR;
function growthRate(income, period, benchValue, guess) {
    if (guess === void 0) { guess = 0.001; }
    var growthRate = guess;
    // Calculates the first derivation
    var grResultDeriv = function (income, period, rate) {
        var r = rate + 1;
        var result = period * income / Math.pow(r, period + 1);
        return result;
    };
    // Set maximum epsilon for end of iteration
    var epsMax = 1e-10;
    // Set maximum number of iterations
    var iterMax = 50;
    // Implement Newton's method
    var iteration = 0;
    var contLoop = true;
    do {
        var r = 1 + growthRate;
        var presentValue = income / Math.pow(r, period);
        var newRate = growthRate - presentValue / grResultDeriv(income, period, growthRate);
        var epsRate = Math.abs(newRate - growthRate);
        growthRate = newRate;
        contLoop = (epsRate > epsMax) && (presentValue > benchValue);
    } while (contLoop && (++iteration < iterMax));
    if (contLoop) {
        return;
    }
    if (isNaN(growthRate)) {
        console.warn("growthRate NaN - income: %d, bench: %d", income, benchValue);
        growthRate = 0;
    }
    // Return internal rate of return
    return growthRate;
}
exports.growthRate = growthRate;
//# sourceMappingURL=FinUtils.js.map