/**
 * Reports API. GET /stratege/api/report/:report_name (API_CONTRACT §5.1).
 * For students, the server filters financial_report / profitability_evolution
 * to their own company — we just pass companyId through.
 */
import type { ReportName, ReportResponse } from '@simprox/api-types';
import { apiRequest } from './client';

export interface ReportParams {
  /** facilitator/admin only; students use their chosen seminar server-side */
  seminarId?: number;
  /** used for server-side company filtering on some reports */
  companyId?: number;
}

export function getReport(
  reportName: ReportName,
  params: ReportParams = {},
  signal?: AbortSignal,
): Promise<ReportResponse> {
  return apiRequest<ReportResponse>(`/stratege/api/report/${reportName}`, {
    params: { seminarId: params.seminarId, companyId: params.companyId },
    signal,
  });
}
