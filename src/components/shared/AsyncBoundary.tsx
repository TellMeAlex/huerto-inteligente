import type { ReactNode } from 'react'

interface AsyncBoundaryProps {
  loading: boolean
  error: string | undefined
  children: ReactNode
}

/** Envoltorio uniforme para estados de carga/error de datos remotos. */
export function AsyncBoundary({ loading, error, children }: AsyncBoundaryProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-8 text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        Cargando…
      </div>
    )
  }
  if (error) {
    return (
      <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-semibold">No se pudieron cargar los datos</p>
        <p className="mt-1 font-mono text-xs">{error}</p>
      </div>
    )
  }
  return <>{children}</>
}
