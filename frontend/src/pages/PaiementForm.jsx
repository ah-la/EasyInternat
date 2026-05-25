import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Plus, X } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { filterStagiairesByRole, getCurrentRole } from '../lib/authRole.js'
import { statusToApi, store } from '../lib/store.js'

const months = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

export default function PaiementForm() {
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const navigate = useNavigate()
  const [stagiaires, setStagiaires] = useState([])
  const [selectedMonths, setSelectedMonths] = useState(['Mai'])
  const [form, setForm] = useState({
    stagiaire: '',
    montant: '300 DH',
    statut: 'Paye',
    date: new Date().toISOString().slice(0, 10)
  })

  useEffect(() => {
    store.getStagiaires().then((rows) => {
      const visible = filterStagiairesByRole(rows, role)
      setStagiaires(visible)
      setForm((current) => ({ ...current, stagiaire: current.stagiaire || visible[0]?.nom || '' }))
    })
  }, [role])

  const toggleMonth = (month) => {
    setSelectedMonths((current) =>
      current.includes(month) ? current.filter((item) => item !== month) : [...current, month]
    )
  }

  const submit = async (event) => {
    event.preventDefault()
    const stagiaire = stagiaires.find((row) => row.nom === form.stagiaire)
    await store.createPaiement({
      stagiaire_id: stagiaire?.id,
      mois: selectedMonths.join(', '),
      montant: Number(String(form.montant).replace(/[^\d.]/g, '')) || 0,
      statut: statusToApi(form.statut),
      date_paiement: form.date
    })
    navigate(`${basePath}/paiements`)
  }

  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Ajouter un paiement</h2>
          <p className="text-sm text-muted">Recherchez le stagiaire et cochez un ou plusieurs mois payes.</p>
        </div>
        <Button as={Link} to={`${basePath}/paiements`} variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Stagiaire</span>
          <input
            required
            className="input"
            list="stagiaires-options"
            placeholder="Tapez le nom du stagiaire..."
            value={form.stagiaire}
            onChange={(event) => setForm({ ...form, stagiaire: event.target.value })}
          />
          <datalist id="stagiaires-options">
            {stagiaires.map((stagiaire) => (
              <option key={stagiaire.id} value={stagiaire.nom} />
            ))}
          </datalist>
        </label>
        <div className="hidden md:block" />

        <div className="md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-primary">Mois payes</span>
          <div className="flex flex-wrap gap-2">
            {months.map((month) => {
              const active = selectedMonths.includes(month)
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => toggleMonth(month)}
                  className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-semibold transition ${
                    active ? 'border-secondary/40 bg-cyan-soft text-primary' : 'border-border bg-white text-slate-600'
                  }`}
                >
                  {active ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {month}
                </button>
              )
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Montant</span>
          <input required className="input" placeholder="300 DH" value={form.montant} onChange={(event) => setForm({ ...form, montant: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Date paiement</span>
          <input required className="input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-primary">Statut</span>
          <select className="input" value={form.statut} onChange={(event) => setForm({ ...form, statut: event.target.value })}>
            <option>Paye</option>
            <option>En retard</option>
            <option>Non paye</option>
          </select>
        </label>

        <div className="flex items-end gap-2 md:col-span-2">
          <Button type="submit">
            <Plus className="h-4 w-4" />
            Ajouter paiement
          </Button>
          <Button as={Link} to={`${basePath}/paiements`} variant="secondary">
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}
