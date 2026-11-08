import { useEffect, useState } from 'react'
import { useSaveField } from '../../hooks/useSaveField.ts'
import { SaveIndicator } from './SaveIndicator.tsx'

interface EditableListProps {
  label: string
  items: string[]
  onSave: (items: string[]) => Promise<unknown>
}

/** Edita una lista de strings (añadir/editar/borrar) y guarda el array completo. */
export function EditableList({ label, items, onSave }: EditableListProps) {
  const [draft, setDraft] = useState<string[]>(items)
  const save = useSaveField()

  useEffect(() => {
    setDraft(items)
  }, [items])

  const dirty = JSON.stringify(draft) !== JSON.stringify(items)

  function update(index: number, value: string) {
    setDraft((prev) => prev.map((item, i) => (i === index ? value : item)))
  }
  function remove(index: number) {
    setDraft((prev) => prev.filter((_, i) => i !== index))
  }
  function add() {
    setDraft((prev) => [...prev, ''])
  }

  async function handleSave() {
    // Descarta entradas vacías antes de persistir.
    await save.run(() => onSave(draft.map((s) => s.trim()).filter(Boolean)))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <SaveIndicator status={save.status} error={save.error} />
          {dirty && (
            <>
              <button
                type="button"
                onClick={() => setDraft(items)}
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
                Guardar
              </button>
            </>
          )}
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {draft.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
            <textarea
              value={item}
              onChange={(e) => update(index, e.target.value)}
              rows={1}
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
              title="Eliminar"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={add}
        className="self-start rounded-md border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700"
      >
        + Añadir
      </button>
    </div>
  )
}
