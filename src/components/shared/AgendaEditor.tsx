import { useEffect, useState } from 'react'
import type { AgendaBlock } from '../../../shared/types.ts'
import { useSaveField } from '../../hooks/useSaveField.ts'
import { SaveIndicator } from './SaveIndicator.tsx'

interface AgendaEditorProps {
  agenda: AgendaBlock[]
  durationMinutes: number
  onSave: (agenda: AgendaBlock[]) => Promise<unknown>
}

/**
 * Editor de la agenda con recálculo en vivo de la suma de duraciones y aviso si no
 * cuadra con la duración declarada de la sesión. El servidor bloquea el guardado si
 * no cuadra; aquí lo mostramos antes para que el usuario lo corrija.
 */
export function AgendaEditor({ agenda, durationMinutes, onSave }: AgendaEditorProps) {
  const [draft, setDraft] = useState<AgendaBlock[]>(agenda)
  const save = useSaveField()

  useEffect(() => {
    setDraft(agenda)
  }, [agenda])

  const total = draft.reduce((acc, b) => acc + (Number(b.duration_minutes) || 0), 0)
  const matches = total === durationMinutes
  const dirty = JSON.stringify(draft) !== JSON.stringify(agenda)

  function updateBlock(index: number, patch: Partial<AgendaBlock>) {
    setDraft((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)))
  }
  function removeBlock(index: number) {
    setDraft((prev) => prev.filter((_, i) => i !== index))
  }
  function addBlock() {
    const last = draft[draft.length - 1]
    const start = last ? last.end_minute : 0
    setDraft((prev) => [
      ...prev,
      { start_minute: start, end_minute: start, duration_minutes: 0, topic: '' },
    ])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">Total agenda:</span>
          <span
            className={`rounded-md px-2 py-0.5 font-semibold ${
              matches ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {total} / {durationMinutes} min
          </span>
          {!matches && (
            <span className="text-xs text-red-600">No cuadra — el guardado se bloqueará</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SaveIndicator status={save.status} error={save.error} />
          {dirty && (
            <>
              <button
                type="button"
                onClick={() => setDraft(agenda)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => save.run(() => onSave(draft))}
                disabled={save.status === 'saving'}
                className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                Guardar agenda
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Inicio</th>
              <th className="px-3 py-2 text-left font-medium">Fin</th>
              <th className="px-3 py-2 text-left font-medium">Min</th>
              <th className="px-3 py-2 text-left font-medium">Tema</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {draft.map((block, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="px-2 py-1">
                  <NumCell
                    value={block.start_minute}
                    onChange={(v) => updateBlock(index, { start_minute: v })}
                  />
                </td>
                <td className="px-2 py-1">
                  <NumCell
                    value={block.end_minute}
                    onChange={(v) => updateBlock(index, { end_minute: v })}
                  />
                </td>
                <td className="px-2 py-1">
                  <NumCell
                    value={block.duration_minutes}
                    onChange={(v) => updateBlock(index, { duration_minutes: v })}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    value={block.topic}
                    onChange={(e) => updateBlock(index, { topic: e.target.value })}
                    className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 hover:border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none"
                  />
                </td>
                <td className="px-1 py-1">
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Eliminar bloque"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addBlock}
        className="self-start rounded-md border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700"
      >
        + Añadir bloque
      </button>
    </div>
  )
}

function NumCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-16 rounded-md border border-transparent bg-transparent px-2 py-1 hover:border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none"
    />
  )
}
