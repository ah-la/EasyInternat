import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { getCurrentRole, getRoleInfo } from '../lib/authRole.js'
import { labelToCategory, store } from '../lib/store.js'

const emptyForm = {
  numero: '',
  etage: 'Rez de chaussee',
  categorie: 'Filles',
  capacite: 4,
  statut: 'Disponible'
}

export default function ChambreForm() {
  const { numero } = useParams()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const roleInfo = getRoleInfo(role)
  const lockedCategory = roleInfo.gender ? `${roleInfo.gender}s` : null
  const [form, setForm] = useState(
    { ...emptyForm, categorie: lockedCategory || 'Filles' }
  )
  const [saving, setSaving] = useState(false)
  const [isOccupied, setIsOccupied] = useState(false)
  const isEditing = Boolean(numero)

  useEffect(() => {
    store.getChambres().then((chambres) => {
      setRows(chambres)
      const current = chambres.find((row) => row.id === numero)
      if (current) {
        setForm(current)
        setIsOccupied(Number(current.occupants || 0) > 0)
      }
    })
  }, [numero])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      numero: form.numero.trim(),
      etage: form.etage,
      category: labelToCategory(lockedCategory || form.categorie),
      capacite: 4,
      statut: String(form.statut || 'Disponible').toLowerCase()
    }
    try {
      if (isEditing) await store.updateChambre(numero, payload)
      else await store.createChambre(payload)
      toast.success(isEditing ? 'Chambre modifiée avec succès.' : 'Chambre ajoutée avec succès.')
      navigate(`${basePath}/chambres`)
    } catch (error) {
      toast.error(error.response?.data?.message || "La chambre n'a pas pu être enregistrée.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">{isEditing ? 'Modifier une chambre' : 'Ajouter une chambre'}</h2>
          <p className="text-sm text-muted">Creez la chambre proprement. L'affectation des stagiaires se fait depuis la gestion des stagiaires.</p>
        </div>
        <Button as={Link} to={`${basePath}/chambres`} variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Numero chambre</span>
          <input
            required
            className="input"
            disabled={isEditing}
            placeholder="Tapez F01, FB1, G01..."
            value={form.numero}
            onChange={(event) => setForm({ ...form, numero: event.target.value })}
          />
          <span className="mt-1 block text-xs font-semibold text-muted">Numeros deja utilises: {rows.length}</span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Etage</span>
          <select className="input" value={form.etage} onChange={(event) => setForm({ ...form, etage: event.target.value })}>
            <option>Rez de chaussee</option>
            <option>1ere etage</option>
            <option>2eme etage</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Categorie</span>
          <select
            className="input"
            value={lockedCategory || form.categorie}
            disabled={Boolean(lockedCategory) || isOccupied}
            onChange={(event) => setForm({ ...form, categorie: event.target.value })}
          >
            <option>Filles</option>
            <option>Garcons</option>
          </select>
          {isOccupied ? <span className="mt-1 block text-xs font-semibold text-muted">Categorie verrouillee car la chambre contient des stagiaires.</span> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Capacite</span>
          <select className="input" value="4" disabled>
            <option value="4">4 stagiaires maximum</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Statut</span>
          <select className="input" value={form.statut} onChange={(event) => setForm({ ...form, statut: event.target.value })}>
            <option>Disponible</option>
            <option>Complete</option>
          </select>
        </label>

        <div className="flex items-end gap-2 md:col-span-2">
          <Button type="submit" disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button as={Link} to={`${basePath}/chambres`} variant="secondary">
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}
