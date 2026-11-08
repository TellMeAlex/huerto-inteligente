import { useEffect, useId, useState } from 'react'
import mermaid from 'mermaid'
import { useSaveField } from '../../hooks/useSaveField.ts'
import { SaveIndicator } from './SaveIndicator.tsx'

mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' })

interface MermaidDiagramProps {
  filename: string
  content: string
  onSave: (content: string) => Promise<unknown>
}

/** Renderiza un diagrama Mermaid con toggle a edición en crudo del .mmd. */
export function MermaidDiagram({ filename, content, onSave }: MermaidDiagramProps) {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [draft, setDraft] = useState(content)
  const [svg, setSvg] = useState<string>('')
  const [renderError, setRenderError] = useState<string | undefined>(undefined)
  const save = useSaveField()
  const baseId = useId().replace(/:/g, '')

  useEffect(() => {
    setDraft(content)
  }, [content])

  useEffect(() => {
    let cancelled = false
    mermaid
      .render(`mmd-${baseId}`, content)
      .then(({ svg }) => {
        if (!cancelled) {
          setSvg(svg)
          setRenderError(undefined)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setRenderError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [content, baseId])

  const dirty = draft !== content

  async function handleSave() {
    const ok = await save.run(() => onSave(draft))
    if (ok) setMode('preview')
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <h3 className="font-mono text-sm font-medium text-slate-700">{filename}</h3>
        <div className="flex items-center gap-3">
          <SaveIndicator status={save.status} error={save.error} />
          {mode === 'edit' && dirty && (
            <button
              type="button"
              onClick={handleSave}
              disabled={save.status === 'saving'}
              className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Guardar
            </button>
          )}
          <div className="flex rounded-md border border-slate-200 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`rounded px-2 py-0.5 font-medium ${mode === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            >
              Vista
            </button>
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`rounded px-2 py-0.5 font-medium ${mode === 'edit' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
            >
              Editar
            </button>
          </div>
        </div>
      </header>
      {mode === 'preview' ? (
        renderError ? (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            No se pudo renderizar el diagrama: {renderError}
          </div>
        ) : (
          <div
            className="flex justify-center overflow-auto p-5 [&_svg]:max-w-full"
            // El SVG lo genera mermaid con securityLevel 'strict' (sanitizado).
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )
      ) : (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          className="h-80 w-full resize-y bg-slate-50 px-5 py-4 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none"
        />
      )}
    </section>
  )
}
