"use strict";
const Personnel_1 = require('../../engine/ComputeEngine/Personnel');
const ENUMS = require('../../engine/ComputeEngine/ENUMS');
function create() {
    let management = new Personnel_1.Management({
        id: "management1",
        label: "management1",
        minDailyTrainedEmployeesNb: 5,
        maxDailyTrainedEmployeesNb: 10,
        budget: {
            decreaseEffectiveness: ENUMS.FUTURES.THREE_MONTH,
            decreaseLimitRate: 0.1
        },
        costs: {
            trainingConsultantDayRate: 1000
        },
        payments: {
            management: {
                "CASH": {
                    credit: ENUMS.CREDIT.CASH,
                    part: 1
                }
            },
            personnel: {
                "CASH": {
                    credit: ENUMS.CREDIT.CASH,
                    part: 1
                }
            }
        }
    });
    return management;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=Management.js.map