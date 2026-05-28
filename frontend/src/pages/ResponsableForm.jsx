import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, KeyRound, Plus, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { labelToCategory, store } from '../lib/store.js'

const emptyForm = {
  id: '',
  nom: '',
  email: '',
  telephone: '',
  roleLabel: 'responsable_filles',
  categorie: 'Filles',
  statut: 'Actif',
  password: '',
  password_confirmation: ''
}

function generatePassword() {
  return `RESP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export default function ResponsableForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const isEditing = Boolean(id)

  useEffect(() => {
    if (!isEditing) {
      const password = generatePassword()
      setForm((current) => ({ ...current, password, password_confirmation: password }))
      return
    }
    store.getResponsables().then((rows) => {
      const current = rows.find((row) => row.id === id)
      if (current) setForm({ ...emptyForm, ...current, password: '', password_confirmation: '' })
    })
  }, [id, isEditing])

  const setRole = (roleLabel) => {
    setForm({
      ...form,
      roleLabel,
      categorie: roleLabel === 'responsable_filles' ? 'Filles' : 'Garcons'
    })
  }

  const generate = () => {
    const password = generatePassword()
    setForm({ ...form, password, password_confirmation: password })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      name: form.nom,
      email: form.email,
      telephone: form.telephone,
      category: labelToCategory(form.categorie),
      is_active: form.statut === 'Actif',
      ...(form.password ? { password: form.password, password_confirmation: form.password_confirmation } : {})
    }

    try {
      if (isEditing) await store.updateResponsable(id, payload)
      else await store.createResponsable(payload)
      toast.success(isEditing ? 'Responsable mis a jour avec succes.' : 'Compte responsable cree avec succes.')
      navigate('/admin/responsables')
    } catch (error) {
      toast.error(error.response?.data?.message || "Le responsable n'a pas pu etre enregistre.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">{isEditing ? 'Modifier un responsable' : 'Ajouter un responsable'}</h2>
          <p className="text-sm text-muted">Cette page est accessible uniquement a l admin.</p>
        </div>
        <Button as={Link} to="/admin/responsables" variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Nom complet</span>
          <input required className="input" placeholder="Responsable Filles" value={form.nom} onChange={(event) => setForm({ ...form, nom: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Email</span>
          <input required className="input" type="email" placeholder="filles@cmc.test" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Telephone</span>
          <input required className="input" placeholder="06XXXXXXXX" value={form.telephone} onChange={(event) => setForm({ ...form, telephone: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Role</span>
          <select className="input" value={form.roleLabel} onChange={(event) => setRole(event.target.value)}>
            <option value="responsable_filles">responsable_filles</option>
            <option value="responsable_garcons">responsable_garcons</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Statut</span>
          <select className="input" value={form.statut} onChange={(event) => setForm({ ...form, statut: event.target.value })}>
            <option>Actif</option>
            <option>Inactif</option>
          </select>
        </label>
        <div className="hidden md:block" />

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Mot de passe</span>
          <div className="flex gap-2">
            <input
              required={!isEditing}
              className="input"
              placeholder={isEditing ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <button
              type="button"
              onClick={generate}
              title="Generer mot de passe"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft"
            >
              <KeyRound className="h-4 w-4" />
            </button>
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Confirmation mot de passe</span>
          <input
            required={!isEditing || Boolean(form.password)}
            className="input"
            placeholder="Confirmer le mot de passe"
            value={form.password_confirmation}
            onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })}
          />
        </label>

        <div className="rounded-xl border border-sky-100 bg-cyan-soft/60 p-4 text-sm font-semibold text-primary md:col-span-2">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Ce responsable peut gerer uniquement les stagiaires, chambres, paiements, sorties et reclamations de sa categorie.
            </p>
          </div>
        </div>

        <div className="flex items-end gap-2 md:col-span-2">
          <Button type="submit" disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? 'Enregistrement...' : isEditing ? 'Mettre a jour' : 'Ajouter'}
          </Button>
          <Button as={Link} to="/admin/responsables" variant="secondary">
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}
