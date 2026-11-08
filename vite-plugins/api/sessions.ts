import path from 'node:path'
import type {
  DiagramFile,
  ProductDefinitionEntry,
  ProductDefinitionsResponse,
  SaveSessionFieldPayload,
  SaveTextPayload,
  SessionBundle,
  SessionData,
  SessionsListResponse,
  SessionSummary,
  SessionTextFile,
} from '../../shared/types.ts'
import {
  fileExists,
  folderToId,
  HttpError,
  listSessionFolders,
  readTextFile,
  resolveSessionDir,
  writeTextFileAtomic,
  type ApiContext,
} from './fs-helpers.ts'
import { assertParseableYaml, readYamlAsPlain, writeYamlDocField } from './yaml-io.ts'
import { validateSessionField } from './validators.ts'
import fs from 'node:fs'

/** Mapa fichero-de-texto -> nombre de archivo en disco. */
const TEXT_FILES: Record<SessionTextFile, string> = {
  notes: 'notes.md',
  script: 'script.md',
  links: 'links.md',
  'plan-template': 'plan-template.md',
  'tool-selection-matrix': 'tool-selection-matrix.md',
  'validation-schema': 'validation-schema.md',
}

function readSessionData(dir: string): SessionData | undefined {
  const sessionPath = path.join(dir, 'session.yaml')
  if (!fileExists(sessionPath)) return undefined
  const parsed = readYamlAsPlain<{ session?: SessionData }>(sessionPath)
  return parsed?.session
}

// --- GET /api/sessions ---

export function listSessions(ctx: ApiContext): SessionsListResponse {
  const folders = listSessionFolders(ctx)
  const sessions: SessionSummary[] = folders.map((folder) => {
    const dir = path.join(ctx.sessionsDir, folder)
    const filesPresent = fs.readdirSync(dir).filter((f) => fileExists(path.join(dir, f)))
    const session = readSessionData(dir)
    const status = session ? 'complete' : 'draft'
    return {
      id: folderToId(folder),
      slug: folder.replace(/^\d+-/, ''),
      title: session?.title ?? titleFromFolder(folder),
      status,
      owner: session?.owner,
      durationMinutes: session?.duration_minutes,
      filesPresent,
    }
  })
  return { sessions }
}

function titleFromFolder(folder: string): string {
  // Fallback legible para sesiones borrador sin session.yaml.
  return folder
    .replace(/^\d+-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// --- GET /api/sessions/:id ---

export function getSessionBundle(ctx: ApiContext, id: string): SessionBundle {
  const { folder, dir } = resolveSessionDir(ctx, id)
  const session = readSessionData(dir)

  const texts: Partial<Record<SessionTextFile, string>> = {}
  for (const [key, filename] of Object.entries(TEXT_FILES) as [SessionTextFile, string][]) {
    const filePath = path.join(dir, filename)
    if (fileExists(filePath)) texts[key] = readTextFile(filePath)
  }

  const checklistPath = path.join(dir, 'checklist.yaml')
  const checklist = fileExists(checklistPath) ? readTextFile(checklistPath) : undefined

  const diagrams: DiagramFile[] = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mmd'))
    .sort()
    .map((filename) => ({ filename, content: readTextFile(path.join(dir, filename)) }))

  return {
    id: folderToId(folder),
    slug: folder.replace(/^\d+-/, ''),
    status: session ? 'complete' : 'draft',
    session,
    checklist,
    texts,
    diagrams,
  }
}

// --- PUT /api/sessions/:id/session ---

export function saveSessionField(ctx: ApiContext, id: string, payload: SaveSessionFieldPayload): void {
  const { dir } = resolveSessionDir(ctx, id)
  const sessionPath = path.join(dir, 'session.yaml')
  if (!fileExists(sessionPath)) {
    throw new HttpError(404, 'Esta sesión no tiene session.yaml (es un borrador)')
  }
  if (!Array.isArray(payload.path) || payload.path.length === 0) {
    throw new HttpError(400, 'Falta la ruta del campo a modificar')
  }

  // El fichero anida todo bajo `session:`; el path del cliente es relativo a ese objeto.
  const fullPath = ['session', ...payload.path]

  writeYamlDocField(sessionPath, fullPath, payload.value, (projected) => {
    const projectedSession = (projected.session ?? {}) as SessionData
    validateSessionField(payload.path, payload.value, projectedSession)
  })
}

// --- PUT /api/sessions/:id/checklist ---

export function saveChecklist(ctx: ApiContext, id: string, payload: SaveTextPayload): void {
  const { dir } = resolveSessionDir(ctx, id)
  const checklistPath = path.join(dir, 'checklist.yaml')
  if (!fileExists(checklistPath)) {
    throw new HttpError(404, 'Esta sesión no tiene checklist.yaml')
  }
  assertParseableYaml(payload.content)
  writeTextFileAtomic(checklistPath, payload.content)
}

// --- PUT /api/sessions/:id/text/:file ---

export function saveText(
  ctx: ApiContext,
  id: string,
  file: string,
  payload: SaveTextPayload,
): void {
  if (!(file in TEXT_FILES)) {
    throw new HttpError(400, `Fichero de texto no soportado: ${file}`)
  }
  const { dir } = resolveSessionDir(ctx, id)
  const filePath = path.join(dir, TEXT_FILES[file as SessionTextFile])
  // No creamos ficheros nuevos desde la UI: solo se edita lo que ya existe.
  if (!fileExists(filePath)) {
    throw new HttpError(404, `La sesión no tiene el fichero ${TEXT_FILES[file as SessionTextFile]}`)
  }
  writeTextFileAtomic(filePath, payload.content)
}

// --- PUT /api/sessions/:id/diagram/:filename ---

export function saveDiagram(
  ctx: ApiContext,
  id: string,
  filename: string,
  payload: SaveTextPayload,
): void {
  // Solo .mmd y sin separadores de ruta: evita traversal por el nombre de fichero.
  if (!filename.endsWith('.mmd') || filename.includes('/') || filename.includes('\\')) {
    throw new HttpError(400, `Nombre de diagrama no válido: ${filename}`)
  }
  const { dir } = resolveSessionDir(ctx, id)
  const filePath = path.join(dir, filename)
  if (!fileExists(filePath)) {
    throw new HttpError(404, `La sesión no tiene el diagrama ${filename}`)
  }
  writeTextFileAtomic(filePath, payload.content)
}

// --- GET /api/product-definitions ---

export function getProductDefinitions(ctx: ApiContext): ProductDefinitionsResponse {
  const entries: ProductDefinitionEntry[] = []

  for (const folder of listSessionFolders(ctx)) {
    const dir = path.join(ctx.sessionsDir, folder)
    const session = readSessionData(dir)
    if (!session) continue

    if (session.product) {
      const p = session.product
      entries.push({
        sessionId: folderToId(folder),
        sessionTitle: session.title,
        kind: 'product',
        statement: p.problem,
        productName: p.name,
        scope: p.initial_scope ?? [],
        outOfScope: p.non_goals_for_session_01 ?? [],
        acceptanceCriteria: [],
      })
    } else if (session.product_case) {
      const pc = session.product_case
      entries.push({
        sessionId: folderToId(folder),
        sessionTitle: session.title,
        kind: 'product_case',
        statement: pc.statement,
        scope: pc.in_scope ?? [],
        outOfScope: pc.out_of_scope ?? [],
        acceptanceCriteria: session.acceptance_criteria ?? [],
        pivotNote: pc.pivot_note,
      })
    }
  }

  entries.sort((a, b) => a.sessionId.localeCompare(b.sessionId))
  return { entries }
}
