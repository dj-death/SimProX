"use strict";
var Manufacturing_1 = require('../../engine/ComputeEngine/Manufacturing');
function create() {
    var materialA = new Manufacturing_1.RawMaterial({
        id: "material1",
        materialID: "0",
        label: "Material",
        spaceNeeded: 0.005,
        diffReelAndCalculatedValue: 0.1,
        spoilProbability: 0
    });
    return [materialA];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = create;
//# sourceMappingURL=RawMaterials.js.map