[![Make.fun competition](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/samidyt/best-household-budget-site-20261126-1457-makefun/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/samidyt/best-household-budget-site-20261126-1457-makefun/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

# DanaRumah — Anggaran Rumah Tangga

A household budget site for an Indonesian family (Keluarga Wijaya, Sidoarjo):
track monthly income vs spending, set category budgets, record transactions,
save toward goals, stay on top of bills, and read monthly reports — all in the
browser, with no network requests. Data is stored locally (localStorage) and
never leaves the device.

## What it does

- **Dasbor** — income, spending, remaining money, spending donut by category,
  income-vs-expense bar chart, latest transactions, unpaid bills, savings goals.
- **Transaksi** — full transaction list with search and category filter; add,
  edit, and delete transactions.
- **Anggaran** — monthly budget per category with progress bars and editable
  limits; copy last month's budget in one click.
- **Tujuan** — savings goals with progress, add funds, create or remove goals.
- **Tagihan** — recurring bills with due dates; mark paid (records the
  transaction automatically), add or remove bills.
- **Laporan** — three-month income-vs-expense trend, category breakdown, and
  plain-language suggestions for next month.
- **Pengaturan** — household profile, monthly income, export data as JSON,
  reset to the example data.

Figures are realistic Indonesian household amounts in rupiah (IDR), for
September–November 2026. The month switcher in the top bar moves between them.

## Run it locally

Serve `app/` with any static server, e.g.:

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080 in desktop Chrome or on a phone.

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with `buildDossier` from
`vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Entry for the make.fun bounty
[Make the best household budget site](https://make.fun/bounty/best-household-budget-site-20261126-1457).
