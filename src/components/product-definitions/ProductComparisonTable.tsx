import type { ProductDefinitionEntry } from '../../../shared/types.ts'

/**
 * Tabla comparativa de Alcance / Fuera de alcance / Criterios de aceptación entre las
 * sesiones que definen producto. El mapeo de campos por formato es explícito (ver
 * FIELD_NOTE): S1 usa initial_scope/non_goals y no tiene criterios; S2/S3 usan
 * in_scope/out_of_scope/acceptance_criteria.
 */
export function ProductComparisonTable({ entries }: { entries: ProductDefinitionEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">Dimensión</th>
            {entries.map((e) => (
              <th key={e.sessionId} className="px-4 py-3 font-medium">
                <span className="font-mono text-slate-400">S{e.sessionId}</span> · {e.kind}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 align-top">
          <Row label="Alcance" entries={entries} pick={(e) => e.scope} />
          <Row label="Fuera de alcance" entries={entries} pick={(e) => e.outOfScope} />
          <Row
            label="Criterios de aceptación"
            entries={entries}
            pick={(e) => e.acceptanceCriteria}
            emptyNote="El formato de S1 no define criterios de aceptación"
          />
        </tbody>
      </table>
    </div>
  )
}

function Row({
  label,
  entries,
  pick,
  emptyNote,
}: {
  label: string
  entries: ProductDefinitionEntry[]
  pick: (e: ProductDefinitionEntry) => string[]
  emptyNote?: string
}) {
  return (
    <tr>
      <th className="w-40 bg-slate-50/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </th>
      {entries.map((e) => {
        const items = pick(e)
        return (
          <td key={e.sessionId} className="px-4 py-3">
            {items.length === 0 ? (
              <span className="text-xs italic text-slate-400">{emptyNote ?? '—'}</span>
            ) : (
              <ul className="flex list-disc flex-col gap-1 pl-4 text-slate-600">
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </td>
        )
      })}
    </tr>
  )
}
