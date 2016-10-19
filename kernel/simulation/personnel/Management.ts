import { Management } from '../../engine/ComputeEngine/Personnel';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


export default function create(): Management {


    var management = new Management({
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