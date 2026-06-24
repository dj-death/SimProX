/**
 * Final-score payload — GET /stratege/api/finalscore
 * (admin: GET /stratege/api/admin/finalscore/:seminarId).
 *
 * Source: api/controllers/simulation/report.ts (getStudentFinalScore).
 * Score = DeltaSOM_Weight * scaledSOM + Profits_Weight * scaledProfit
 *       + 2 * scaledBudget   (weights come from the seminar's initial period).
 * See docs/API_CONTRACT.md §5.3.
 */

export interface CompanyScore {
  companyId: number;
  /** raw delta share-of-market (value segment share, x100) */
  originalSOM: number;
  /** cumulated net results */
  originalProfit: number;
  /** cumulated investments vs budget, as a percentage */
  originalBudget: number;
  /** 0..100, normalized across companies */
  scaledSOM: number;
  /** 0..100, normalized across companies */
  scaledProfit: number;
  /** 0..100; 0 when originalBudget <= 100, else 100 - originalBudget */
  scaledBudget: number;
  /** weighted total */
  finalScore: number;
}

export interface PeriodScores {
  period: number;
  seminarId: string;
  scores: CompanyScore[];
}

/** The actual top-level response object. */
export interface FinalScoreResponse {
  simulation_span: number;
  showLastPeriodScore: boolean;
  scoreData: PeriodScores[];
}
