import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Plus, Power, PowerOff, ShieldCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { store } from '../lib/store.js'

function ResponsableModal({ responsable, onClose }) {
  if (!responsable) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-soft text-primary">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-black text-primary">{responsable.nom}</h2>
              <p className="mt-1 text-sm font-semibold text-muted">{responsable.roleLabel}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft" title="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Email', responsable.email],
            ['Telephone', responsable.telephone || '-'],
            ['Categorie', responsable.categorie],
            ['Statut', responsable.statut],
            ['Derniere connexion', responsable.last_login],
            ['Stagiaires geres', responsable.managed_count],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-sky-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-muted">{label}</p>
              <p className="mt-1 text-sm font-black text-primary">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-sky-100 bg-cyan-soft/60 p-4 text-sm font-semibold text-primary">
          Ce responsable peut gerer uniquement les donnees de sa categorie.
        </div>
      </div>
    </div>
  )
}

export default function Responsables() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusTarget, setStatusTarget] = useState(null)
  const [selected, setSelected] = useState(null)

  const loadRows = () => {
    setLoading(true)
    store.getResponsables().then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRows()
  }, [])

  const toggleStatus = async () => {
    if (!statusTarget) return
    const nextActive = !statusTarget.is_active
    try {
      const updated = await store.updateResponsable(statusTarget.id, { is_active: nextActive })
      setRows((current) => current.map((row) => (row.id === statusTarget.id ? updated : row)))
      toast.success(nextActive ? 'Responsable active avec succes.' : 'Responsable desactive avec succes.')
    } catch (error) {
      toast.error(error.response?.data?.message || "Le statut n'a pas pu etre modifie.")
    } finally {
      setStatusTarget(null)
    }
  }

  const columns = [
    { accessorKey: 'nom', header: 'Nom' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'telephone', header: 'Telephone' },
    { accessorKey: 'roleLabel', header: 'Role' },
    { accessorKey: 'categorie', header: 'Categorie' },
    { accessorKey: 'last_login', header: 'Derniere connexion' },
    { accessorKey: 'managed_count', header: 'Stagiaires geres' },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge>
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-nowrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelected(row.original)}
            title="Voir"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft"
          >
            <Eye className="h-4 w-4" />
          </button>
          <Link
            to={`/admin/responsables/${row.original.id}/edit`}
            title="Modifier"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setStatusTarget(row.original)}
            title={row.original.is_active ? 'Desactiver' : 'Activer'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white shadow-subtle transition hover:scale-105 ${
              row.original.is_active ? 'border-amber-100 text-amber-700 hover:bg-amber-50' : 'border-green-100 text-success hover:bg-green-50'
            }`}
          >
            {row.original.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </button>
        </div>
      )
    }
  ]

  return (
    <>
      <DataTable
        title="Responsables"
        columns={columns}
        rows={rows}
        loading={loading}
        showHeading={false}
        actions={
          <Button as={Link} to="/admin/responsables/new">
            <Plus className="h-4 w-4" />
            Ajouter responsable
          </Button>
        }
      />

      <ResponsableModal responsable={selected} onClose={() => setSelected(null)} />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={statusTarget?.is_active ? 'Desactiver responsable' : 'Activer responsable'}
        message={
          statusTarget?.is_active
            ? `${statusTarget?.nom} ne pourra plus se connecter. Continuer ?`
            : `${statusTarget?.nom} pourra se connecter a nouveau. Continuer ?`
        }
        confirmLabel={statusTarget?.is_active ? 'Desactiver' : 'Activer'}
        cancelLabel="Annuler"
        tone={statusTarget?.is_active ? 'danger' : 'primary'}
        onCancel={() => setStatusTarget(null)}
        onConfirm={toggleStatus}
      />
    </>
  )
}
