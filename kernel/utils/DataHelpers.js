"use strict";
function isObject(val) {
    if (val === null) {
        return false;
    }
    return ((typeof val === 'object') && !(val instanceof Date));
}
function processStates(decisions, results) {
    if (!decisions.length || !results.length) {
        return {};
    }
    let newStates = {};
    // c' mieux que results as it so flat
    let obj = decisions[0];
    // iterate over object: machines ...
    for (var prop in obj) {
        if (!obj.hasOwnProperty(prop)) {
            continue;
        }
        let coll = obj[prop];
        if (!coll || !isObject(coll)) {
            continue;
        }
        newStates[prop] = []; // { machines: [] }
        coll.forEach(function (item, idx) {
            let itemResults = [];
            let itemDecs = [];
            results.forEach(function (result) {
                let res = result[prop];
                res && itemResults.push(res[idx]);
            });
            decisions.forEach(function (decision) {
                let dec = decision[prop];
                dec && itemDecs.push(dec[idx]);
            });
            newStates[prop].push({
                results: itemResults,
                decisions: itemDecs
            });
        });
    }
    return newStates;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = processStates;
//# sourceMappingURL=DataHelpers.js.map