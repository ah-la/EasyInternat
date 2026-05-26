export const monthlyStats = [
  { month: 'Jan', sorties: 8, paiements: 88 },
  { month: 'Fev', sorties: 12, paiements: 82 },
  { month: 'Mar', sorties: 6, paiements: 91 },
  { month: 'Avr', sorties: 10, paiements: 86 },
  { month: 'Mai', sorties: 7, paiements: 93 }
]

export const stagiaires = [
  { id: 'ST-001', nom: 'Ahlam Hiba', cin: 'AB123', email: 'ahlam@cmc.test', password: 'password', genre: 'Fille', chambre: 'F-101', paiement: 'Paye' },
  { id: 'ST-002', nom: 'Sara Amal', cin: 'CD456', email: 'sara@cmc.test', password: 'password', genre: 'Fille', chambre: 'F-102', paiement: 'En retard' },
  { id: 'ST-003', nom: 'Yassine Omar', cin: 'EF789', email: 'yassine@cmc.test', password: 'password', genre: 'Garcon', chambre: 'G-201', paiement: 'Non paye' },
  { id: 'ST-004', nom: 'Mehdi Nabil', cin: 'GH321', email: 'mehdi@cmc.test', password: 'password', genre: 'Garcon', chambre: 'G-203', paiement: 'Paye' }
]

export const chambres = [
  { numero: 'F01', etage: 'Rez de chaussee', categorie: 'Filles', capacite: 4, stagiaires: ['Ahlam Hiba', 'Sara Amal'], occupants: 2, statut: 'Disponible' },
  { numero: 'F02', etage: 'Rez de chaussee', categorie: 'Filles', capacite: 4, stagiaires: [], occupants: 0, statut: 'Disponible' },
  { numero: 'FB1', etage: '1ere etage', categorie: 'Filles', capacite: 4, stagiaires: ['Nadia El Amrani', 'Imane Rami', 'Houda Salhi'], occupants: 3, statut: 'Disponible' },
  { numero: 'FB2', etage: '2eme etage', categorie: 'Filles', capacite: 4, stagiaires: ['Meryem Ait', 'Sara Amal', 'Ahlam Hiba', 'Nadia El Amrani'], occupants: 4, statut: 'Complete' },
  { numero: 'G01', etage: 'Rez de chaussee', categorie: 'Garcons', capacite: 4, stagiaires: ['Yassine Omar'], occupants: 1, statut: 'Disponible' },
  { numero: 'G02', etage: 'Rez de chaussee', categorie: 'Garcons', capacite: 4, stagiaires: [], occupants: 0, statut: 'Disponible' },
  { numero: 'GB1', etage: '1ere etage', categorie: 'Garcons', capacite: 4, stagiaires: ['Yassine Omar', 'Mehdi Nabil', 'Omar Salmi'], occupants: 3, statut: 'Disponible' },
  { numero: 'GB2', etage: '2eme etage', categorie: 'Garcons', capacite: 4, stagiaires: ['Yassine Omar', 'Mehdi Nabil', 'Omar Salmi', 'Anas Radi'], occupants: 4, statut: 'Complete' }
]

export const paiements = [
  { mois: 'Mai', stagiaire: 'Ahlam Hiba', montant: '300 DH', statut: 'Paye', date: '2026-05-05' },
  { mois: 'Mai', stagiaire: 'Sara Amal', montant: '300 DH', statut: 'En retard', date: '2026-05-12' },
  { mois: 'Mai', stagiaire: 'Yassine Omar', montant: '300 DH', statut: 'Non paye', date: '2026-05-14' }
]

export const sorties = [
  {
    id: 'SOR-001',
    stagiaire: 'Ahlam Hiba',
    genre: 'Fille',
    dateSortie: '2026-05-17',
    heureSortie: '18:00',
    dateRetour: '2026-05-19',
    heureRetour: '20:00',
    motif: 'Weekend familial',
    contact: '0600000000',
    statut: 'En attente'
  },
  {
    id: 'SOR-002',
    stagiaire: 'Yassine Omar',
    genre: 'Garcon',
    dateSortie: '2026-05-18',
    heureSortie: '17:30',
    dateRetour: '2026-05-20',
    heureRetour: '19:00',
    motif: 'Rendez-vous administratif',
    contact: '0611111111',
    statut: 'Validee'
  }
]

export const reclamations = [
  { id: 'REC-018', stagiaire: 'Ahlam Hiba', chambre: 'F-101', type: 'Chambre', statut: 'En attente', priorite: 'Moyenne' },
  { id: 'REC-019', stagiaire: 'Yassine Omar', chambre: 'G-201', type: 'Maintenance', statut: 'En cours', priorite: 'Haute' },
  { id: 'REC-020', stagiaire: 'Mehdi Nabil', chambre: 'G-203', type: 'Securite', statut: 'Validee', priorite: 'Normale' }
]

export const responsables = [
  { id: 'RESP-001', nom: 'Responsable Filles', email: 'filles@cmc.test', categorie: 'Filles', statut: 'Actif' },
  { id: 'RESP-002', nom: 'Responsable Garcons', email: 'garcons@cmc.test', categorie: 'Garcons', statut: 'Actif' }
]

export const demandes = [
  {
    id: 'DEM-001',
    nom: 'Nadia El Amrani',
    cin: 'AA123456',
    email: 'nadia@email.com',
    telephone: '0612345678',
    filiere: 'Developpement Digital',
    etablissement: 'ISTA Casablanca',
    annee: '1ere annee',
    genre: 'Fille',
    message: 'Demande de place a l internat.',
    certificat: 'certificat-residence-nadia.pdf',
    statut: 'En attente'
  },
  {
    id: 'DEM-002',
    nom: 'Omar Salmi',
    cin: 'BB456789',
    email: 'omar@email.com',
    telephone: '0622222222',
    filiere: 'Infrastructure Digitale',
    etablissement: 'ISTA Casablanca',
    annee: '2eme annee',
    genre: 'Garcon',
    message: 'Habite loin du centre.',
    certificat: 'certificat-residence-omar.pdf',
    statut: 'Liste attente'
  }
]
