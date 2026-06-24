/**
 * Chart payloads — GET /stratege/api/chart/:chart_name
 * (admin: GET /stratege/api/admin/chart/:chart_name).
 *
 * Source: api/assemblers/chart.ts. Most charts are produced by a shared
 * `generateChartData()` helper and share the `SeriesChart` shape below.
 * A few (investmentsVersusBudget, perception_map) differ.
 * See docs/API_CONTRACT.md §5.2.
 */

/** The chart names the AngularJS client requests (snake_case in the URL). */
export const CHART_NAMES = [
  'inventory_report',
  'market_share_in_value',
  'market_share_in_volume',
  'mind_space_share',
  'shelf_space_share',
  'total_investment',
  'net_profit_by_companies',
  'return_on_investment',
  'investments_versus_budget',
  'market_sales_value',
  'market_sales_volume',
  'total_inventory_at_factory',
  'total_inventory_at_trade',
  'segments_leaders_by_value_price_sensitive',
  'segments_leaders_by_value_pretenders',
  'segments_leaders_by_value_moderate',
  'segments_leaders_by_value_good_life',
  'segments_leaders_by_value_ultimate',
  'segments_leaders_by_value_pragmatic',
  'perception_map',
  'growth_rate_in_volume',
  'growth_rate_in_value',
  'net_market_price',
  'segment_value_share_total_market',
] as const;

export type ChartName = (typeof CHART_NAMES)[number];

/**
 * Default chart shape from generateChartData(): one row per period, one column
 * per company. chartData[periodIndex][companyIndex] aligns with
 * periods[periodIndex] and companyNames[companyIndex].
 */
export interface SeriesChart {
  periods: number[];
  companyNames: string[];
  chartData: number[][];
}

/** perception_map carries per-company coordinate data instead of a series. */
export interface PerceptionMapChart {
  periods: number[];
  companyNames: string[];
  allCompanyData: unknown[];
}

export type ChartResponse = SeriesChart | PerceptionMapChart;

/**
 * NOTE: the client lists all CHART_NAMES, but several are disabled/stubbed in
 * api/assemblers/chart.ts (e.g. marketShareInVolume returns a constant). Verify
 * which names actually return data before rendering them. See API_CONTRACT §6.2.
 */
