import { useEffect, useState } from 'react'
import { useSaveField } from '../../hooks/useSaveField.ts'
import { SaveIndicator } from './SaveIndicator.tsx'

interface EditableFieldProps {
  label: string
  value: string | number
  multiline?: boolean
  type?: 'text' | 'number'
  /** Guarda el nuevo valor. Debe resolver ok o lanzar con el mensaje de error. */
  onSave: (value: string | number) => Promise<unknown>
}

/**
 * Campo editable en sitio. Detecta si hay cambios (dirty) y solo entonces ofrece
 * guardar/cancelar. Al guardar con éxito, el valor pasa a ser el nuevo baseline.
 */
export function EditableField({
  label,
  value,
  multiline = false,
  type = 'text',
  onSave,
}: EditableFieldProps) {
  const [draft, setDraft] = useState(String(value))
  const save = useSaveField()

  // Si el valor de origen cambia (recarga tras guardar), re-sincroniza el draft.
  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const dirty = draft !== String(value)

  async function handleSave() {
    const parsed = type === 'number' ? Number(draft) : draft
    const ok = await save.run(() => onSave(parsed))
    if (!ok) return
  }

  return (
    <div className="flex flex-col gap-1.5">
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
                onClick={() => setDraft(String(value))}
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
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      ) : (
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      )}
    </div>
  )
}
