import { useState } from 'react';
import { Link } from 'react-router-dom';
import { REPORT_NAMES, STUDENT_FILTERED_REPORTS, type ReportName } from '@simprox/api-types';
import { useAuth } from '../auth/AuthContext';
import { useReport } from './useReport';
import { ReportTable } from './ReportTable';
import { ApiRequestError } from '../api/client';

function label(name: ReportName): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ReportsPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<ReportName>(REPORT_NAMES[0]);

  // companyId drives server-side filtering for the student-filtered reports.
  const companyId = typeof user?.companyId === 'number' ? user.companyId : undefined;
  const query = useReport(selected, { companyId });

  return (
    <main style={{ fontFamily: 'system-ui', margin: '2rem', maxWidth: 1100 }}>
      <p><Link to="/">← Home</Link></p>
      <h1>Reports</h1>

      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {REPORT_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            aria-pressed={selected === name}
            style={{
              padding: '6px 10px',
              border: '1px solid #d0d7de',
              borderRadius: 6,
              background: selected === name ? '#0969da' : '#fff',
              color: selected === name ? '#fff' : '#24292f',
              cursor: 'pointer',
            }}
          >
            {label(name)}
          </button>
        ))}
      </nav>

      <section>
        <h2 style={{ fontSize: 18 }}>
          {label(selected)}
          {STUDENT_FILTERED_REPORTS.includes(selected) && (
            <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
              (filtered to your company)
            </span>
          )}
        </h2>

        {query.isLoading && <p>Loading…</p>}
        {query.isError && (
          <p role="alert" style={{ color: 'crimson' }}>
            {query.error instanceof ApiRequestError ? query.error.message : 'Failed to load report'}
          </p>
        )}
        {query.data !== undefined && !query.isLoading && <ReportTable data={query.data} />}
      </section>
    </main>
  );
}
