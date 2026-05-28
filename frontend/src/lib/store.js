import api from '../services/api.js'

const unwrap = (payload) => (Array.isArray(payload?.data) ? payload.data : payload)
const fullName = (row = {}) => [row.nom, row.prenom].filter(Boolean).join(' ').trim() || row.name || ''
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))

export function categoryToLabel(category = '') {
  return category === 'filles' ? 'Filles' : 'Garcons'
}

export function labelToCategory(label = '') {
  return String(label).toLowerCase().includes('fille') ? 'filles' : 'garcons'
}

export function genreToCategory(genre = '') {
  return String(genre).toLowerCase().includes('fille') ? 'filles' : 'garcons'
}

export function categoryToGenre(category = '') {
  return category === 'filles' ? 'Fille' : 'Garcon'
}

function dateRaw(value = '') {
  return value ? String(value).slice(0, 10) : ''
}

function formatDate(value = '') {
  const raw = dateRaw(value)
  if (!raw) return ''
  const [year, month, day] = raw.split('-')
  return [day, month, year].filter(Boolean).join('/')
}

export function statusToApi(value = '') {
  const normalized = String(value).toLowerCase()
  if (normalized.includes('retard')) return 'en_retard'
  if (normalized.includes('non')) return 'non_paye'
  if (normalized.includes('refus')) return 'refusee'
  if (normalized.includes('accept') || normalized.includes('valid')) return 'acceptee'
  if (normalized.includes('liste')) return 'liste_attente'
  if (normalized.includes('paye')) return 'paye'
  return 'en_attente'
}

export function demandeStatusLabel(value = '') {
  const normalized = String(value).toLowerCase()
  if (normalized === 'acceptee' || normalized.includes('accept')) return 'Acceptée'
  if (normalized === 'refusee' || normalized.includes('refus')) return 'Refusée'
  if (normalized === 'liste_attente' || normalized.includes('liste')) return 'Liste attente'
  return 'En attente'
}

const mapStagiaire = (row = {}) => ({
  ...row,
  id: String(row.id),
  nom: fullName(row),
  nom_simple: row.nom || '',
  prenom: row.prenom || '',
  fullName: fullName(row),
  email: row.user?.email || row.email || '',
  genre: row.genre || categoryToGenre(row.category),
  categorie: categoryToLabel(row.category),
  chambre: row.chambre?.numero || row.chambre || '',
  chambreDetails: row.chambre && typeof row.chambre === 'object' ? row.chambre : null,
  chambre_id: row.chambre_id || row.chambre?.id || '',
  payment_status: row.payment_status || '',
  payment_due_month: row.payment_due_month || '',
  payment_latest_month: row.payment_latest_month || '',
  paiement: row.payment_label || row.paiement || 'A payer'
})

const mapResponsable = (row = {}) => ({
  ...row,
  id: String(row.id),
  nom: row.name || row.nom || '',
  email: row.email || '',
  telephone: row.telephone || '',
  categorie: categoryToLabel(row.category),
  roleLabel: row.category === 'filles' ? 'Responsable filles' : 'Responsable garcons',
  roleValue: row.category === 'filles' ? 'responsable_filles' : 'responsable_garcons',
  statut: row.is_active === false ? 'Inactif' : 'Actif',
  is_active: row.is_active !== false,
  last_login: row.last_login_at ? String(row.last_login_at).replace('T', ' ').slice(0, 16) : 'Jamais',
  managed_count: row.managed_stagiaires_count ?? 0
})

const mapDemande = (row = {}) => ({
  ...row,
  id: String(row.id),
  nom: fullName(row),
  statut_api: row.statut || 'en_attente',
  statut: demandeStatusLabel(row.statut),
  date: row.created_at ? String(row.created_at).slice(0, 10) : '',
  certificat: row.certificat_residence || row.certificat || '',
  certificat_url: row.certificat_residence ? `/demandes/${row.id}/certificat` : ''
})

const mapChambre = (row = {}) => {
  const stagiaireRows = row.stagiaires || []
  const names = stagiaireRows.map((stagiaire) => fullName(stagiaire))
  const occupants = row.stagiaires_count ?? names.length

  return {
    ...row,
    id: String(row.id),
    numero: row.numero,
    etage: row.etage || 'Rez de chaussee',
    categorie: categoryToLabel(row.category),
    capacite: Number(row.capacite || 4),
    occupants,
    places_libres: Math.max(0, Number(row.capacite || 4) - occupants),
    stagiaires: names,
    occupantDetails: stagiaireRows.map((stagiaire) => ({
      id: String(stagiaire.id),
      nom: fullName(stagiaire),
      cin: stagiaire.cin || '',
      genre: stagiaire.genre || categoryToGenre(stagiaire.category),
      category: stagiaire.category || row.category,
      chambre_id: stagiaire.chambre_id || row.id
    })),
    statut: occupants >= Number(row.capacite || 4) ? 'Complete' : 'Disponible'
  }
}

const mapPaiement = (row = {}) => ({
  ...row,
  id: String(row.id),
  stagiaire: row.stagiaire ? fullName(row.stagiaire) : row.stagiaire,
  stagiaire_id: row.stagiaire_id || row.stagiaire?.id || '',
  chambre: row.stagiaire?.chambre?.numero || '',
  categorie: categoryToLabel(row.stagiaire?.category || row.category),
  montant_value: Number(row.montant || 0),
  montant: `${Number(row.montant || 0)} DH`,
  statut: row.statut === 'paye' ? 'Paye' : row.statut === 'en_retard' ? 'En retard' : 'Non paye',
  mode_paiement: row.mode_paiement || 'Especes',
  numero_recu: row.numero_recu || '',
  date: row.date_paiement || ''
})

const mapSortie = (row = {}) => ({
  ...row,
  id: String(row.id),
  stagiaire: row.stagiaire ? fullName(row.stagiaire) : '',
  genre: row.stagiaire?.genre || categoryToGenre(row.stagiaire?.category),
  chambre: row.stagiaire?.chambre?.numero || '',
  categorie: categoryToLabel(row.stagiaire?.category),
  telephone: row.stagiaire?.telephone || row.contact || '',
  dateSortie: formatDate(row.date_sortie),
  dateRetour: formatDate(row.date_retour),
  dateSortieRaw: dateRaw(row.date_sortie),
  dateRetourRaw: dateRaw(row.date_retour),
  motif: row.motif || '',
  statut_api: row.statut_effectif || row.statut,
  statut:
    (row.statut_effectif || row.statut) === 'retourne'
      ? 'Retourne'
      : (row.statut_effectif || row.statut) === 'retard'
        ? 'Retard'
        : 'Sorti'
})

const mapReclamation = (row = {}) => ({
  ...row,
  id: String(row.id),
  stagiaire: row.stagiaire ? fullName(row.stagiaire) : '',
  nom: row.stagiaire?.nom || '',
  prenom: row.stagiaire?.prenom || '',
  cin: row.stagiaire?.cin || '',
  telephone: row.stagiaire?.telephone || '',
  chambre: row.stagiaire?.chambre?.numero || '',
  categorie: categoryToLabel(row.stagiaire?.category),
  email: row.stagiaire?.user?.email || '',
  date: row.created_at ? String(row.created_at).slice(0, 10) : '',
  priorite: row.priorite || 'Normale'
})

const mapProfile = (row = {}) => ({
  ...mapStagiaire(row),
  paiements: (row.paiements || []).map(mapPaiement),
  reclamations: (row.reclamations || []).map(mapReclamation),
  sorties: (row.sorties || []).map(mapSortie)
})

async function list(path, mapper, params = {}) {
  const { data } = await api.get(path, { params: cleanParams(params) })
  return unwrap(data).map(mapper)
}

export const store = {
  getDashboard: async () => (await api.get('/dashboard')).data,

  getStagiaires: (params) => list('/stagiaires', mapStagiaire, params),
  getStagiaireProfile: async (id) => mapProfile((await api.get(`/stagiaires/${id}/profile`)).data),
  createStagiaire: async (payload) => mapStagiaire((await api.post('/stagiaires', payload)).data),
  updateStagiaire: async (id, payload) => mapStagiaire((await api.put(`/stagiaires/${id}`, payload)).data),
  deleteStagiaire: (id) => api.delete(`/stagiaires/${id}`),

  getResponsables: () => list('/responsables', mapResponsable),
  createResponsable: async (payload) => mapResponsable((await api.post('/responsables', payload)).data),
  updateResponsable: async (id, payload) => mapResponsable((await api.put(`/responsables/${id}`, payload)).data),
  deleteResponsable: (id) => api.delete(`/responsables/${id}`),

  getDemandes: (params) => list('/demandes', mapDemande, params),
  acceptDemande: (id, payload = {}) => api.post(`/demandes/${id}/accept`, payload),
  refuseDemande: (id, motif_refus = '') => api.post(`/demandes/${id}/refuse`, { motif_refus }),
  updateDemande: (id, payload) => api.put(`/demandes/${id}`, payload),

  getChambres: (params) => list('/chambres', mapChambre, params),
  createChambre: async (payload) => mapChambre((await api.post('/chambres', payload)).data),
  updateChambre: async (id, payload) => mapChambre((await api.put(`/chambres/${id}`, payload)).data),
  deleteChambre: (id) => api.delete(`/chambres/${id}`),

  getPaiements: (params) => list('/paiements', mapPaiement, params),
  createPaiement: async (payload) => mapPaiement((await api.post('/paiements', payload)).data),
  updatePaiement: async (id, payload) => mapPaiement((await api.put(`/paiements/${id}`, payload)).data),
  deletePaiement: (id) => api.delete(`/paiements/${id}`),

  getSorties: (params) => list('/sorties', mapSortie, params),
  createSortie: async (payload) => mapSortie((await api.post('/sorties', payload)).data),
  updateSortie: async (id, payload) => mapSortie((await api.put(`/sorties/${id}`, payload)).data),
  deleteSortie: (id) => api.delete(`/sorties/${id}`),

  getReclamations: (params) => list('/reclamations', mapReclamation, params),
  createReclamation: async (payload) => mapReclamation((await api.post('/reclamations', payload)).data),
  updateReclamation: async (id, payload) => mapReclamation((await api.put(`/reclamations/${id}`, payload)).data)
}
