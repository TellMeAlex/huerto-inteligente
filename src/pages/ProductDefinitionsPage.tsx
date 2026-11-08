import { useProductDefinitions } from '../hooks/useSessions.ts'
import { AsyncBoundary } from '../components/shared/AsyncBoundary.tsx'
import { ProductTimeline } from '../components/product-definitions/ProductTimeline.tsx'
import { ProductComparisonTable } from '../components/product-definitions/ProductComparisonTable.tsx'

export function ProductDefinitionsPage() {
  const { data, loading, error } = useProductDefinitions()

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Definiciones de producto
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          La definición del producto no vive en un único documento: evoluciona sesión a sesión
          dentro de cada <code className="font-mono text-slate-600">session.yaml</code>. Aquí se ve
          esa evolución y el pivote documentado.
        </p>
      </header>

      <AsyncBoundary loading={loading} error={error}>
        {data && data.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Ninguna sesión define producto todavía.
          </p>
        )}
        {data && data.length > 0 && (
          <div className="flex flex-col gap-10">
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Línea temporal
              </h2>
              <ProductTimeline entries={data} />
            </section>
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Comparativa
              </h2>
              <ProductComparisonTable entries={data} />
            </section>
          </div>
        )}
      </AsyncBoundary>
    </div>
  )
}
