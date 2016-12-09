import { RawMaterial} from '../../engine/ComputeEngine/Manufacturing';

import ENUMS = require('../../engine/ComputeEngine/ENUMS');


export default function create(): RawMaterial[] {

    let materialA = new RawMaterial({
        id: "material1",
        materialID: "0",

        label: "Material",
        spaceNeeded: 0.005,
        diffReelAndCalculatedValue: 0.1,

        spoilProbability: 0
    });

    return [materialA];
}

