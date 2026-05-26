import Card from './ui/Card.jsx'
import Badge from './ui/Badge.jsx'

export default function StatCard({ label, value, icon: Icon, hint, trend = '', tone = 'info' }) {
  return (
    <Card hover className="group relative overflow-hidden rounded-3xl border-sky-100 bg-gradient-to-br from-white via-white to-cyan-soft/70 p-6 shadow-[0_20px_50px_rgba(14,165,233,0.10)]">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-secondary/10 blur-2xl transition group-hover:bg-secondary/20" />
      <div className="flex items-start justify-between gap-4">
        <div className="relative z-10 min-w-0">
          <p className="text-sm font-bold text-muted">{label}</p>
          <h3 className="mt-3 text-4xl font-black tracking-normal text-primary">{value}</h3>
          {hint && <p className="mt-2 text-xs font-semibold text-muted">{hint}</p>}
          {trend ? <Badge tone={tone} className="mt-4 h-8 px-3 text-[11px] font-black">{trend}</Badge> : null}
        </div>
        {Icon && (
          <div className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white shadow-[0_16px_30px_rgba(7,59,92,0.20)]">
            <Icon className="h-7 w-7" />
          </div>
        )}
      </div>
    </Card>
  )
}
