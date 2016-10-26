let CompanyLengthMax = 15;
let BrandNameLengthMax = 5;
let SKUNameLengthMax = 2;
let SeminarIDLengthMax = 5;
let SeminarFullNameLengthMax = 40;
let UserNameLengthMax = 40;

let CompaniesMax = 6;
let BrandsMax = 5;
let SKUsMax = 5;

let AllBrandsMax = CompaniesMax * BrandsMax;
let AllSKUsMax = AllBrandsMax * SKUsMax;
let ConsumerSegmentsMax = 6;
let ConsumerSegmentsMaxTotal = ConsumerSegmentsMax + 1;

let TEN = 10;
let Last_CID = CompaniesMax;
let Last_CIDPlus = CompaniesMax + 1;
let Last_BID = TEN * Last_CID + BrandsMax;
let Last_SID = TEN * TEN * Last_CID + TEN * BrandsMax + SKUsMax;

let History_3 = -3;
let History_2 = -2;
let History_1 = -1;
let History_0 = 0;
let Period_0 = 0;
let Period_Max = 9;
let Period_Display = 6; //Max period number of chart&data which displayed in the form and reports
let Never = Period_Max + 1;

let WeeksInQuarter = 13;
let MonthsInYear = 12;

let EpisodesMax = WeeksInQuarter;
let EpisodesBeyondMax = EpisodesMax + 1;
let StocksMax = 4;
let StocksMaxTotal = StocksMax + 1;
let PriceMax = 2; //{ prices may be set for= current production (0); last period production (1); older production (2) }

let P_DimensionsMax = 2;

let TechnologyUltimateLevel = 20;
let IngredientsUltimateQuality = TechnologyUltimateLevel + 2;
let TechnologyToImproveFreshness = 11;
let AdditionalBudgetsMax = 2;

let SimulationName = 'MARKSIMOS';
let ReadParametersOK = 0;
let ReadExogenousOK = 0;
let ReadResultsOK = 0


let ActualSize = [0.5, 1.0, 2.0];
let WarrantyYears = [1, 3, 5];
let EpisodesCount = [13, 12];
let ObsoleteAge = [StocksMax - 2, StocksMaxTotal];

let TSimulationVariant = ['FMCG', 'DURABLES'];


let consts = {
    CompanyLengthMax: CompanyLengthMax,
    BrandNameLengthMax: BrandNameLengthMax,
    SKUNameLengthMax: SKUNameLengthMax,
    SeminarIDLengthMax: SeminarIDLengthMax,
    SeminarFullNameLengthMax: SeminarFullNameLengthMax,
    UserNameLengthMax: UserNameLengthMax,

    CompaniesMax: CompaniesMax,
    BrandsMax: BrandsMax,
    SKUsMax: SKUsMax,

    AllBrandsMax: AllBrandsMax,
    AllSKUsMax: AllSKUsMax,
    ConsumerSegmentsMax: ConsumerSegmentsMax,
    ConsumerSegmentsMaxTotal: ConsumerSegmentsMaxTotal,

    TEN: TEN,
    Last_CID: Last_CID,
    Last_CIDPlus: Last_CIDPlus,
    Last_BID: Last_BID,
    Last_SID: Last_SID,

    History_3: History_3,
    History_2: History_2,
    History_1: History_1,
    History_0: History_0,
    Period_0: Period_0,
    Period_Max: Period_Max,
    Period_Display: Period_Display,
    Never: Never,

    WeeksInQuarter: WeeksInQuarter,
    MonthsInYear: MonthsInYear,

    EpisodesMax: EpisodesMax,
    EpisodesBeyondMax: EpisodesBeyondMax,
    StocksMax: StocksMax,
    StocksMaxTotal: StocksMaxTotal,
    PriceMax: PriceMax,

    P_DimensionsMax: P_DimensionsMax,

    TechnologyUltimateLevel: TechnologyUltimateLevel,
    IngredientsUltimateQuality: IngredientsUltimateQuality,
    TechnologyToImproveFreshness: TechnologyToImproveFreshness,
    AdditionalBudgetsMax: AdditionalBudgetsMax,

    SimulationName: SimulationName,
    ReadParametersOK: ReadParametersOK,
    ReadExogenousOK: ReadExogenousOK,
    ReadResultsOK: ReadResultsOK,

    ActualSize: ActualSize
};

export = consts;