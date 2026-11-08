import { Link } from 'react-router-dom'
import type { RoadmapEntry, SessionSummary } from '../../../shared/types.ts'
import { StatusBadge } from './StatusBadge.tsx'

interface SessionCardProps {
  entry: RoadmapEntry
  summary: SessionSummary | undefined
}

export function SessionCard({ entry, summary }: SessionCardProps) {
  const status = summary?.status ?? 'draft'
  return (
    <Link
      to={`/sessions/${entry.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
          {entry.id}
        </span>
        <StatusBadge status={status} />
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900 group-hover:text-slate-700">
        {entry.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-500">{entry.question}</p>
      {summary && (
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
          {summary.durationMinutes ? `${summary.durationMinutes} min · ` : ''}
          {summary.filesPresent.length} fichero{summary.filesPresent.length === 1 ? '' : 's'}
        </p>
      )}
    </Link>
  )
}
