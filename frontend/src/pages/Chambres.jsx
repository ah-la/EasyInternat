import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Pencil, Plus, RotateCcw } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { getCurrentRole, getRoleInfo } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const floors = [
  { value: 'Tous', label: 'Tous les etages' },
  { value: 'Rez de chaussee', label: 'Rez de chaussee' },
  { value: '1ere etage', label: '1ere etage' },
  { value: '2eme etage', label: '2eme etage' }
]
const statuses = [
  { value: 'Tous', label: 'Tous statuts' },
  { value: 'Disponible', label: 'Disponible' },
  { value: 'Complete', label: 'Complete' }
]
const categories = [
  { value: 'Tous', label: 'Toutes categories' },
  { value: 'Filles', label: 'Filles' },
  { value: 'Garcons', label: 'Garcons' }
]

export default function Chambres() {
  const [activeFloor, setActiveFloor] = useState('Tous')
  const [activeStatus, setActiveStatus] = useState('Tous')
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [expanded, setExpanded] = useState(null)
  const [allRows, setAllRows] = useState([])
  const [loading, setLoading] = useState(true)
  const role = getCurrentRole()
  const roleInfo = getRoleInfo(role)
  const basePath = role === 'admin' ? '/admin' : '/responsable'

  useEffect(() => {
    setLoading(true)
    store.getChambres().then(setAllRows).catch(() => setAllRows([])).finally(() => setLoading(false))
  }, [])

  const resetFilters = () => {
    setActiveFloor('Tous')
    setActiveStatus('Tous')
    setActiveCategory('Tous')
  }

  const rows = useMemo(() => {
    return allRows.filter((chambre) => {
      const roleMatch = roleInfo.gender ? chambre.categorie === `${roleInfo.gender}s` : true
      const floorMatch = activeFloor === 'Tous' || chambre.etage === activeFloor
      const statusMatch = activeStatus === 'Tous' || chambre.statut === activeStatus
      const categoryMatch = activeCategory === 'Tous' || chambre.categorie === activeCategory
      return roleMatch && floorMatch && statusMatch && categoryMatch
    })
  }, [activeCategory, activeFloor, activeStatus, roleInfo.gender, allRows])

  const columns = [
    { accessorKey: 'numero', header: 'Chambre' },
    { accessorKey: 'etage', header: 'Etage' },
    { accessorKey: 'categorie', header: 'Categorie' },
    { accessorKey: 'capacite', header: 'Capacite' },
    {
      accessorKey: 'occupants',
      header: 'Occupants',
      cell: ({ row }) => `${row.original.occupants}/${row.original.capacite}`
    },
    {
      accessorKey: 'stagiaires',
      header: 'Stagiaires',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setExpanded((current) => (current === row.original.numero ? null : row.original.numero))}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-2 text-xs font-semibold text-primary hover:border-secondary/50"
        >
          {expanded === row.original.numero ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          Voir
        </button>
      )
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge>
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link
          to={`${basePath}/chambres/${row.original.id}/edit`}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-2 text-xs font-semibold text-primary hover:border-secondary/50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </Link>
      )
    }
  ]

  const displayRows = rows.flatMap((row) => {
    if (expanded !== row.numero) return [row]
    const details = row.stagiaires?.length ? row.stagiaires : ['Chambre vide']
    return [
      row,
      {
        id: `${row.numero}-details`,
        isDetails: true,
        detailsNode: (
          <div className="flex flex-wrap gap-2">
            {details.map((name) => (
              <span key={name} className="rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-semibold text-primary shadow-subtle">
                {name}
              </span>
            ))}
          </div>
        )
      }
    ]
  })

  return (
    <DataTable
      title="Chambres"
      columns={columns}
      rows={displayRows}
      loading={loading}
      showHeading={false}
      actions={
        <Button as={Link} to={`${basePath}/chambres/new`}>
          <Plus className="h-4 w-4" />
          Ajouter chambre
        </Button>
      }
      filters={
        <>
          <Button type="button" variant="secondary" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4" />
            Reinitialiser
          </Button>
          <select className="input h-11 w-44" value={activeFloor} onChange={(event) => setActiveFloor(event.target.value)}>
            {floors.map((floor) => <option key={floor.value} value={floor.value}>{floor.label}</option>)}
          </select>
          {role === 'admin' && (
            <select className="input h-11 w-36" value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
              {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
            </select>
          )}
          <select className="input h-11 w-36" value={activeStatus} onChange={(event) => setActiveStatus(event.target.value)}>
            {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </>
      }
    />
  )
}
