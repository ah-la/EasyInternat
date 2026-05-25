import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Button from '../components/ui/Button.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const columns = [
  { accessorKey: 'mois', header: 'Mois' },
  { accessorKey: 'stagiaire', header: 'Stagiaire' },
  { accessorKey: 'chambre', header: 'Chambre' },
  { accessorKey: 'categorie', header: 'Categorie' },
  { accessorKey: 'montant', header: 'Montant' },
  { accessorKey: 'statut', header: 'Statut' },
  { accessorKey: 'date', header: 'Date paiement' }
]

export default function Paiements() {
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ category: '', chambre: '', mois: '', statut: '', date: '' })
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'

  useEffect(() => {
    store.getPaiements(filters).then(setRows).catch(() => setRows([]))
  }, [filters])

  return (
    <DataTable
      title="Paiements"
      columns={columns}
      rows={rows}
      showHeading={false}
      actions={
        <Button as={Link} to={`${basePath}/paiements/new`}>
          <Plus className="h-4 w-4" />
          Ajouter paiement
        </Button>
      }
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
          <input
            value={filters.chambre}
            onChange={(event) => setFilters((current) => ({ ...current, chambre: event.target.value }))}
            placeholder="Chambre"
            className="h-10 w-28 rounded-lg border border-border px-3 text-sm outline-none focus:border-secondary"
          />
          <input
            value={filters.mois}
            onChange={(event) => setFilters((current) => ({ ...current, mois: event.target.value }))}
            placeholder="Mois"
            className="h-10 w-28 rounded-lg border border-border px-3 text-sm outline-none focus:border-secondary"
          />
          <select
            value={filters.statut}
            onChange={(event) => setFilters((current) => ({ ...current, statut: event.target.value }))}
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
          >
            <option value="">Statut</option>
            <option value="paye">Paye</option>
            <option value="en_retard">En retard</option>
            <option value="non_paye">Non paye</option>
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
