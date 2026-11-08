import type { SessionData } from '../../../../shared/types.ts'
import { EditableField } from '../../shared/EditableField.tsx'
import { EditableList } from '../../shared/EditableList.tsx'
import type { SaveField } from '../save-field.ts'

/**
 * Pestaña de producto. Renderiza el formato de S1 (`product`) o el de S2/S3
 * (`product_case` + acceptance_criteria + sdd + contingency), montando solo lo presente.
 */
export function ProductTab({ session, save }: { session: SessionData; save: SaveField }) {
  return (
    <div className="flex flex-col gap-6">
      {session.product && <ProductBlock session={session} save={save} />}
      {session.product_case && <ProductCaseBlock session={session} save={save} />}
    </div>
  )
}

function ProductBlock({ session, save }: { session: SessionData; save: SaveField }) {
  const p = session.product!
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <SectionTitle badge="product" text="Definición de producto (formato sesión 1)" />
      <div className="flex flex-col gap-5">
        <EditableField label="Nombre" value={p.name} onSave={(v) => save(['product', 'name'], v)} />
        <EditableField
          label="Problema"
          multiline
          value={p.problem}
          onSave={(v) => save(['product', 'problem'], v)}
        />
        {p.initial_scope && (
          <EditableList
            label="Alcance inicial"
            items={p.initial_scope}
            onSave={(items) => save(['product', 'initial_scope'], items)}
          />
        )}
        {p.non_goals_for_session_01 && (
          <EditableList
            label="Fuera de alcance"
            items={p.non_goals_for_session_01}
            onSave={(items) => save(['product', 'non_goals_for_session_01'], items)}
          />
        )}
        {p.evolution && (
          <EditableList
            label="Evolución"
            items={p.evolution}
            onSave={(items) => save(['product', 'evolution'], items)}
          />
        )}
      </div>
    </section>
  )
}

function ProductCaseBlock({ session, save }: { session: SessionData; save: SaveField }) {
  const pc = session.product_case!
  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle badge="product_case" text="Caso de producto (formato sesiones 2-3)" />
        <div className="flex flex-col gap-5">
          <EditableField
            label="Enunciado"
            multiline
            value={pc.statement}
            onSave={(v) => save(['product_case', 'statement'], v)}
          />
          {pc.pivot_note !== undefined && (
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
                ⟳ Nota de pivote
              </p>
              <EditableField
                label=""
                multiline
                value={pc.pivot_note}
                onSave={(v) => save(['product_case', 'pivot_note'], v)}
              />
            </div>
          )}
          {pc.in_scope && (
            <EditableList
              label="Alcance"
              items={pc.in_scope}
              onSave={(items) => save(['product_case', 'in_scope'], items)}
            />
          )}
          {pc.out_of_scope && (
            <EditableList
              label="Fuera de alcance"
              items={pc.out_of_scope}
              onSave={(items) => save(['product_case', 'out_of_scope'], items)}
            />
          )}
        </div>
      </section>

      {session.acceptance_criteria && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Criterios de aceptación</h3>
          <EditableList
            label="Criterios"
            items={session.acceptance_criteria}
            onSave={(items) => save(['acceptance_criteria'], items)}
          />
        </section>
      )}

      {session.contingency && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Contingencia</h3>
          <div className="flex flex-col gap-5">
            {session.contingency.trigger_conditions && (
              <EditableList
                label="Condiciones de activación"
                items={session.contingency.trigger_conditions}
                onSave={(items) => save(['contingency', 'trigger_conditions'], items)}
              />
            )}
            {session.contingency.fallback !== undefined && (
              <EditableField
                label="Plan B"
                multiline
                value={session.contingency.fallback}
                onSave={(v) => save(['contingency', 'fallback'], v)}
              />
            )}
          </div>
        </section>
      )}
    </>
  )
}

function SectionTitle({ badge, text }: { badge: string; text: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs text-white">
        {badge}
      </span>
      <h3 className="text-sm font-semibold text-slate-900">{text}</h3>
    </div>
  )
}
