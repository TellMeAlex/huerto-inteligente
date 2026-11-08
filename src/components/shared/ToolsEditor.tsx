import { useEffect, useState } from 'react'
import type { SessionTool } from '../../../shared/types.ts'
import { useSaveField } from '../../hooks/useSaveField.ts'
import { SaveIndicator } from './SaveIndicator.tsx'

interface ToolsEditorProps {
  tools: SessionTool[]
  onSave: (tools: SessionTool[]) => Promise<unknown>
}

/** Editor de la lista de herramientas (name/role/aliases/evidence) con guardado completo. */
export function ToolsEditor({ tools, onSave }: ToolsEditorProps) {
  const [draft, setDraft] = useState<SessionTool[]>(tools)
  const save = useSaveField()

  useEffect(() => {
    setDraft(tools)
  }, [tools])

  const dirty = JSON.stringify(draft) !== JSON.stringify(tools)

  function patch(index: number, p: Partial<SessionTool>) {
    setDraft((prev) => prev.map((t, i) => (i === index ? { ...t, ...p } : t)))
  }
  function remove(index: number) {
    setDraft((prev) => prev.filter((_, i) => i !== index))
  }
  function add() {
    setDraft((prev) => [...prev, { name: '', role: '' }])
  }

  async function handleSave() {
    // Limpia aliases vacío para no ensuciar el YAML.
    const cleaned = draft.map((t) => {
      const out: SessionTool = { name: t.name, role: t.role }
      if (t.aliases && t.aliases.length > 0) out.aliases = t.aliases
      if (t.evidence) out.evidence = t.evidence
      return out
    })
    await save.run(() => onSave(cleaned))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-2">
        <SaveIndicator status={save.status} error={save.error} />
        {dirty && (
          <>
            <button
              type="button"
              onClick={() => setDraft(tools)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={save.status === 'saving'}
              className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Guardar herramientas
            </button>
          </>
        )}
      </div>
      <ul className="flex flex-col gap-3">
        {draft.map((tool, index) => (
          <li key={index} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <input
                value={tool.name}
                onChange={(e) => patch(index, { name: e.target.value })}
                placeholder="Nombre"
                className="flex-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm font-semibold focus:border-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </div>
            <textarea
              value={tool.role}
              onChange={(e) => patch(index, { role: e.target.value })}
              placeholder="Rol / descripción"
              rows={2}
              className="mt-2 w-full resize-y rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:border-slate-400 focus:outline-none"
            />
            <input
              value={(tool.aliases ?? []).join(', ')}
              onChange={(e) =>
                patch(index, {
                  aliases: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Alias (separados por coma)"
              className="mt-2 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 focus:border-slate-400 focus:outline-none"
            />
            {tool.evidence !== undefined && (
              <textarea
                value={tool.evidence}
                onChange={(e) => patch(index, { evidence: e.target.value })}
                placeholder="Evidencia"
                rows={1}
                className="mt-2 w-full resize-y rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 focus:border-slate-400 focus:outline-none"
              />
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={add}
        className="self-start rounded-md border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700"
      >
        + Añadir herramienta
      </button>
    </div>
  )
}
