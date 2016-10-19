"use strict";
function isObject(val) {
    if (val === null) {
        return false;
    }
    return ((typeof val === 'object') && !(val instanceof Date));
}
function processStates(states) {
    if (!states.length || !(states[0].decision)) {
        return {};
    }
    var newStates = {};
    // c' mieux que results as it so flat
    var obj = states[0].decision;
    // iterate over object: machines ...
    for (var prop in obj) {
        if (!obj.hasOwnProperty(prop)) {
            continue;
        }
        var coll = obj[prop];
        if (!isObject(coll)) {
            continue;
        }
        newStates[prop] = []; // { machines: [] }
        coll.forEach(function (item, idx) {
            var itemResults = [];
            var itemDecs = [];
            states.forEach(function (state) {
                var res = state.results[prop];
                var dec = state.decision[prop];
                res && itemResults.push(res[idx]);
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