import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, KeyRound, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { getCurrentRole, getRoleInfo } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const emptyForm = {
  nom: '',
  prenom: '',
  cin: '',
  telephone: '',
  filiere: '',
  email: '',
  password: '',
  password_confirmation: '',
  genre: 'Fille',
  chambre_id: ''
}

const randomPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const categoryFromGenre = (genre = '') => (String(genre).toLowerCase().includes('fille') ? 'filles' : 'garcons')

export default function StagiaireForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const roleInfo = getRoleInfo(role)
  const lockedGender = roleInfo.gender
  const [form, setForm] = useState({ ...emptyForm, genre: lockedGender || 'Fille' })
  const [chambres, setChambres] = useState([])
  const [saving, setSaving] = useState(false)
  const isEditing = Boolean(id)

  useEffect(() => {
    Promise.all([store.getChambres(), id ? store.getStagiaireProfile(id) : Promise.resolve(null)])
      .then(([rooms, current]) => {
        setChambres(rooms)
        if (current) {
          setForm({
            nom: current.nom_simple || '',
            prenom: current.prenom || '',
            cin: current.cin || '',
            telephone: current.telephone || '',
            filiere: current.filiere || '',
            email: current.email || '',
            password: '',
            password_confirmation: '',
            genre: lockedGender || current.genre || 'Fille',
            chambre_id: current.chambre_id ? String(current.chambre_id) : ''
          })
        }
      })
      .catch(() => toast.error('Chargement des donnees impossible.'))
  }, [id, lockedGender])

  const selectedCategory = categoryFromGenre(lockedGender || form.genre)
  const availableChambres = useMemo(
    () => chambres.filter((chambre) => (chambre.category || '').toLowerCase() === selectedCategory),
    [chambres, selectedCategory]
  )

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'genre' ? { chambre_id: '' } : {})
    }))
  }

  const generatePassword = () => {
    const password = randomPassword()
    setForm((current) => ({ ...current, password, password_confirmation: password }))
    toast.success('Mot de passe genere.')
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        cin: form.cin,
        telephone: form.telephone,
        filiere: form.filiere,
        email: form.email,
        genre: lockedGender || form.genre,
        chambre_id: form.chambre_id || undefined,
        password: form.password || undefined,
        password_confirmation: form.password_confirmation || undefined
      }

      if (isEditing) await store.updateStagiaire(id, payload)
      else await store.createStagiaire(payload)

      toast.success(isEditing ? 'Stagiaire modifie avec succes.' : 'Stagiaire ajoute avec compte cree.')
      navigate(`${basePath}/stagiaires`)
    } catch (error) {
      toast.error(error.response?.data?.message || "L'enregistrement a echoue.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">{isEditing ? 'Modifier un stagiaire' : 'Ajouter un stagiaire'}</h2>
          <p className="text-sm text-muted">Compte stagiaire sera cree automatiquement avec le role stagiaire.</p>
        </div>
        <Button as={Link} to={`${basePath}/stagiaires`} variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Nom</span>
          <input required className="input" value={form.nom} onChange={(event) => setField('nom', event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Prenom</span>
          <input required className="input" value={form.prenom} onChange={(event) => setField('prenom', event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">CIN</span>
          <input required className="input" value={form.cin} onChange={(event) => setField('cin', event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Telephone</span>
          <input required className="input" placeholder="06XXXXXXXX" value={form.telephone} onChange={(event) => setField('telephone', event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Filiere</span>
          <input required className="input" value={form.filiere} onChange={(event) => setField('filiere', event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Categorie</span>
          <select className="input" value={lockedGender || form.genre} disabled={Boolean(lockedGender)} onChange={(event) => setField('genre', event.target.value)}>
            <option>Fille</option>
            <option>Garcon</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Chambre</span>
          <select required className="input" value={form.chambre_id} onChange={(event) => setField('chambre_id', event.target.value)}>
            <option value="">Selectionner une chambre</option>
            {availableChambres.map((chambre) => (
              <option key={chambre.id} value={chambre.id} disabled={Number(chambre.occupants) >= Number(chambre.capacite)}>
                {chambre.numero} - {chambre.occupants}/{chambre.capacite}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Email connexion</span>
          <input required={!isEditing} className="input" type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} />
        </label>
        <div className="flex items-end">
          <Button type="button" variant="secondary" onClick={generatePassword} className="w-full">
            <KeyRound className="h-4 w-4" />
            Generer mot de passe
          </Button>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Mot de passe</span>
          <input required={!isEditing} className="input" type="text" value={form.password} onChange={(event) => setField('password', event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Confirmation mot de passe</span>
          <input required={!isEditing || Boolean(form.password)} className="input" type="text" value={form.password_confirmation} onChange={(event) => setField('password_confirmation', event.target.value)} />
        </label>

        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
          <Button type="submit" disabled={saving}>
            <Plus className="h-4 w-4" />
            {isEditing ? 'Mettre a jour' : 'Ajouter'}
          </Button>
          <Button as={Link} to={`${basePath}/stagiaires`} variant="secondary">
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}
