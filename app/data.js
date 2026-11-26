/* DanaRumah — seed data and shared helpers.
   All figures are realistic Indonesian household (IDR) examples for Nov 2026.
   The app stores its live state in localStorage under DANA_KEY; the seed below
   is only the first-run starting point. */
(function () {
  'use strict';

  var DANA_KEY = 'danarumah-v1';

  var CATEGORIES = [
    { id: 'belanja',    name: 'Belanja Harian',   color: '#2e7d5b' },
    { id: 'makan',      name: 'Makan di Luar',    color: '#e8a33d' },
    { id: 'transport',  name: 'Transportasi',     color: '#2f6fb2' },
    { id: 'listrik',    name: 'Listrik & Air',    color: '#7a5fb0' },
    { id: 'internet',   name: 'Internet & HP',    color: '#3d9b8f' },
    { id: 'pendidikan', name: 'Pendidikan',       color: '#b0653a' },
    { id: 'kesehatan',  name: 'Kesehatan',        color: '#c9503c' },
    { id: 'hiburan',    name: 'Hiburan',          color: '#8a6d3b' },
    { id: 'pakaian',    name: 'Pakaian',          color: '#5b7a2e' },
    { id: 'tabungan',   name: 'Tabungan',         color: '#0f5b4a' },
    { id: 'lainnya',    name: 'Lainnya',          color: '#8a94a0' }
  ];

  var MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function seedData() {
    return {
      household: { name: 'Keluarga Wijaya', members: 4, city: 'Sidoarjo' },
      income: [
        { id: 'inc-gaji',   label: 'Gaji Bulanan (Ayah)',  amount: 9500000, month: '2026-11' },
        { id: 'inc-usaha',  label: 'Usaha Sampingan (Ibu)', amount: 3000000, month: '2026-11' },
        { id: 'inc-gaji-10', label: 'Gaji Bulanan (Ayah)', amount: 9500000, month: '2026-10' },
        { id: 'inc-usaha-10', label: 'Usaha Sampingan (Ibu)', amount: 2800000, month: '2026-10' },
        { id: 'inc-gaji-09', label: 'Gaji Bulanan (Ayah)', amount: 9500000, month: '2026-09' },
        { id: 'inc-usaha-09', label: 'Usaha Sampingan (Ibu)', amount: 2400000, month: '2026-09' }
      ],
      budgets: {
        '2026-11': { belanja: 3000000, makan: 800000, transport: 1200000, listrik: 650000,
          internet: 450000, pendidikan: 1500000, kesehatan: 500000, hiburan: 600000,
          pakaian: 400000, tabungan: 2000000 },
        '2026-10': { belanja: 3000000, makan: 800000, transport: 1200000, listrik: 650000,
          internet: 450000, pendidikan: 1500000, kesehatan: 500000, hiburan: 600000,
          pakaian: 400000, tabungan: 2000000 }
      },
      transactions: [
        { id: 't01', date: '2026-11-01', desc: 'Gaji Bulanan (Ayah)', cat: 'lainnya', type: 'in', amount: 9500000 },
        { id: 't02', date: '2026-11-02', desc: 'Belanja mingguan — Pasar Tradisional', cat: 'belanja', type: 'out', amount: 685000 },
        { id: 't03', date: '2026-11-03', desc: 'Usaha Sampingan (Ibu)', cat: 'lainnya', type: 'in', amount: 3000000 },
        { id: 't04', date: '2026-11-04', desc: 'Bensin motor (2x isi)', cat: 'transport', type: 'out', amount: 120000 },
        { id: 't05', date: '2026-11-05', desc: 'Internet rumah — IndiHome', cat: 'internet', type: 'out', amount: 350000 },
        { id: 't06', date: '2026-11-06', desc: 'SPP sekolah Anisa', cat: 'pendidikan', type: 'out', amount: 750000 },
        { id: 't07', date: '2026-11-07', desc: 'Belanja sayur & buah — Tukang Sayur', cat: 'belanja', type: 'out', amount: 215000 },
        { id: 't08', date: '2026-11-08', desc: 'Makan malam keluarga — Warung Bu Tini', cat: 'makan', type: 'out', amount: 185000 },
        { id: 't09', date: '2026-11-09', desc: 'Beras 25 kg + minyak goreng', cat: 'belanja', type: 'out', amount: 420000 },
        { id: 't10', date: '2026-11-10', desc: 'Listrik PLN (token)', cat: 'listrik', type: 'out', amount: 612000 },
        { id: 't11', date: '2026-11-11', desc: 'BPJS Kesehatan keluarga', cat: 'kesehatan', type: 'out', amount: 420000 },
        { id: 't12', date: '2026-11-12', desc: 'Ojek online — antar Anisa les', cat: 'transport', type: 'out', amount: 45000 },
        { id: 't13', date: '2026-11-13', desc: 'Buku & alat tulis — Toko Buku Pelita', cat: 'pendidikan', type: 'out', amount: 265000 },
        { id: 't14', date: '2026-11-14', desc: 'Belanja mingguan — Supermarket', cat: 'belanja', type: 'out', amount: 745000 },
        { id: 't15', date: '2026-11-15', desc: 'PDAM — tagihan air', cat: 'listrik', type: 'out', amount: 185000 },
        { id: 't16', date: '2026-11-16', desc: 'Nonton bioskop — keluarga (4 tiket)', cat: 'hiburan', type: 'out', amount: 200000 },
        { id: 't17', date: '2026-11-17', desc: 'Pulsa & paket data — 2 nomor', cat: 'internet', type: 'out', amount: 150000 },
        { id: 't18', date: '2026-11-18', desc: 'Servis motor — ganti oli', cat: 'transport', type: 'out', amount: 185000 },
        { id: 't19', date: '2026-11-19', desc: 'Belanja sayur & lauk pauk', cat: 'belanja', type: 'out', amount: 268000 },
        { id: 't20', date: '2026-11-20', desc: 'Makan siang — Ayam Geprek (kantor)', cat: 'makan', type: 'out', amount: 95000 },
        { id: 't21', date: '2026-11-21', desc: 'Les piano Anisa — bulan November', cat: 'pendidikan', type: 'out', amount: 350000 },
        { id: 't22', date: '2026-11-22', desc: 'Baju sekolah — seragam olahraga', cat: 'pakaian', type: 'out', amount: 175000 },
        { id: 't23', date: '2026-11-23', desc: 'Pindah ke tabungan — Dana Darurat', cat: 'tabungan', type: 'out', amount: 1000000 },
        { id: 't24', date: '2026-11-24', desc: 'Belanja mingguan — Pasar Tradisional', cat: 'belanja', type: 'out', amount: 590000 },
        { id: 't25', date: '2026-11-25', desc: 'Obat & vitamin — Apotek Sehat', cat: 'kesehatan', type: 'out', amount: 135000 },
        { id: 't26', date: '2026-11-26', desc: 'Parkir & tol — perjalanan dinas', cat: 'transport', type: 'out', amount: 85000 },
        { id: 't27', date: '2026-10-03', desc: 'Belanja mingguan — Pasar Tradisional', cat: 'belanja', type: 'out', amount: 640000 },
        { id: 't28', date: '2026-10-05', desc: 'Internet rumah — IndiHome', cat: 'internet', type: 'out', amount: 350000 },
        { id: 't29', date: '2026-10-07', desc: 'SPP sekolah Anisa', cat: 'pendidikan', type: 'out', amount: 750000 },
        { id: 't30', date: '2026-10-10', desc: 'Listrik PLN (token)', cat: 'listrik', type: 'out', amount: 598000 },
        { id: 't31', date: '2026-10-14', desc: 'Belanja mingguan — Supermarket', cat: 'belanja', type: 'out', amount: 712000 },
        { id: 't32', date: '2026-10-18', desc: 'Makan malam — resto keluarga', cat: 'makan', type: 'out', amount: 320000 },
        { id: 't33', date: '2026-10-22', desc: 'Servis motor + ban', cat: 'transport', type: 'out', amount: 340000 },
        { id: 't34', date: '2026-10-25', desc: 'Pindah ke tabungan — Dana Darurat', cat: 'tabungan', type: 'out', amount: 1000000 },
        { id: 't35', date: '2026-09-04', desc: 'Belanja mingguan — Pasar Tradisional', cat: 'belanja', type: 'out', amount: 605000 },
        { id: 't36', date: '2026-09-10', desc: 'Listrik PLN (token)', cat: 'listrik', type: 'out', amount: 575000 },
        { id: 't37', date: '2026-09-15', desc: 'Belanja mingguan — Supermarket', cat: 'belanja', type: 'out', amount: 690000 },
        { id: 't38', date: '2026-09-20', desc: 'Makan malam — resto keluarga', cat: 'makan', type: 'out', amount: 285000 },
        { id: 't39', date: '2026-09-25', desc: 'Pindah ke tabungan — Dana Darurat', cat: 'tabungan', type: 'out', amount: 1000000 }
      ],
      goals: [
        { id: 'g1', name: 'Dana Darurat', target: 10000000, saved: 6250000, note: 'Cadangan 3 bulan pengeluaran pokok.' },
        { id: 'g2', name: 'Liburan Keluarga', target: 5000000, saved: 2100000, note: 'Liburan akhir tahun ke Malang.' },
        { id: 'g3', name: 'Renovasi Dapur', target: 8000000, saved: 1400000, note: 'Ganti meja dapur dan rak piring.' },
        { id: 'g4', name: 'Motor Baru', target: 15000000, saved: 3750000, note: 'Ganti motor lama yang sering mogok.' }
      ],
      bills: [
        { id: 'b1', name: 'Internet Rumah — IndiHome', amount: 350000, dueDay: 5, paid: true, month: '2026-11' },
        { id: 'b2', name: 'SPP Sekolah Anisa', amount: 750000, dueDay: 7, paid: true, month: '2026-11' },
        { id: 'b3', name: 'Listrik PLN', amount: 612000, dueDay: 10, paid: true, month: '2026-11' },
        { id: 'b4', name: 'BPJS Kesehatan', amount: 420000, dueDay: 10, paid: true, month: '2026-11' },
        { id: 'b5', name: 'PDAM — Air Bersih', amount: 185000, dueDay: 15, paid: true, month: '2026-11' },
        { id: 'b6', name: 'Cicilan Motor', amount: 850000, dueDay: 20, paid: false, month: '2026-11' },
        { id: 'b7', name: 'Iuran RT & Keamanan', amount: 75000, dueDay: 25, paid: false, month: '2026-11' }
      ]
    };
  }

  function formatIDR(n) {
    return 'Rp ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function formatDateID(iso) {
    var parts = iso.split('-');
    return parseInt(parts[2], 10) + ' ' + MONTH_NAMES[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
  }

  function monthLabel(ym) {
    var parts = ym.split('-');
    return MONTH_NAMES[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
  }

  function categoryById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) return CATEGORIES[i];
    }
    return { id: id, name: id, color: '#8a94a0' };
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(DANA_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.transactions && parsed.budgets) return parsed;
      }
    } catch (e) { /* fall through to seed */ }
    var fresh = seedData();
    saveState(fresh);
    return fresh;
  }

  function saveState(state) {
    try { window.localStorage.setItem(DANA_KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
  }

  function resetState() {
    var fresh = seedData();
    saveState(fresh);
    return fresh;
  }

  window.Dana = {
    DANA_KEY: DANA_KEY,
    CATEGORIES: CATEGORIES,
    MONTH_NAMES: MONTH_NAMES,
    seedData: seedData,
    formatIDR: formatIDR,
    formatDateID: formatDateID,
    monthLabel: monthLabel,
    categoryById: categoryById,
    escapeHtml: escapeHtml,
    loadState: loadState,
    saveState: saveState,
    resetState: resetState
  };
})();
