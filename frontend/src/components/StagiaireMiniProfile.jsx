import { BedDouble, GraduationCap, UserRound } from 'lucide-react'
import Card from './ui/Card.jsx'

export default function StagiaireMiniProfile({ profile }) {
  if (!profile) return null

  const line = [
    profile.chambre || 'Sans chambre',
    profile.categorie || '',
    profile.annee || '1ere annee'
  ].filter(Boolean).join(' - ')

  return (
    <Card className="mx-auto mb-4 flex w-full flex-col items-start gap-3 p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-soft text-primary">
        <UserRound className="h-7 w-7" />
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-xl font-black text-primary">{profile.fullName || profile.nom}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-muted">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            {line}
          </span>
          {profile.filiere ? (
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {profile.filiere}
            </span>
          ) : null}
        </p>
      </div>
    </Card>
  )
}
