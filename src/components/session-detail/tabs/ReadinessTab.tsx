import { useEffect, useState } from 'react'
import type { SessionData } from '../../../../shared/types.ts'
import { EditableField } from '../../shared/EditableField.tsx'
import { EditableList } from '../../shared/EditableList.tsx'
import { useSaveField } from '../../../hooks/useSaveField.ts'
import { SaveIndicator } from '../../shared/SaveIndicator.tsx'
import type { SaveField } from '../save-field.ts'

interface ReadinessTabProps {
  session: SessionData
  checklist: string | undefined
  save: SaveField
  onSaveChecklist: (content: string) => Promise<unknown>
}

export function ReadinessTab({ session, checklist, save, onSaveChecklist }: ReadinessTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {session.preparation_resources && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Recursos de preparación</h3>
          <EditableList
            label="Ficheros"
            items={session.preparation_resources}
            onSave={(items) => save(['preparation_resources'], items)}
          />
        </section>
      )}

      {session.readiness_review && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Revisión de readiness</h3>
          <div className="flex flex-col gap-5">
            <EditableField
              label="Revisor"
              value={session.readiness_review.owner}
              onSave={(v) => save(['readiness_review', 'owner'], v)}
            />
            <EditableList
              label="Criterios"
              items={session.readiness_review.criteria}
              onSave={(items) => save(['readiness_review', 'criteria'], items)}
            />
          </div>
        </section>
      )}

      {checklist !== undefined && (
        <ChecklistEditor checklist={checklist} onSave={onSaveChecklist} />
      )}
    </div>
  )
}

/** checklist.yaml se edita como texto YAML crudo (el servidor valida que parsee). */
function ChecklistEditor({
  checklist,
  onSave,
}: {
  checklist: string
  onSave: (content: string) => Promise<unknown>
}) {
  const [draft, setDraft] = useState(checklist)
  const save = useSaveField()

  useEffect(() => {
    setDraft(checklist)
  }, [checklist])

  const dirty = draft !== checklist

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <h3 className="font-mono text-sm font-medium text-slate-700">checklist.yaml</h3>
        <div className="flex items-center gap-3">
          <SaveIndicator status={save.status} error={save.error} />
          {dirty && (
            <button
              type="button"
              onClick={() => save.run(() => onSave(draft))}
              disabled={save.status === 'saving'}
              className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Guardar
            </button>
          )}
        </div>
      </header>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        className="h-96 w-full resize-y bg-slate-50 px-5 py-4 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none"
      />
    </section>
  )
}
