import { ArrowDownUp, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { SettlementPeriod } from '../types/dashboard'

type SortKey = keyof Pick<
  SettlementPeriod,
  | 'settlementPeriod'
  | 'actual_mw'
  | 'forecast_mw'
  | 'signed_error_mw'
  | 'abs_error_mw'
  | 'ape_percent'
>

const columns: Array<[string, SortKey]> = [
  ['Period', 'settlementPeriod'],
  ['Forecast', 'forecast_mw'],
  ['Actual', 'actual_mw'],
  ['Signed error', 'signed_error_mw'],
  ['Abs. error', 'abs_error_mw'],
  ['Error %', 'ape_percent'],
]

const fmt = (value: number) =>
  new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(value)

export function DataTable({
  rows,
  isMonthly,
}: {
  rows: SettlementPeriod[]
  isMonthly: boolean
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('settlementPeriod')
  const [ascending, setAscending] = useState(true)
  const [page, setPage] = useState(0)

  const pageSize = 24

  const data = useMemo(
    () =>
      rows
        .filter((row) =>
          `${row.settlementPeriod} ${row.startTime} ${row.publishTime}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort(
          (a, b) =>
            (Number(a[sort]) - Number(b[sort])) * (ascending ? 1 : -1),
        ),
    [rows, query, sort, ascending],
  )

  const pages = Math.max(1, Math.ceil(data.length / pageSize))
  const safePage = Math.min(page, pages - 1)
  const pageRows = data.slice(
    safePage * pageSize,
    (safePage + 1) * pageSize,
  )

  const changeSort = (key: SortKey) => {
    if (sort === key) {
      setAscending(!ascending)
    } else {
      setSort(key)
      setAscending(true)
    }

    setPage(0)
  }

  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">
            {isMonthly
              ? 'DAILY DELIVERY SUMMARY'
              : 'SETTLEMENT PERIOD DETAIL'}
          </p>
          <h2>
            {isMonthly
              ? 'Latest settlement period for each delivery day'
              : 'Granular forecast audit'}
          </h2>
        </div>

        <label className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(0)
            }}
            placeholder="Search period or timestamp"
          />
        </label>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              {columns.map(([label, key]) => (
                <th key={key}>
                  <button onClick={() => changeSort(key)}>
                    {label}
                    <ArrowDownUp size={13} />
                  </button>
                </th>
              ))}
              <th>Publish time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map((row) => {
              const status =
                Math.abs(row.signed_error_mw) < 1
                  ? 'Accurate'
                  : row.signed_error_mw > 0
                    ? 'Over-forecasted'
                    : 'Under-forecasted'

              return (
                <tr key={row.startTime}>
                  <td>{row.startTime.slice(0, 10)}</td>
                  <td>{row.settlementPeriod}</td>
                  <td>{fmt(row.forecast_mw)}</td>
                  <td>{fmt(row.actual_mw)}</td>
                  <td
                    className={
                      row.signed_error_mw > 0 ? 'positive' : 'negative'
                    }
                  >
                    {fmt(row.signed_error_mw)}
                  </td>
                  <td>{fmt(row.abs_error_mw)}</td>
                  <td>{fmt(row.ape_percent)}%</td>
                  <td>
                    {row.publishTime.slice(0, 16).replace('T', ' ')}
                  </td>
                  <td>
                    <span
                      className={`status-chip ${
                        status === 'Accurate'
                          ? 'neutral'
                          : row.signed_error_mw > 0
                            ? 'positive-chip'
                            : 'negative-chip'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          {data.length} matching {isMonthly ? 'days' : 'periods'}
        </span>

        <div>
          <button
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            Previous
          </button>

          <span>
            {safePage + 1} / {pages}
          </span>

          <button
            disabled={safePage >= pages - 1}
            onClick={() => setPage(safePage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}