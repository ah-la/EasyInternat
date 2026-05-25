import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { filterStagiairesByRole, getCurrentRole, getRoleInfo } from '../lib/authRole.js'
import { labelToCategory, store } from '../lib/store.js'

const emptyForm = {
  numero: '',
  etage: 'Rez de chaussee',
  categorie: 'Filles',
  capacite: 4
}

export default function ChambreForm() {
  const { numero } = useParams()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [availableStagiaires, setAvailableStagiaires] = useState([])
  const role = getCurrentRole()
  const basePath = role === 'admin' ? '/admin' : '/responsable'
  const roleInfo = getRoleInfo(role)
  const lockedCategory = roleInfo.gender ? `${roleInfo.gender}s` : null
  const [form, setForm] = useState(
    { ...emptyForm, categorie: lockedCategory || 'Filles' }
  )
  const [stagiaireInput, setStagiaireInput] = useState('')
  const [selectedStagiaires, setSelectedStagiaires] = useState([])
  const isEditing = Boolean(numero)

  useEffect(() => {
    Promise.all([store.getChambres(), store.getStagiaires()]).then(([chambres, stagiaires]) => {
      setRows(chambres)
      setAvailableStagiaires(filterStagiairesByRole(stagiaires, role))
      const current = chambres.find((row) => row.id === numero)
      if (current) {
        setForm(current)
        setSelectedStagiaires(current.stagiaires || [])
      }
    })
  }, [numero, role])

  const chooseRoom = (value) => {
    const selected = rows.find((row) => row.numero === value)
    if (selected) {
      setForm({
        numero: selected.numero,
        etage: selected.etage,
        categorie: lockedCategory || selected.categorie,
        capacite: selected.capacite
      })
      setSelectedStagiaires(selected.stagiaires || [])
      return
    }
    setForm({ ...form, numero: value })
  }

  const addStagiaire = () => {
    const name = stagiaireInput.trim()
    if (!name || selectedStagiaires.includes(name) || selectedStagiaires.length >= Number(form.capacite)) return
    setSelectedStagiaires((currentList) => [...currentList, name])
    setStagiaireInput('')
  }

  const submit = async (event) => {
    event.preventDefault()
    const typedName = stagiaireInput.trim()
    const names = [
      ...selectedStagiaires,
      ...(typedName && !selectedStagiaires.includes(typedName) ? [typedName] : [])
    ].slice(0, Number(form.capacite))
    const payload = {
      numero: form.numero,
      etage: form.etage,
      category: labelToCategory(lockedCategory || form.categorie),
      capacite: Number(form.capacite),
      statut: names.length >= Number(form.capacite) ? 'complete' : 'disponible'
    }
    if (isEditing) await store.updateChambre(numero, payload)
    else await store.createChambre(payload)
    navigate(`${basePath}/chambres`)
  }

  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">{isEditing ? 'Modifier une chambre' : 'Ajouter une chambre'}</h2>
          <p className="text-sm text-muted">Ajoutez les stagiaires ligne par ligne. La chambre devient rouge quand elle atteint 4/4.</p>
        </div>
        <Button as={Link} to={`${basePath}/chambres`} variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Choisir chambre</span>
          <input
            required
            className="input"
            list="chambres-options"
            placeholder="Tapez F01, FB1, G01..."
            value={form.numero}
            onChange={(event) => chooseRoom(event.target.value)}
          />
          <datalist id="chambres-options">
            {rows
              .filter((row) => !lockedCategory || row.categorie === lockedCategory)
              .map((row) => (
                <option key={row.numero} value={row.numero}>
                  {row.numero} - {row.etage} - {row.categorie}
                </option>
              ))}
          </datalist>
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
          <select className="input" value={lockedCategory || form.categorie} disabled={Boolean(lockedCategory)} onChange={(event) => setForm({ ...form, categorie: event.target.value })}>
            <option>Filles</option>
            <option>Garcons</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">Capacite</span>
          <input required className="input" type="number" min="1" max="8" value={form.capacite} onChange={(event) => setForm({ ...form, capacite: event.target.value })} />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-primary">Stagiaires dans la chambre</span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input"
              list="chambre-stagiaires-options"
              placeholder="Tapez le nom du stagiaire..."
              value={stagiaireInput}
              onChange={(event) => setStagiaireInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addStagiaire()
                }
              }}
            />
            <Button type="button" onClick={addStagiaire}>
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
          <datalist id="chambre-stagiaires-options">
            {availableStagiaires
              .filter((stagiaire) => !selectedStagiaires.includes(stagiaire.nom))
              .map((stagiaire) => (
                <option key={stagiaire.id} value={stagiaire.nom} />
              ))}
          </datalist>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedStagiaires.length ? selectedStagiaires.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedStagiaires((currentList) => currentList.filter((item) => item !== name))}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-2.5 text-xs font-semibold text-primary shadow-subtle"
              >
                {name}
                <X className="h-3.5 w-3.5 text-muted" />
              </button>
            )) : (
              <span className="text-sm text-muted">Aucun stagiaire ajoute.</span>
            )}
          </div>
        </label>

        <div className="flex items-end gap-2 md:col-span-2">
          <Button type="submit">
            <Plus className="h-4 w-4" />
            Enregistrer
          </Button>
          <Button as={Link} to={`${basePath}/chambres`} variant="secondary">
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}
