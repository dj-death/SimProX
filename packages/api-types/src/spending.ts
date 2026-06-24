/**
 * Spending / capacity payloads.
 *
 * Source: api/assemblers/spendingDetails.ts and
 * api/controllers/simulation/decision.ts (getOtherinfo).
 *
 * ⚠️ Both currently return HARDCODED PLACEHOLDER values in the source — the real
 * computation is commented out. Treat these shapes as provisional and verify/
 * wire up real values before a client relies on them. See API_CONTRACT §5.4, §6.3.
 */

/** GET /stratege/api/spending_details */
export interface SpendingDetailsResponse {
  companyData: {
    investmentInProductionEfficiency: number;
    investmentInProcessingTechnology: number;
    totalInvestment: number;
    averageBudgetPerPeriod: number;
    totalInvestmentBudget: number;
    cumulatedPreviousInvestments: number;
    availableBudget: number;
    normalCapacity: number;
    acquiredEfficiency: number;
    acquiredProductionVolumeFlexibility: number;
    acquiredTechnologyLevel: number;
  };
}

/** GET /stratege/api/company/otherinfo */
export interface OtherInfoResponse {
  totalAvailableBudget: number;
  normalCapacity: number;
  overtimeCapacity: number;
  totalAvailableBudgetValue: number;
  normalCapacityValue: number;
  overtimeCapacityValue: number;
}
