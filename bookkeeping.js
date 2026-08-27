// ========== 德州扑克记账模块 ==========
// 集成到 york 仓库，元素ID统一加 bk 前缀

(function() {
  'use strict';

  // ========== 数据存储 ==========
  const BOOK_KEY = 'york_poker_bookkeeping';
  let bookData = loadBookData();
  let editingId = null;
  let currentResult = 'win';
  let selectedBlind = '';
  let selectedTags = [];
  let currentGroupBy = 'blind';
  let chartMode = 'trend';
  let lastParsed = [];
  let lastMode = 'text';
  let lastTable = null;
  let checkedSet = new Set();
  let recordListLimit = 10;
  let recordListStep = 10;

  function loadBookData() {
    try {
      const d = JSON.parse(localStorage.getItem(BOOK_KEY));
      if (d && d.records) return d;
    } catch(e) {}
    return {
      records: [],
      blinds: ['1/2', '0.5/1', '1/3', '2/5', '5/10'],
      tags: ['线上', '线下']
    };
  }
  function saveBookData() {
    localStorage.setItem(BOOK_KEY, JSON.stringify(bookData));
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function formatLocalDate(d = new Date()) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  function formatDurationText(v) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? `${Math.round(n * 100) / 100}h` : '—';
  }

  // ========== 模式切换（集成到 york 的 mode-selector） ==========
  function initModeSwitch() {
    const bkBtn = document.getElementById('bookkeepingModeButton');
    const bkWorkspace = document.getElementById('bookkeepingWorkspace');
    if (!bkBtn || !bkWorkspace) return;

    // 拦截记账按钮点击
    bkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      switchToBookkeeping();
    });

    // 监听其他mode按钮点击，隐藏记账，恢复保险界面
    document.querySelectorAll('.mode-button').forEach(btn => {
      if (btn.id === 'bookkeepingModeButton') return;
      btn.addEventListener('click', () => {
        const bkWs = document.getElementById('bookkeepingWorkspace');
        if (bkWs.style.display === 'flex' || !bkWs.classList.contains('is-hidden')) {
          // 隐藏记账面板
          bkWs.style.display = '';
          bkWs.classList.add('is-hidden');
          bkBtn.classList.remove('is-active');
          bkBtn.setAttribute('aria-selected', 'false');
          // 恢复保险面板的display（清除inline style，让CSS的is-hidden类生效）
          const restoreIds = ['handPanel', 'doubleWorkspace', 'callWorkspace', 'sidePotPanel'];
          restoreIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.display = ''; }
          });
          // 恢复 pool-mode-row 和 rule-note
          const poolRow = document.querySelector('.pool-mode-row');
          if (poolRow) poolRow.style.display = '';
          const ruleNote = document.querySelector('.rule-note');
          if (ruleNote) ruleNote.style.display = '';
        }
      });
    });
  }

  function switchToBookkeeping() {
    const bkBtn = document.getElementById('bookkeepingModeButton');
    const bkWorkspace = document.getElementById('bookkeepingWorkspace');

    // 隐藏所有保险相关面板（直接用style.display，确保可靠隐藏）
    const hideIds = ['handPanel', 'doubleWorkspace', 'callWorkspace', 'sidePotPanel'];
    hideIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.display = 'none'; }
    });

    // 隐藏 pool-mode-row 和 rule-note
    const poolRow = document.querySelector('.pool-mode-row');
    if (poolRow) poolRow.style.display = 'none';
    const ruleNote = document.querySelector('.rule-note');
    if (ruleNote) ruleNote.style.display = 'none';

    // 显示记账面板
    bkWorkspace.style.display = 'flex';
    bkWorkspace.classList.remove('is-hidden');

    // 更新按钮状态
    document.querySelectorAll('.mode-button').forEach(btn => {
      const active = btn.id === 'bookkeepingModeButton';
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    renderAll();
  }

  // 当从记账切回保险时，恢复pool-mode-row
  function restorePoolModeRow() {
    const poolRow = document.querySelector('.pool-mode-row');
    if (poolRow) poolRow.style.display = '';
  }

  // ========== 统计 ==========
  function calcStats(records) {
    let sessions = records.length;
    let hours = 0, profit = 0;
    records.forEach(r => {
      hours += r.duration || 0;
      profit += r.result === 'win' ? r.amount : -r.amount;
    });
    hours = Math.round(hours * 100) / 100;
    const hourly = hours > 0 ? Math.round(profit / hours * 100) / 100 : 0;
    return { sessions, hours, profit, hourly };
  }

  function renderStats(records) {
    const s = calcStats(records);
    document.getElementById('bkStatSessions').textContent = s.sessions;
    document.getElementById('bkStatHours').textContent = s.hours + 'h';
    const profitEl = document.getElementById('bkStatProfit');
    profitEl.textContent = (s.profit >= 0 ? '+' : '') + s.profit;
    profitEl.className = 'bk-stat-value ' + (s.profit >= 0 ? 'bk-positive' : 'bk-negative');
    const hourlyEl = document.getElementById('bkStatHourly');
    hourlyEl.textContent = (s.hourly >= 0 ? '+' : '') + s.hourly;
    hourlyEl.className = 'bk-stat-value ' + (s.hourly >= 0 ? 'bk-positive' : 'bk-negative');
    const wins = records.filter(r => r.result === 'win').length;
    const winRate = s.sessions > 0 ? Math.round(wins / s.sessions * 100) : 0;
    const avg = s.sessions > 0 ? Math.round(s.profit / s.sessions * 100) / 100 : 0;
    const wrEl = document.getElementById('bkStatWinRate');
    wrEl.textContent = winRate + '%';
    wrEl.className = 'bk-stat-value ' + (winRate >= 50 ? 'bk-positive' : 'bk-negative');
    const avgEl = document.getElementById('bkStatAvg');
    avgEl.textContent = (avg >= 0 ? '+' : '') + avg;
    avgEl.className = 'bk-stat-value ' + (avg >= 0 ? 'bk-positive' : 'bk-negative');
  }

  // ========== 筛选器 ==========
  function renderFilters() {
    const records = bookData.records;
    const yearSel = document.getElementById('bkFilterYear');
    const monthSel = document.getElementById('bkFilterMonth');
    const daySel = document.getElementById('bkFilterDay');
    const years = [...new Set(records.map(r => r.date.substring(0, 4)))].sort().reverse();
    const curYear = yearSel.value;
    yearSel.innerHTML = '<option value="">全部年份</option>' + years.map(y => `<option value="${y}">${y}年</option>`).join('');
    if (years.includes(curYear)) yearSel.value = curYear;
    const yearFilter = yearSel.value;
    const monthSource = yearFilter ? records.filter(r => r.date.startsWith(yearFilter)) : records;
    const months = [...new Set(monthSource.map(r => r.date.substring(0, 7)))].sort().reverse();
    const curMonth = monthSel.value;
    monthSel.innerHTML = '<option value="">全部月份</option>' + months.map(m => `<option value="${m}">${parseInt(m.substring(5), 10)}月</option>`).join('');
    if (months.includes(curMonth)) monthSel.value = curMonth; else monthSel.value = '';
    const monthFilter = monthSel.value;
    const daySource = monthFilter ? records.filter(r => r.date.startsWith(monthFilter)) : (yearFilter ? records.filter(r => r.date.startsWith(yearFilter)) : records);
    const days = [...new Set(daySource.map(r => r.date))].sort().reverse();
    const curDay = daySel.value;
    daySel.innerHTML = '<option value="">全部日期</option>' + days.map(d => `<option value="${d}">${parseInt(d.substring(8), 10)}日</option>`).join('');
    if (days.includes(curDay)) daySel.value = curDay; else daySel.value = '';
    const tagSel = document.getElementById('bkFilterTag');
    const curTag = tagSel.value;
    tagSel.innerHTML = '<option value="">全部标签</option>' + bookData.tags.map(t => `<option value="${t}">${t}</option>`).join('');
    if (bookData.tags.includes(curTag)) tagSel.value = curTag;
    const blindSel = document.getElementById('bkFilterBlind');
    const curBlind = blindSel.value;
    blindSel.innerHTML = '<option value="">全部盲注</option>' + bookData.blinds.map(b => `<option value="${b}">${b}</option>`).join('');
    if (bookData.blinds.includes(curBlind)) blindSel.value = curBlind;
  }

  function getFilteredRecords() {
    const year = document.getElementById('bkFilterYear').value;
    const month = document.getElementById('bkFilterMonth').value;
    const day = document.getElementById('bkFilterDay').value;
    const tag = document.getElementById('bkFilterTag').value;
    const blind = document.getElementById('bkFilterBlind').value;
    return bookData.records.filter(r => {
      if (year && !r.date.startsWith(year)) return false;
      if (month && !r.date.startsWith(month)) return false;
      if (day && r.date !== day) return false;
      if (tag && !(r.tags || []).includes(tag)) return false;
      if (blind && r.blind !== blind) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id)));
  }

  function getListVisibleRecords(records) {
    if (recordListLimit < 0 || records.length <= recordListLimit) return records;
    return records.slice(0, recordListLimit);
  }

  // ========== 峰值排行 ==========
  function getPeakRecords(records, type, n = 5) {
    return [...records]
      .filter(r => type === 'win' ? r.result === 'win' : r.result === 'lose')
      .sort((a, b) => (type === 'win' ? b.amount - a.amount : b.amount - a.amount) || b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id)))
      .slice(0, n);
  }

  function renderPeakLists(records) {
    const winEl = document.getElementById('bkPeakListWin');
    const loseEl = document.getElementById('bkPeakListLose');
    const wins = getPeakRecords(records, 'win', 5);
    const loses = getPeakRecords(records, 'lose', 5);
    const renderOne = (title, arr, cls) => {
      if (arr.length === 0) return '<div class="bk-empty">暂无数据</div>';
      return `<div class="bk-peak-title">${title}</div>` + arr.map((r, i) => {
        const meta = [r.date, r.blind, formatDurationText(r.duration), (r.tags || []).join('/') || '', r.note || ''].filter(Boolean).join(' · ');
        return `<div class="bk-peak-item"><span>#${i + 1}</span><span class="bk-money ${cls}">${cls === 'bk-pos' ? '+' : '-'}${r.amount}</span><div>${meta}</div></div>`;
      }).join('');
    };
    loseEl.innerHTML = renderOne('输最多前5局', loses, 'bk-neg');
    winEl.innerHTML = renderOne('赢最多前5局', wins, 'bk-pos');
  }

  // ========== 记录列表 ==========
  function renderRecords() {
    renderFilters();
    const records = getFilteredRecords();
    const listEl = document.getElementById('bkRecordList');
    document.getElementById('bkRecordCount').textContent = records.length + ' 条';
    if (records.length === 0) {
      listEl.innerHTML = '<div class="bk-empty">暂无记录，点上方"记一笔"开始</div>';
      document.getElementById('bkListControls').innerHTML = '';
      document.getElementById('bkPeakListWin').innerHTML = '<div class="bk-empty">暂无数据</div>';
      document.getElementById('bkPeakListLose').innerHTML = '<div class="bk-empty">暂无数据</div>';
      renderBookkeepingAnalytics(bookData.records);
      return;
    }
    const visible = getListVisibleRecords(records);
    const moreLeft = records.length - visible.length;
    const controls = [];
    if (recordListLimit >= 0 && records.length > recordListLimit) {
      controls.push(`<button class="bk-mini-btn ${recordListLimit === 10 ? 'is-active' : ''}" data-limit="10">最近10条</button>`);
      controls.push(`<button class="bk-mini-btn" data-action="more">更多10条</button>`);
      controls.push(`<button class="bk-mini-btn ${recordListLimit < 0 ? 'is-active' : ''}" data-action="all">加载全部</button>`);
      controls.push(`<span class="bk-hint">当前显示 ${visible.length} / ${records.length} 条${moreLeft > 0 ? `，还可看 ${moreLeft} 条` : ''}</span>`);
    }
    document.getElementById('bkListControls').innerHTML = controls.join('');
    renderBookkeepingAnalytics(records);
    listEl.innerHTML = visible.map(r => {
      const cls = r.result === 'win' ? 'bk-win' : 'bk-lose';
      const sign = r.result === 'win' ? '+' : '-';
      const meta = [r.blind, formatDurationText(r.duration), (r.tags || []).join(' '), r.note].filter(Boolean).join(' · ');
      return `<div class="bk-record-item">
        <span class="bk-record-date">${r.date.substring(5)}</span>
        <div class="bk-record-info"><div class="bk-record-blinds">${meta}</div></div>
        <span class="bk-record-amount ${cls}">${sign}${r.amount}</span>
        <button class="bk-record-edit" data-edit="${r.id}" type="button">✎</button>
        <button class="bk-record-del" data-del="${r.id}" type="button">×</button>
      </div>`;
    }).join('');
    renderStats(records);
    renderPeakLists(records);
  }

  function renderAll() {
    renderFilters();
    recordListLimit = 10;
    renderRecords();
  }

  // ========== 分组统计 & 图表 ==========
  function renderBookkeepingAnalytics(records) {
    renderGroupStats(records);
    renderCharts(records);
  }

  function aggregateGroups(records, key) {
    const map = {};
    records.forEach(r => {
      const vals = key === 'blind' ? [r.blind] : (r.tags || []);
      vals.forEach(g => {
        if (!g) return;
        if (!map[g]) map[g] = { name: g, profit: 0, n: 0, wins: 0 };
        map[g].profit += r.result === 'win' ? r.amount : -r.amount;
        map[g].n++;
        if (r.result === 'win') map[g].wins++;
      });
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }

  function renderGroupStats(records) {
    const el = document.getElementById('bkGroupStats');
    const groups = aggregateGroups(records, currentGroupBy);
    if (groups.length === 0) { el.innerHTML = '<div class="bk-empty">暂无数据</div>'; return; }
    const maxAbs = Math.max(...groups.map(g => Math.abs(g.profit)), 1);
    el.innerHTML = groups.map(g => {
      const w = Math.max(4, Math.round(Math.abs(g.profit) / maxAbs * 100));
      const cls = g.profit >= 0 ? 'bk-pos' : 'bk-neg';
      const sign = g.profit >= 0 ? '+' : '';
      const wr = g.n > 0 ? Math.round(g.wins / g.n * 100) : 0;
      return `<div class="bk-group-row">
        <span class="bk-group-name">${g.name}</span>
        <div class="bk-group-bar-wrap"><div class="bk-group-bar ${cls}" style="width:${w}%"></div></div>
        <span class="bk-group-meta"><b class="${cls}">${sign}${g.profit}</b> · ${g.n}场 · ${wr}%</span>
      </div>`;
    }).join('');
  }

  function renderCharts(records) {
    const box = document.getElementById('bkChartBox');
    box.innerHTML = chartMode === 'trend' ? buildTrendSVG(records) : buildGroupBarSVG(records, currentGroupBy);
  }

  function buildTrendSVG(records) {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length === 0) return '<div class="bk-empty">暂无数据</div>';
    let cum = 0;
    const pts = sorted.map(r => { cum += (r.result === 'win' ? r.amount : -r.amount); return cum; });
    const W = 320, H = 150, padL = 36, padR = 12, padT = 12, padB = 20;
    const maxV = Math.max(...pts, 0), minV = Math.min(...pts, 0);
    const range = (maxV - minV) || 1;
    const innerW = W - padL - padR, innerH = H - padT - padB;
    const x = i => padL + (pts.length === 1 ? innerW / 2 : i / (pts.length - 1) * innerW);
    const y = v => padT + (maxV - v) / range * innerH;
    const zeroY = y(0);
    const poly = pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const lastV = pts[pts.length - 1];
    const lastCls = lastV >= 0 ? '#27ae60' : '#e74c3c';
    const areaPts = `${padL},${zeroY.toFixed(1)} ${poly} ${(x(pts.length - 1)).toFixed(1)},${zeroY.toFixed(1)}`;
    return `<svg class="bk-chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <line x1="${padL}" y1="${zeroY.toFixed(1)}" x2="${W - padR}" y2="${zeroY.toFixed(1)}" stroke="#5a7a68" stroke-width="1" stroke-dasharray="3 3"/>
      <polygon points="${areaPts}" fill="${lastCls}" opacity="0.12"/>
      <polyline points="${poly}" fill="none" stroke="#f0c674" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${pts.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.5" fill="#f0c674"/>`).join('')}
      <text x="${(x(pts.length - 1)).toFixed(1)}" y="${(y(lastV) - 6).toFixed(1)}" fill="${lastCls}" font-size="10" text-anchor="end" font-weight="700">${lastV >= 0 ? '+' : ''}${lastV}</text>
    </svg><div class="bk-chart-legend">累计盈亏走势（按日期，共 ${pts.length} 笔）</div>`;
  }

  function buildGroupBarSVG(records, key) {
    const groups = aggregateGroups(records, key);
    if (groups.length === 0) return '<div class="bk-empty">暂无数据</div>';
    const W = 320, H = 150, padL = 36, padR = 12, padT = 14, padB = 30;
    const maxAbs = Math.max(...groups.map(g => Math.abs(g.profit)), 1);
    const innerH = H - padT - padB;
    const yZero = padT + innerH / 2;
    const scale = innerH / 2 / maxAbs;
    const n = groups.length;
    const bw = Math.min(44, (W - padL - padR) / n - 8);
    const gap = (W - padL - padR - bw * n) / (n + 1);
    let bars = '';
    groups.forEach((g, i) => {
      const h = Math.abs(g.profit) * scale;
      const x = padL + gap + i * (bw + gap);
      const top = g.profit >= 0 ? yZero - h : yZero;
      const fill = g.profit >= 0 ? '#27ae60' : '#e74c3c';
      bars += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, h).toFixed(1)}" rx="3" fill="${fill}"/>`;
      const label = g.name.length > 5 ? g.name.slice(0, 5) : g.name;
      bars += `<text x="${(x + bw / 2).toFixed(1)}" y="${(H - 12).toFixed(1)}" fill="#8fb89a" font-size="9" text-anchor="middle">${label}</text>`;
      bars += `<text x="${(x + bw / 2).toFixed(1)}" y="${(top - 3).toFixed(1)}" fill="${fill}" font-size="9" text-anchor="middle">${g.profit >= 0 ? '+' : ''}${g.profit}</text>`;
    });
    return `<svg class="bk-chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <line x1="${padL}" y1="${yZero.toFixed(1)}" x2="${W - padR}" y2="${yZero.toFixed(1)}" stroke="#5a7a68" stroke-width="1" stroke-dasharray="3 3"/>
      ${bars}
    </svg><div class="bk-chart-legend">各${key === 'blind' ? '盲注级别' : '标签'}盈亏对比</div>`;
  }

  // ========== 记一笔表单 ==========
  function openRecordForm(id) {
    editingId = id || null;
    currentResult = 'win';
    selectedBlind = bookData.blinds[0] || '';
    selectedTags = [];
    if (id) {
      const r = bookData.records.find(x => x.id === id);
      if (r) {
        currentResult = r.result;
        selectedBlind = r.blind;
        selectedTags = [...(r.tags || [])];
        document.getElementById('bkRecAmount').value = r.amount;
        document.getElementById('bkRecDuration').value = (r.duration == null ? '' : r.duration);
        document.getElementById('bkRecDate').value = r.date;
        document.getElementById('bkRecNote').value = r.note || '';
        document.getElementById('bkRecordFormTitle').textContent = '编辑记录';
      }
    } else {
      document.getElementById('bkRecAmount').value = '';
      document.getElementById('bkRecDuration').value = '';
      document.getElementById('bkRecDate').value = formatLocalDate();
      document.getElementById('bkRecNote').value = '';
      document.getElementById('bkRecordFormTitle').textContent = '记一笔';
    }
    setResult(currentResult);
    renderBlindSelect();
    renderTagSelect();
    document.getElementById('bkRecordOverlay').classList.remove('is-hidden');
  }

  function closeRecordForm() {
    document.getElementById('bkRecordOverlay').classList.add('is-hidden');
  }

  function setResult(r) {
    currentResult = r;
    document.getElementById('bkBtnWin').classList.toggle('is-active', r === 'win');
    document.getElementById('bkBtnLose').classList.toggle('is-active', r === 'lose');
  }

  function renderBlindSelect() {
    const el = document.getElementById('bkBlindSelect');
    el.innerHTML = bookData.blinds.map(b =>
      `<span class="bk-option-chip ${b === selectedBlind ? 'is-active' : ''}" data-blind="${b}">${b}</span>`
    ).join('');
  }

  function renderTagSelect() {
    const el = document.getElementById('bkTagSelect');
    el.innerHTML = bookData.tags.map(t =>
      `<span class="bk-option-chip ${selectedTags.includes(t) ? 'is-active' : ''}" data-tag="${t}">${t}</span>`
    ).join('');
  }

  function saveRecord() {
    const amount = parseFloat(document.getElementById('bkRecAmount').value);
    const rawDuration = document.getElementById('bkRecDuration').value;
    const duration = rawDuration === '' ? null : parseFloat(rawDuration);
    const date = document.getElementById('bkRecDate').value;
    const note = document.getElementById('bkRecNote').value.trim();
    if (!amount || amount <= 0) { alert('请输入金额'); return; }
    if (!date) { alert('请选择日期'); return; }
    if (!selectedBlind) { alert('请选择盲注级别'); return; }
    const record = {
      id: editingId || (Date.now() + '_' + Math.random().toString(36).slice(2, 8)),
      date, result: currentResult, amount,
      duration: Number.isFinite(duration) ? duration : null,
      blind: selectedBlind, tags: [...selectedTags], note
    };
    if (editingId) {
      const idx = bookData.records.findIndex(r => r.id === editingId);
      if (idx >= 0) bookData.records[idx] = record;
    } else {
      bookData.records.push(record);
    }
    saveBookData();
    closeRecordForm();
    renderAll();
  }

  // ========== 盲注管理 ==========
  function openBlindManager() {
    renderBlindList();
    document.getElementById('bkBlindOverlay').classList.remove('is-hidden');
  }
  function closeBlindManager() {
    document.getElementById('bkBlindOverlay').classList.add('is-hidden');
    document.getElementById('bkNewBlind').value = '';
  }
  function renderBlindList() {
    const el = document.getElementById('bkBlindList');
    el.innerHTML = bookData.blinds.map(b =>
      `<div class="bk-option-list-item"><span>${b}</span><button data-rmblind="${b}" type="button">×</button></div>`
    ).join('');
  }
  function addBlind() {
    const input = document.getElementById('bkNewBlind');
    const val = input.value.trim();
    if (!val) return;
    if (bookData.blinds.includes(val)) { alert('该盲注已存在'); return; }
    bookData.blinds.push(val);
    saveBookData();
    input.value = '';
    renderBlindList();
    renderBlindSelect();
  }
  function removeBlind(b) {
    bookData.blinds = bookData.blinds.filter(x => x !== b);
    if (selectedBlind === b) selectedBlind = bookData.blinds[0] || '';
    saveBookData();
    renderBlindList();
    renderBlindSelect();
  }

  // ========== 数据导出/导入/清空 ==========
  function exportData() {
    const blob = new Blob([JSON.stringify(bookData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poker-bookkeeping-' + new Date().toISOString().substring(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearAllData() {
    if (!confirm('确定清空所有记账数据？此操作不可恢复！')) return;
    if (!confirm('再次确认：真的要删除全部记录吗？')) return;
    bookData = { records: [], blinds: bookData.blinds, tags: bookData.tags };
    saveBookData();
    renderAll();
  }

  // ========== 导入（Excel/CSV/粘贴） ==========
  function openImport() {
    document.getElementById('bkPasteInput').value = '';
    document.getElementById('bkPastePreview').innerHTML = '';
    document.getElementById('bkImportFileName').textContent = '';
    const fi = document.getElementById('bkImportFileInput');
    if (fi) fi.value = '';
    lastParsed = [];
    lastMode = 'text';
    lastTable = null;
    checkedSet = new Set();
    document.getElementById('bkImportOverlay').classList.remove('is-hidden');
  }
  function closeImport() {
    document.getElementById('bkImportOverlay').classList.add('is-hidden');
  }

  function detectDelimiter(firstLine) {
    const cands = ['\t', ',', ';', '|'];
    let best = '', bestN = 0;
    cands.forEach(d => {
      const n = firstLine.split(d).length - 1;
      if (n > bestN) { bestN = n; best = d; }
    });
    return best;
  }

  function autoMapCols(headers) {
    const find = (kws) => {
      for (let i = 0; i < headers.length; i++) {
        const h = (headers[i] || '').toLowerCase();
        if (kws.some(k => h.includes(k))) return i;
      }
      return -1;
    };
    return {
      date: find(['交易时间', '记账日期', '日期', '时间', '记账', 'date', '创建']),
      sign: find(['收/支', '收支', '收入/支出', '收入', '支出', '方向', '结果', '输赢', '赢', '输', '状态']),
      amount: find(['金额(元)', '金额', '交易金额', '数额', '总价', '价钱', 'amount']),
      duration: find(['时长', '小时', '时间长度', 'duration', 'hours']),
      blind: find(['盲注', '级别', '盲注级别', 'blind', 'stakes']),
      tags: find(['标签', '分类', 'tags', 'label']),
      note: find(['对方', '商品', '说明', '备注', '名称', '摘要', '昵称'])
    };
  }

  function parseTable(lines, delim) {
    const headers = lines[0].split(delim).map(s => s.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(delim).map(s => s.trim());
      if (cells.length < 2 && !cells[0]) continue;
      rows.push({ cells });
    }
    const colMap = autoMapCols(headers);
    const defaultAgg = colMap.sign >= 0 && /收|支|方向|类型|状态/.test(headers[colMap.sign] || '') ? 'date' : 'row';
    return { headers, rows, colMap, agg: defaultAgg };
  }

  function extractRow(tbl, r, colMap) {
    const cells = r.cells;
    const cm = colMap;
    let date = '', result = 'win', amount = 0, note = '', duration = 0, blind = '', tags = [];
    const dcell = cm.date >= 0 ? (cells[cm.date] || '') : '';
    const m = dcell.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
    if (m) date = `${m[1]}-${pad2(+m[2])}-${pad2(+m[3])}`;
    else { const m2 = dcell.match(/(\d{1,2})[-/](\d{1,2})/); if (m2) date = `${new Date().getFullYear()}-${pad2(+m2[1])}-${pad2(+m2[2])}`; }
    const scell = cm.sign >= 0 ? (cells[cm.sign] || '') : '';
    const acell = cm.amount >= 0 ? (cells[cm.amount] || '') : '';
    const amtMatch = (acell || '').replace(/[¥￥,\s]/g, '').match(/-?\d+(?:\.\d+)?/);
    const signed = amtMatch ? parseFloat(amtMatch[0]) : 0;
    amount = Math.abs(signed);
    if (cm.sign >= 0) {
      if (/收入|收$|收\s*入|\+|^收/.test(scell) || /赢/.test(scell)) result = 'win';
      else if (/支出|支$|付|^-/.test(scell) || /输/.test(scell)) result = 'lose';
      else result = signed < 0 ? 'lose' : 'win';
    } else {
      result = signed < 0 ? 'lose' : 'win';
    }
    if (cm.duration >= 0) { const d = parseFloat((cells[cm.duration] || '').trim()); if (!isNaN(d)) duration = d; }
    if (cm.blind >= 0) blind = (cells[cm.blind] || '').trim();
    if (cm.tags >= 0) { const tv = (cells[cm.tags] || '').trim(); if (tv) tags = tv.split(/[/\、,， ]+/).filter(Boolean); }
    if (cm.note >= 0) {
      const parts = [];
      if (cm.note !== cm.date && cm.note !== cm.amount) parts.push(cells[cm.note] || '');
      note = parts.join(' ').trim();
    }
    return { date, result, amount: Math.round(amount * 100) / 100, note, duration, blind, tags };
  }

  function renderTablePreview() {
    const tbl = lastTable;
    if (!tbl) return;
    const box = document.getElementById('bkPastePreview');
    const opts = (sel, idx, label) => `<label>${label}<select id="${sel}">` +
      tbl.headers.map((h, i) => `<option value="${i}" ${i === idx ? 'selected' : ''}>${h || '(空)'}</option>`).join('') +
      `<option value="-1" ${idx < 0 ? 'selected' : ''}>（无）</option></select></label>`;
    const cm = tbl.colMap;
    let html = `<div class="bk-col-map">
      ${opts('bkCmDate', cm.date, '日期列')}
      ${opts('bkCmSign', cm.sign, '输赢/收支列')}
      ${opts('bkCmAmount', cm.amount, '金额列')}
      ${opts('bkCmDuration', cm.duration, '时长列')}
      ${opts('bkCmBlind', cm.blind, '盲注列')}
      ${opts('bkCmTags', cm.tags, '标签列')}
      ${opts('bkCmNote', cm.note, '备注列')}
    </div>`;
    html += `<div class="bk-agg-toggle">
      <span>聚合方式：</span>
      <label><input type="radio" name="bkAgg" value="row" ${tbl.agg === 'row' ? 'checked' : ''}>每条=一场（小程序导出）</label>
      <label><input type="radio" name="bkAgg" value="date" ${tbl.agg === 'date' ? 'checked' : ''}>按日期聚合（微信账单流水）</label>
    </div>`;
    html += `<div class="bk-preview-table"><div class="bk-pt-row bk-pt-head bk-pt-check"><span></span><span>日期</span><span>输赢</span><span>金额</span><span>时长</span><span>盲注</span><span>标签</span><span>备注</span></div>`;
    tbl.rows.forEach((r, i) => {
      const ex = extractRow(tbl, r, tbl.colMap);
      const checked = checkedSet.has(i) ? 'checked' : '';
      html += `<div class="bk-pt-row bk-pt-check">
        <input type="checkbox" ${checked} data-check="${i}">
        <span>${ex.date.slice(5) || '-'}</span>
        <span class="${ex.result === 'win' ? 'bk-ok' : 'bk-bad'}">${ex.result === 'win' ? '赢' : '输'}</span>
        <span class="bk-amt">${ex.amount}</span>
        <span>${ex.duration || '-'}</span>
        <span class="bk-pk">${ex.blind || '-'}</span>
        <span class="bk-pk">${(ex.tags || []).join('/') || '-'}</span>
        <span class="bk-pk">${ex.note || '-'}</span>
      </div>`;
    });
    html += `</div>`;
    const cnt = checkedSet.size;
    html += `<div style="margin-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      <button class="bk-primary-btn" id="bkConfirmImportBtn" type="button">确认导入 ${cnt} 条</button>
      <button class="bk-mgmt-btn" id="bkSelectAllBtn" type="button">全选</button>
      <button class="bk-mgmt-btn" id="bkSelectNoneBtn" type="button">全不选</button>
      <span class="bk-hint">已选 ${cnt} / ${tbl.rows.length}</span>
    </div>`;
    box.innerHTML = html;
  }

  function parsePasteImport() {
    const raw = document.getElementById('bkPasteInput').value.trim();
    if (!raw) { alert('请先粘贴记录，或上传 CSV 文件'); return; }
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const delim = detectDelimiter(lines[0] || '');
    const firstCols = (lines[0] || '').split(delim).length;
    const looksTable = delim && firstCols >= 2 && lines.length >= 2;
    if (looksTable) {
      lastMode = 'table';
      lastTable = parseTable(lines, delim);
      checkedSet = new Set(lastTable.rows.map((_, i) => i));
      renderTablePreview();
    } else {
      lastMode = 'text';
      const parsed = [], errors = [];
      lines.forEach((line, idx) => {
        const rec = parseOneRecord(line);
        if (rec) parsed.push(rec);
        else errors.push({ line: idx + 1, text: line });
      });
      lastParsed = parsed;
      renderPastePreview(parsed, errors);
    }
  }

  function parseOneRecord(line) {
    let work = line;
    let date = '', result = '', blind = '', duration = 0, amount = 0, note = '';
    let m;
    if ((m = work.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/))) {
      date = `${m[1]}-${pad2(+m[2])}-${pad2(+m[3])}`;
      work = work.replace(m[0], ' ');
    } else if ((m = work.match(/(\d{1,2})月(\d{1,2})[日号]?/))) {
      date = `${new Date().getFullYear()}-${pad2(+m[1])}-${pad2(+m[2])}`;
      work = work.replace(m[0], ' ');
    } else if ((m = work.match(/(\d{1,2})[-/](\d{1,2})(?!\d)/))) {
      date = `${new Date().getFullYear()}-${pad2(+m[1])}-${pad2(+m[2])}`;
      work = work.replace(m[0], ' ');
    }
    if (/赢|胜|win/i.test(work)) result = 'win';
    else if (/输|败|lose/i.test(work)) result = 'lose';
    else if (/\+/i.test(work)) result = 'win';
    else if (/-/i.test(work)) result = 'lose';
    else result = 'win';
    work = work.replace(/赢|输|胜|败|win|lose/gi, ' ');
    if ((m = work.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/))) {
      blind = `${m[1]}/${m[2]}`;
      work = work.replace(m[0], ' ');
    }
    if ((m = work.match(/(\d+(?:\.\d+)?)\s*(?:h|小时|时)/i))) {
      duration = parseFloat(m[1]);
      work = work.replace(m[0], ' ');
    }
    if ((m = work.match(/(\d+(?:\.\d+)?)\s*万/))) {
      amount = parseFloat(m[1]) * 10000;
      work = work.replace(m[0], ' ');
    } else if ((m = work.match(/(?:¥|￥|元|RMB)?\s*(\d+(?:\.\d+)?)/))) {
      amount = parseFloat(m[1]);
      work = work.replace(m[0], ' ');
    }
    if (!amount || amount <= 0) return null;
    const tags = [];
    bookData.tags.forEach(t => { if (line.includes(t) && !tags.includes(t)) tags.push(t); });
    const tagEsc = bookData.tags.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (tagEsc) work = work.replace(new RegExp(tagEsc, 'g'), ' ');
    note = work.replace(/\s+/g, ' ').trim();
    if (duration === 0) {
      note = note.replace(/^[+\-]\s*/, '');
      const nm = note.match(/^(\d+(?:\.\d+)?)(?:\s|$)/);
      if (nm) { duration = parseFloat(nm[1]); note = note.slice(nm[0].length).trim(); }
    }
    return { date, result, amount: Math.round(amount * 100) / 100, duration, blind, tags, note };
  }

  function renderPastePreview(parsed, errors) {
    const box = document.getElementById('bkPastePreview');
    if (parsed.length === 0 && errors.length === 0) { box.innerHTML = ''; return; }
    let html = `<div class="bk-preview-summary">成功解析 <b style="color:#27ae60">${parsed.length}</b> 条${errors.length ? `，跳过 <b style="color:#e74c3c">${errors.length}</b> 条` : ''}</div>`;
    if (parsed.length) {
      html += `<div class="bk-preview-table"><div class="bk-pt-row bk-pt-head"><span>日期</span><span>输赢</span><span>金额</span><span>时长</span><span>盲注</span><span>备注/标签</span></div>`;
      html += parsed.map(r => `<div class="bk-pt-row">
        <span>${r.date.slice(5)}</span>
        <span class="${r.result === 'win' ? 'bk-ok' : 'bk-bad'}">${r.result === 'win' ? '赢' : '输'}</span>
        <span class="bk-amt">${r.amount}</span>
        <span>${formatDurationText(r.duration)}</span>
        <span>${r.blind || '-'}</span>
        <span>${(r.tags.join(',') + ' ' + (r.note || '')).trim() || '-'}</span>
      </div>`).join('');
      html += `</div><button class="bk-primary-btn" id="bkConfirmImportBtn" type="button">确认导入 ${parsed.length} 条</button>`;
    }
    if (errors.length) {
      html += `<div class="bk-preview-table" style="margin-top:10px;">` +
        errors.map(e => `<div class="bk-pt-row"><span style="grid-column:1/7" class="bk-bad">第${e.line}行无法识别：${e.text}</span></div>`).join('') +
        `</div>`;
    }
    box.innerHTML = html;
  }

  function confirmImport() {
    let toAdd = [];
    if (lastMode === 'text') {
      toAdd = lastParsed.map(r => ({ date: r.date, result: r.result, amount: r.amount, duration: r.duration, blind: r.blind, tags: [...r.tags], note: r.note }));
    } else if (lastMode === 'table' && lastTable) {
      const cm = lastTable.colMap;
      const sel = lastTable.rows.filter((_, i) => checkedSet.has(i)).map(r => extractRow(lastTable, r, cm));
      if (lastTable.agg === 'date') {
        const byDate = {};
        sel.forEach(e => {
          const d = e.date || '未知日期';
          if (!byDate[d]) byDate[d] = { date: d, net: 0, duration: 0, note: [] };
          byDate[d].net += (e.result === 'win' ? e.amount : -e.amount);
          byDate[d].duration += (e.duration || 0);
          if (e.note) byDate[d].note.push(e.note);
        });
        toAdd = Object.values(byDate).map(g => ({
          date: g.date, result: g.net >= 0 ? 'win' : 'lose', amount: Math.round(Math.abs(g.net) * 100) / 100,
          duration: Math.round(g.duration * 100) / 100, blind: '', tags: [], note: [...new Set(g.note)].slice(0, 3).join('/')
        })).filter(x => x.amount > 0);
      } else {
        toAdd = sel.map(e => ({ date: e.date, result: e.result, amount: e.amount, duration: e.duration || 0, blind: e.blind || '', tags: e.tags || [], note: e.note }));
      }
    }
    if (toAdd.length === 0) { alert('没有可导入的数据'); return; }
    if (!confirm(`确认导入 ${toAdd.length} 条记录？将合并进现有数据。`)) return;
    toAdd.forEach(r => {
      bookData.records.push({
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        date: r.date || formatLocalDate(),
        result: r.result, amount: r.amount, duration: r.duration || 0,
        blind: r.blind || bookData.blinds[0] || '',
        tags: r.tags || [], note: r.note || ''
      });
    });
    saveBookData();
    closeImport();
    renderAll();
    alert(`成功导入 ${toAdd.length} 条`);
  }

  function handleImportFile(input) {
    const f = input.files && input.files[0];
    if (!f) return;
    document.getElementById('bkImportFileName').textContent = '已选择：' + f.name;
    const name = (f.name || '').toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      loadXlsxAndImport(f);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      let text = e.target.result;
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      document.getElementById('bkPasteInput').value = text;
      parsePasteImport();
    };
    reader.readAsText(f, 'utf-8');
  }

  function loadXlsxAndImport(f) {
    if (typeof XLSX === 'undefined') {
      alert('Excel 解析组件未加载（可能离线）。请联网后重试，或先把文件另存为 CSV 再导入。');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const wsName = wb.SheetNames[0];
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wsName]);
        document.getElementById('bkPasteInput').value = csv;
        parsePasteImport();
      } catch (err) {
        alert('解析 Excel 失败：' + (err && err.message ? err.message : err) + '\n可先把文件另存为 CSV 再导入。');
      }
    };
    reader.readAsArrayBuffer(f);
  }

  // ========== 事件绑定 ==========
  function initEvents() {
    // 记一笔
    document.getElementById('bkAddRecordBtn').addEventListener('click', () => openRecordForm());
    document.getElementById('bkRecordClose').addEventListener('click', closeRecordForm);
    document.getElementById('bkBtnWin').addEventListener('click', () => setResult('win'));
    document.getElementById('bkBtnLose').addEventListener('click', () => setResult('lose'));
    document.getElementById('bkSaveRecordBtn').addEventListener('click', saveRecord);

    // 盲注选择（事件委托）
    document.getElementById('bkBlindSelect').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-blind]');
      if (chip) { selectedBlind = chip.dataset.blind; renderBlindSelect(); }
    });
    document.getElementById('bkTagSelect').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-tag]');
      if (chip) {
        const t = chip.dataset.tag;
        if (selectedTags.includes(t)) selectedTags = selectedTags.filter(x => x !== t);
        else selectedTags.push(t);
        renderTagSelect();
      }
    });

    // 盲注管理
    document.getElementById('bkOpenBlindMgr').addEventListener('click', openBlindManager);
    document.getElementById('bkBlindClose').addEventListener('click', closeBlindManager);
    document.getElementById('bkAddBlindBtn').addEventListener('click', addBlind);
    document.getElementById('bkBlindList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-rmblind]');
      if (btn) removeBlind(btn.dataset.rmblind);
    });

    // 记录列表（事件委托）
    document.getElementById('bkRecordList').addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit]');
      const delBtn = e.target.closest('[data-del]');
      if (editBtn) openRecordForm(editBtn.dataset.edit);
      if (delBtn) {
        const id = delBtn.dataset.del;
        if (confirm('确定删除这条记录？')) {
          bookData.records = bookData.records.filter(r => String(r.id) !== String(id));
          saveBookData();
          renderAll();
        }
      }
    });

    // 列表控制
    document.getElementById('bkListControls').addEventListener('click', (e) => {
      const limitBtn = e.target.closest('[data-limit]');
      const actionBtn = e.target.closest('[data-action]');
      if (limitBtn) { recordListLimit = parseInt(limitBtn.dataset.limit); renderRecords(); }
      if (actionBtn) {
        if (actionBtn.dataset.action === 'more') { recordListLimit += recordListStep; renderRecords(); }
        if (actionBtn.dataset.action === 'all') { recordListLimit = -1; renderRecords(); }
      }
    });

    // 筛选
    ['bkFilterYear', 'bkFilterMonth', 'bkFilterDay', 'bkFilterTag', 'bkFilterBlind'].forEach(id => {
      document.getElementById(id).addEventListener('change', renderRecords);
    });

    // 分组
    document.getElementById('bkGrpBlind').addEventListener('click', () => {
      currentGroupBy = 'blind';
      document.getElementById('bkGrpBlind').classList.add('is-active');
      document.getElementById('bkGrpTag').classList.remove('is-active');
      renderGroupStats(getFilteredRecords());
      if (chartMode === 'group') renderCharts(getFilteredRecords());
    });
    document.getElementById('bkGrpTag').addEventListener('click', () => {
      currentGroupBy = 'tag';
      document.getElementById('bkGrpTag').classList.add('is-active');
      document.getElementById('bkGrpBlind').classList.remove('is-active');
      renderGroupStats(getFilteredRecords());
      if (chartMode === 'group') renderCharts(getFilteredRecords());
    });

    // 图表
    document.getElementById('bkChartTrend').addEventListener('click', () => {
      chartMode = 'trend';
      document.getElementById('bkChartTrend').classList.add('is-active');
      document.getElementById('bkChartGroup').classList.remove('is-active');
      renderCharts(getFilteredRecords());
    });
    document.getElementById('bkChartGroup').addEventListener('click', () => {
      chartMode = 'group';
      document.getElementById('bkChartGroup').classList.add('is-active');
      document.getElementById('bkChartTrend').classList.remove('is-active');
      renderCharts(getFilteredRecords());
    });

    // 数据管理
    document.getElementById('bkExportBtn').addEventListener('click', exportData);
    document.getElementById('bkImportBtn').addEventListener('click', openImport);
    document.getElementById('bkClearBtn').addEventListener('click', clearAllData);

    // 导入弹窗
    document.getElementById('bkImportClose').addEventListener('click', closeImport);
    document.getElementById('bkParseImportBtn').addEventListener('click', parsePasteImport);
    document.getElementById('bkImportFileInput').addEventListener('change', (e) => handleImportFile(e.target));

    // 导入预览（事件委托）
    document.getElementById('bkPastePreview').addEventListener('click', (e) => {
      if (e.target.id === 'bkConfirmImportBtn') confirmImport();
      if (e.target.id === 'bkSelectAllBtn') { if (lastTable) { checkedSet = new Set(lastTable.rows.map((_, i) => i)); renderTablePreview(); } }
      if (e.target.id === 'bkSelectNoneBtn') { checkedSet = new Set(); renderTablePreview(); }
      const check = e.target.closest('[data-check]');
      if (check) {
        const i = parseInt(check.dataset.check);
        if (check.checked) checkedSet.add(i); else checkedSet.delete(i);
        renderTablePreview();
      }
    });

    // 导入列映射（事件委托）
    document.getElementById('bkPastePreview').addEventListener('change', (e) => {
      const sel = e.target.closest('select');
      if (!sel || !sel.id.startsWith('bkCm')) return;
      if (!lastTable) return;
      const key = sel.id.replace('bkCm', '').toLowerCase();
      lastTable.colMap[key] = parseInt(sel.value);
      renderTablePreview();
    });

    // 导入聚合方式
    document.getElementById('bkPastePreview').addEventListener('change', (e) => {
      if (e.target.name === 'bkAgg') {
        if (lastTable) { lastTable.agg = e.target.value; renderTablePreview(); }
      }
    });

    // 点击遮罩关闭弹窗
    document.getElementById('bkRecordOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'bkRecordOverlay') closeRecordForm();
    });
    document.getElementById('bkBlindOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'bkBlindOverlay') closeBlindManager();
    });
    document.getElementById('bkImportOverlay').addEventListener('click', (e) => {
      if (e.target.id === 'bkImportOverlay') closeImport();
    });
  }

  // ========== 初始化 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initModeSwitch(); initEvents(); });
  } else {
    initModeSwitch();
    initEvents();
  }

})();
