import {
  AlertTriangle,
  BedDouble,
  Bell,
  CreditCard,
  FileCheck2,
  MessageSquareWarning,
  UsersRound
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import StatCard from '../../components/StatCard.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge, { statusTone } from '../../components/ui/Badge.jsx'
import DataTable from '../../components/DataTable.jsx'
import { monthlyStats } from '../../data/mockData.js'
import { filterStagiairesByRole, getCurrentRole, getRoleInfo } from '../../lib/authRole.js'
import { store } from '../../lib/store.js'

const statIcons = [UsersRound, BedDouble, FileCheck2, AlertTriangle]

const notificationIcons = {
  demande: FileCheck2,
  reclamation: MessageSquareWarning,
  paiement: CreditCard,
  absence: AlertTriangle,
  sortie: Bell
}

const tableColumns = {
  stagiaires: [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nom', header: 'Stagiaire' },
    { accessorKey: 'chambre', header: 'Chambre' },
    { accessorKey: 'paiement', header: 'Paiement', cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge> }
  ],
  chambres: [
    { accessorKey: 'numero', header: 'Chambre' },
    { accessorKey: 'categorie', header: 'Categorie' },
    { accessorKey: 'occupants', header: 'Occupants' },
    { accessorKey: 'statut', header: 'Statut' }
  ],
  sorties: [
    { accessorKey: 'dateSortie', header: 'Sortie' },
    { accessorKey: 'stagiaire', header: 'Stagiaire' },
    { accessorKey: 'dateRetour', header: 'Retour' },
    { accessorKey: 'statut', header: 'Statut', cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge> }
  ],
  paiements: [
    { accessorKey: 'stagiaire', header: 'Stagiaire' },
    { accessorKey: 'mois', header: 'Mois' },
    { accessorKey: 'montant', header: 'Montant' },
    { accessorKey: 'statut', header: 'Statut', cell: ({ getValue }) => <Badge tone={statusTone(getValue())}>{getValue()}</Badge> }
  ]
}

export default function Dashboard() {
  const role = getCurrentRole()
  const roleInfo = getRoleInfo(role)
  const [summary, setSummary] = useState({})
  const [allStagiaires, setAllStagiaires] = useState([])
  const [allDemandes, setAllDemandes] = useState([])
  const [allSorties, setAllSorties] = useState([])
  const [allChambres, setAllChambres] = useState([])
  const [allPaiements, setAllPaiements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      store.getDashboard(),
      store.getStagiaires(),
      store.getDemandes(),
      store.getSorties(),
      store.getChambres(),
      store.getPaiements()
    ]).then(([dashboard, stagiaires, demandes, sorties, chambres, paiements]) => {
      setSummary(dashboard)
      setAllStagiaires(stagiaires)
      setAllDemandes(demandes)
      setAllSorties(sorties)
      setAllChambres(chambres)
      setAllPaiements(paiements)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const visibleStagiaires = filterStagiairesByRole(allStagiaires, role)
  const visibleNames = new Set(visibleStagiaires.map((stagiaire) => stagiaire.nom))
  const visibleChambres = roleInfo.gender
    ? allChambres.filter((chambre) => chambre.categorie === `${roleInfo.gender}s`)
    : allChambres
  const visiblePaiements = allPaiements.filter((paiement) => visibleNames.has(paiement.stagiaire))
  const visibleSorties = roleInfo.gender ? allSorties.filter((sortie) => sortie.genre === roleInfo.gender) : allSorties
  const pendingDemandes = allDemandes.filter((demande) => demande.statut === 'En attente')
  const latePayments = visiblePaiements.filter((paiement) => paiement.statut !== 'Paye')
  const notifications = summary.notifications || []
  const basePath = role === 'admin' ? '/admin' : '/responsable'

  const dashboardStats = [
    {
      label: 'Stagiaires actifs',
      value: summary.stagiaires ?? visibleStagiaires.length,
      hint: roleInfo.gender
        ? `${visibleStagiaires.length} ${roleInfo.gender.toLowerCase()}${visibleStagiaires.length > 1 ? 's' : ''}`
        : `${visibleStagiaires.filter((row) => row.genre === 'Fille').length} filles, ${visibleStagiaires.filter((row) => row.genre === 'Garcon').length} garcons`,
      trend: '+12% ce mois',
      tone: 'success'
    },
    {
      label: 'Chambres occupees',
      value: `${summary.chambres_occupees ?? visibleChambres.filter((chambre) => chambre.occupants > 0).length}/${summary.chambres_total ?? visibleChambres.length}`,
      hint: 'Selon les chambres visibles',
      trend: 'Occupation suivie',
      tone: 'info'
    },
    {
      label: 'Demandes en attente',
      value: summary.demandes_en_attente ?? pendingDemandes.length,
      hint: 'A traiter dans Demandes',
      trend: 'A prioriser',
      tone: 'warning'
    },
    {
      label: 'Paiements en retard',
      value: summary.paiements_retard ?? latePayments.length,
      hint: 'Dossiers a suivre',
      trend: '-5% cette semaine',
      tone: latePayments.length > 0 ? 'warning' : 'success'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.06 }}
          >
            <StatCard {...stat} icon={statIcons[index]} />
          </motion.div>
        ))}
      </div>

      <div className="grid min-w-0 gap-7 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="min-w-0 overflow-hidden rounded-3xl p-6 shadow-[0_22px_55px_rgba(7,59,92,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary">Activite mensuelle</h2>
              <p className="text-sm text-muted">Sorties, absences et paiements</p>
            </div>
            <Badge tone="info">Mis a jour {format(new Date(), 'dd/MM/yyyy')}</Badge>
          </div>
          <div className="h-64 min-w-0 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CDEEFF" />
                <XAxis dataKey="month" stroke="#64748B" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#EAF8FF' }} contentStyle={{ borderColor: '#CDEEFF', borderRadius: 8 }} />
                <Bar dataKey="sorties" name="Sorties" fill="#0EA5E9" radius={[10, 10, 0, 0]} animationDuration={900} />
                <Bar dataKey="absences" name="Absences" fill="#F59E0B" radius={[10, 10, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="min-w-0 overflow-hidden rounded-3xl p-6 shadow-[0_22px_55px_rgba(7,59,92,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary">Tendance paiements</h2>
              <p className="text-sm text-muted">Suivi de regularite</p>
            </div>
            <CreditCard className="h-5 w-5 text-secondary" />
          </div>
          <div className="h-64 min-w-0 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CDEEFF" />
                <XAxis dataKey="month" stroke="#64748B" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderColor: '#CDEEFF', borderRadius: 8 }} />
                <Line type="monotone" dataKey="paiements" name="Paiements" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4, fill: '#0EA5E9' }} animationDuration={950} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="min-w-0 rounded-3xl p-6 shadow-[0_22px_55px_rgba(7,59,92,0.08)]">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-primary">Notifications</h2>
            <p className="text-sm font-semibold text-muted">Demandes, reclamations, paiements et absences a suivre</p>
          </div>
          <Badge tone="info">{notifications.length} alertes</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {notifications.map((item, index) => {
            const Icon = notificationIcons[item.type] || Bell
            return (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <Link
                  to={`${basePath}/${item.target}`}
                  className="block h-full rounded-2xl border border-sky-100 bg-white p-4 shadow-subtle transition hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <Badge tone={item.tone}>{item.count}</Badge>
                  </div>
                  <h3 className="mt-4 text-sm font-black text-primary">{item.title}</h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-muted">{item.message}</p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </Card>

      <div className="grid min-w-0 gap-7 xl:grid-cols-2">
        <DataTable title="Stagiaires recents" columns={tableColumns.stagiaires} rows={visibleStagiaires.slice(0, 4)} loading={loading} />
        <DataTable title="Chambres" columns={tableColumns.chambres} rows={visibleChambres.slice(0, 4)} loading={loading} />
        <DataTable title="Sorties recentes" columns={tableColumns.sorties} rows={visibleSorties.slice(0, 4)} loading={loading} />
        <DataTable title="Paiements" columns={tableColumns.paiements} rows={visiblePaiements.slice(0, 4)} loading={loading} />
      </div>
    </motion.div>
  )
}
