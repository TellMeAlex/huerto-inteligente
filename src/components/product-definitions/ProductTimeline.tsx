import { Link } from 'react-router-dom'
import type { ProductDefinitionEntry } from '../../../shared/types.ts'

/** Línea temporal de definiciones de producto, una tarjeta por sesión que la define. */
export function ProductTimeline({ entries }: { entries: ProductDefinitionEntry[] }) {
  return (
    <ol className="relative flex flex-col gap-6 border-l-2 border-slate-200 pl-6">
      {entries.map((entry) => (
        <li key={entry.sessionId} className="relative">
          <span className="absolute top-1 -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
            {entry.sessionId}
          </span>
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <Link
                to={`/sessions/${entry.sessionId}`}
                className="text-sm font-semibold text-slate-900 hover:text-slate-600"
              >
                {entry.sessionTitle}
              </Link>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                {entry.kind}
              </span>
            </div>

            {entry.productName && (
              <p className="mt-2 text-sm font-medium text-slate-700">{entry.productName}</p>
            )}
            <p className="mt-1 text-sm text-slate-600">{entry.statement}</p>

            {entry.pivotNote && (
              <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
                  ⟳ Pivote de producto
                </p>
                <p className="text-sm text-violet-900">{entry.pivotNote}</p>
              </div>
            )}
          </article>
        </li>
      ))}
    </ol>
  )
}
