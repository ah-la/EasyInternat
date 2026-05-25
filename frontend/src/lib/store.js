import api from '../services/api.js'

const unwrap = (payload) => (Array.isArray(payload?.data) ? payload.data : payload)
const fullName = (row = {}) => [row.nom, row.prenom].filter(Boolean).join(' ').trim() || row.name || ''

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

const mapStagiaire = (row = {}) => ({
  ...row,
  id: String(row.id),
  nom: fullName(row),
  prenom: row.prenom || '',
  email: row.user?.email || row.email || '',
  genre: row.genre || categoryToGenre(row.category),
  categorie: categoryToLabel(row.category),
  chambre: row.chambre?.numero || row.chambre || '',
  chambre_id: row.chambre_id || row.chambre?.id || '',
  paiement: row.paiement || ''
})

const mapResponsable = (row = {}) => ({
  ...row,
  id: String(row.id),
  nom: row.name || row.nom || '',
  categorie: categoryToLabel(row.category),
  statut: 'Actif'
})

const mapDemande = (row = {}) => ({
  ...row,
  id: String(row.id),
  nom: fullName(row),
  certificat: row.certificat_residence || row.certificat || ''
})

const mapChambre = (row = {}) => {
  const names = (row.stagiaires || []).map((stagiaire) => fullName(stagiaire))
  const occupants = row.stagiaires_count ?? names.length

  return {
    ...row,
    id: String(row.id),
    numero: row.numero,
    etage: row.etage || 'Rez de chaussee',
    categorie: categoryToLabel(row.category),
    capacite: Number(row.capacite || 4),
    occupants,
    stagiaires: names,
    statut: occupants >= Number(row.capacite || 4) ? 'Complete' : 'Disponible'
  }
}

const mapPaiement = (row = {}) => ({
  ...row,
  id: String(row.id),
  stagiaire: row.stagiaire ? fullName(row.stagiaire) : row.stagiaire,
  montant: `${Number(row.montant || 0)} DH`,
  statut: row.statut === 'paye' ? 'Paye' : row.statut === 'en_retard' ? 'En retard' : 'Non paye',
  date: row.date_paiement || ''
})

const mapSortie = (row = {}) => ({
  ...row,
  id: String(row.id),
  stagiaire: row.stagiaire ? fullName(row.stagiaire) : '',
  genre: row.stagiaire?.genre || categoryToGenre(row.stagiaire?.category),
  dateSortie: row.date_sortie,
  dateRetour: row.date_retour,
  statut: row.statut
})

const mapReclamation = (row = {}) => ({
  ...row,
  id: String(row.id),
  stagiaire: row.stagiaire ? fullName(row.stagiaire) : '',
  chambre: row.stagiaire?.chambre?.numero || '',
  priorite: row.priorite || 'Normale'
})

async function list(path, mapper) {
  const { data } = await api.get(path)
  return unwrap(data).map(mapper)
}

export const store = {
  getDashboard: async () => (await api.get('/dashboard')).data,

  getStagiaires: () => list('/stagiaires', mapStagiaire),
  createStagiaire: async (payload) => mapStagiaire((await api.post('/stagiaires', payload)).data),
  updateStagiaire: async (id, payload) => mapStagiaire((await api.put(`/stagiaires/${id}`, payload)).data),
  deleteStagiaire: (id) => api.delete(`/stagiaires/${id}`),

  getResponsables: () => list('/responsables', mapResponsable),
  createResponsable: async (payload) => mapResponsable((await api.post('/responsables', payload)).data),
  updateResponsable: async (id, payload) => mapResponsable((await api.put(`/responsables/${id}`, payload)).data),
  deleteResponsable: (id) => api.delete(`/responsables/${id}`),

  getDemandes: () => list('/demandes', mapDemande),
  acceptDemande: (id) => api.post(`/demandes/${id}/accept`),
  refuseDemande: (id, motif_refus = '') => api.post(`/demandes/${id}/refuse`, { motif_refus }),
  updateDemande: (id, payload) => api.put(`/demandes/${id}`, payload),

  getChambres: () => list('/chambres', mapChambre),
  createChambre: async (payload) => mapChambre((await api.post('/chambres', payload)).data),
  updateChambre: async (id, payload) => mapChambre((await api.put(`/chambres/${id}`, payload)).data),
  deleteChambre: (id) => api.delete(`/chambres/${id}`),

  getPaiements: () => list('/paiements', mapPaiement),
  createPaiement: async (payload) => mapPaiement((await api.post('/paiements', payload)).data),

  getSorties: () => list('/sorties', mapSortie),
  createSortie: async (payload) => mapSortie((await api.post('/sorties', payload)).data),
  updateSortie: async (id, payload) => mapSortie((await api.put(`/sorties/${id}`, payload)).data),

  getReclamations: () => list('/reclamations', mapReclamation),
  createReclamation: async (payload) => mapReclamation((await api.post('/reclamations', payload)).data),
  updateReclamation: async (id, payload) => mapReclamation((await api.put(`/reclamations/${id}`, payload)).data),

  markPresence: async () => (await api.post('/presences/mark')).data
}
