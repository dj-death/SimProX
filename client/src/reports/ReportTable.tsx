/**
 * Generic report renderer.
 *
 * Most SimProX reports return an array of per-period objects (see the Angular
 * `tablereport*.html` partials: `ng-repeat="quarter in data"`), rendered
 * transposed — one column per period, one row per metric. We mirror that:
 *   columns  = items (labelled by `period` when present)
 *   rows     = the union of metric keys across items
 * Anything that isn't an array-of-objects falls back to a readable JSON dump,
 * so the slice stays honest about shapes we haven't specced yet.
 */
import type { ReportResponse } from '@simprox/api-types';

type Row = Record<string, unknown>;

function isArrayOfObjects(data: unknown): data is Row[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every((d) => d !== null && typeof d === 'object' && !Array.isArray(d))
  );
}

/** Humanize a camelCase / snake_case key into a label. */
function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function ReportTable({ data }: { data: ReportResponse }) {
  if (!isArrayOfObjects(data)) {
    return (
      <pre style={{ background: '#f6f8fa', padding: 12, overflow: 'auto', fontSize: 12 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  const items = data as Row[];
  // Column headers: prefer a `period` field, else the index.
  const columns = items.map((item, i) =>
    'period' in item ? `Period ${formatCell(item.period)}` : `#${i + 1}`,
  );
  // Metric rows: union of keys, excluding the `period` label key.
  const metricKeys = Array.from(
    items.reduce<Set<string>>((set, item) => {
      Object.keys(item).forEach((k) => {
        if (k !== 'period') set.add(k);
      });
      return set;
    }, new Set()),
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={th}>Metric</th>
            {columns.map((c, i) => (
              <th key={i} style={{ ...th, textAlign: 'right' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricKeys.map((key) => (
            <tr key={key}>
              <td style={{ ...td, fontWeight: 600 }}>{humanize(key)}</td>
              {items.map((item, i) => (
                <td key={i} style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCell(item[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  borderBottom: '2px solid #d0d7de',
  padding: '6px 10px',
  textAlign: 'left',
  background: '#f6f8fa',
  position: 'sticky',
  top: 0,
};
const td: React.CSSProperties = {
  borderBottom: '1px solid #eaecef',
  padding: '5px 10px',
};
