import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSaveField } from '../../hooks/useSaveField.ts'
import { SaveIndicator } from './SaveIndicator.tsx'

interface MarkdownDocEditorProps {
  title: string
  content: string
  onSave: (content: string) => Promise<unknown>
}

/**
 * Muestra un documento markdown renderizado con un toggle a edición en crudo
 * (textarea). No parsea la estructura interna del documento a formulario: es texto.
 */
export function MarkdownDocEditor({ title, content, onSave }: MarkdownDocEditorProps) {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [draft, setDraft] = useState(content)
  const save = useSaveField()

  useEffect(() => {
    setDraft(content)
  }, [content])

  const dirty = draft !== content

  async function handleSave() {
    const ok = await save.run(() => onSave(draft))
    if (ok) setMode('preview')
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <h3 className="font-mono text-sm font-medium text-slate-700">{title}</h3>
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
            <ToggleButton active={mode === 'preview'} onClick={() => setMode('preview')}>
              Vista
            </ToggleButton>
            <ToggleButton active={mode === 'edit'} onClick={() => setMode('edit')}>
              Editar
            </ToggleButton>
          </div>
        </div>
      </header>
      {mode === 'preview' ? (
        <div className="prose-doc max-h-[32rem] overflow-auto px-5 py-4">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
      ) : (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          className="h-[32rem] w-full resize-y bg-slate-50 px-5 py-4 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none"
        />
      )}
    </section>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-0.5 font-medium transition-colors ${
        active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}
