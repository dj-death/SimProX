/**
 * Decision payload — the most important shape in the app.
 *
 * Source of truth: api/models/decision/CompanyDecSchema.ts (Mongoose schema).
 * Numeric fields use a custom `Numeric` cast (non-numbers -> 0). A default of
 * -1 means "not set / inherit previous period" for that field. Min/max are the
 * validation bounds enforced server-side; mirror them in client forms.
 *
 * Returned by:  GET /stratege/api/company
 * Submitted to: PUT /stratege/api/company/decision  (wrapped, see CompanyDecisionUpdate)
 * See docs/API_CONTRACT.md §5.4.
 */

/** One product on one sub-market. */
export interface SubMarketDecision {
  /** default -1, min 0, max 99000 */
  advertisingBudget: number;
  /** default -1, min 0, max 999 */
  price: number;
  /** default -1, min -999, max 9999 */
  deliveredQ: number;
}

export interface MarketDecision {
  /** default -1, min 0, max 99000 */
  corporateComBudget: number;
  products: SubMarketDecision[];
}

/** Sales agent (distribution) decision. */
export interface AgentDecision {
  /** default -1, min 0, max 99 */
  appointedNb: number;
  /** default -1, min 0, max 0.99 */
  commissionRate: number;
  /** default -1, min 5000, max 99000 */
  support: number;
}

export interface SubProductDecision {
  /** min 0, max 9999 */
  subcontractQ: number;
  /** default -1, min 0, max 1 */
  premiumMaterialPropertion: number;
}

export interface ProductDecision {
  /** default -1, max 999 */
  manufacturingTime: number;
  /** default -1, max 999 */
  assemblyTime: number;
  /** default false */
  improvementsTakeup: boolean;
  /** default -1, min 0, max 99000 */
  developmentBudget: number;
  /** default -1, min 0, max 1 */
  premiumMaterialPropertion: number;
}

export interface MachineTypeDecision {
  /** default 0, min 0, max 99 */
  boughtNb: number;
  /** default 0, min 0, max 99 */
  soldNb: number;
}

export interface MachineryDecision {
  /** default -1, min 0, max 99 */
  maintenanceHours: number;
  types: MachineTypeDecision[];
}

export interface MaterialFuture {
  term: number;
  /** default 0, min 0, max 99000 */
  quantity: number;
}

export interface MaterialDecision {
  purchases: MaterialFuture[];
}

export interface FactoryDecision {
  /** default 0, min 0, max 9999 */
  extension: number;
}

export interface ECommerceDecision {
  /** default -1, min 0, max 99 */
  websitePortsNb: number;
  /** default -1, min 0, max 999000 */
  websiteDevBudget: number;
}

export interface WorkerDecision {
  /** default -1, min 900, max 9999 */
  hourlyWageRate: number;
  /** default 0, min -9, max 99 (negative = layoffs) */
  hire: number;
  /** default 0, min 0, max 9 */
  trainedNb: number;
}

export interface InsuranceDecision {
  /** default -1, min 0, max 4 (insurance plan tier) */
  plan: number;
}

export interface BankAccountDecision {
  termLoans: number;
  termDeposit: number;
}

/** The inner `decision` object — the actual per-period inputs. */
export interface Decision {
  markets: MarketDecision[];
  agents: AgentDecision[];
  subProducts: SubProductDecision[];
  products: ProductDecision[];
  materials: MaterialDecision[];
  machineries: MachineryDecision[];
  /** default -1, min 1, max 3 (production shift level) */
  shiftLevel: number;
  factories: FactoryDecision[];
  eCommerces: ECommerceDecision[];
  bankAccounts: BankAccountDecision[];
  insurances: InsuranceDecision[];
  /** default 0, min -999000, max 999000 (share issue/buyback) */
  sharesVariation: number;
  /** default 0, min 0, max 0.99 (dividend payout ratio) */
  dividend: number;
  /** order market-share market-research report */
  orderMarketSharesInfo: boolean;
  /** order corporate-activity market-research report */
  orderCorporateActivityInfo: boolean;
  /** default -1, min 0, max 90 */
  staffTrainingDays: number;
  /** default -1, min 30000, max 999000 */
  managementBudget: number;
  workers: WorkerDecision[];
}

/** Full persisted decision document (GET /stratege/api/company). */
export interface CompanyDecision {
  seminarId: string;
  period: number;
  /** company id */
  d_CID: number;
  d_CompanyName: string;
  /** array of brand ids */
  d_BrandsDecisions: number[];
  d_IsAdditionalBudgetAccepted: boolean;
  d_RequestedAdditionalBudget: number;
  d_InvestmentInEfficiency: number;
  d_InvestmentInTechnology: number;
  d_InvestmentInServicing: number;
  bs_AdditionalBudgetApplicationCounter: number;
  bs_BlockBudgetApplication: boolean;
  decision: Decision;
}

/**
 * Request body for PUT /stratege/api/company/decision.
 * periodId/seminarId are only sent when a facilitator edits another company.
 */
export interface CompanyDecisionUpdate {
  company_data: { decision: Decision };
  companyId: number;
  periodId?: number;
  seminarId?: string;
}
