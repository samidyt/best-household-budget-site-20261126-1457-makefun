/* DanaRumah — view renderers. Each route renders into #view and wires its controls.
   State lives in window.DanaApp.state; every change is saved to localStorage. */
(function () {
  'use strict';
  var D = window.Dana;

  function monthTx(state, ym) {
    return state.transactions.filter(function (t) { return t.date.slice(0, 7) === ym; });
  }
  function monthIncome(state, ym) {
    var sum = 0;
    state.income.forEach(function (r) { if (r.month === ym) sum += r.amount; });
    return sum;
  }
  function monthExpense(state, ym) {
    var sum = 0;
    monthTx(state, ym).forEach(function (t) { if (t.type === 'out') sum += t.amount; });
    return sum;
  }
  function spentByCategory(state, ym) {
    var map = {};
    monthTx(state, ym).forEach(function (t) {
      if (t.type !== 'out' || t.cat === 'tabungan') return;
      map[t.cat] = (map[t.cat] || 0) + t.amount;
    });
    return map;
  }
  function budgetFor(state, ym) {
    return state.budgets[ym] || state.budgets['2026-11'] || {};
  }
  function sortedTx(list) {
    return list.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.id < b.id ? 1 : -1;
    });
  }
  function el(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
  }
  function openModal(title, bodyHtml) {
    var root = document.getElementById('modal-root');
    root.innerHTML = '';
    var back = el('<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true"><h2>' +
      D.escapeHtml(title) + '</h2><div class="modal-body">' + bodyHtml + '</div></div></div>');
    back.addEventListener('click', function (e) {
      if (e.target === back) root.innerHTML = '';
    });
    root.appendChild(back);
    return back;
  }
  function closeModal() { document.getElementById('modal-root').innerHTML = ''; }
  function moneyInput(v) { return String(v || '').replace(/[^\d]/g, ''); }

  /* ---------------- Dashboard ---------------- */
  function renderDashboard(state, ym) {
    var inc = monthIncome(state, ym);
    var exp = monthExpense(state, ym);
    var balance = inc - exp;
    var budgets = budgetFor(state, ym);
    var spent = spentByCategory(state, ym);
    var budgetTotal = 0, k;
    for (k in budgets) budgetTotal += budgets[k];
    var slices = D.CATEGORIES.filter(function (c) { return spent[c.id] > 0 && c.id !== 'tabungan'; })
      .map(function (c) { return { label: c.name, value: spent[c.id], color: c.color }; })
      .sort(function (a, b) { return b.value - a.value; });
    var recent = sortedTx(monthTx(state, ym)).slice(0, 6);
    var upcoming = state.bills.filter(function (b) { return b.month === ym && !b.paid; })
      .sort(function (a, b) { return a.dueDay - b.dueDay; });
    var goals = state.goals;
    var months = ['2026-09', '2026-10', '2026-11'].map(function (m) {
      return { label: D.monthLabel(m).split(' ')[0], income: monthIncome(state, m), expense: monthExpense(state, m) };
    });

    var html = '<div class="page-head"><div><h1>Dasbor ' + D.escapeHtml(state.household.name) + '</h1>' +
      '<p class="lede">' + D.escapeHtml(D.monthLabel(ym)) + ' · ' + state.household.members +
      ' anggota keluarga · ' + D.escapeHtml(state.household.city) +
      '. Ringkasan uang masuk, uang keluar, dan sisa anggaran bulan ini.</p></div>' +
      '<div class="btn-row"><a class="btn" href="#/transaksi?action=add">+ Tambah Transaksi</a></div></div>';

    html += '<div class="grid grid-4" style="margin-bottom:16px">' +
      '<div class="card stat"><div class="label">Pemasukan</div><div class="value pos">' + D.formatIDR(inc) +
      '</div><div class="hint">Gaji + usaha sampingan</div></div>' +
      '<div class="card stat"><div class="label">Pengeluaran</div><div class="value neg">' + D.formatIDR(exp) +
      '</div><div class="hint">Semua belanja bulan ini</div></div>' +
      '<div class="card stat"><div class="label">Sisa Uang</div><div class="value ' + (balance >= 0 ? 'pos' : 'neg') + '">' + D.formatIDR(balance) +
      '</div><div class="hint">' + (balance >= 0 ? 'Masih dalam anggaran' : 'Melebihi pemasukan') + '</div></div>' +
      '<div class="card stat accent"><div class="label">Total Anggaran</div><div class="value">' + D.formatIDR(budgetTotal) +
      '</div><div class="hint">10 kategori bulan ini</div></div></div>';

    html += '<div class="grid grid-2" style="margin-bottom:16px">' +
      '<div class="card"><h2>Pengeluaran per Kategori</h2><p class="sub">Di luar tabungan · ' + D.escapeHtml(D.monthLabel(ym)) + '</p>' +
      '<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">' +
      '<div style="width:190px;flex:none">' + window.DanaCharts.donutChart(slices, 190, 28) + '</div>' +
      '<ul class="legend" style="flex:1;min-width:200px">' +
      slices.slice(0, 6).map(function (s) {
        return '<li><span class="dot" style="background:' + s.color + '"></span>' + D.escapeHtml(s.label) +
          '<span class="amt">' + D.formatIDR(s.value) + '</span></li>';
      }).join('') + '</ul></div>' +
      '<p style="margin-top:14px"><a href="#/anggaran">Lihat semua anggaran →</a></p></div>' +
      '<div class="card"><h2>Pemasukan vs Pengeluaran</h2><p class="sub">Tiga bulan terakhir</p>' +
      window.DanaCharts.monthBarChart(months) +
      '<p class="small muted">November: pemasukan ' + D.formatIDR(months[2].income) + ', pengeluaran ' +
      D.formatIDR(months[2].expense) + '. Selisih ' + D.formatIDR(months[2].income - months[2].expense) + ' disisihkan untuk tabungan dan dana darurat.</p>' +
      '<p><a href="#/laporan">Buka laporan lengkap →</a></p></div></div>';

    html += '<div class="grid grid-3">' +
      '<div class="card"><h2>Transaksi Terakhir</h2><p class="sub">6 terbaru bulan ini</p><ul class="list">' +
      recent.map(function (t) {
        var c = D.categoryById(t.cat);
        return '<li><span class="dot" style="background:' + c.color + '"></span><span class="grow"><span class="name">' +
          D.escapeHtml(t.desc) + '</span><br><span class="meta">' + D.formatDateID(t.date) + ' · ' + D.escapeHtml(c.name) +
          '</span></span><span class="amount ' + (t.type === 'in' ? 'in' : 'out') + '">' +
          (t.type === 'in' ? '+' : '−') + D.formatIDR(t.amount) + '</span></li>';
      }).join('') + '</ul><p style="margin-top:12px"><a href="#/transaksi">Semua transaksi →</a></p></div>' +
      '<div class="card"><h2>Tagihan Belum Lunas</h2><p class="sub">' + upcoming.length + ' tagihan menanti bulan ini</p>' +
      (upcoming.length ? '<ul class="list">' + upcoming.map(function (b) {
        return '<li><span class="grow"><span class="name">' + D.escapeHtml(b.name) + '</span><br><span class="meta">Jatuh tempo tgl ' +
          b.dueDay + ' ' + D.escapeHtml(D.monthLabel(ym)) + '</span></span><span class="amount due">' + D.formatIDR(b.amount) + '</span></li>';
      }).join('') + '</ul>' : '<p class="empty">Semua tagihan bulan ini sudah lunas. 🎉</p>') +
      '<p style="margin-top:12px"><a href="#/tagihan">Kelola tagihan →</a></p></div>' +
      '<div class="card"><h2>Tujuan Tabungan</h2><p class="sub">Progres menuju target</p>' +
      goals.map(function (g) {
        var pct = Math.min(100, Math.round(g.saved / g.target * 100));
        return '<div class="bar-row"><span>' + D.escapeHtml(g.name) + '</span><b>' + pct + '%</b></div>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
          '<p class="small muted">' + D.formatIDR(g.saved) + ' dari ' + D.formatIDR(g.target) + '</p>';
      }).join('') + '<p style="margin-top:10px"><a href="#/tujuan">Lihat semua tujuan →</a></p></div></div>';

    return html;
  }

  /* ---------------- Transactions ---------------- */
  function txFormHtml(t, cats) {
    var opts = cats.map(function (c) {
      return '<option value="' + c.id + '"' + (t && t.cat === c.id ? ' selected' : '') + '>' + D.escapeHtml(c.name) + '</option>';
    }).join('');
    return '<form class="stack" id="tx-form">' +
      '<label>Deskripsi<input name="desc" required maxlength="80" value="' + (t ? D.escapeHtml(t.desc) : '') + '" placeholder="cth. Belanja mingguan — Pasar"></label>' +
      '<div class="form-grid"><label>Jumlah (Rp)<input name="amount" inputmode="numeric" required value="' + (t ? t.amount : '') + '" placeholder="250000"></label>' +
      '<label>Tanggal<input type="date" name="date" required value="' + (t ? t.date : '2026-11-26') + '"></label></div>' +
      '<div class="form-grid"><label>Kategori<select name="cat">' + opts + '</select></label>' +
      '<label>Jenis<select name="type"><option value="out"' + (t && t.type === 'out' ? ' selected' : '') + '>Pengeluaran</option>' +
      '<option value="in"' + (t && t.type === 'in' ? ' selected' : '') + '>Pemasukan</option></select></label></div>' +
      '<div class="btn-row" style="margin-top:16px"><button class="btn" type="submit">' + (t ? 'Simpan Perubahan' : 'Tambah Transaksi') +
      '</button><button class="btn ghost" type="button" data-close>Batal</button></div></form>';
  }

  function renderTransactions(state, ym, query) {
    var q = (query.q || '').toLowerCase();
    var cat = query.cat || '';
    var list = sortedTx(monthTx(state, ym)).filter(function (t) {
      if (cat && t.cat !== cat) return false;
      if (q && t.desc.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    var catOpts = '<option value="">Semua kategori</option>' + D.CATEGORIES.map(function (c) {
      return '<option value="' + c.id + '"' + (cat === c.id ? ' selected' : '') + '>' + D.escapeHtml(c.name) + '</option>';
    }).join('');
    var html = '<div class="page-head"><div><h1>Transaksi</h1><p class="lede">' + list.length +
      ' transaksi pada ' + D.escapeHtml(D.monthLabel(ym)) + '. Tambah, ubah, atau hapus — semua tersimpan otomatis.</p></div>' +
      '<button class="btn" id="tx-add">+ Tambah Transaksi</button></div>';
    html += '<div class="card"><div class="toolbar">' +
      '<div class="field"><label for="f-q">Cari deskripsi</label><input id="f-q" type="search" placeholder="cth. pasar, listrik…" value="' + D.escapeHtml(query.q || '') + '"></div>' +
      '<div class="field"><label for="f-cat">Kategori</label><select id="f-cat">' + catOpts + '</select></div>' +
      '<button class="btn ghost" id="f-apply" type="button">Terapkan</button>' +
      '<button class="btn ghost" id="f-clear" type="button">Reset</button></div>';
    if (!list.length) {
      html += '<p class="empty">Tidak ada transaksi yang cocok. Coba ubah pencarian atau tambah transaksi baru.</p>';
    } else {
      html += '<div style="overflow-x:auto"><table class="data"><thead><tr><th>Tanggal</th><th>Deskripsi</th><th>Kategori</th><th class="right">Jumlah</th><th></th></tr></thead><tbody>' +
        list.map(function (t) {
          var c = D.categoryById(t.cat);
          return '<tr><td class="nowrap">' + D.formatDateID(t.date) + '</td><td>' + D.escapeHtml(t.desc) +
            '</td><td><span class="tag" style="background:' + c.color + '22;color:' + c.color + '">' + D.escapeHtml(c.name) + '</span></td>' +
            '<td class="right nowrap"><span class="amount ' + (t.type === 'in' ? 'in' : 'out') + '">' +
            (t.type === 'in' ? '+' : '−') + D.formatIDR(t.amount) + '</span></td>' +
            '<td class="right nowrap"><button class="btn ghost small" data-edit="' + t.id + '" type="button">Ubah</button> ' +
            '<button class="btn danger small" data-del="' + t.id + '" type="button">Hapus</button></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    html += '</div>';
    return html;
  }

  /* ---------------- Budgets ---------------- */
  function renderBudgets(state, ym) {
    var budgets = budgetFor(state, ym);
    var spent = spentByCategory(state, ym);
    var totalBudget = 0, totalSpent = 0, k;
    for (k in budgets) { totalBudget += budgets[k]; totalSpent += spent[k] || 0; }
    var overallPct = totalBudget > 0 ? Math.round(totalSpent / totalBudget * 100) : 0;
    var html = '<div class="page-head"><div><h1>Anggaran Bulanan</h1><p class="lede">Batas belanja tiap kategori untuk ' +
      D.escapeHtml(D.monthLabel(ym)) + '. Ubah angkanya kapan saja — progres terhitung dari transaksi bulan ini.</p></div>' +
      '<button class="btn ghost" id="budget-copy" type="button">Salin dari Oktober</button></div>';
    html += '<div class="card" style="margin-bottom:16px"><div class="bar-row"><span><b>Total terpakai</b> ' +
      D.formatIDR(totalSpent) + ' dari ' + D.formatIDR(totalBudget) + '</span><b class="pct ' + (overallPct > 100 ? 'over' : '') + '">' +
      overallPct + '%</b></div><div class="bar ' + (overallPct > 90 ? (overallPct > 100 ? 'over' : 'warn') : '') + '"><i style="width:' +
      Math.min(100, overallPct) + '%"></i></div>' +
      '<p class="small muted" style="margin-top:10px">Sisa anggaran keseluruhan: <b>' + D.formatIDR(Math.max(0, totalBudget - totalSpent)) + '</b>.</p></div>';
    html += '<div class="grid grid-2">' + D.CATEGORIES.filter(function (c) { return c.id !== 'lainnya'; }).map(function (c) {
      var b = budgets[c.id] || 0;
      var s = spent[c.id] || 0;
      var pct = b > 0 ? Math.round(s / b * 100) : 0;
      var cls = pct > 100 ? 'over' : (pct > 85 ? 'warn' : '');
      return '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline">' +
        '<h3><span class="dot" style="background:' + c.color + '"></span> ' + D.escapeHtml(c.name) + '</h3>' +
        '<button class="btn ghost small" data-budget-edit="' + c.id + '" type="button">Ubah batas</button></div>' +
        '<div class="bar-row"><span>Terpakai ' + D.formatIDR(s) + ' dari ' + D.formatIDR(b) + '</span><b class="pct ' + (pct > 100 ? 'over' : '') + '">' + pct + '%</b></div>' +
        '<div class="bar ' + cls + '"><i style="width:' + Math.min(100, pct) + '%"></i></div>' +
        '<p class="small muted" style="margin-top:8px">' + (s > b ? 'Melebihi anggaran sebesar ' + D.formatIDR(s - b) + '. Kurangi belanja kategori ini minggu depan.' :
          'Sisa ' + D.formatIDR(b - s) + ' untuk sisa bulan ini.') + '</p></div>';
    }).join('') + '</div>';
    return html;
  }

  /* ---------------- Goals ---------------- */
  function renderGoals(state) {
    var totalSaved = 0, totalTarget = 0;
    state.goals.forEach(function (g) { totalSaved += g.saved; totalTarget += g.target; });
    var html = '<div class="page-head"><div><h1>Tujuan Tabungan</h1><p class="lede">Total terkumpul ' +
      D.formatIDR(totalSaved) + ' dari target ' + D.formatIDR(totalTarget) +
      '. Tambah dana ke tujuan mana pun, atau buat tujuan baru.</p></div>' +
      '<button class="btn" id="goal-add" type="button">+ Tujuan Baru</button></div>';
    html += '<div class="grid grid-2">' + state.goals.map(function (g) {
      var pct = Math.min(100, Math.round(g.saved / g.target * 100));
      var remain = g.target - g.saved;
      return '<div class="card"><h2>' + D.escapeHtml(g.name) + '</h2><p class="sub">' + D.escapeHtml(g.note) + '</p>' +
        '<div class="bar-row"><span>' + D.formatIDR(g.saved) + ' dari ' + D.formatIDR(g.target) + '</span><b>' + pct + '%</b></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<p class="small muted" style="margin-top:8px">' + (remain > 0 ? 'Kurang ' + D.formatIDR(remain) + ' lagi.' : 'Target tercapai! 🎉') + '</p>' +
        '<div class="btn-row"><button class="btn small" data-goal-fund="' + g.id + '" type="button">+ Tambah Dana</button>' +
        '<button class="btn danger small" data-goal-del="' + g.id + '" type="button">Hapus</button></div></div>';
    }).join('') + '</div>';
    html += '<div class="card" style="margin-top:16px"><h2>Tips menabung keluarga</h2>' +
      '<p>Anggaran tabungan bulan ini Rp 2.000.000 — sisihkan di awal gajian, sebelum belanja lain. Dana darurat idealnya 3× pengeluaran pokok bulanan (sekitar Rp 9.000.000 untuk keluarga ini), dan Dana Darurat sudah 62% tercapai.</p></div>';
    return html;
  }

  /* ---------------- Bills ---------------- */
  function renderBills(state, ym) {
    var bills = state.bills.filter(function (b) { return b.month === ym; })
      .sort(function (a, b) { return a.dueDay - b.dueDay; });
    var unpaid = bills.filter(function (b) { return !b.paid; });
    var unpaidTotal = unpaid.reduce(function (s, b) { return s + b.amount; }, 0);
    var html = '<div class="page-head"><div><h1>Tagihan &amp; Pengingat</h1><p class="lede">' + unpaid.length +
      ' tagihan belum lunas senilai ' + D.formatIDR(unpaidTotal) + ' pada ' + D.escapeHtml(D.monthLabel(ym)) +
      '. Tandai lunas begitu dibayar — transaksi tercatat otomatis.</p></div>' +
      '<button class="btn" id="bill-add" type="button">+ Tambah Tagihan</button></div>';
    html += '<div class="card"><ul class="list">' + bills.map(function (b) {
      var status = b.paid ? '<span class="tag paid">Lunas</span>' :
        (b.dueDay <= 26 ? '<span class="tag due">Jatuh tempo</span>' : '<span class="tag soon">Akan datang</span>');
      return '<li><span class="grow"><span class="name">' + D.escapeHtml(b.name) + '</span><br><span class="meta">Jatuh tempo tanggal ' +
        b.dueDay + ' · ' + D.escapeHtml(D.monthLabel(ym)) + '</span></span>' + status +
        ' <span class="amount ' + (b.paid ? '' : 'due') + '">' + D.formatIDR(b.amount) + '</span>' +
        (b.paid ? '' : ' <button class="btn small" data-bill-pay="' + b.id + '" type="button">Tandai Lunas</button>') +
        ' <button class="btn danger small" data-bill-del="' + b.id + '" type="button">Hapus</button></li>';
    }).join('') + '</ul></div>';
    html += '<div class="tip" style="margin-top:16px"><b>Pengingat:</b> cicilan motor jatuh tempo tanggal 20 (' +
      D.formatIDR(850000) + ') dan iuran RT tanggal 25 (' + D.formatIDR(75000) +
      '). Bayar sebelum tanggalnya agar tidak kena denda.</div>';
    return html;
  }

  /* ---------------- Reports ---------------- */
  function renderReports(state, ym) {
    var months = ['2026-09', '2026-10', '2026-11'];
    var rows = months.map(function (m) {
      return { label: D.monthLabel(m).split(' ')[0], income: monthIncome(state, m), expense: monthExpense(state, m) };
    });
    var spent = spentByCategory(state, ym);
    var catRows = D.CATEGORIES.filter(function (c) { return spent[c.id] > 0; })
      .map(function (c) { return { label: c.name, value: spent[c.id], color: c.color }; })
      .sort(function (a, b) { return b.value - a.value; });
    var maxCat = catRows.length ? catRows[0].value : 0;
    var exp = monthExpense(state, ym), inc = monthIncome(state, ym);
    var saveRate = inc > 0 ? Math.round((inc - exp) / inc * 100) : 0;
    var top = catRows[0];
    var avgDaily = Math.round(exp / 26);
    var html = '<div class="page-head"><div><h1>Laporan Keuangan</h1><p class="lede">Ringkasan tiga bulan terakhir dan rincian ' +
      D.escapeHtml(D.monthLabel(ym)) + ' untuk keluarga.</p></div></div>';
    html += '<div class="grid grid-3" style="margin-bottom:16px">' +
      '<div class="card stat"><div class="label">Tingkat Tabungan</div><div class="value pos">' + saveRate + '%</div><div class="hint">dari pemasukan bulan ini</div></div>' +
      '<div class="card stat"><div class="label">Rata-rata Belanja / Hari</div><div class="value">' + D.formatIDR(avgDaily) + '</div><div class="hint">26 hari tercatat bulan ini</div></div>' +
      '<div class="card stat"><div class="label">Kategori Terbesar</div><div class="value" style="font-size:20px">' + (top ? D.escapeHtml(top.label) : '—') + '</div><div class="hint">' + (top ? D.formatIDR(top.value) : '') + '</div></div></div>';
    html += '<div class="grid grid-2" style="margin-bottom:16px">' +
      '<div class="card"><h2>Tren Bulanan</h2><p class="sub">Pemasukan vs pengeluaran</p>' +
      window.DanaCharts.monthBarChart(rows) +
      '<table class="data" style="margin-top:8px"><thead><tr><th>Bulan</th><th class="right">Pemasukan</th><th class="right">Pengeluaran</th><th class="right">Selisih</th></tr></thead><tbody>' +
      rows.map(function (r, i) {
        return '<tr><td>' + D.escapeHtml(D.monthLabel(months[i])) + '</td><td class="right">' + D.formatIDR(r.income) +
          '</td><td class="right">' + D.formatIDR(r.expense) + '</td><td class="right"><b>' + D.formatIDR(r.income - r.expense) + '</b></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="card"><h2>Rincian Kategori — ' + D.escapeHtml(D.monthLabel(ym)) + '</h2><p class="sub">Diurutkan dari yang terbesar</p>' +
      window.DanaCharts.categoryBars(catRows, maxCat) + '</div></div>';
    html += '<div class="card"><h2>Apa yang Bisa Diperbaiki Bulan Depan?</h2>' +
      '<div class="insight"><b>Belanja Harian</b> adalah pos terbesar (' + D.formatIDR(spent.belanja || 0) +
      '). Belanja mingguan di pasar tradisional sudah hemat — pertahankan pola 4× belanja mingguan dan kurangi jajan di luar jam makan.</div>' +
      '<div class="insight"><b>Makan di Luar</b> baru ' + D.formatIDR(spent.makan || 0) + ' dari anggaran ' +
      D.formatIDR((budgetFor(state, ym).makan) || 0) + '. Sisa anggaran ini bisa dialihkan ke Dana Darurat.</div>' +
      '<div class="insight"><b>Transportasi</b> ' + D.formatIDR(spent.transport || 0) + ' — servis motor rutin bulan ini menjaga biaya tetap rendah dibanding Oktober.</div></div>';
    return html;
  }

  /* ---------------- Settings ---------------- */
  function renderSettings(state) {
    var html = '<div class="page-head"><div><h1>Pengaturan</h1><p class="lede">Data keluarga, pemasukan bulanan, dan pengelolaan data aplikasi.</p></div></div>';
    html += '<div class="grid grid-2">' +
      '<div class="card"><h2>Profil Keluarga</h2><form class="stack" id="settings-form">' +
      '<label>Nama keluarga<input name="name" required maxlength="60" value="' + D.escapeHtml(state.household.name) + '"></label>' +
      '<label>Kota<input name="city" required maxlength="40" value="' + D.escapeHtml(state.household.city) + '"></label>' +
      '<label>Jumlah anggota keluarga<input name="members" type="number" min="1" max="20" required value="' + state.household.members + '"></label>' +
      '<div class="btn-row" style="margin-top:16px"><button class="btn" type="submit">Simpan Profil</button></div></form></div>' +
      '<div class="card"><h2>Pemasukan Bulanan</h2><p class="sub">Sumber pemasukan tetap keluarga (November 2026)</p><ul class="list">' +
      state.income.filter(function (r) { return r.month === '2026-11'; }).map(function (r) {
        return '<li><span class="grow"><span class="name">' + D.escapeHtml(r.label) + '</span></span><span class="amount in">' + D.formatIDR(r.amount) + '</span></li>';
      }).join('') + '</ul>' +
      '<p class="small muted">Ubah pemasukan lewat halaman Transaksi (tambah transaksi jenis Pemasukan) atau atur ulang data di bawah.</p></div></div>';
    html += '<div class="card" style="margin-top:16px"><h2>Kelola Data</h2>' +
      '<p>Semua data tersimpan lokal di peramban ini. Unduh salinan cadangan, atau kembalikan data ke contoh awal.</p>' +
      '<div class="btn-row"><button class="btn ghost" id="export-data" type="button">Unduh Data (JSON)</button>' +
      '<button class="btn danger" id="reset-data" type="button">Kembalikan ke Data Contoh</button></div>' +
      '<p class="small muted" id="settings-msg" style="margin-top:10px"></p></div>';
    return html;
  }

  window.DanaViews = {
    renderDashboard: renderDashboard,
    renderTransactions: renderTransactions,
    renderBudgets: renderBudgets,
    renderGoals: renderGoals,
    renderBills: renderBills,
    renderReports: renderReports,
    renderSettings: renderSettings,
    txFormHtml: txFormHtml,
    openModal: openModal,
    closeModal: closeModal,
    moneyInput: moneyInput,
    el: el
  };
})();
