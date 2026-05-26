import { AlertTriangle, X } from 'lucide-react'
import Button from './Button.jsx'

export default function ConfirmDialog({
  open,
  title = 'Confirmation',
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  tone = 'danger',
  onConfirm,
  onCancel
}) {
  if (!open) return null

  const confirmVariant = tone === 'danger' ? 'danger' : 'primary'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(7,59,92,0.22)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-danger">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-black text-primary">{title}</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-muted">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-sky-100 bg-white text-primary shadow-subtle transition hover:bg-cyan-soft"
            title={cancelLabel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
