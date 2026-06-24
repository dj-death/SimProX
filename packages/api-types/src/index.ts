/**
 * @simprox/api-types — shared API contract types.
 *
 * The four shapes the UI actually renders are decision, report, chart and
 * finalscore. Everything else here supports those flows (auth, errors,
 * spending, simulation control, sockets).
 *
 * See docs/API_CONTRACT.md for the full endpoint inventory these types map to.
 */
export * from './common';
export * from './auth';
export * from './decision';
export * from './report';
export * from './chart';
export * from './finalscore';
export * from './spending';
export * from './simulation';
