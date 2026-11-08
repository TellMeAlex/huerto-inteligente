import type { DiagramFile } from '../../../../shared/types.ts'
import { MermaidDiagram } from '../../shared/MermaidDiagram.tsx'

interface DiagramsTabProps {
  diagrams: DiagramFile[]
  onSaveDiagram: (filename: string, content: string) => Promise<unknown>
}

export function DiagramsTab({ diagrams, onSaveDiagram }: DiagramsTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {diagrams.map((diagram) => (
        <MermaidDiagram
          key={diagram.filename}
          filename={diagram.filename}
          content={diagram.content}
          onSave={(content) => onSaveDiagram(diagram.filename, content)}
        />
      ))}
    </div>
  )
}
