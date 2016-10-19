
interface AbstractObject {
    label: string;
    spaceNeeded: number;
    
    CO2Footprint: {
        kwh: number;
        weight: number;
    };

    costs?: any;
}

export = AbstractObject;
