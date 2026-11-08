import type { SessionData } from '../../../../shared/types.ts'
import { EditableField } from '../../shared/EditableField.tsx'
import { EditableList } from '../../shared/EditableList.tsx'
import type { SaveField } from '../save-field.ts'

export function OverviewTab({ session, save }: { session: SessionData; save: SaveField }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <EditableField label="Título" value={session.title} onSave={(v) => save(['title'], v)} />
        <EditableField label="Owner" value={session.owner} onSave={(v) => save(['owner'], v)} />
        <EditableField
          label="Duración (min)"
          type="number"
          value={session.duration_minutes}
          onSave={(v) => save(['duration_minutes'], v)}
        />
        {session.format !== undefined && (
          <EditableField
            label="Formato"
            multiline
            value={session.format}
            onSave={(v) => save(['format'], v)}
          />
        )}
      </div>

      {session.objective && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Objetivo</h3>
          <div className="flex flex-col gap-5">
            <EditableField
              label="Enunciado"
              multiline
              value={session.objective.statement}
              onSave={(v) => save(['objective', 'statement'], v)}
            />
            {session.objective.observable_outcomes && (
              <EditableList
                label="Resultados observables"
                items={session.objective.observable_outcomes}
                onSave={(items) => save(['objective', 'observable_outcomes'], items)}
              />
            )}
          </div>
        </section>
      )}

      {session.audience && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Audiencia</h3>
          <div className="flex flex-col gap-5">
            <EditableField
              label="Descripción"
              multiline
              value={session.audience.description}
              onSave={(v) => save(['audience', 'description'], v)}
            />
            {session.audience.prior_knowledge && (
              <EditableList
                label="Conocimiento previo"
                items={session.audience.prior_knowledge}
                onSave={(items) => save(['audience', 'prior_knowledge'], items)}
              />
            )}
          </div>
        </section>
      )}
    </div>
  )
}
