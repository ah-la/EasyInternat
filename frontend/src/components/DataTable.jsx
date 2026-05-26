import { Download, Loader2 } from 'lucide-react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import Button from './ui/Button.jsx'
import Card from './ui/Card.jsx'
import Badge, { statusTone } from './ui/Badge.jsx'

function normalizeColumns(columns, rows) {
  if (columns?.[0]?.accessorKey) {
    return columns.map((column) => ({
      ...column,
      cell:
        column.cell ||
        (({ getValue }) => {
          const value = getValue()
          const isStatus = ['statut', 'paiement', 'presence'].includes(column.accessorKey)
          return isStatus ? <Badge tone={statusTone(value)}>{value}</Badge> : value
        })
    }))
  }

  const keys = Object.keys(rows?.[0] || {})
  return keys.map((key) => ({
    accessorKey: key,
    header: key.charAt(0).toUpperCase() + key.slice(1),
    cell: ({ getValue }) => {
      const value = getValue()
      const isStatus = ['statut', 'paiement', 'presence'].includes(key)
      return isStatus ? <Badge tone={statusTone(value)}>{value}</Badge> : value
    }
  }))
}

function exportExcel(title, rows) {
  const cleanRows = (rows || []).filter((row) => !row.isDetails)
  const keys = Object.keys(cleanRows?.[0] || {}).filter((key) => !['detailsNode', 'isDetails'].includes(key))
  const escape = (value) => `"${String(Array.isArray(value) ? value.join(', ') : value ?? '').replace(/"/g, '""')}"`
  const content = [
    keys.map(escape).join(';'),
    ...cleanRows.map((row) => keys.map((key) => escape(row[key])).join(';'))
  ].join('\n')
  const blob = new Blob([`\ufeff${content}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function LoadingRows({ columnsCount = 4 }) {
  return Array.from({ length: 5 }).map((_, rowIndex) => (
    <tr key={rowIndex} className="border-b border-border">
      {Array.from({ length: columnsCount }).map((__, columnIndex) => (
        <td key={columnIndex} className="px-3 py-3">
          <div className="h-4 animate-pulse rounded bg-cyan-soft" />
        </td>
      ))}
    </tr>
  ))
}

function LoadingCards() {
  return Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="rounded-lg border border-border bg-white p-3 shadow-subtle">
      <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-cyan-soft" />
      <div className="space-y-2">
        <div className="h-3 animate-pulse rounded bg-cyan-soft" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-cyan-soft" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-cyan-soft" />
      </div>
    </div>
  ))
}

export default function DataTable({
  title,
  columns,
  rows = [],
  actions,
  filters,
  loading = false,
  emptyMessage = 'Aucune donnee trouvee',
  searchable = true,
  pageSize = 8,
  showHeading = true,
  exportBeforeActions = false
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const tableColumns = useMemo(() => normalizeColumns(columns, rows), [columns, rows])
  const searchableRows = useMemo(() => rows.filter((row) => !row.isDetails), [rows])
  const detailRows = useMemo(() => rows.filter((row) => row.isDetails), [rows])
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows

    const matches = searchableRows.filter((row) =>
      Object.entries(row).some(([key, value]) => {
        if (['detailsNode', 'isDetails'].includes(key)) return false
        if (Array.isArray(value)) return value.join(' ').toLowerCase().includes(term)
        return String(value ?? '').toLowerCase().includes(term)
      })
    )
    const matchIds = new Set(matches.map((row) => String(row.id ?? row.numero)))

    return [
      ...matches,
      ...detailRows.filter((row) => {
        const baseId = String(row.id || '').replace('-details', '')
        return matchIds.has(baseId)
      })
    ]
  }, [detailRows, rows, search, searchableRows])
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [currentPage, filteredRows, pageSize])

  const table = useReactTable({
    data: paginatedRows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel()
  })
  const hasRows = table.getRowModel().rows.length > 0

  const exportButton = (
    <Button type="button" variant="secondary" onClick={() => exportExcel(title, filteredRows)}>
      <Download className="h-4 w-4" />
      Excel
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {showHeading ? <h2 className="text-xl font-bold text-primary">{title}</h2> : <div />}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {searchable ? (
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder={`Rechercher dans ${title.toLowerCase()}...`}
              className="h-11 w-full rounded-xl border border-sky-100 bg-white/90 px-3 text-sm font-semibold text-primary shadow-subtle outline-none transition placeholder:text-muted focus:border-secondary focus:ring-4 focus:ring-secondary/15 sm:w-64"
            />
          ) : null}
          {exportBeforeActions ? exportButton : null}
          {actions}
          {!exportBeforeActions ? exportButton : null}
          {filters}
        </div>
      </div>

      <Card className="relative min-w-0 overflow-hidden">
      {loading && hasRows ? (
        <div className="absolute inset-0 z-10 flex items-start justify-end bg-white/55 p-3 backdrop-blur-[1px]">
          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold text-primary shadow-subtle">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement
          </span>
        </div>
      ) : null}

      <div className="space-y-3 md:hidden">
        {loading && !hasRows ? <LoadingCards /> : null}
        {!loading && !hasRows ? (
          <div className="rounded-lg border border-border bg-white p-4 text-center text-sm font-semibold text-muted">
            {emptyMessage}
          </div>
        ) : null}
        {table.getRowModel().rows.map((row) => {
          if (row.original?.isDetails) {
            return (
              <div key={row.id} className="rounded-lg border border-border bg-cyan-soft/45 p-3">
                {row.original.detailsNode}
              </div>
            )
          }

          return (
            <div key={row.id} className="rounded-lg border border-border bg-white p-3 shadow-subtle">
              {row.getVisibleCells().map((cell) => {
                const header = cell.column.columnDef.header
                return (
                  <div key={cell.id} className="flex items-start justify-between gap-3 border-b border-border py-2 last:border-b-0">
                    <span className="text-xs font-bold uppercase text-muted">{typeof header === 'string' ? header : cell.column.id}</span>
                    <div className="max-w-[60%] text-right text-sm font-semibold text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="hidden rounded-2xl border border-sky-50 md:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-y border-border bg-cyan-soft/95 backdrop-blur">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-3 font-black text-primary">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {loading && !hasRows ? <LoadingRows columnsCount={tableColumns.length || 4} /> : null}
            {!loading && !hasRows ? (
              <tr>
                <td colSpan={tableColumns.length || 1} className="px-3 py-8 text-center text-sm font-semibold text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
            {table.getRowModel().rows.map((row) => {
              if (row.original?.isDetails) {
                return (
                  <tr key={row.id} className="bg-cyan-soft/45">
                    <td colSpan={row.getVisibleCells().length} className="px-3 py-3 text-slate-700">
                      {row.original.detailsNode}
                    </td>
                  </tr>
                )
              }

              return (
                <tr key={row.id} className="transition odd:bg-white even:bg-slate-50/70 hover:bg-cyan-soft/70">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="break-words px-3 py-3 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-sky-50 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-muted">
            Page {currentPage} sur {totalPages} - {filteredRows.length} lignes
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="h-9 rounded-xl border border-sky-100 bg-white px-3 text-sm font-black text-primary shadow-subtle transition hover:bg-cyan-soft disabled:cursor-not-allowed disabled:opacity-45"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 min-w-9 rounded-xl border px-3 text-sm font-black transition ${
                    pageNumber === currentPage
                      ? 'border-secondary bg-secondary text-white shadow-[0_12px_24px_rgba(14,165,233,0.22)]'
                      : 'border-sky-100 bg-white text-primary shadow-subtle hover:bg-cyan-soft'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="h-9 rounded-xl border border-sky-100 bg-white px-3 text-sm font-black text-primary shadow-subtle transition hover:bg-cyan-soft disabled:cursor-not-allowed disabled:opacity-45"
            >
              &gt;
            </button>
          </div>
        </div>
      ) : null}
      </Card>
    </div>
  )
}
