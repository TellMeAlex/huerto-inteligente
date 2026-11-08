import path from 'node:path'
import type { RoadmapEntry, RoadmapResponse } from '../../shared/types.ts'
import { fileExists, readTextFile, type ApiContext } from './fs-helpers.ts'

/** Extrae el texto de un enlace markdown `[texto](url)` o devuelve la celda tal cual. */
function stripLink(cell: string): string {
  const match = cell.match(/\[([^\]]*)\]\([^)]*\)/)
  return (match ? match[1] : cell).trim()
}

/** Saca la carpeta de una celda tipo [`sessions/01-.../`](sessions/01-.../notes.md). */
function extractFolder(cell: string): string {
  const url = cell.match(/\]\(([^)]*)\)/)?.[1] ?? cell
  const cleaned = url.replace(/`/g, '').trim()
  // Nos quedamos con "sessions/01-entorno-trabajo" aunque el enlace apunte a un fichero.
  const dirMatch = cleaned.match(/sessions\/[^/)]+/)
  return dirMatch ? dirMatch[0] : cleaned
}

/**
 * Parsea la tabla de sesiones de ROADMAP.md. La tabla tiene columnas
 * `| # | Título | Pregunta que responde | Carpeta |`.
 */
export function parseRoadmap(ctx: ApiContext): RoadmapResponse {
  const roadmapPath = path.join(ctx.repoRoot, 'ROADMAP.md')
  if (!fileExists(roadmapPath)) return { sessions: [] }

  const lines = readTextFile(roadmapPath).split('\n')
  const entries: RoadmapEntry[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|')) continue

    const cells = trimmed
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())
    if (cells.length < 4) continue

    const idRaw = cells[0]
    // Saltar cabecera (`#`) y separador (`---`); solo filas cuya 1ª celda es numérica.
    if (!/^\d+$/.test(idRaw)) continue

    entries.push({
      id: idRaw.padStart(2, '0'),
      title: stripLink(cells[1]),
      question: cells[2],
      folder: extractFolder(cells[3]),
    })
  }

  return { sessions: entries }
}
