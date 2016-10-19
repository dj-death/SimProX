import * as Scenario from '../Engine/Scenario';

function isObject(val) {
    if (val === null) {
        return false;
    }

    return ((typeof val === 'object') && !(val instanceof Date));
}

export default function processStates(states: Scenario.Scenario[]): any {
    if (!states.length || ! (states[0].decision)) {
        return {};
    }

    let newStates = {};

    // c' mieux que results as it so flat
    let obj = states[0].decision;

    // iterate over object: machines ...
    for (var prop in obj) {

        if (!obj.hasOwnProperty(prop)) {
            continue;
        }

        let coll: Array<any> = obj[prop];

        if (!isObject(coll)) {
            continue;
        }

        newStates[prop] = []; // { machines: [] }

        coll.forEach(function (item, idx) {
            let itemResults = [];
            let itemDecs = [];

            states.forEach(function (state: Scenario.Scenario) {
                let res = state.results[prop];
                let dec = state.decision[prop];


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