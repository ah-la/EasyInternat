import { useEffect, useState } from 'react'
import { Check, Clock3, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

export default function Demandes() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', statut: '', date: '' })
  const role = getCurrentRole()

  useEffect(() => {
    setLoading(true)
    store.getDemandes(filters).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [filters])

  const updateStatus = async (id, statut) => {
    const demande = rows.find((row) => row.id === id)
    if (statut === 'Acceptee') await store.acceptDemande(id)
    else if (statut === 'Refusee') {
      const motif = window.prompt('Motif de refus', '')
      if (motif === null) return
      await store.refuseDemande(id, motif)
    }
    else await store.updateDemande(id, { statut: 'liste_attente' })

    setRows((current) => current.map((row) => (row.id === id ? { ...row, statut } : row)))
    if (statut === 'Acceptee') {
      toast.success(`Message envoye a ${demande.email} / ${demande.telephone}: votre demande est acceptee.`)
      return
    }
    const message =
      statut === 'Refusee'
          ? `Message envoye a ${demande.email} / ${demande.telephone}: votre demande est refusee.`
          : `Message envoye a ${demande.email} / ${demande.telephone}: votre dossier est en liste d attente.`

    toast.success(message)
  }

  const columns = [
    { accessorKey: 'id', header: 'Ref.' },
    { accessorKey: 'nom', header: 'Stagiaire' },
    { accessorKey: 'cin', header: 'CIN' },
    { accessorKey: 'telephone', header: 'Telephone' },
    { accessorKey: 'filiere', header: 'Filiere' },
    { accessorKey: 'genre', header: 'Genre' },
    { accessorKey: 'certificat', header: 'Certificat' },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge>
    },
    {
      accessorKey: 'actions',
      header: 'Decision',
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateStatus(row.original.id, 'Acceptee')}
            title="Accepter"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-green-100 bg-white text-success shadow-subtle transition hover:scale-105 hover:bg-green-50"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => updateStatus(row.original.id, 'Liste attente')}
            title="Liste attente"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 bg-white text-amber-700 shadow-subtle transition hover:scale-105 hover:bg-amber-50"
          >
            <Clock3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => updateStatus(row.original.id, 'Refusee')}
            title="Refuser"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-danger shadow-subtle transition hover:scale-105 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <DataTable
      title="Demandes"
      columns={columns}
      rows={rows}
      loading={loading}
      showHeading={false}
      filters={
        <div className="flex flex-wrap items-center gap-2">
          {role === 'admin' ? (
            <select
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
            >
              <option value="">Tous</option>
              <option value="filles">Filles</option>
              <option value="garcons">Garcons</option>
            </select>
          ) : null}
          <select
            value={filters.statut}
            onChange={(event) => setFilters((current) => ({ ...current, statut: event.target.value }))}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
          >
            <option value="">Statut</option>
            <option value="en_attente">En attente</option>
            <option value="liste_attente">Liste attente</option>
            <option value="acceptee">Acceptee</option>
            <option value="refusee">Refusee</option>
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
            className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-secondary"
          />
        </div>
      }
    />
  )
}
