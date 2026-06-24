import { useQuery } from '@tanstack/react-query';
import type { ReportName } from '@simprox/api-types';
import { getReport, type ReportParams } from '../api/reports';

export function useReport(reportName: ReportName, params: ReportParams = {}) {
  return useQuery({
    queryKey: ['report', reportName, params.seminarId ?? null, params.companyId ?? null],
    queryFn: ({ signal }) => getReport(reportName, params, signal),
    enabled: Boolean(reportName),
  });
}
