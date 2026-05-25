import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { labelToCategory, store } from '../lib/store.js'

const emptyForm = {
  id: '',
  nom: '',
  email: '',
  categorie: 'Filles',
  statut: 'Actif'
}

export default function ResponsableForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const isEditing = Boolean(id)

  useEffect(() => {
    if (!isEditing) return
    store.getResponsables().then((rows) => {
      const current = rows.find((row) => row.id === id)
      if (current) setForm(current)
    })
  }, [id, isEditing])

  const submit = async (event) => {
    event.preventDefault()
    const payload = {
      name: form.nom,
      email: form.email,
      category: labelToCategory(form.categorie),
      ...(form.password ? { password: form.password } : {})
    }
    if (isEditing) await store.updateResponsable(id, payload)
    else await store.createResponsable(payload)
    navigate('/admin/responsables')
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
          <span className="mb-2 block text-sm font-semibold text-primary">Categorie</span>
          <select className="input" value={form.categorie} onChange={(event) => setForm({ ...form, categorie: event.target.value })}>
            <option>Filles</option>
            <option>Garcons</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Statut</span>
          <select className="input" value={form.statut} onChange={(event) => setForm({ ...form, statut: event.target.value })}>
            <option>Actif</option>
            <option>Inactif</option>
          </select>
        </label>

        <div className="flex items-end gap-2 md:col-span-2">
          <Button type="submit">
            <Plus className="h-4 w-4" />
            {isEditing ? 'Mettre a jour' : 'Ajouter'}
          </Button>
          <Button as={Link} to="/admin/responsables" variant="secondary">
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}
