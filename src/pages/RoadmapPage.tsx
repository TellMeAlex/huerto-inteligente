import { useRoadmap } from '../hooks/useSessions.ts'
import { AsyncBoundary } from '../components/shared/AsyncBoundary.tsx'
import { SessionCard } from '../components/roadmap/SessionCard.tsx'

export function RoadmapPage() {
  const { data, loading, error } = useRoadmap()

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Roadmap de sesiones</h1>
        <p className="mt-1 text-sm text-slate-500">
          AiContext &amp; SDD en acción — vista general del recorrido y estado de cada charla.
        </p>
      </header>

      <AsyncBoundary loading={loading} error={error}>
        {data && (
          <>
            <RoadmapStats total={data.roadmap.length} sessions={data.sessions} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.roadmap.map((entry) => (
                <SessionCard
                  key={entry.id}
                  entry={entry}
                  summary={data.sessions.find((s) => s.id === entry.id)}
                />
              ))}
            </div>
          </>
        )}
      </AsyncBoundary>
    </div>
  )
}

function RoadmapStats({
  total,
  sessions,
}: {
  total: number
  sessions: { status: string }[]
}) {
  const complete = sessions.filter((s) => s.status === 'complete').length
  const draft = sessions.filter((s) => s.status === 'draft').length
  return (
    <div className="mb-6 flex flex-wrap gap-4 text-sm">
      <Stat label="Sesiones" value={total} />
      <Stat label="Completas" value={complete} accent="text-emerald-600" />
      <Stat label="Borrador" value={draft} accent="text-amber-600" />
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2">
      <span className={`text-lg font-bold ${accent ?? 'text-slate-900'}`}>{value}</span>{' '}
      <span className="text-slate-500">{label}</span>
    </div>
  )
}
