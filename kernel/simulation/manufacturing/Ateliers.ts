import { Atelier } from '../../engine/ComputeEngine/Manufacturing';


export default function create(): Atelier[] {

    var atelierMoulage = new Atelier({
        id: "atelier1",
        atelierID: "0",

        label: "Atelier de Moulage",

        factoryID: "0",

        spaceNeeded: 0,
        unity: 0,
        costs: {
            fixedExpenses: 0,
            maintenance: 0,
            power: 0
        }
    });

    var atelierFinition = new Atelier({
        id: "atelier2",
        atelierID: "1",

        label: "Atelier de Finition",

        factoryID: "0",

        spaceNeeded: 0,
        unity: 0,
        costs: {
            fixedExpenses: 0,
            maintenance: 0,
            power: 0
        }
    });

    return [atelierMoulage, atelierFinition];

}