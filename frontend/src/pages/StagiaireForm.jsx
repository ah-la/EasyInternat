import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { getCurrentRole, getRoleInfo } from '../lib/authRole.js'
import { store } from '../lib/store.js'

const emptyForm = {
  id: '',
  nom: '',
  cin: '',
  email: '',
  password: '',
  genre: 'Fille',
  chambre: '',
  paiement: 'Paye'
}

export default function StagiaireForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const roleInfo = getRoleInfo(getCurrentRole())
  const lockedGender = roleInfo.gender
  const [form, setForm] = useState({ ...emptyForm, genre: lockedGender || 'Fille' })
  const isEditing = Boolean(id)

  useEffect(() => {
    store.getStagiaires().then((data) => {
      setRows(data)
      const current = data.find((row) => row.id === id)
      if (current) setForm(current)
    })
  }, [id])

  const submit = async (event) => {
    event.preventDefault()
    const [nom, ...prenomParts] = form.nom.trim().split(' ')
    const payload = {
      nom,
      prenom: prenomParts.join(' '),
      cin: form.cin,
      email: form.email,
      password: form.password || undefined,
      genre: lockedGender || form.genre,
      filiere: form.filiere || 'Developpement Digital',
      chambre_numero: form.chambre || undefined
    }
    if (isEditing) await store.updateStagiaire(id, payload)
    else await store.createStagiaire(payload)
    navigate(`${basePath}/stagiaires`)
  }

  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">{isEditing ? 'Modifier un stagiaire' : 'Ajouter un stagiaire'}</h2>
          <p className="text-sm text-muted">
            {lockedGender ? `Vous gerez uniquement les stagiaires ${lockedGender.toLowerCase()}s.` : 'Admin peut gerer tous les stagiaires.'}
          </p>
        </div>
        <Button as={Link} to={`${basePath}/stagiaires`} variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">ID</span>
          <input className="input" placeholder="ST-005" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Nom complet</span>
          <input required className="input" placeholder="Nom du stagiaire" value={form.nom} onChange={(event) => setForm({ ...form, nom: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">CIN</span>
          <input required className="input" placeholder="AB123456" value={form.cin} onChange={(event) => setForm({ ...form, cin: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Email connexion</span>
          <input required className="input" type="email" placeholder="stagiaire@cmc.test" value={form.email || ''} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Mot de passe</span>
          <input className="input" placeholder="Mot de passe" value={form.password || ''} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Genre</span>
          <select className="input" value={lockedGender || form.genre} disabled={Boolean(lockedGender)} onChange={(event) => setForm({ ...form, genre: event.target.value })}>
            <option>Fille</option>
            <option>Garcon</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Chambre</span>
          <input required className="input" placeholder={lockedGender === 'Fille' ? 'F-101' : lockedGender === 'Garcon' ? 'G-201' : 'F-101 / G-201'} value={form.chambre} onChange={(event) => setForm({ ...form, chambre: event.target.value })} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Paiement</span>
          <select className="input" value={form.paiement} onChange={(event) => setForm({ ...form, paiement: event.target.value })}>
            <option>Paye</option>
            <option>En retard</option>
            <option>Non paye</option>
          </select>
        </label>

        <div className="flex items-end gap-2 md:col-span-3">
          <Button type="submit">
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
