import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

export default function Presences() {
  const [rows, setRows] = useState([])
  const role = getCurrentRole()
  const roleGender = role === 'responsable_filles' ? 'Fille' : role === 'responsable_garcons' ? 'Garcon' : null

  const visibleRows = useMemo(() => {
    if (!roleGender) return rows
    return rows.filter((row) => row.genre === roleGender)
  }, [rows, roleGender])

  useEffect(() => {
    store.getSorties().then(setRows).catch(() => setRows([]))
  }, [])

  const updateStatus = async (id, statut) => {
    await store.updateSortie(id, { statut: statut === 'Validee' ? 'validee' : 'refusee' })
    setRows((current) => current.map((row) => (row.id === id ? { ...row, statut } : row)))
  }

  const columns = [
    { accessorKey: 'id', header: 'Ref.' },
    { accessorKey: 'stagiaire', header: 'Stagiaire' },
    { accessorKey: 'genre', header: 'Genre' },
    { accessorKey: 'dateSortie', header: 'Date sortie' },
    { accessorKey: 'dateRetour', header: 'Date retour' },
    { accessorKey: 'motif', header: 'Motif' },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge>
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={() => updateStatus(row.original.id, 'Validee')}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-green-100 bg-white px-2 text-xs font-semibold text-success hover:bg-green-50"
          >
            <Check className="h-3.5 w-3.5" />
            Valider
          </button>
          <button
            type="button"
            onClick={() => updateStatus(row.original.id, 'Refusee')}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-100 bg-white px-2 text-xs font-semibold text-danger hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5" />
            Refuser
          </button>
        </div>
      )
    }
  ]

  return <DataTable title="Sorties" columns={columns} rows={visibleRows} showHeading={false} />
}
