
export enum CREDIT {
    CASH = 0,
    ONE_MONTH = 30,
    TWO_MONTH = 60,
    THREE_MONTH = 90
}

export enum FUTURES {
    IMMEDIATE,
    THREE_MONTH,
    SIX_MONTH
}

export enum DELIVERY {
    IMMEDIATE = 0,
    NEXT_PERIOD = 1,
    AFTERNEXT_PERIOD = 2,
}

export enum QUALITY {
    LQ,
    MQ,
    HQ
}

export enum SHIFT_LEVEL {
    SINGLE,
    DOUBLE,
    TREBLE
}

export enum PERIODS { // in months
    QUARTER = 3,
    HALF_YEAR = 6,
    YEAR = 12
}

export interface CO2Footprint {
    kwh: number;
    weight: number;
}

export interface Shift {
    level: SHIFT_LEVEL;
    workersNeededNb: number;
    maxHoursPerPeriod: number;
    maxHoursWeekDays: number;
    maxHoursOvertimeSaturday: number;
    maxHoursOvertimeSunday: number;
    shiftPremium: number;

    weeksWorkedByPeriod: number;
}

export enum IMPROVEMENT_TYPE {
    NONE,
    MINOR,
    MAJOR
}

export interface Future {
    term: FUTURES;
}

export interface FuturesArray {
    [index: string]: Future;
}

export enum COM_AXES {
    PRICE,
    CONFORT,
    RESISTANCE,
    ESTHETIC,
}


export enum STAR_RATINGS {
    ONE_STAR = 1,
    TWO_STAR = 2,
    THREE_STAR = 3,
    FOUR_STAR = 4,
    FIVE_STAR = 5
}

export interface Company_BankFile {
    property: number;
    inventories: number;
    tradeReceivables: number;
    taxDue: number;
    tradePayables: number;
}

export interface Payment {
    credit: CREDIT;
    part: number;
}

export interface PaymentArray {
    [index: string]: Payment;
}

export enum ACTIVITY {
    OPERATING,
    FINANCING,
    INVESTING
};

// S&P

export enum CREDIT_SHORTTERM_RATING {
    A1_PLUS = 9986,
    A1 = 9773,
    A2 = 9332,
    A3 = 8413,
    B = 6915,
    C = 5000,
    D = 2776
}


export enum CREDIT_LONGTERM_RATING {
    AAA = 9990,
    AA_PLUS = 9988,
    AA = 9986,
    AA_MINUS = 9938,
    A_PLUS = 9773,
    A = 9599,
    A_MINUS = 9332,
    BBB_PLUS = 8944,
    BBB = 8413,
    BBB_MINUS = 7734,
    BB_PLUS = 6915,
    BB = 6554,
    BB_MINUS = 6179,
    B_PLUS = 5987,
    B = 5793,
    B_MINUS = 5398,
    CCC_PLUS = 5000,
    CCC = 4364,
    CCC_MINUS = 4052,
    CC = 2776,
    C = 2297,
    D = 1379
}

export enum SPACE_USAGES {
    MACHINES,
    WORKERS,
    STOCKS
}


export interface MarketingMix {
    supply: number[][];

    prices: number[][];
    credits: number[][];
    directAds: number[][];
    qualities: number[][];

    corporateAds: number[];
    salesForceCommissions: number[];
    salesForceStaff: number[];
    salesForceSupport: number[];

    websiteLevels: number[];
}


export enum PLC_STAGE {
    INTRODUCTION,
    GROWTH,
    MATURITY_BEGIN,
    MATURITY_END,
    DECLINE
}


// http://www.learnmarketing.net/Types%20of%20%20product%20life%20cycles.htm
export enum PLC_TYPE {
    CLASSICAL,
    RAPID_PENETRATION,
    GROWTH_MATURITY,
    STABLE_MATURITY,
    GROWTH_DECLINE_PLATEAU,
}


export interface VariableRange {
    threshold: number;
    mediane?: number;
    wearout: number;
}