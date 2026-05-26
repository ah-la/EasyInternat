import { useEffect, useMemo, useState } from 'react'
import { Check, Clock3, Copy, Eye, FileText, KeyRound, Loader2, ShieldCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { genreToCategory, store } from '../lib/store.js'
import api from '../services/api.js'

const actionButton =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white shadow-subtle transition hover:scale-105 disabled:cursor-wait disabled:opacity-60'

function generatePassword() {
  return `CMC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function DecisionModal({ decision, chambres, busy, onClose, onAccept, onRefuse }) {
  const [chambreId, setChambreId] = useState('')
  const [password, setPassword] = useState(generatePassword)
  const [motif, setMotif] = useState('')

  useEffect(() => {
    if (!decision) return
    setChambreId('')
    setPassword(generatePassword())
    setMotif('')
  }, [decision])

  if (!decision) return null

  const demande = decision.demande
  const isAccept = decision.type === 'accept'
  const category = genreToCategory(demande.genre)
  const availableRooms = chambres.filter((chambre) => chambre.category === category && Number(chambre.occupants || 0) < Number(chambre.capacite || 4))

  const submit = () => {
    if (isAccept) {
      if (!chambreId) {
        toast.error('Choisissez une chambre disponible.')
        return
      }
      onAccept(demande, { chambre_id: chambreId, password, password_confirmation: password })
      return
    }

    onRefuse(demande, motif)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isAccept ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
              {isAccept ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
            </span>
            <div>
              <h2 className="text-lg font-black text-primary">{isAccept ? 'Accepter la demande' : 'Refuser la demande'}</h2>
              <p className="mt-1 text-sm font-semibold text-muted">
                {demande.nom} - CIN {demande.cin}
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

        {isAccept ? (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-primary">Affecter chambre</span>
              <select
                value={chambreId}
                onChange={(event) => setChambreId(event.target.value)}
                className="h-12 w-full rounded-xl border border-sky-100 bg-white px-4 text-sm font-semibold text-primary outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15"
              >
                <option value="">Choisir une chambre {category === 'filles' ? 'filles' : 'garçons'}</option>
                {availableRooms.map((chambre) => (
                  <option key={chambre.id} value={chambre.id}>
                    {chambre.numero} - {chambre.occupants}/{chambre.capacite}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl border border-sky-100 bg-cyan-soft/45 p-4">
              <p className="mb-3 text-sm font-black text-primary">Compte stagiaire créé automatiquement</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase text-muted">Email connexion</span>
                  <input value={demande.email || ''} readOnly className="h-11 w-full rounded-xl border border-sky-100 bg-white px-3 text-sm font-semibold text-primary" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase text-muted">Password / code</span>
                  <div className="flex gap-2">
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 min-w-0 flex-1 rounded-xl border border-sky-100 bg-white px-3 text-sm font-semibold text-primary outline-none focus:border-secondary"
                    />
                    <button
                      type="button"
                      onClick={() => setPassword(generatePassword())}
                      className="grid h-11 w-11 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft"
                      title="Générer mot de passe"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                  </div>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-primary">Motif de refus</span>
              <textarea
                value={motif}
                onChange={(event) => setMotif(event.target.value)}
                placeholder="Expliquez le motif..."
                rows={4}
                className="w-full rounded-2xl border border-sky-100 bg-white p-4 text-sm font-semibold text-primary outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/15"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {['Dossier incomplet', 'Non inscrit au centre'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMotif(value)}
                  className="rounded-full border border-sky-100 bg-cyan-soft px-3 py-2 text-xs font-black text-primary transition hover:bg-white"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button type="button" variant={isAccept ? 'primary' : 'danger'} onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isAccept ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {isAccept ? 'Confirmer création' : 'Confirmer refus'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Demandes() {
  const [rows, setRows] = useState([])
  const [chambres, setChambres] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', statut: '', date: '' })
  const [certificate, setCertificate] = useState(null)
  const [decision, setDecision] = useState(null)
  const [actionLoading, setActionLoading] = useState('')
  const role = getCurrentRole()

  useEffect(() => {
    setLoading(true)
    store.getDemandes(filters).then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    store.getChambres().then(setChambres).catch(() => setChambres([]))
  }, [])

  const setRowStatus = (id, statut, statutApi) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, statut, statut_api: statutApi } : row)))
  }

  const acceptDemande = async (demande, payload) => {
    setActionLoading(`${demande.id}:accept`)
    try {
      const { data } = await store.acceptDemande(demande.id, payload)
      setRowStatus(demande.id, 'Acceptée', 'acceptee')
      toast.success(`Demande acceptée. Compte: ${data.email}${payload.password ? ` / Code: ${payload.password}` : ''}`)
      setDecision(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "La demande n'a pas pu être acceptée.")
    } finally {
      setActionLoading('')
    }
  }

  const refuseDemande = async (demande, motif) => {
    setActionLoading(`${demande.id}:refuse`)
    try {
      await store.refuseDemande(demande.id, motif)
      setRowStatus(demande.id, 'Refusée', 'refusee')
      toast.success(`Demande refusée. Motif envoyé à ${demande.email}.`)
      setDecision(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "La demande n'a pas pu être refusée.")
    } finally {
      setActionLoading('')
    }
  }

  const waitDemande = async (demande) => {
    setActionLoading(`${demande.id}:wait`)
    try {
      await store.updateDemande(demande.id, { statut: 'liste_attente' })
      setRowStatus(demande.id, 'Liste attente', 'liste_attente')
      toast.success(`Demande mise en liste d'attente pour ${demande.nom}.`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Statut non modifié.")
    } finally {
      setActionLoading('')
    }
  }

  const viewCertificate = async (demande) => {
    if (!demande.certificat_url) {
      setCertificate({ missing: true, title: `Certificat - ${demande.nom}`, demande })
      return
    }

    try {
      const response = await api.get(demande.certificat_url, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      setCertificate({
        url,
        type: response.data.type,
        title: `Certificat - ${demande.nom}`,
        demande
      })
    } catch {
      setCertificate({ missing: true, title: `Certificat - ${demande.nom}`, demande })
    }
  }

  const closeCertificate = () => {
    if (certificate?.url) URL.revokeObjectURL(certificate.url)
    setCertificate(null)
  }

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'Ref.' },
    { accessorKey: 'date', header: 'Date demande' },
    { accessorKey: 'nom', header: 'Stagiaire' },
    { accessorKey: 'cin', header: 'CIN' },
    { accessorKey: 'telephone', header: 'Telephone' },
    { accessorKey: 'filiere', header: 'Filiere' },
    { accessorKey: 'genre', header: 'Genre' },
    {
      accessorKey: 'verification',
      header: 'Vérification centre',
      cell: ({ row }) => (
        <Badge tone={row.original.isVerified ? 'success' : 'danger'}>
          {row.original.isVerified ? 'Vérifié CMC' : 'Non vérifié'}
        </Badge>
      )
    },
    {
      accessorKey: 'certificat',
      header: 'Certificat',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => viewCertificate(row.original)}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm font-black text-primary shadow-subtle transition hover:scale-[1.02] hover:bg-cyan-soft"
          title="Voir certificat"
        >
          <Eye className="h-4 w-4" />
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
      header: 'Décision',
      cell: ({ row }) => {
        const demande = row.original
        const isBusy = actionLoading.startsWith(`${demande.id}:`)

        return (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDecision({ type: 'accept', demande })}
              title="Accepter"
              disabled={isBusy}
              className={`${actionButton} border-green-100 text-success hover:bg-green-50`}
            >
              {actionLoading === `${demande.id}:accept` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => waitDemande(demande)}
              title="Mettre en attente"
              disabled={isBusy}
              className={`${actionButton} border-amber-100 text-amber-700 hover:bg-amber-50`}
            >
              {actionLoading === `${demande.id}:wait` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setDecision({ type: 'refuse', demande })}
              title="Refuser"
              disabled={isBusy}
              className={`${actionButton} border-red-100 text-danger hover:bg-red-50`}
            >
              {actionLoading === `${demande.id}:refuse` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </button>
          </div>
        )
      }
    }
  ], [actionLoading])

  return (
    <>
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
                <option value="garcons">Garçons</option>
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
              <option value="acceptee">Acceptée</option>
              <option value="refusee">Refusée</option>
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

      <DecisionModal
        decision={decision}
        chambres={chambres}
        busy={Boolean(actionLoading)}
        onClose={() => setDecision(null)}
        onAccept={acceptDemande}
        onRefuse={refuseDemande}
      />

      {certificate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-soft text-primary">
                  {certificate.missing ? <ShieldCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </span>
                <div>
                  <h2 className="text-lg font-black text-primary">{certificate.title}</h2>
                  <p className="text-xs font-semibold text-muted">Document protégé par authentification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCertificate}
                className="grid h-10 w-10 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-[60vh] overflow-hidden rounded-xl border border-sky-100 bg-slate-50">
              {certificate.missing ? (
                <div className="flex h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
                  <FileText className="h-12 w-12 text-muted" />
                  <p className="text-lg font-black text-primary">Aucun certificat disponible.</p>
                  <p className="max-w-md text-sm font-semibold text-muted">
                    Le fichier n'existe pas encore ou l'accès au document a été refusé.
                  </p>
                </div>
              ) : certificate.type === 'application/pdf' ? (
                <iframe title={certificate.title} src={certificate.url} className="h-[70vh] w-full" />
              ) : (
                <img src={certificate.url} alt={certificate.title} className="mx-auto max-h-[70vh] w-auto max-w-full object-contain" />
              )}
            </div>
            {!certificate.missing && certificate.url ? (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(certificate.url)
                  toast.success('Lien temporaire copié.')
                }}
                className="mt-3 inline-flex w-fit items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs font-black text-primary shadow-subtle transition hover:bg-cyan-soft"
              >
                <Copy className="h-4 w-4" />
                Copier lien temporaire
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
