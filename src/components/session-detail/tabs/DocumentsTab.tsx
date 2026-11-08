import type { SessionBundle, SessionTextFile } from '../../../../shared/types.ts'
import { MarkdownDocEditor } from '../../shared/MarkdownDocEditor.tsx'

const FILE_LABELS: Record<SessionTextFile, string> = {
  notes: 'notes.md',
  script: 'script.md',
  links: 'links.md',
  'plan-template': 'plan-template.md',
  'tool-selection-matrix': 'tool-selection-matrix.md',
  'validation-schema': 'validation-schema.md',
}

const ORDER: SessionTextFile[] = [
  'notes',
  'script',
  'links',
  'tool-selection-matrix',
  'plan-template',
  'validation-schema',
]

interface DocumentsTabProps {
  texts: SessionBundle['texts']
  onSaveText: (file: SessionTextFile, content: string) => Promise<unknown>
}

export function DocumentsTab({ texts, onSaveText }: DocumentsTabProps) {
  const present = ORDER.filter((file) => texts[file] !== undefined)
  return (
    <div className="flex flex-col gap-5">
      {present.map((file) => (
        <MarkdownDocEditor
          key={file}
          title={FILE_LABELS[file]}
          content={texts[file]!}
          onSave={(content) => onSaveText(file, content)}
        />
      ))}
    </div>
  )
}
