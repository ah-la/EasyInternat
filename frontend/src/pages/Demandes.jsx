import { useEffect, useMemo, useState } from 'react'
import { Check, Clock3, X } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../components/DataTable.jsx'
import Badge, { statusTone } from '../components/ui/Badge.jsx'
import { getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

export default function Demandes() {
  const [rows, setRows] = useState([])
  const role = getCurrentRole()
  const roleGender = role === 'responsable_filles' ? 'Fille' : role === 'responsable_garcons' ? 'Garcon' : null

  const visibleRows = useMemo(() => {
    if (!roleGender) return rows
    return rows.filter((row) => row.genre === roleGender)
  }, [rows, roleGender])

  useEffect(() => {
    store.getDemandes().then(setRows).catch(() => setRows([]))
  }, [])

  const updateStatus = async (id, statut) => {
    const demande = rows.find((row) => row.id === id)
    if (statut === 'Acceptee') await store.acceptDemande(id)
    else if (statut === 'Refusee') await store.refuseDemande(id)
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
        <div className="flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={() => updateStatus(row.original.id, 'Acceptee')}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-green-100 bg-white px-2 text-xs font-semibold text-success hover:bg-green-50"
          >
            <Check className="h-3.5 w-3.5" />
            Accepter
          </button>
          <button
            type="button"
            onClick={() => updateStatus(row.original.id, 'Liste attente')}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-amber-100 bg-white px-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
          >
            <Clock3 className="h-3.5 w-3.5" />
            Attente
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

  return <DataTable title="Demandes" columns={columns} rows={visibleRows} showHeading={false} />
}
