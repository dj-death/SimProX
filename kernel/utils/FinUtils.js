"use strict";
function IRR(values, guess) {
    // Credits: algorithm inspired by Apache OpenOffice
    // Calculates the resulting amount
    let irrResult = function (values, dates, rate) {
        let r = rate + 1;
        let result = values[0];
        for (let i = 1; i < values.length; i++) {
            result += values[i] / Math.pow(r, (dates[i] - dates[0]) / 365);
        }
        return result;
    };
    // Calculates the first derivation
    let irrResultDeriv = function (values, dates, rate) {
        let r = rate + 1;
        let result = 0;
        for (let i = 1; i < values.length; i++) {
            let frac = (dates[i] - dates[0]) / 365;
            result -= frac * values[i] / Math.pow(r, frac + 1);
        }
        return result;
    };
    // Initialize dates and check that values contains at least one positive value and one negative value
    let dates = [];
    let positive = false;
    let negative = false;
    for (let i = 0; i < values.length; i++) {
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
    let resultRate = guess;
    // Set maximum epsilon for end of iteration
    let epsMax = 1e-10;
    // Set maximum number of iterations
    let iterMax = 50;
    // Implement Newton's method
    let newRate, epsRate, resultValue;
    let iteration = 0;
    let contLoop = true;
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
function growthRate(income, period, benchValue, guess = 0.001) {
    let growthRate = guess;
    // Calculates the first derivation
    let grResultDeriv = function (income, period, rate) {
        let r = rate + 1;
        let result = period * income / Math.pow(r, period + 1);
        return result;
    };
    // Set maximum epsilon for end of iteration
    let epsMax = 1e-10;
    // Set maximum number of iterations
    let iterMax = 50;
    // Implement Newton's method
    let iteration = 0;
    let contLoop = true;
    do {
        let r = 1 + growthRate;
        let presentValue = income / Math.pow(r, period);
        let newRate = growthRate - presentValue / grResultDeriv(income, period, growthRate);
        let epsRate = Math.abs(newRate - growthRate);
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