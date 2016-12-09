import * as Scenario from '../Engine/Scenario';

function isObject(val) {
    if (val === null) {
        return false;
    }

    return ((typeof val === 'object') && !(val instanceof Date));
}

export default function processStates(decisions: Scenario.Decision[], results: Scenario.Results[]): any {
    if (!decisions.length || !results.length) {
        return {};
    }


    let newStates = {};

    // c' mieux que results as it so flat
    let obj = decisions[0];


    // iterate over object: machines ...
    for (let prop in obj) {

        if (!obj.hasOwnProperty(prop)) {
            continue;
        }

        let coll: Array<any> = obj[prop];

        if (!coll || !isObject(coll)) {
            continue;
        }

        newStates[prop] = []; // { machines: [] }

        coll.forEach(function (item, idx) {
            let itemResults = [];
            let itemDecs = [];

            results.forEach(function (result: Scenario.Results) {
                let res = result[prop];

                res && itemResults.push(res[idx]);
            });

            decisions.forEach(function (decision: Scenario.Decision) {
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