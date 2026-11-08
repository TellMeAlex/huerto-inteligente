import { Link, useParams } from 'react-router-dom'
import { useSession } from '../hooks/useSessions.ts'
import { AsyncBoundary } from '../components/shared/AsyncBoundary.tsx'
import { StatusBadge } from '../components/roadmap/StatusBadge.tsx'
import { SessionDetailContent } from '../components/session-detail/SessionDetailContent.tsx'

export function SessionDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useSession(id)

  return (
    <div>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        ← Roadmap
      </Link>

      <AsyncBoundary loading={loading} error={error}>
        {data && (
          <>
            <header className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                    {data.id}
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {data.session?.title ?? data.slug}
                  </h1>
                </div>
                {data.session && (
                  <p className="mt-2 text-sm text-slate-500">
                    {data.session.owner} · {data.session.duration_minutes} min
                    {data.session.format ? ` · ${data.session.format}` : ''}
                  </p>
                )}
              </div>
              <StatusBadge status={data.status} />
            </header>

            <SessionDetailContent bundle={data} reload={reload} />
          </>
        )}
      </AsyncBoundary>
    </div>
  )
}
