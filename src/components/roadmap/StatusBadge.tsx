import type { SessionStatus } from '../../../shared/types.ts'

const STYLES: Record<SessionStatus, string> = {
  complete: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  draft: 'bg-amber-100 text-amber-700 ring-amber-600/20',
}

const LABELS: Record<SessionStatus, string> = {
  complete: 'Completa',
  draft: 'Borrador',
}

export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
