function  _between(value, min, max, option) {
    switch (option) {
        case "g":
            return (value > min && value <= max);

        case "l":
            return (value >= min && value < max);

        case "gl":
        case "lg":
            return (value > min && value < max);

        default:
            return (value >= min && value <= max);
    }
}

function  _minMax(num1, num2) {
    let min, max;
    if (num1 > num2) {
        min = num2;
        max = num1;
    }
    else {
        min = num1;
        max = num2;
    }
    return { min: min, max: max };
}

function  _toBeInt(value) {       
    return value << 0 === value;
}

function  _isEqualInt(value) {
    return value << 0 == value
}



export function  isArray(value) {
    return Array.isArray(value);
}

export function  isArrayLen(value, num) {
    if (!Array.isArray(value)) {
        return false;
    }
    return value.length === num;
}

export function  equal(value, num) {
    return value == num;
}

export function  toBe(value, num) {
    return value === num;
}


export function  gt(value, num) {
    return value > num;
}


export function  gte(value, num) {
    return value >= num;
}


export function  lt(value, num) {
    return value < num
}

export function  lte(value, num) {
    return value <= num;
}

export function  between(value, num1, num2, option) {           
    let minMax = _minMax(num1, num2);
    return _between(value, minMax.min, minMax.max,option);
}

export function  eachBetween(value, num1, num2, option) {          
    let minMax = _minMax(num1, num2);
    if (value) {
        for (let i = 0; i < value.length; i++) {
            if (!_between(value[i], minMax.min, minMax.max, option)) {                      
                return false;
            }
        }
    }           
    return true;
}

export function  eachInt(value) {
    if (value) {
        for (let i = 0; i < value.length; i++) {
            if (!_toBeInt(value[i])) {
                return false;
            }
        }
    }
    return true;
}

export function  eachEqualInt(value) {
    if (value) {
        for (let i = 0; i < value.length; i++) {
            if (!_isEqualInt(value[i])) {
                return false;
            }
        }
    }
    return true;
}

