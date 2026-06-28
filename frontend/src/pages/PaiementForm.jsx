import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, ChevronsUpDown, Plus, ReceiptText, X } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { filterStagiairesByRole, getCurrentRole } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const months = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

function stagiaireLabel(stagiaire) {
  return `${stagiaire.nom} - ${stagiaire.chambre || '-'} - ${stagiaire.categorie}`
}

export default function PaiementForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const navigate = useNavigate()
  const stagiairePickerRef = useRef(null)
  const [stagiaires, setStagiaires] = useState([])
  const [paiements, setPaiements] = useState([])
  const [selectedMonths, setSelectedMonths] = useState([])
  const [search, setSearch] = useState('')
  const [openSuggestions, setOpenSuggestions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    stagiaire_id: '',
    montant: 200,
    date: new Date().toISOString().slice(0, 10)
  })

  useEffect(() => {
    Promise.all([store.getStagiaires(), store.getPaiements()]).then(([students, payments]) => {
      const visible = filterStagiairesByRole(students, role)
      setStagiaires(visible)
      setPaiements(payments)

      const current = payments.find((payment) => payment.id === id)
      if (current) {
        setSelectedMonths([current.mois])
        setForm({
          stagiaire_id: current.stagiaire_id,
          montant: current.montant_value || Number(String(current.montant).replace(/[^\d.]/g, '')) || 200,
          date: current.date || new Date().toISOString().slice(0, 10)
        })
        setSearch(stagiaireLabel(visible.find((stagiaire) => String(stagiaire.id) === String(current.stagiaire_id)) || { nom: current.stagiaire, chambre: current.chambre, categorie: current.categorie }))
        return
      }

    })
  }, [id, role])

  useEffect(() => {
    if (!openSuggestions) return undefined

    const closeOnOutsideClick = (event) => {
      if (!stagiairePickerRef.current?.contains(event.target)) {
        setOpenSuggestions(false)
      }
    }

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenSuggestions(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [openSuggestions])

  const selectedStagiaire = useMemo(
    () => stagiaires.find((stagiaire) => String(stagiaire.id) === String(form.stagiaire_id)),
    [form.stagiaire_id, stagiaires]
  )

  const paidMonths = useMemo(() => {
    if (!form.stagiaire_id) return new Set()
    return new Set(
      paiements
        .filter((payment) => String(payment.stagiaire_id) === String(form.stagiaire_id) && (!isEditing || String(payment.id) !== String(id)))
        .map((payment) => payment.mois)
    )
  }, [form.stagiaire_id, id, isEditing, paiements])

  const suggestions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return stagiaires.filter((stagiaire) => stagiaireLabel(stagiaire).toLowerCase().includes(term)).slice(0, 8)
  }, [search, stagiaires])

  const total = selectedMonths.length * (Number(form.montant) || 0)

  const chooseStagiaire = (stagiaire) => {
    setForm((current) => ({ ...current, stagiaire_id: stagiaire.id }))
    setSearch(stagiaireLabel(stagiaire))
    setOpenSuggestions(false)
    setSelectedMonths((current) => current.filter((month) => !paiements.some((payment) => String(payment.stagiaire_id) === String(stagiaire.id) && payment.mois === month)))
  }

  const toggleMonth = (month) => {
    if (paidMonths.has(month)) {
      toast.error(`${month} est deja paye pour ce stagiaire.`)
      return
    }
    setSelectedMonths((current) =>
      current.includes(month) ? current.filter((item) => item !== month) : [...current, month]
    )
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.stagiaire_id) {
      toast.error('Choisissez un stagiaire.')
      return
    }
    if (selectedMonths.length === 0) {
      toast.error('Selectionnez au moins un mois paye.')
      return
    }

    setSaving(true)
    try {
      const basePayload = {
        stagiaire_id: form.stagiaire_id,
        montant: Number(form.montant) || 0,
        statut: 'paye',
        date_paiement: form.date
      }

      if (isEditing) {
        await store.updatePaiement(id, { ...basePayload, mois: selectedMonths[0] })
      } else {
        await store.createPaiements({ ...basePayload, mois: selectedMonths })
      }

      toast.success(isEditing ? 'Paiement modifie avec succes.' : 'Paiement ajoute avec succes.')
      navigate(`${basePath}/paiements`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Le paiement n'a pas pu etre enregistre.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">{isEditing ? 'Modifier un paiement' : 'Ajouter un paiement'}</h2>
          <p className="text-sm text-muted">Selectionnez le stagiaire depuis la base de donnees et cochez les mois encaisses.</p>
        </div>
        <Button as={Link} to={`${basePath}/paiements`} variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label ref={stagiairePickerRef} className="relative block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-primary">Stagiaire</span>
          <div className="relative">
            <input
              required
              className="input pr-11"
              placeholder="Rechercher un stagiaire..."
              value={search}
              onFocus={() => setOpenSuggestions(true)}
              onChange={(event) => {
                setSearch(event.target.value)
                setForm((current) => ({ ...current, stagiaire_id: '' }))
                setSelectedMonths([])
                setOpenSuggestions(true)
              }}
            />
            <button
              type="button"
              aria-label={openSuggestions ? 'Fermer la liste des stagiaires' : 'Ouvrir la liste des stagiaires'}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-cyan-soft hover:text-primary"
              onClick={() => setOpenSuggestions((current) => !current)}
            >
              <ChevronsUpDown className="h-4 w-4" />
            </button>
          </div>
          {openSuggestions ? (
            <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-sky-100 bg-white p-2 shadow-[0_18px_45px_rgba(7,59,92,0.14)]">
              {suggestions.length ? suggestions.map((stagiaire) => (
                <button
                  key={stagiaire.id}
                  type="button"
                  onClick={() => chooseStagiaire(stagiaire)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-cyan-soft"
                >
                  <span>
                    <span className="block text-sm font-black text-primary">{stagiaire.nom}</span>
                    <span className="block text-xs font-semibold text-muted">{stagiaire.chambre || '-'} - {stagiaire.categorie}</span>
                  </span>
                  {String(form.stagiaire_id) === String(stagiaire.id) ? <Check className="h-4 w-4 text-success" /> : null}
                </button>
              )) : (
                <div className="px-3 py-4 text-center text-sm font-semibold text-muted">Aucun stagiaire trouve</div>
              )}
            </div>
          ) : null}
        </label>

        <div className="md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-primary">Mois payes</span>
          <div className="flex flex-wrap gap-2">
            {months.map((month) => {
              const active = selectedMonths.includes(month)
              const alreadyPaid = paidMonths.has(month)
              return (
                <button
                  key={month}
                  type="button"
                  disabled={alreadyPaid}
                  onClick={() => toggleMonth(month)}
                  className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    active ? 'border-secondary/40 bg-cyan-soft text-primary' : 'border-border bg-white text-slate-600'
                  }`}
                  title={alreadyPaid ? 'Mois deja paye' : month}
                >
                  {active ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {month}
                </button>
              )
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Montant par mois</span>
          <input required className="input" type="number" min="1" step="0.01" value={form.montant} onChange={(event) => setForm({ ...form, montant: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Date paiement</span>
          <input required className="input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        </label>

        <div className="rounded-xl border border-sky-100 bg-cyan-soft/60 p-4 text-sm font-semibold text-primary md:col-span-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase text-muted">Mois selectionnes</p>
              <p className="font-black">{selectedMonths.length ? selectedMonths.join(', ') : '-'}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-muted">Montant par mois</p>
              <p className="font-black">{Number(form.montant) || 0} DH</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-muted">Total a enregistrer</p>
              <p className="inline-flex items-center gap-2 font-black">
                <ReceiptText className="h-4 w-4" />
                {total} DH
              </p>
            </div>
          </div>
          {selectedStagiaire ? (
            <p className="mt-2 text-xs text-muted">Selection: {stagiaireLabel(selectedStagiaire)}</p>
          ) : null}
        </div>

        <div className="flex items-end gap-2 md:col-span-2">
          <Button type="submit" disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? 'Enregistrement...' : isEditing ? 'Modifier paiement' : 'Ajouter paiement'}
          </Button>
          <Button as={Link} to={`${basePath}/paiements`} variant="secondary">
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}
