import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightLeft, BedDouble, Building2, CheckCircle2, Eye, Pencil, Plus, RotateCcw, Trash2, UserMinus, UsersRound, X } from 'lucide-react'
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

function OccupantsModal({ chambre, basePath, busy, onClose, onRemove, onTransfer }) {
  if (!chambre) return null

  const occupants = chambre.occupantDetails?.length ? chambre.occupantDetails : []

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
          {occupants.length ? occupants.map((stagiaire) => (
            <div key={stagiaire.id} className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-primary">{stagiaire.nom}</p>
                <p className="text-xs font-semibold text-muted">CIN {stagiaire.cin || '-'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onTransfer(stagiaire)}
                  disabled={busy}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 text-xs font-black text-primary shadow-subtle transition hover:bg-cyan-soft disabled:opacity-60"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Transferer
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(stagiaire)}
                  disabled={busy}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-100 bg-white px-3 text-xs font-black text-danger shadow-subtle transition hover:bg-red-50 disabled:opacity-60"
                >
                  <UserMinus className="h-4 w-4" />
                  Retirer
                </button>
              </div>
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

function TransferModal({ stagiaire, currentRoom, chambres, busy, onClose, onSubmit }) {
  const [targetRoom, setTargetRoom] = useState('')

  useEffect(() => {
    if (!stagiaire) return
    const available = chambres.find((chambre) =>
      chambre.category === stagiaire.category &&
      String(chambre.id) !== String(currentRoom?.id) &&
      Number(chambre.occupants || 0) < Number(chambre.capacite || 4)
    )
    setTargetRoom(available?.id || '')
  }, [chambres, currentRoom, stagiaire])

  if (!stagiaire) return null

  const availableRooms = chambres.filter((chambre) =>
    chambre.category === stagiaire.category &&
    String(chambre.id) !== String(currentRoom?.id) &&
    Number(chambre.occupants || 0) < Number(chambre.capacite || 4)
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-soft text-primary">
              <ArrowRightLeft className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-black text-primary">Transferer vers une autre chambre</h2>
              <p className="mt-1 text-sm font-semibold text-muted">{stagiaire.nom}</p>
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

        <div className="space-y-4">
          <div className="rounded-2xl border border-sky-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-muted">Chambre actuelle</p>
            <p className="mt-1 text-base font-black text-primary">{currentRoom?.numero || '-'}</p>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-primary">Chambres disponibles</span>
            <select
              value={targetRoom}
              onChange={(event) => setTargetRoom(event.target.value)}
              className="h-12 w-full rounded-xl border border-sky-100 bg-white px-4 text-sm font-semibold text-primary outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15"
            >
              {availableRooms.length ? null : <option value="">Aucune chambre disponible</option>}
              {availableRooms.map((chambre) => (
                <option key={chambre.id} value={chambre.id}>
                  {chambre.numero} - {chambre.occupants}/{chambre.capacite}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button type="button" disabled={busy || !targetRoom} onClick={() => onSubmit(stagiaire, targetRoom)}>
            <ArrowRightLeft className="h-4 w-4" />
            Transferer
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
  const [transferTarget, setTransferTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionBusy, setActionBusy] = useState(false)
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

  const refreshRooms = async () => {
    const chambres = await store.getChambres()
    setAllRows(chambres)
    if (selectedRoom) {
      setSelectedRoom(chambres.find((chambre) => chambre.id === selectedRoom.id) || null)
    }
  }

  const removeOccupant = async (stagiaire) => {
    setActionBusy(true)
    try {
      await store.updateStagiaire(stagiaire.id, { chambre_id: null })
      await refreshRooms()
      toast.success(`${stagiaire.nom} retire de la chambre.`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Impossible de retirer ce stagiaire.")
    } finally {
      setActionBusy(false)
    }
  }

  const transferOccupant = async (stagiaire, chambreId) => {
    setActionBusy(true)
    try {
      await store.updateStagiaire(stagiaire.id, { chambre_id: chambreId })
      await refreshRooms()
      setTransferTarget(null)
      toast.success(`${stagiaire.nom} transfere avec succes.`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Impossible de transferer ce stagiaire.")
    } finally {
      setActionBusy(false)
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

  const summary = useMemo(() => {
    const total = rows.length
    const completes = rows.filter((chambre) => Number(chambre.occupants || 0) >= Number(chambre.capacite || 4)).length
    const placesLibres = rows.reduce((sum, chambre) => sum + Number(chambre.places_libres || 0), 0)
    return {
      total,
      disponibles: Math.max(0, total - completes),
      completes,
      placesLibres
    }
  }, [rows])

  const cards = [
    { label: 'Total chambres', value: summary.total, icon: Building2, tone: 'bg-cyan-soft text-primary' },
    { label: 'Disponibles', value: summary.disponibles, icon: CheckCircle2, tone: 'bg-green-50 text-success' },
    { label: 'Completes', value: summary.completes, icon: UsersRound, tone: 'bg-red-50 text-danger' },
    { label: 'Places libres', value: summary.placesLibres, icon: BedDouble, tone: 'bg-amber-50 text-amber-700' }
  ]

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-subtle">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-muted">{label}</p>
                <p className="mt-1 text-2xl font-black text-primary">{value}</p>
              </div>
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </div>

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

      <OccupantsModal
        chambre={selectedRoom}
        basePath={basePath}
        busy={actionBusy}
        onClose={() => setSelectedRoom(null)}
        onRemove={removeOccupant}
        onTransfer={(stagiaire) => setTransferTarget(stagiaire)}
      />

      <TransferModal
        stagiaire={transferTarget}
        currentRoom={selectedRoom}
        chambres={allRows}
        busy={actionBusy}
        onClose={() => setTransferTarget(null)}
        onSubmit={transferOccupant}
      />

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
