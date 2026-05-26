import { cn } from '../../lib/cn.js'

const toneMap = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-amber-700 border-warning/25',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-secondary/10 text-primary border-secondary/20',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200'
}

export function statusTone(value = '') {
  const normalized = value.toString().toLowerCase()

  if (['paye', 'presente', 'present', 'validee', 'actif', 'acceptee', 'disponible'].some((word) => normalized.includes(word))) {
    return 'success'
  }

  if (['retard', 'attente', 'cours', 'liste'].some((word) => normalized.includes(word))) {
    return 'warning'
  }

  if (['absent', 'non paye', 'refusee', 'bloquee', 'refuse', 'complete'].some((word) => normalized.includes(word))) {
    return 'danger'
  }

  return 'info'
}

export default function Badge({ children, tone = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex h-8 items-center rounded-full border px-3 text-xs font-black shadow-[0_8px_18px_rgba(15,23,42,0.04)]',
        toneMap[tone] || toneMap.neutral,
        className
      )}
    >
      {children}
    </span>
  )
}
