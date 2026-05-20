(function(global) {
/** Default API catalog from dev-test k6 scripts */
const DEFAULT_APIS = [
  { id: 1, method: 'GET', path: '/api/v1/users?outlet-code={outletCode}', avg: 213.06, min: 208.16, med: 210.38, max: 248.83, p90: 219.92, p95: 226.56, rps: 0.803, status: 'PASS' },
  { id: 2, method: 'POST', path: '/api/v1/auth/login', avg: 364.11, min: 345.24, med: 351.7, max: 722.08, p90: 369.12, p95: 395.79, rps: 0.712, status: 'PASS' },
  { id: 3, method: 'GET', path: '/api/v1/users/current', avg: 230.55, min: 203.67, med: 210.77, max: 875.29, p90: 240.2, p95: 257.2, rps: 0.8, status: 'PASS' },
  { id: 4, method: 'GET', path: '/api/v1/shop-info?code={outletCode}&brandId={brandId}', avg: 234.34, min: 213.4, med: 214.45, max: 763.09, p90: 238.48, p95: 309.07, rps: 0.796, status: 'PASS' },
  { id: 5, method: 'GET', path: '/api/v1/tables?outlet_id={shopId}&brand_id={brandId}', avg: 207.52, min: 190.07, med: 206.45, max: 250.25, p90: 211.76, p95: 214.48, rps: 0.799, status: 'PASS' },
  { id: 6, method: 'GET', path: '/api/v1/cash-drawer/active-session', avg: 237.38, min: 219.4, med: 235.2, max: 423.76, p90: 239.51, p95: 245.27, rps: 0.794, status: 'PASS' },
  { id: 7, method: 'GET', path: '/api/v1/main-menu/{mainMenuId}/categories/webshop-brand/{brandId}/shop/{shopId}', avg: 328.38, min: 289.84, med: 310, max: 629.35, p90: 356.03, p95: 365.9, rps: 0.708, status: 'PASS' },
  { id: 8, method: 'GET', path: '/api/v1/customers/', avg: 372.63, min: 336.21, med: 341.88, max: 806.86, p90: 390.33, p95: 420.23, rps: 0.411, status: 'PASS' },
  { id: 9, method: 'POST', path: '/api/v1/customers', avg: 333.6, min: 333.6, med: 333.6, max: 333.6, p90: 333.6, p95: 333.6, rps: 0.497, status: 'PASS' },
  { id: 10, method: 'PUT', path: '/api/v1/customers/{customerId}', avg: 255.9, min: 235.13, med: 246.94, max: 285.63, p90: 277.89, p95: 281.76, rps: 0.868, status: 'PASS' },
  { id: 11, method: 'GET', path: '/api/v1/admin/orders/status/CREATED?franchise=1&shop={shopId}&paginate=false', avg: 390.37, min: 361.43, med: 378.1, max: 505.88, p90: 447.99, p95: 463.75, rps: 0.708, status: 'PASS' },
  { id: 12, method: 'POST', path: '/api/v1/accept-order/{orderId}', avg: 1620, min: 1620, med: 1620, max: 1620, p90: 1620, p95: 1620, rps: 0.269, status: 'PASS' },
  { id: 13, method: 'POST', path: '/api/v1/accept-order/{orderId}', avg: 1630, min: 1480, med: 1630, max: 1790, p90: 1760, p95: 1770, rps: 0.305, status: 'PASS' },
  { id: 14, method: 'POST', path: '/api/v1/deny-order/{orderId}', avg: 1110, min: 1110, med: 1110, max: 1110, p90: 1110, p95: 1110, rps: 0.358, status: 'PASS' },
  { id: 15, method: 'POST', path: '/api/v1/orders', avg: 501.95, min: 501.95, med: 501.95, max: 501.95, p90: 501.95, p95: 501.95, rps: 0.766, status: 'PASS' },
  { id: 16, method: 'POST', path: '/api/v1/orders', avg: 363.25, min: 363.25, med: 363.25, max: 363.25, p90: 363.25, p95: 363.25, rps: 0.838, status: 'PASS' },
  { id: 17, method: 'POST', path: '/api/v1/orders', avg: 384.88, min: 384.88, med: 384.88, max: 384.88, p90: 384.88, p95: 384.88, rps: 0.882, status: 'PASS' },
  { id: 18, method: 'POST', path: '/api/v1/orders', avg: 428.26, min: 428.26, med: 428.26, max: 428.26, p90: 428.26, p95: 428.26, rps: 0.746, status: 'PASS' },
  { id: 19, method: 'POST', path: '/api/v1/orders', avg: 407.06, min: 407.06, med: 407.06, max: 407.06, p90: 407.06, p95: 407.06, rps: 0.807, status: 'PASS' },
  { id: 20, method: 'POST', path: '/api/v1/orders', avg: 373.08, min: 373.08, med: 373.08, max: 373.08, p90: 373.08, p95: 373.08, rps: 0.816, status: 'PASS' },
  { id: 21, method: 'POST', path: '/api/v1/orders', avg: 334.71, min: 334.71, med: 334.71, max: 334.71, p90: 334.71, p95: 334.71, rps: 0.965, status: 'PASS' },
  { id: 22, method: 'GET', path: '/api/v1/orders?status={status}&platforms={platforms}&outlet_id={outletId}', avg: 223.68, min: 213.65, med: 218.12, max: 244.32, p90: 238.54, p95: 241.43, rps: 0.994, status: 'PASS' },
  { id: 23, method: 'PATCH', path: '/api/v1/orders/{orderId}/status', avg: 223.68, min: 213.65, med: 218.12, max: 244.32, p90: 238.54, p95: 241.43, rps: 0.994, status: 'PASS' },
  { id: 24, method: 'POST', path: '/api/v1/preparing/{orderId}', avg: 491.38, min: 491.38, med: 491.38, max: 491.38, p90: 491.38, p95: 491.38, rps: 0.465, status: 'PASS' },
  { id: 25, method: 'PATCH', path: '/api/v1/orders/{orderId}/status', avg: 2360, min: 402.09, med: 2360, max: 4320, p90: 3930, p95: 4130, rps: 0.275, status: 'PASS' },
  { id: 26, method: 'POST', path: '/api/v1/ready-to-pickup/{orderId}', avg: 1110, min: 1110, med: 1110, max: 1110, p90: 1110, p95: 1110, rps: 0.36, status: 'PASS' },
  { id: 27, method: 'PATCH', path: '/api/v1/orders/{orderId}/status', avg: 254.7, min: 225.33, med: 254.7, max: 284.07, p90: 278.19, p95: 281.13, rps: 0.903, status: 'PASS' },
];

/** Map k6 script tag / filename stem â†’ API definition */
const SCRIPT_API_MAP = {
  'all-users-fetch': { method: 'GET', path: '/api/v1/users?outlet-code={outletCode}' },
  'login-test': { method: 'POST', path: '/api/v1/auth/login' },
  'current-user-fetch': { method: 'GET', path: '/api/v1/users/current' },
  'shop-details-fetch': { method: 'GET', path: '/api/v1/shop-info?code={outletCode}&brandId={brandId}' },
  'tables-fetch': { method: 'GET', path: '/api/v1/tables?outlet_id={shopId}&brand_id={brandId}' },
  'table-view': { method: 'GET', path: '/api/v1/tables?outlet_id={shopId}&brand_id={brandId}' },
  'active-cash-drawer-session-fetch': { method: 'GET', path: '/api/v1/cash-drawer/active-session' },
  'items-fetch': { method: 'GET', path: '/api/v1/main-menu/{mainMenuId}/categories/webshop-brand/{brandId}/shop/{shopId}' },
  'all-customers-fetch': { method: 'GET', path: '/api/v1/customers/' },
  'create-customer': { method: 'POST', path: '/api/v1/customers' },
  'update-customer': { method: 'PUT', path: '/api/v1/customers/{customerId}' },
  'incoming-order-details-created': { method: 'GET', path: '/api/v1/admin/orders/status/CREATED?franchise=1&shop={shopId}&paginate=false' },
  'accept-single-order': { method: 'POST', path: '/api/v1/accept-order/{orderId}' },
  'accept-multiple-orders-by-id': { method: 'POST', path: '/api/v1/accept-order/{orderId}' },
  'reject-incoming-order': { method: 'POST', path: '/api/v1/deny-order/{orderId}' },
  'fetch-orders-by-status': { method: 'GET', path: '/api/v1/orders?status={status}&platforms={platforms}&outlet_id={outletId}' },
  'move-to-preparing-pos': { method: 'PATCH', path: '/api/v1/orders/{orderId}/status' },
  'move-to-preparing-incoming': { method: 'POST', path: '/api/v1/preparing/{orderId}' },
  'move-to-ready-pos': { method: 'PATCH', path: '/api/v1/orders/{orderId}/status' },
  'move-to-ready-incoming': { method: 'POST', path: '/api/v1/ready-to-pickup/{orderId}' },
  'move-to-served-dispatched': { method: 'PATCH', path: '/api/v1/orders/{orderId}/status' },
  'takeaway-manual-card': { method: 'POST', path: '/api/v1/orders' },
  'takeaway-cash': { method: 'POST', path: '/api/v1/orders' },
  'takeaway-pot': { method: 'POST', path: '/api/v1/orders' },
  'dine-in-manual-card': { method: 'POST', path: '/api/v1/orders' },
  'dine-in-cash': { method: 'POST', path: '/api/v1/orders' },
  'dine-in-pay-later': { method: 'POST', path: '/api/v1/orders' },
  'delivery-manual-card': { method: 'POST', path: '/api/v1/orders' },
  'delivery-cash': { method: 'POST', path: '/api/v1/orders' },
  'delivery-pod': { method: 'POST', path: '/api/v1/orders' },
  'cancel-paid-order': { method: 'PATCH', path: '/api/v1/orders/{orderId}/refund' },
  'cancel-unpaid-order': { method: 'PATCH', path: '/api/v1/orders/{orderId}/status' },
};

/** Windows Resource Monitor snapshot (POS_UI.exe during k6 test) */
const DEFAULT_SYSTEM_MONITOR = {
  source: 'Windows Resource Monitor',
  capturedAt: '2026-05-20',
  process: {
    name: 'POS_UI.exe',
    pid: 15856,
    status: 'Running',
    threads: 45,
    cpuCurrent: 0,
    cpuAverage: 1.51,
  },
  overview: {
    cpuUsagePercent: 16,
    cpuMaxFrequencyPercent: 100,
    diskIoKBps: 157,
    diskHighestActivePercent: 2,
    networkKbps: 51,
    networkUtilPercent: 0,
    hardFaultsPerSec: 0,
    physicalMemoryUsedPercent: 68,
  },
  memory: {
    commitKB: 217088,
    workingSetKB: 371792,
    shareableKB: 189084,
    privateKB: 182708,
  },
  network: [
    { address: 'ab96c323dcc214dc1.awsglobalaccelerator.com' },
    { address: '76.223.107.159' },
    { address: 's3.eu-west-2.amazonaws.com' },
  ],
  disk: [
    { path: 'User Downloads' },
    { path: 'AppData\\Local' },
    { path: 'System logs' },
  ],
};

function getDefaultReportPayload() {
  return {
    meta: {
      title: 'DeliverGate POS',
      host: 'https://pos-go-api.delivergate.com',
      environment: 'Production',
      vus: 1,
      date: new Date().toISOString().slice(0, 10),
    },
    system: JSON.parse(JSON.stringify(DEFAULT_SYSTEM_MONITOR)),
    aggregate: {
      totalRequests: 14832,
      reqRateAvg: 49.4,
      successRate: 99.3,
      failedRequests: 103,
      avgResponseMs: 142,
      p50Ms: 118,
      p95Ms: 387,
      p99Ms: 621,
      peakMs: 1204,
      minMs: 34,
      dataReceivedMB: 218,
      dataSentMB: 4.2,
    },
    apis: DEFAULT_APIS.map((a) => ({ ...a })),
    history: [],
    updatedAt: null,
    uploadedBy: null,
  };
}

function metricVal(m, field) {
  if (!m) return null;
  if (m.values && m.values[field] != null) return m.values[field];
  return m[field] ?? null;
}

function parseK6Summary(json, hint = {}) {
  const m = json.metrics || {};
  const httpReqs = metricVal(m.http_reqs, 'count') ?? 0;
  const rate = metricVal(m.http_reqs, 'rate') ?? 0;
  const dur = m.http_req_duration;
  const avg = metricVal(dur, 'avg') ?? 0;
  const min = metricVal(dur, 'min') ?? 0;
  const med = metricVal(dur, 'med') ?? avg;
  const max = metricVal(dur, 'max') ?? avg;
  const p90 = metricVal(dur, 'p(90)') ?? med;
  const p95 = metricVal(dur, 'p(95)') ?? p90;

  const failedMetric = m.http_req_failed;
  const failRate = metricVal(failedMetric, 'rate') ?? 0;
  const failedPasses = metricVal(failedMetric, 'passes') ?? 0;
  const httpFailed = failedPasses || Math.round(httpReqs * failRate);

  const checks = m.checks;
  const checkFails = metricVal(checks, 'fails') ?? 0;
  const checkPasses = metricVal(checks, 'passes') ?? 0;
  const totalChecks = checkPasses + checkFails;

  const dataRecv = metricVal(m.data_received, 'count') ?? 0;
  const dataSent = metricVal(m.data_sent, 'count') ?? 0;

  const durationMs = json.state?.testRunDurationMs ?? 0;
  const testDurationSec = durationMs > 0 ? durationMs / 1000 : 0;

  const aggregate = {
    totalRequests: httpReqs,
    reqRateAvg: rate || (testDurationSec ? httpReqs / testDurationSec : 0),
    successRate: httpReqs ? Math.max(0, 100 - (httpFailed / httpReqs) * 100) : 100,
    failedRequests: httpFailed,
    avgResponseMs: Math.round(avg),
    p50Ms: Math.round(med),
    p95Ms: Math.round(p95),
    p99Ms: Math.round(max),
    peakMs: Math.round(max),
    minMs: Math.round(min),
    dataReceivedMB: Math.round((dataRecv / 1024 / 1024) * 10) / 10,
    dataSentMB: Math.round((dataSent / 1024 / 1024) * 10) / 10,
  };

  const apiRow = {
    method: hint.method || 'GET',
    path: hint.path || '/api/v1/unknown',
    avg,
    min,
    med,
    max,
    p90,
    p95,
    rps: rate,
    status: checkFails > 0 || httpFailed > 0 ? 'FAIL' : 'PASS',
  };

  return { aggregate, apiRow, meta: { checksPassed: checkPasses, checksFailed: checkFails, totalChecks } };
}

function normalizeScriptKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/^\d+[\s._-]*/, '')
    .replace(/[\s\[\]()]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function apiFromScriptName(scriptName) {
  const key = normalizeScriptKey(scriptName);
  return SCRIPT_API_MAP[key] || null;
}

function parseAllTestResults(arr) {
  if (!Array.isArray(arr)) throw new Error('Expected JSON array (all-test-results.json)');
  const apis = [];
  let id = 1;
  for (const run of arr) {
    let summary;
    try {
      const raw = run.rawSummary?.value ?? run.rawSummary;
      summary = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      continue;
    }
    if (!summary?.metrics) continue;
    const scriptKey = normalizeScriptKey(run.script || run.tag);
    const hint = apiFromScriptName(scriptKey) || { method: 'GET', path: `/api/v1/${scriptKey}` };
    const { apiRow } = parseK6Summary(summary, hint);
    apis.push({ id: id++, ...apiRow, script: run.script, timestamp: run.timestamp });
  }
  return { apis };
}

function parseUploadedDocument(json, filename = '') {
  if (Array.isArray(json)) {
    const { apis } = parseAllTestResults(json);
    const aggregate = buildAggregateFromApis(apis);
    return { type: 'all-test-results', apis, aggregate, filename };
  }

  if (json.apis && Array.isArray(json.apis)) {
    return {
      type: 'report-bundle',
      apis: json.apis.map((a, i) => ({ id: a.id ?? i + 1, status: a.status || 'PASS', ...a })),
      aggregate: json.aggregate || buildAggregateFromApis(json.apis),
      meta: json.meta || {},
      filename,
    };
  }

  if (json.metrics) {
    const stem = filename.replace(/\.json$/i, '').replace(/-summary$/, '');
    const hint = apiFromScriptName(stem) || {};
    const { aggregate, apiRow } = parseK6Summary(json, hint);
    return { type: 'k6-summary', aggregate, apiRow, filename, hint };
  }

  throw new Error('Unrecognized file. Upload k6 summary JSON, report bundle { apis, aggregate }, or all-test-results array.');
}

function buildAggregateFromApis(apis) {
  if (!apis?.length) return getDefaultReportPayload().aggregate;
  const n = apis.length;
  const p95s = apis.map((s) => s.p95).sort((a, b) => a - b);
  const maxs = apis.map((s) => s.max).sort((a, b) => a - b);
  const totalRps = apis.reduce((a, s) => a + (s.rps || 0), 0);
  const failed = apis.filter((a) => a.status === 'FAIL').length;
  return {
    totalRequests: Math.max(n, Math.round(totalRps * 300)),
    reqRateAvg: totalRps,
    successRate: Math.round(((n - failed) / n) * 1000) / 10,
    failedRequests: failed,
    avgResponseMs: Math.round(apis.reduce((a, s) => a + s.avg, 0) / n),
    p50Ms: Math.round(apis.reduce((a, s) => a + s.med, 0) / n),
    p95Ms: Math.round(p95s[Math.min(n - 1, Math.floor(n * 0.95))]),
    p99Ms: Math.round(maxs[Math.min(n - 1, Math.floor(n * 0.99))]),
    peakMs: Math.round(Math.max(...apis.map((s) => s.max))),
    minMs: Math.round(Math.min(...apis.map((s) => s.min))),
    dataReceivedMB: 0,
    dataSentMB: 0,
  };
}

function mergeUploadIntoPayload(current, parsed, mode = 'merge') {
  const next = {
    ...current,
    meta: { ...current.meta, ...(parsed.meta || {}) },
    history: [
      ...(current.history || []),
      { at: new Date().toISOString(), type: parsed.type, file: parsed.filename },
    ].slice(-20),
  };

  if (parsed.type === 'report-bundle' || parsed.type === 'all-test-results') {
    next.apis = parsed.apis.map((a, i) => ({ id: i + 1, ...a }));
    next.aggregate = { ...current.aggregate, ...parsed.aggregate };
    return next;
  }

  if (parsed.type === 'k6-summary') {
    next.aggregate = { ...current.aggregate, ...parsed.aggregate };
    if (mode === 'replace') {
      next.apis = [{ id: 1, ...parsed.apiRow }];
      return next;
    }
    const path = parsed.apiRow.path;
    const idx = next.apis.findIndex((a) => a.path === path && a.method === parsed.apiRow.method);
    if (idx >= 0) {
      next.apis[idx] = { ...next.apis[idx], ...parsed.apiRow, id: next.apis[idx].id };
    } else {
      next.apis.push({ id: next.apis.length + 1, ...parsed.apiRow });
    }
    return next;
  }

  return next;
}

  global.DGReportData = {
    getDefaultReportPayload,
    parseK6Summary,
    parseAllTestResults,
    parseUploadedDocument,
    buildAggregateFromApis,
    mergeUploadIntoPayload,
    apiFromScriptName,
    DEFAULT_APIS,
    SCRIPT_API_MAP,
    DEFAULT_SYSTEM_MONITOR,
  };
})(window);
