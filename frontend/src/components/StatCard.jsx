import Card from './ui/Card.jsx'

export default function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <Card hover>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <h3 className="mt-2 text-3xl font-bold text-primary">{value}</h3>
          {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
        </div>
        {Icon && (
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-soft text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  )
}
