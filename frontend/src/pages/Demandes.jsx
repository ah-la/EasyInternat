import { useEffect, useState } from 'react'
import { Check, Clock3, Eye, FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'
import api from '../services/api.js'

export default function Demandes() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', statut: '', date: '' })
  const [certificate, setCertificate] = useState(null)
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

  const viewCertificate = async (demande) => {
    if (!demande.certificat_url) {
      toast.error('Aucun certificat disponible pour cette demande.')
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
      toast.error("Certificat introuvable ou acces refuse.")
    }
  }

  const closeCertificate = () => {
    if (certificate?.url) URL.revokeObjectURL(certificate.url)
    setCertificate(null)
  }

  const columns = [
    { accessorKey: 'id', header: 'Ref.' },
    { accessorKey: 'nom', header: 'Stagiaire' },
    { accessorKey: 'cin', header: 'CIN' },
    { accessorKey: 'telephone', header: 'Telephone' },
    { accessorKey: 'filiere', header: 'Filiere' },
    { accessorKey: 'genre', header: 'Genre' },
    {
      accessorKey: 'certificat',
      header: 'Certificat',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => viewCertificate(row.original)}
          disabled={!row.original.certificat_url}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-sm font-black text-primary shadow-subtle transition hover:scale-[1.02] hover:bg-cyan-soft disabled:cursor-not-allowed disabled:opacity-45"
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

      {certificate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-soft text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-primary">{certificate.title}</h2>
                  <p className="text-xs font-semibold text-muted">Document protege par authentification</p>
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
              {certificate.type === 'application/pdf' ? (
                <iframe title={certificate.title} src={certificate.url} className="h-[70vh] w-full" />
              ) : (
                <img src={certificate.url} alt={certificate.title} className="mx-auto max-h-[70vh] w-auto max-w-full object-contain" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
