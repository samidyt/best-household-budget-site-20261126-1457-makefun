/* DanaRumah — small inline-SVG chart builders (no libraries, no network). */
(function () {
  'use strict';

  /* Donut chart: slices = [{label, value, color}]. Returns an SVG string. */
  function donutChart(slices, size, thickness) {
    size = size || 220;
    thickness = thickness || 30;
    var total = 0, i;
    for (i = 0; i < slices.length; i++) total += slices[i].value;
    var cx = size / 2, cy = size / 2, r = (size - thickness) / 2;
    var circ = 2 * Math.PI * r;
    var out = '<svg class="chart-wrap" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Diagram lingkaran pengeluaran per kategori">';
    out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#eee7d8" stroke-width="' + thickness + '"/>';
    var offset = 0;
    for (i = 0; i < slices.length; i++) {
      var frac = total > 0 ? slices[i].value / total : 0;
      var len = frac * circ;
      if (len <= 0) continue;
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + slices[i].color +
        '" stroke-width="' + thickness + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (circ - len).toFixed(2) +
        '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
      offset += len;
    }
    out += '</svg>';
    return out;
  }

  /* Grouped vertical bar chart: months = [{label, income, expense}]. */
  function monthBarChart(months, width, height) {
    width = width || 640;
    height = height || 260;
    var padL = 8, padB = 28, padT = 14;
    var max = 0, i;
    for (i = 0; i < months.length; i++) {
      max = Math.max(max, months[i].income, months[i].expense);
    }
    if (max <= 0) max = 1;
    var plotH = height - padT - padB;
    var groupW = (width - padL * 2) / months.length;
    var barW = Math.min(34, (groupW - 18) / 2);
    var out = '<svg class="chart-wrap" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Grafik batang pemasukan dan pengeluaran per bulan">';
    // gridlines
    for (var g = 0; g <= 4; g++) {
      var y = padT + plotH - (plotH * g / 4);
      out += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (width - padL) + '" y2="' + y.toFixed(1) + '" stroke="#eee7d8" stroke-width="1"/>';
    }
    for (i = 0; i < months.length; i++) {
      var gx = padL + groupW * i + groupW / 2;
      var hInc = months[i].income / max * plotH;
      var hExp = months[i].expense / max * plotH;
      out += '<rect x="' + (gx - barW - 3).toFixed(1) + '" y="' + (padT + plotH - hInc).toFixed(1) +
        '" width="' + barW + '" height="' + hInc.toFixed(1) + '" rx="3" fill="#2e7d5b"><title>Pemasukan ' +
        months[i].label + ': ' + window.Dana.formatIDR(months[i].income) + '</title></rect>';
      out += '<rect x="' + (gx + 3).toFixed(1) + '" y="' + (padT + plotH - hExp).toFixed(1) +
        '" width="' + barW + '" height="' + hExp.toFixed(1) + '" rx="3" fill="#c9503c"><title>Pengeluaran ' +
        months[i].label + ': ' + window.Dana.formatIDR(months[i].expense) + '</title></rect>';
      out += '<text x="' + gx.toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle" font-size="13" fill="#6b7a73">' +
        months[i].label + '</text>';
    }
    out += '</svg>';
    out += '<p class="small muted"><span style="color:#2e7d5b">■</span> Pemasukan &nbsp; <span style="color:#c9503c">■</span> Pengeluaran</p>';
    return out;
  }

  /* Horizontal category bars for the report page. */
  function categoryBars(rows, maxValue) {
    var out = '';
    for (var i = 0; i < rows.length; i++) {
      var pct = maxValue > 0 ? Math.round(rows[i].value / maxValue * 100) : 0;
      out += '<div class="bar-row"><span><span class="dot" style="display:inline-block;background:' + rows[i].color +
        '"></span> ' + window.Dana.escapeHtml(rows[i].label) + '</span><b>' +
        window.Dana.formatIDR(rows[i].value) + '</b></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>';
    }
    return out;
  }

  window.DanaCharts = {
    donutChart: donutChart,
    monthBarChart: monthBarChart,
    categoryBars: categoryBars
  };
})();
