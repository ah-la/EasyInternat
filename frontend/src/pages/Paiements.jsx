import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, Eye, Pencil, Plus, ReceiptText, SearchX, Trash2, TrendingUp, UsersRound, WalletCards, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const categoryClass = (category = '') =>
  String(category).toLowerCase().includes('fille')
    ? 'border-pink-200 bg-pink-50 text-pink-700'
    : 'border-sky-200 bg-sky-50 text-sky-700'

const currentMonthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' })
  .format(new Date())
  .replace(/^\p{L}/u, (letter) => letter.toUpperCase())

function PaiementModal({ paiement, onClose }) {
  if (!paiement) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-soft text-primary">
              <ReceiptText className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-black text-primary">Detail paiement</h2>
              <p className="mt-1 text-sm font-semibold text-muted">{paiement.stagiaire}</p>
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

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Mois', paiement.mois],
            ['Montant', paiement.montant],
            ['Date', paiement.date || '-'],
            ['Chambre', paiement.chambre || '-']
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-sky-100 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase text-muted">{label}</p>
              <p className="mt-1 text-sm font-black text-primary">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RetardsModal({ stagiaires, month, onClose }) {
  const rows = stagiaires.filter((stagiaire) => stagiaire.payment_status === 'en_retard' || stagiaire.payment_status === 'a_payer')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700">
              <SearchX className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-black text-primary">Retards paiement</h2>
              <p className="mt-1 text-sm font-semibold text-muted">Stagiaires qui n'ont pas paye {month}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft" title="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-2 overflow-auto">
          {rows.length ? rows.map((stagiaire) => (
            <div key={stagiaire.id} className="grid gap-2 rounded-2xl border border-sky-100 bg-slate-50 p-4 sm:grid-cols-4">
              <p className="font-black text-primary sm:col-span-2">{stagiaire.nom}</p>
              <p className="text-sm font-semibold text-muted">{stagiaire.chambre || '-'}</p>
              <Badge>{stagiaire.paiement}</Badge>
            </div>
          )) : (
            <div className="rounded-2xl border border-sky-100 bg-slate-50 p-6 text-center text-sm font-semibold text-muted">
              Aucun retard pour ce mois.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Paiements() {
  const [rows, setRows] = useState([])
  const [stagiaires, setStagiaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', mois: '' })
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showRetards, setShowRetards] = useState(false)
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'

  const loadData = () => {
    setLoading(true)
    Promise.all([store.getPaiements(filters), store.getStagiaires()])
      .then(([payments, students]) => {
        setRows(payments)
        setStagiaires(students)
      })
      .catch(() => {
        setRows([])
        setStagiaires([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const summary = useMemo(() => {
    const totalMonth = rows
      .filter((row) => row.mois === currentMonthName)
      .reduce((sum, row) => sum + Number(row.montant_value || 0), 0)
    const payes = rows.length
    const retard = stagiaires.filter((stagiaire) => stagiaire.payment_status === 'en_retard').length
    const nonPayes = stagiaires.filter((stagiaire) => ['non_paye', 'a_payer'].includes(stagiaire.payment_status)).length
    return { totalMonth, payes, retard, nonPayes }
  }, [rows, stagiaires])

  const deletePaiement = async () => {
    if (!deleteTarget) return
    try {
      await store.deletePaiement(deleteTarget.id)
      setRows((current) => current.filter((row) => row.id !== deleteTarget.id))
      toast.success('Paiement supprime avec succes.')
    } catch (error) {
      toast.error(error.response?.data?.message || "Le paiement n'a pas pu etre supprime.")
    } finally {
      setDeleteTarget(null)
    }
  }

  const columns = [
    { accessorKey: 'mois', header: 'Mois' },
    { accessorKey: 'stagiaire', header: 'Stagiaire' },
    { accessorKey: 'chambre', header: 'Chambre' },
    {
      accessorKey: 'categorie',
      header: 'Categorie',
      cell: ({ getValue }) => <Badge className={categoryClass(getValue())}>{getValue()}</Badge>
    },
    { accessorKey: 'montant', header: 'Montant' },
    { accessorKey: 'statut', header: 'Statut' },
    { accessorKey: 'date', header: 'Date paiement' },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-nowrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelected(row.original)}
            title="Voir"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft"
          >
            <Eye className="h-4 w-4" />
          </button>
          <Link
            to={`${basePath}/paiements/${row.original.id}/edit`}
            title="Modifier"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:scale-105 hover:bg-cyan-soft"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(row.original)}
            title="Supprimer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-danger shadow-subtle transition hover:scale-105 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const cards = [
    { label: 'Total encaissé ce mois', value: `${summary.totalMonth} DH`, icon: Banknote, tone: 'bg-cyan-soft text-primary' },
    { label: 'Paiements en retard', value: summary.retard, icon: TrendingUp, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Payés', value: summary.payes, icon: WalletCards, tone: 'bg-green-50 text-success' },
    { label: 'Non payés', value: summary.nonPayes, icon: UsersRound, tone: 'bg-red-50 text-danger' }
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
        title="Paiements"
        columns={columns}
        rows={rows}
        loading={loading}
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
            <select
              value={filters.mois}
              onChange={(event) => setFilters((current) => ({ ...current, mois: event.target.value }))}
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-secondary"
            >
              <option value="">Tous les mois</option>
              {['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'].map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <Button type="button" variant="secondary" onClick={() => setShowRetards(true)}>
              <SearchX className="h-4 w-4" />
              Afficher retards
            </Button>
          </div>
        }
      />

      <PaiementModal paiement={selected} onClose={() => setSelected(null)} />
      {showRetards ? <RetardsModal stagiaires={stagiaires} month={currentMonthName} onClose={() => setShowRetards(false)} /> : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer paiement"
        message={deleteTarget ? `Vous voulez vraiment supprimer le paiement de ${deleteTarget.stagiaire} ?` : ''}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={deletePaiement}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
