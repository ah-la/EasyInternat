import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Plus, RotateCcw, Trash2, UsersRound, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
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

function occupancyTone(occupants, capacite) {
  const ratio = Number(occupants || 0) / Number(capacite || 4)
  if (ratio >= 1) return { bar: 'bg-danger', text: 'text-danger' }
  if (ratio >= 0.75) return { bar: 'bg-warning', text: 'text-amber-700' }
  return { bar: 'bg-success', text: 'text-success' }
}

function OccupantsModal({ chambre, basePath, onClose }) {
  if (!chambre) return null

  const occupants = chambre.stagiaires?.length ? chambre.stagiaires : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-soft text-primary">
              <UsersRound className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-black text-primary">Occupants {chambre.numero}</h2>
              <p className="mt-1 text-sm font-semibold text-muted">
                {chambre.occupants}/{chambre.capacite} stagiaires affectes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft"
            title="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {occupants.length ? occupants.map((name) => (
            <div key={name} className="rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm font-black text-primary">
              {name}
            </div>
          )) : (
            <div className="rounded-2xl border border-sky-100 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-muted">
              Chambre vide
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Fermer
          </Button>
          <Button as={Link} to={`${basePath}/stagiaires`}>
            <UsersRound className="h-4 w-4" />
            Gerer occupants
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Chambres() {
  const [activeFloor, setActiveFloor] = useState('Tous')
  const [activeStatus, setActiveStatus] = useState('Tous')
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [allRows, setAllRows] = useState([])
  const [loading, setLoading] = useState(true)
  const role = getCurrentRole()
  const roleInfo = getRoleInfo(role)
  const basePath = role === 'admin' ? '/admin' : '/responsable'

  const loadRooms = () => {
    setLoading(true)
    store.getChambres().then(setAllRows).catch(() => setAllRows([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRooms()
  }, [])

  const resetFilters = () => {
    setActiveFloor('Tous')
    setActiveStatus('Tous')
    setActiveCategory('Tous')
  }

  const deleteRoom = async () => {
    if (!deleteTarget) return
    try {
      await store.deleteChambre(deleteTarget.id)
      setAllRows((current) => current.filter((row) => row.id !== deleteTarget.id))
      toast.success('Chambre supprimee avec succes.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de supprimer une chambre occupee.')
    } finally {
      setDeleteTarget(null)
    }
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
    {
      accessorKey: 'occupants',
      header: 'Occupation',
      cell: ({ row }) => {
        const tone = occupancyTone(row.original.occupants, row.original.capacite)
        const percent = Math.min(100, (Number(row.original.occupants || 0) / Number(row.original.capacite || 4)) * 100)

        return (
          <div className="min-w-[130px]">
            <div className={`mb-1 text-xs font-black ${tone.text}`}>
              {row.original.occupants}/{row.original.capacite}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'places_libres',
      header: 'Places libres',
      cell: ({ row }) => (
        <span className="font-black text-primary">
          {row.original.places_libres} place{row.original.places_libres > 1 ? 's' : ''}
        </span>
      )
    },
    {
      accessorKey: 'stagiaires',
      header: 'Occupants',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setSelectedRoom(row.original)}
          title="Voir occupants"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft"
        >
          <Eye className="h-4 w-4" />
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
        <div className="flex flex-nowrap items-center gap-2">
          <Link
            to={`${basePath}/chambres/${row.original.id}/edit`}
            title="Modifier"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              if (Number(row.original.occupants) > 0) {
                toast.error('Impossible de supprimer une chambre occupée.')
                return
              }
              setDeleteTarget(row.original)
            }}
            title="Supprimer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-danger shadow-subtle transition hover:scale-105 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <>
      <DataTable
        title="Chambres"
        columns={columns}
        rows={rows}
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
            <Button type="button" variant="secondary" onClick={resetFilters} title="Reinitialiser">
              <RotateCcw className="h-4 w-4" />
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

      <OccupantsModal chambre={selectedRoom} basePath={basePath} onClose={() => setSelectedRoom(null)} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer chambre"
        message={deleteTarget ? `Vous voulez vraiment supprimer la chambre ${deleteTarget.numero} ?` : ''}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={deleteRoom}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
