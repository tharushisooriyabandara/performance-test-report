(function () {
  let charts = { main: null, p50p95: null, dist: null, system: null };
  let payload = DGReportData.getDefaultReportPayload();
  let activePanel = 'api';

  const PANEL_META = {
    api: { title: 'API Testing', desc: 'API test results and endpoint performance' },
    system: { title: 'Monitor System Resources', desc: 'CPU, memory, and network during test runs' },
  };

  function fmtMs(v) {
    if (v >= 1000) return (v / 1000).toFixed(2) + ' s';
    return Math.round(v) + ' ms';
  }
  function fmtNum(n) { return Math.round(n).toLocaleString('en-US'); }
  function fmtMsDash(v) {
    if (v >= 1000) return (v / 1000).toFixed(2) + ' s';
    return fmtNum(v) + ' ms';
  }
  function color(v) {
    if (v < 300) return '#4ade80';
    if (v < 700) return '#fbbf24';
    return '#f87171';
  }
  function barPct(v, max) { return Math.min(100, (v / max) * 100).toFixed(1) + '%'; }
  function apiLabel(s, maxLen = 44) {
    const label = s.method + ' ' + s.path;
    return label.length > maxLen ? label.slice(0, maxLen - 1) + '…' : label;
  }
  function methodClass(m) { return m.toLowerCase(); }

  function buildDashboardSummary(list, agg) {
    const n = list.length || 1;
    const failed = list.filter((a) => a.status === 'FAIL').length;
    return {
      totalRequests: agg.totalRequests ?? n,
      reqRateAvg: agg.reqRateAvg ?? 0,
      successRate: agg.successRate ?? (n ? ((n - failed) / n) * 100 : 100),
      failedRequests: agg.failedRequests ?? failed,
      avgResponseMs: agg.avgResponseMs ?? 0,
      p50Ms: agg.p50Ms ?? 0,
      p95Ms: agg.p95Ms ?? 0,
      p99Ms: agg.p99Ms ?? 0,
      peakMs: agg.peakMs ?? 0,
      minMs: agg.minMs ?? 0,
      dataReceivedMB: agg.dataReceivedMB ?? 0,
      dataSentMB: agg.dataSentMB ?? 0,
    };
  }

  function renderK6Dashboard(d) {
    const el = document.getElementById('k6Dashboard');
    if (!el) return;
    const successClass = d.successRate >= 99 ? 'green' : d.successRate >= 95 ? 'amber' : 'red';
    const cards = [
      { label: 'total requests', value: fmtNum(d.totalRequests), sub: `${Number(d.reqRateAvg).toFixed(1)} req/s avg`, accent: 'accent-blue' },
      { label: 'success rate', value: `${Number(d.successRate).toFixed(1)}%`, sub: `${fmtNum(d.failedRequests)} failed`, accent: 'accent-green', valueClass: successClass },
      { label: 'avg response', value: fmtMsDash(d.avgResponseMs), sub: `p50: ${fmtMsDash(d.p50Ms)}`, accent: 'accent-teal' },
      { label: 'p95 response', value: fmtMsDash(d.p95Ms), sub: `p99: ${fmtMsDash(d.p99Ms)}`, accent: 'accent-amber', valueClass: d.p95Ms > 600 ? 'amber' : '' },
      { label: 'peak response', value: fmtMsDash(d.peakMs), sub: `min: ${fmtMsDash(d.minMs)}`, accent: 'accent-amber', valueClass: d.peakMs > 1000 ? 'amber' : '' },
      { label: 'data received', value: `${d.dataReceivedMB} MB`, sub: `sent: ${d.dataSentMB} MB`, accent: 'accent-blue' },
    ];
    el.innerHTML = cards.map((c) => `
    <div class="dash-card ${c.accent}">
      <div class="dash-label">${c.label}</div>
      <div class="dash-value ${c.valueClass || ''}">${c.value}</div>
      <div class="dash-sub">${c.sub}</div>
    </div>
  `).join('');
  }

  function updateMeta(payload) {
    const { meta, apis, aggregate } = payload;
    const failed = apis.filter((a) => a.status === 'FAIL').length;
    const host = meta.host || 'pos-go-api.delivergate.com';
    const hostShort = host.replace(/^https?:\/\//, '');

    document.getElementById('topBarHost').textContent = hostShort;
    document.getElementById('topBarDate').textContent = meta.date || '—';
    document.getElementById('topBarVus').textContent = `VUs: ${meta.vus ?? 1}`;

    document.getElementById('heroTag').textContent = `k6 · Performance Test · ${meta.environment || 'Production'}`;
    const heroSpan = document.getElementById('heroTitleSpan');
    if (heroSpan) heroSpan.textContent = meta.title || 'DeliverGate POS';
    document.getElementById('heroSub').innerHTML =
      `${host} &nbsp;·&nbsp; ${apis.length} APIs &nbsp;·&nbsp; ${failed} Failures`;

    const pills = document.getElementById('heroPills');
    pills.innerHTML = `
    <span class="pill pass"><span class="dot2"></span>${apis.length - failed} APIs passed</span>
    <span class="pill ${failed ? '' : 'pass'}"><span class="dot2"></span>${failed} failed</span>
    <span class="pill"><span class="dot2"></span>${meta.vus ?? 1} Virtual User(s)</span>
  `;

    document.getElementById('apiCount').textContent = apis.length;
    document.getElementById('fastApiCount').textContent = apis.filter((s) => s.avg < 300).length;
    document.getElementById('slowApiCount').textContent = apis.filter((s) => s.avg > 600).length;

    const footerHost = document.getElementById('footerHost');
    if (footerHost) footerHost.textContent = hostShort;
    const footerDate = document.getElementById('footerDate');
    if (footerDate) footerDate.textContent = meta.date || new Date().toISOString().slice(0, 10);
  }

  function renderTable(apis) {
    const tbody = document.getElementById('scenarioBody');
    tbody.innerHTML = '';
    const maxAvg = Math.max(...apis.map((s) => s.avg), 1);
    apis.forEach((s) => {
      const c = color(s.avg);
      const statusHtml =
        s.status === 'FAIL'
          ? '<span class="status-fail">FAIL</span>'
          : '<span class="status-ok"><span class="status-dot"></span>PASS</span>';
      const row = document.createElement('tr');
      row.innerHTML = `
      <td class="scenario-num">${String(s.id).padStart(2, '0')}</td>
      <td class="api-cell"><div class="api-row"><span class="api-method ${methodClass(s.method)}">${s.method}</span><span class="api-path">${s.path}</span></div></td>
      <td class="center mono" style="color:${c}">${fmtMs(s.avg)}</td>
      <td class="center mono" style="color:var(--muted)">${fmtMs(s.min)}</td>
      <td class="center mono">${fmtMs(s.med)}</td>
      <td class="center mono" style="color:${color(s.max)}">${fmtMs(s.max)}</td>
      <td class="center mono">${fmtMs(s.p90)}</td>
      <td class="center mono">${fmtMs(s.p95)}</td>
      <td class="center mono" style="color:var(--muted)">${(s.rps || 0).toFixed(3)}</td>
      <td class="center">${statusHtml}</td>
      <td class="center"><div class="bar-wrap"><div class="bar-track"><div class="bar-fill" style="width:${barPct(s.avg, maxAvg)};background:${c}"></div></div></div></td>`;
      tbody.appendChild(row);
    });
  }

  function destroyCharts() {
    Object.keys(charts).forEach((k) => {
      if (charts[k]) {
        charts[k].destroy();
        charts[k] = null;
      }
    });
  }

  function renderCharts(apis) {
    destroyCharts();
    const sorted = [...apis].sort((a, b) => b.avg - a.avg).slice(0, 18);
    charts.main = new Chart(document.getElementById('mainChart'), {
      type: 'bar',
      data: {
        labels: sorted.map((s) => apiLabel(s, 40)),
        datasets: [{
          label: 'Avg Response (ms)',
          data: sorted.map((s) => Math.round(s.avg)),
          backgroundColor: sorted.map((s) => color(s.avg) + 'cc'),
          borderColor: sorted.map((s) => color(s.avg)),
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => apiLabel(sorted[items[0].dataIndex], 80),
              label: (ctx) => ' Avg: ' + fmtMs(ctx.raw),
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#666',
              font: { size: 11 },
              callback: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + 's' : v + 'ms'),
            },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          y: { ticks: { color: '#aaa', font: { size: 11, family: 'DM Mono' } }, grid: { display: false } },
        },
      },
    });

    const keyS = sorted.length >= 6 ? [apis[1], apis[6], apis[7], apis[10], apis[11], apis[24]].filter(Boolean) : apis.slice(0, 6);
    charts.p50p95 = new Chart(document.getElementById('p50p95Chart'), {
      type: 'bar',
      data: {
        labels: keyS.map((s) => apiLabel(s, 28)),
        datasets: [
          { label: 'p50', data: keyS.map((s) => Math.round(s.med)), backgroundColor: 'rgba(96,165,250,0.7)', borderRadius: 3 },
          { label: 'p95', data: keyS.map((s) => Math.round(s.p95)), backgroundColor: 'rgba(251,191,36,0.7)', borderRadius: 3 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#888', font: { size: 11 } } },
          tooltip: {
            callbacks: {
              title: (items) => apiLabel(keyS[items[0].dataIndex], 80),
              label: (ctx) => ' ' + ctx.dataset.label + ': ' + fmtMs(ctx.raw),
            },
          },
        },
        scales: {
          x: { ticks: { color: '#666', font: { size: 10, family: 'DM Mono' } }, grid: { display: false } },
          y: {
            ticks: { color: '#666', font: { size: 11 }, callback: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + 's' : v + 'ms') },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
        },
      },
    });

    const fast = apis.filter((s) => s.avg < 300).length;
    const med = apis.filter((s) => s.avg >= 300 && s.avg <= 600).length;
    const slow = apis.filter((s) => s.avg > 600).length;
    charts.dist = new Chart(document.getElementById('distChart'), {
      type: 'doughnut',
      data: {
        labels: ['Fast <300ms', 'Medium 300–600ms', 'Slow >600ms'],
        datasets: [{
          data: [fast, med, slow],
          backgroundColor: ['rgba(74,222,128,0.8)', 'rgba(251,191,36,0.8)', 'rgba(248,113,113,0.8)'],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } },
    });

    const leg = document.getElementById('distLegend');
    if (leg) {
      leg.innerHTML = `
      <span style="display:flex;align-items:center;gap:5px;"><span style="width:10px;height:10px;border-radius:2px;background:#4ade80;display:inline-block"></span>Fast &lt;300ms (${fast})</span>
      <span style="display:flex;align-items:center;gap:5px;"><span style="width:10px;height:10px;border-radius:2px;background:#fbbf24;display:inline-block"></span>Medium 300–600ms (${med})</span>
      <span style="display:flex;align-items:center;gap:5px;"><span style="width:10px;height:10px;border-radius:2px;background:#f87171;display:inline-block"></span>Slow &gt;600ms (${slow})</span>`;
    }
  }

  function renderSystemPanel(data) {
    const { meta, aggregate } = data;
    const agg = aggregate || {};
    const dashEl = document.getElementById('systemDashboard');
    if (!dashEl) return;

    const recv = agg.dataReceivedMB ?? 0;
    const sent = agg.dataSentMB ?? 0;
    const reqRate = agg.reqRateAvg ?? 0;
    const vus = meta?.vus ?? 1;

    const cards = [
      { label: 'virtual users', value: String(vus), sub: 'Concurrent load', accent: 'accent-teal' },
      { label: 'request rate', value: `${Number(reqRate).toFixed(1)} req/s`, sub: 'Average throughput', accent: 'accent-blue' },
      { label: 'data received', value: `${recv} MB`, sub: `sent: ${sent} MB`, accent: 'accent-green' },
      { label: 'total requests', value: fmtNum(agg.totalRequests ?? 0), sub: `${Number(agg.successRate ?? 100).toFixed(1)}% success`, accent: 'accent-blue' },
    ];
    dashEl.innerHTML = cards.map((c) => `
    <div class="dash-card ${c.accent}">
      <div class="dash-label">${c.label}</div>
      <div class="dash-value">${c.value}</div>
      <div class="dash-sub">${c.sub}</div>
    </div>
  `).join('');

    const grid = document.getElementById('systemMetricsGrid');
    if (grid) {
      grid.innerHTML = `
      <div class="metric-card blue">
        <div class="metric-label">Throughput</div>
        <div class="metric-value">${Number(reqRate).toFixed(2)}</div>
        <div class="metric-sub">req/s average</div>
      </div>
      <div class="metric-card green">
        <div class="metric-label">Data in</div>
        <div class="metric-value" style="color:var(--green)">${recv} MB</div>
        <div class="metric-sub">k6 data_received</div>
      </div>
      <div class="metric-card amber">
        <div class="metric-label">Data out</div>
        <div class="metric-value" style="color:var(--amber)">${sent} MB</div>
        <div class="metric-sub">k6 data_sent</div>
      </div>
    `;
    }

    const canvas = document.getElementById('systemChart');
    if (!canvas) return;
    if (charts.system) {
      charts.system.destroy();
      charts.system = null;
    }
    charts.system = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Data received (MB)', 'Data sent (MB)'],
        datasets: [{
          label: 'MB',
          data: [recv, sent],
          backgroundColor: ['rgba(96,165,250,0.75)', 'rgba(74,222,128,0.75)'],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: '#666' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#aaa' }, grid: { display: false } },
        },
      },
    });
  }

  function switchPanel(panelId) {
    activePanel = panelId;
    document.querySelectorAll('.nav-item[data-panel]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.panel === panelId);
    });
    document.querySelectorAll('.content-panel').forEach((el) => {
      el.classList.toggle('active', el.id === `panel-${panelId}`);
    });

    const meta = PANEL_META[panelId] || PANEL_META.api;
    const titleEl = document.getElementById('pageTitle');
    const descEl = document.getElementById('pageDesc');
    if (titleEl) titleEl.textContent = meta.title;
    if (descEl) descEl.textContent = meta.desc;

    if (panelId === 'api') {
      requestAnimationFrame(() => {
        Object.values(charts).forEach((c) => c?.resize?.());
      });
    }
    if (panelId === 'system' && charts.system) {
      requestAnimationFrame(() => charts.system?.resize?.());
    }

    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }

  function setupSidebar() {
    document.querySelectorAll('.nav-item[data-panel]').forEach((btn) => {
      btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
    });

    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
    });

    switchPanel(activePanel);
  }

  function renderAll(data) {
    payload = data;
    const apis = payload.apis;
    const dash = buildDashboardSummary(apis, payload.aggregate);
    renderK6Dashboard(dash);
    updateMeta(payload);
    renderTable(apis);
    renderCharts(apis);
    renderSystemPanel(payload);
  }

  setupSidebar();
  renderAll(payload);
})();
