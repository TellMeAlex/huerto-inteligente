import { useMemo } from 'react'
import type { SessionBundle, SessionTextFile } from '../../../shared/types.ts'
import { api } from '../../lib/api-client.ts'
import { Tabs, type TabDef } from '../shared/Tabs.tsx'
import { AgendaEditor } from '../shared/AgendaEditor.tsx'
import { ToolsEditor } from '../shared/ToolsEditor.tsx'
import { MarkdownDocEditor } from '../shared/MarkdownDocEditor.tsx'
import { OverviewTab } from './tabs/OverviewTab.tsx'
import { ProductTab } from './tabs/ProductTab.tsx'
import { DocumentsTab } from './tabs/DocumentsTab.tsx'
import { DiagramsTab } from './tabs/DiagramsTab.tsx'
import { ReadinessTab } from './tabs/ReadinessTab.tsx'
import type { SaveField } from './save-field.ts'

interface SessionDetailContentProps {
  bundle: SessionBundle
  /** Recarga el bundle tras un guardado, para mantener la UI consistente. */
  reload: () => void
}

export function SessionDetailContent({ bundle, reload }: SessionDetailContentProps) {
  const { id, session } = bundle

  // Guardados: tras cada escritura recargamos el bundle para reflejar el estado real.
  const save: SaveField = useMemo(
    () => (path, value) => api.saveSessionField(id, { path, value }).then((r) => {
      reload()
      return r
    }),
    [id, reload],
  )

  const saveText = (file: SessionTextFile, content: string) =>
    api.saveText(id, file, { content }).then((r) => {
      reload()
      return r
    })
  const saveDiagram = (filename: string, content: string) =>
    api.saveDiagram(id, filename, { content }).then((r) => {
      reload()
      return r
    })
  const saveChecklist = (content: string) =>
    api.saveChecklist(id, { content }).then((r) => {
      reload()
      return r
    })

  // Borrador: sin session.yaml, solo mostramos notes.md.
  if (!session) {
    return (
      <div className="flex flex-col gap-5">
        <DraftBanner />
        {bundle.texts.notes !== undefined && (
          <MarkdownDocEditor
            title="notes.md"
            content={bundle.texts.notes}
            onSave={(content) => saveText('notes', content)}
          />
        )}
      </div>
    )
  }

  // Sesión completa: pestañas condicionales según lo presente en el bundle.
  const tabs: TabDef[] = []

  tabs.push({
    key: 'overview',
    label: 'Resumen',
    render: () => <OverviewTab session={session} save={save} />,
  })

  if (session.agenda && session.agenda.length > 0) {
    tabs.push({
      key: 'agenda',
      label: 'Agenda',
      count: session.agenda.length,
      render: () => (
        <AgendaEditor
          agenda={session.agenda!}
          durationMinutes={session.duration_minutes}
          onSave={(agenda) => save(['agenda'], agenda)}
        />
      ),
    })
  }

  if (session.tools && session.tools.length > 0) {
    tabs.push({
      key: 'tools',
      label: 'Herramientas',
      count: session.tools.length,
      render: () => (
        <ToolsEditor tools={session.tools!} onSave={(tools) => save(['tools'], tools)} />
      ),
    })
  }

  if (session.product || session.product_case) {
    tabs.push({
      key: 'product',
      label: 'Producto',
      render: () => <ProductTab session={session} save={save} />,
    })
  }

  const textCount = Object.keys(bundle.texts).length
  if (textCount > 0) {
    tabs.push({
      key: 'documents',
      label: 'Documentos',
      count: textCount,
      render: () => <DocumentsTab texts={bundle.texts} onSaveText={saveText} />,
    })
  }

  if (bundle.diagrams.length > 0) {
    tabs.push({
      key: 'diagrams',
      label: 'Diagramas',
      count: bundle.diagrams.length,
      render: () => <DiagramsTab diagrams={bundle.diagrams} onSaveDiagram={saveDiagram} />,
    })
  }

  if (session.preparation_resources || session.readiness_review || bundle.checklist) {
    tabs.push({
      key: 'readiness',
      label: 'Preparación',
      render: () => (
        <ReadinessTab
          session={session}
          checklist={bundle.checklist}
          save={save}
          onSaveChecklist={saveChecklist}
        />
      ),
    })
  }

  return <Tabs tabs={tabs} />
}

function DraftBanner() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <p className="font-semibold">Sesión en borrador</p>
      <p className="mt-1 text-amber-700">
        Esta sesión solo tiene <code className="font-mono">notes.md</code>. El resto del paquete
        (ficha, agenda, checklist, diagramas) aún está pendiente de preparar.
      </p>
    </div>
  )
}
