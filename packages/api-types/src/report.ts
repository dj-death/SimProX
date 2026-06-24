/**
 * Table-report payloads — GET /stratege/api/report/:report_name
 * (admin: GET /stratege/api/admin/report/:report_name).
 *
 * Source: api/controllers/simulation/report.ts (getReport). The body is
 * `report.reportData`, which is tabular and report-specific. For students,
 * `financial_report` and `profitability_evolution` are filtered server-side to
 * the student's own company (extractReportOfOneCompany) — a security boundary,
 * keep it server-side. See docs/API_CONTRACT.md §5.1.
 */

export const REPORT_NAMES = [
  'company_status',
  'financial_report',
  'profitability_evolution',
  'competitor_intelligence',
  'segment_distribution',
  'market_trends',
  'market_indicators',
] as const;

export type ReportName = (typeof REPORT_NAMES)[number];

/** Reports filtered to one company for students (vs all companies for facilitators). */
export const STUDENT_FILTERED_REPORTS: ReportName[] = [
  'financial_report',
  'profitability_evolution',
];

/**
 * reportData is report-specific tabular data. It is rendered by the existing
 * `tablereport*.html` partials, which define the column spec. Treat as opaque
 * rows keyed by company/period until per-report interfaces are extracted in a
 * follow-up (recommended: one interface per REPORT_NAMES entry).
 */
export type ReportRow = Record<string, unknown>;
export type ReportResponse = ReportRow | ReportRow[];
