/* DanaRumah — router, state and control wiring. No network: all state in localStorage. */
(function () {
  'use strict';
  var D = window.Dana;
  var V = window.DanaViews;

  var state = D.loadState();
  var currentMonth = '2026-11';
  var view = document.getElementById('view');
  var monthLabel = document.getElementById('month-label');

  var ROUTES = {
    dashboard: function (q) { return V.renderDashboard(state, currentMonth); },
    transaksi: function (q) { return V.renderTransactions(state, currentMonth, q); },
    anggaran: function (q) { return V.renderBudgets(state, currentMonth); },
    tujuan: function (q) { return V.renderGoals(state); },
    tagihan: function (q) { return V.renderBills(state, currentMonth); },
    laporan: function (q) { return V.renderReports(state, currentMonth); },
    pengaturan: function (q) { return V.renderSettings(state); }
  };

  function parseHash() {
    var raw = window.location.hash.replace(/^#\/?/, '');
    var parts = raw.split('?');
    var route = parts[0] || 'dashboard';
    var q = {};
    if (parts[1]) {
      parts[1].split('&').forEach(function (pair) {
        var kv = pair.split('=');
        q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
    }
    return { route: ROUTES[route] ? route : 'dashboard', q: q };
  }

  function render() {
    var parsed = parseHash();
    monthLabel.textContent = D.monthLabel(currentMonth);
    view.innerHTML = ROUTES[parsed.route](parsed.q);
    document.querySelectorAll('.mainnav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === parsed.route);
    });
    wireRoute(parsed.route, parsed.q);
    if (parsed.q.action === 'add' && parsed.route === 'transaksi') openTxForm(null);
  }

  function shiftMonth(delta) {
    var parts = currentMonth.split('-');
    var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10) + delta;
    while (m < 1) { m += 12; y -= 1; }
    while (m > 12) { m -= 12; y += 1; }
    var next = y + '-' + (m < 10 ? '0' + m : '' + m);
    if (next < '2026-09' || next > '2026-11') return;
    currentMonth = next;
    render();
  }

  function save() { D.saveState(state); }

  function nextId(prefix) {
    return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  }

  /* ----- Transaction form ----- */
  function openTxForm(existing) {
    var modal = V.openModal(existing ? 'Ubah Transaksi' : 'Tambah Transaksi', V.txFormHtml(existing, D.CATEGORIES));
    var form = modal.querySelector('#tx-form');
    modal.querySelector('[data-close]').addEventListener('click', V.closeModal);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var amount = parseInt(V.moneyInput(fd.get('amount')), 10);
      if (!amount || amount <= 0) { alert('Masukkan jumlah yang valid (lebih dari 0).'); return; }
      var desc = String(fd.get('desc') || '').trim();
      if (!desc) { alert('Isi deskripsi transaksi.'); return; }
      var rec = {
        id: existing ? existing.id : nextId('t'),
        date: String(fd.get('date')),
        desc: desc,
        cat: String(fd.get('cat')),
        type: String(fd.get('type')),
        amount: amount
      };
      if (existing) {
        var idx = state.transactions.findIndex(function (t) { return t.id === existing.id; });
        if (idx >= 0) state.transactions[idx] = rec;
      } else {
        state.transactions.push(rec);
      }
      save();
      V.closeModal();
      render();
    });
  }

  /* ----- Budget edit ----- */
  function openBudgetEdit(catId) {
    var cat = D.categoryById(catId);
    var budgets = state.budgets[currentMonth] || (state.budgets[currentMonth] = {});
    var cur = budgets[catId] || 0;
    var modal = V.openModal('Ubah Batas — ' + cat.name,
      '<form class="stack" id="budget-form"><label>Batas bulanan (Rp)<input name="amount" inputmode="numeric" required value="' + cur + '"></label>' +
      '<p class="field-note">Berlaku untuk ' + D.escapeHtml(D.monthLabel(currentMonth)) + '.</p>' +
      '<div class="btn-row" style="margin-top:16px"><button class="btn" type="submit">Simpan</button>' +
      '<button class="btn ghost" type="button" data-close>Batal</button></div></form>');
    modal.querySelector('[data-close]').addEventListener('click', V.closeModal);
    modal.querySelector('#budget-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = parseInt(V.moneyInput(new FormData(e.target).get('amount')), 10);
      if (isNaN(amount) || amount < 0) { alert('Masukkan jumlah yang valid.'); return; }
      state.budgets[currentMonth][catId] = amount;
      save();
      V.closeModal();
      render();
    });
  }

  /* ----- Goal forms ----- */
  function openGoalFund(goal) {
    var modal = V.openModal('Tambah Dana — ' + goal.name,
      '<form class="stack" id="goal-form"><label>Jumlah tambahan (Rp)<input name="amount" inputmode="numeric" required placeholder="250000"></label>' +
      '<p class="field-note">Terkumpul saat ini: ' + D.formatIDR(goal.saved) + ' dari ' + D.formatIDR(goal.target) + '.</p>' +
      '<div class="btn-row" style="margin-top:16px"><button class="btn" type="submit">Tambah Dana</button>' +
      '<button class="btn ghost" type="button" data-close>Batal</button></div></form>');
    modal.querySelector('[data-close]').addEventListener('click', V.closeModal);
    modal.querySelector('#goal-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = parseInt(V.moneyInput(new FormData(e.target).get('amount')), 10);
      if (!amount || amount <= 0) { alert('Masukkan jumlah yang valid.'); return; }
      goal.saved += amount;
      state.transactions.push({ id: nextId('t'), date: currentMonth + '-26', desc: 'Pindah ke tabungan — ' + goal.name, cat: 'tabungan', type: 'out', amount: amount });
      save();
      V.closeModal();
      render();
    });
  }

  function openGoalAdd() {
    var modal = V.openModal('Tujuan Baru',
      '<form class="stack" id="goal-add-form">' +
      '<label>Nama tujuan<input name="name" required maxlength="60" placeholder="cth. Dana Pendidikan Anak"></label>' +
      '<div class="form-grid"><label>Target (Rp)<input name="target" inputmode="numeric" required placeholder="5000000"></label>' +
      '<label>Sudah terkumpul (Rp)<input name="saved" inputmode="numeric" value="0"></label></div>' +
      '<label>Catatan<input name="note" maxlength="120" placeholder="cth. Untuk tahun ajaran baru"></label>' +
      '<div class="btn-row" style="margin-top:16px"><button class="btn" type="submit">Buat Tujuan</button>' +
      '<button class="btn ghost" type="button" data-close>Batal</button></div></form>');
    modal.querySelector('[data-close]').addEventListener('click', V.closeModal);
    modal.querySelector('#goal-add-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var target = parseInt(V.moneyInput(fd.get('target')), 10);
      var saved = parseInt(V.moneyInput(fd.get('saved')), 10) || 0;
      if (!target || target <= 0) { alert('Masukkan target yang valid.'); return; }
      state.goals.push({ id: nextId('g'), name: String(fd.get('name')).trim(), target: target, saved: saved, note: String(fd.get('note') || '').trim() });
      save();
      V.closeModal();
      render();
    });
  }

  /* ----- Bill forms ----- */
  function openBillAdd() {
    var modal = V.openModal('Tambah Tagihan',
      '<form class="stack" id="bill-add-form">' +
      '<label>Nama tagihan<input name="name" required maxlength="60" placeholder="cth. Langganan Air Galon"></label>' +
      '<div class="form-grid"><label>Jumlah (Rp)<input name="amount" inputmode="numeric" required placeholder="150000"></label>' +
      '<label>Jatuh tempo (tanggal)<input name="dueDay" type="number" min="1" max="31" required value="15"></label></div>' +
      '<div class="btn-row" style="margin-top:16px"><button class="btn" type="submit">Tambah Tagihan</button>' +
      '<button class="btn ghost" type="button" data-close>Batal</button></div></form>');
    modal.querySelector('[data-close]').addEventListener('click', V.closeModal);
    modal.querySelector('#bill-add-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var amount = parseInt(V.moneyInput(fd.get('amount')), 10);
      var dueDay = parseInt(fd.get('dueDay'), 10);
      if (!amount || amount <= 0 || !dueDay || dueDay < 1 || dueDay > 31) { alert('Periksa jumlah dan tanggal jatuh tempo.'); return; }
      state.bills.push({ id: nextId('b'), name: String(fd.get('name')).trim(), amount: amount, dueDay: dueDay, paid: false, month: currentMonth });
      save();
      V.closeModal();
      render();
    });
  }

  /* ----- Per-route wiring ----- */
  function wireRoute(route, q) {
    if (route === 'transaksi') {
      var addBtn = document.getElementById('tx-add');
      if (addBtn) addBtn.addEventListener('click', function () { openTxForm(null); });
      view.querySelectorAll('[data-edit]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var t = state.transactions.find(function (x) { return x.id === btn.getAttribute('data-edit'); });
          if (t) openTxForm(t);
        });
      });
      view.querySelectorAll('[data-del]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var t = state.transactions.find(function (x) { return x.id === btn.getAttribute('data-del'); });
          if (t && confirm('Hapus transaksi "' + t.desc + '" (' + D.formatIDR(t.amount) + ')?')) {
            state.transactions = state.transactions.filter(function (x) { return x.id !== t.id; });
            save();
            render();
          }
        });
      });
      var apply = document.getElementById('f-apply');
      if (apply) apply.addEventListener('click', function () {
        var qq = document.getElementById('f-q').value.trim();
        var cc = document.getElementById('f-cat').value;
        var parts = [];
        if (qq) parts.push('q=' + encodeURIComponent(qq));
        if (cc) parts.push('cat=' + encodeURIComponent(cc));
        window.location.hash = '#/transaksi' + (parts.length ? '?' + parts.join('&') : '');
      });
      var clear = document.getElementById('f-clear');
      if (clear) clear.addEventListener('click', function () { window.location.hash = '#/transaksi'; });
      var fq = document.getElementById('f-q');
      if (fq) fq.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); apply.click(); } });
    }
    if (route === 'anggaran') {
      view.querySelectorAll('[data-budget-edit]').forEach(function (btn) {
        btn.addEventListener('click', function () { openBudgetEdit(btn.getAttribute('data-budget-edit')); });
      });
      var copyBtn = document.getElementById('budget-copy');
      if (copyBtn) copyBtn.addEventListener('click', function () {
        var prev = state.budgets['2026-10'];
        if (!prev) { alert('Tidak ada anggaran bulan sebelumnya.'); return; }
        state.budgets[currentMonth] = JSON.parse(JSON.stringify(prev));
        save();
        render();
      });
    }
    if (route === 'tujuan') {
      view.querySelectorAll('[data-goal-fund]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var g = state.goals.find(function (x) { return x.id === btn.getAttribute('data-goal-fund'); });
          if (g) openGoalFund(g);
        });
      });
      view.querySelectorAll('[data-goal-del]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var g = state.goals.find(function (x) { return x.id === btn.getAttribute('data-goal-del'); });
          if (g && confirm('Hapus tujuan "' + g.name + '"?')) {
            state.goals = state.goals.filter(function (x) { return x.id !== g.id; });
            save();
            render();
          }
        });
      });
      var ga = document.getElementById('goal-add');
      if (ga) ga.addEventListener('click', openGoalAdd);
    }
    if (route === 'tagihan') {
      view.querySelectorAll('[data-bill-pay]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var b = state.bills.find(function (x) { return x.id === btn.getAttribute('data-bill-pay'); });
          if (!b) return;
          b.paid = true;
          state.transactions.push({
            id: nextId('t'), date: currentMonth + '-' + (b.dueDay < 10 ? '0' + b.dueDay : '' + b.dueDay),
            desc: b.name + ' (dibayar)', cat: b.name.indexOf('Listrik') >= 0 || b.name.indexOf('PDAM') >= 0 ? 'listrik' : 'lainnya',
            type: 'out', amount: b.amount
          });
          save();
          render();
        });
      });
      view.querySelectorAll('[data-bill-del]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var b = state.bills.find(function (x) { return x.id === btn.getAttribute('data-bill-del'); });
          if (b && confirm('Hapus tagihan "' + b.name + '"?')) {
            state.bills = state.bills.filter(function (x) { return x.id !== b.id; });
            save();
            render();
          }
        });
      });
      var ba = document.getElementById('bill-add');
      if (ba) ba.addEventListener('click', openBillAdd);
    }
    if (route === 'pengaturan') {
      var form = document.getElementById('settings-form');
      if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        state.household.name = String(fd.get('name')).trim() || state.household.name;
        state.household.city = String(fd.get('city')).trim() || state.household.city;
        state.household.members = Math.max(1, parseInt(fd.get('members'), 10) || 1);
        save();
        var msg = document.getElementById('settings-msg');
        if (msg) msg.textContent = 'Profil keluarga tersimpan.';
        render();
      });
      var expBtn = document.getElementById('export-data');
      if (expBtn) expBtn.addEventListener('click', function () {
        var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'danarumah-data.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
        var msg = document.getElementById('settings-msg');
        if (msg) msg.textContent = 'Data diunduh sebagai danarumah-data.json.';
      });
      var resetBtn = document.getElementById('reset-data');
      if (resetBtn) resetBtn.addEventListener('click', function () {
        if (confirm('Kembalikan semua data ke contoh awal? Perubahan Anda akan hilang.')) {
          state = D.resetState();
          save();
          render();
        }
      });
    }
  }

  document.getElementById('month-prev').addEventListener('click', function () { shiftMonth(-1); });
  document.getElementById('month-next').addEventListener('click', function () { shiftMonth(1); });
  window.addEventListener('hashchange', render);
  render();

  window.DanaApp = { get state() { return state; }, render: render };
})();
