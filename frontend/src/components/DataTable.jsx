import { Download, Loader2 } from 'lucide-react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
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
  showHeading = true,
  exportBeforeActions = false
}) {
  const tableColumns = useMemo(() => normalizeColumns(columns, rows), [columns, rows])

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel()
  })
  const hasRows = table.getRowModel().rows.length > 0

  const exportButton = (
    <Button type="button" variant="secondary" onClick={() => exportExcel(title, rows)}>
      <Download className="h-4 w-4" />
      Excel
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {showHeading ? <h2 className="text-xl font-bold text-primary">{title}</h2> : <div />}
        <div className="flex flex-wrap items-center justify-end gap-2">
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

      <div className="hidden md:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-y border-border bg-cyan-soft/70">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-3 font-semibold text-primary">
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
                <tr key={row.id} className="transition hover:bg-cyan-soft/50">
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
      </Card>
    </div>
  )
}
