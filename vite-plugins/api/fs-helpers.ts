import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Contexto compartido por todos los handlers: la raíz del repo de contenido.
 * Desde aquí colgamos sessions/ y ROADMAP.md.
 */
export interface ApiContext {
  repoRoot: string
  sessionsDir: string
}

export function createContext(repoRoot: string): ApiContext {
  return { repoRoot, sessionsDir: path.join(repoRoot, 'sessions') }
}

/** Error con status HTTP asociado, para que el router responda el código correcto. */
export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Lista los slugs reales de carpetas dentro de sessions/ (ej. "01-entorno-trabajo"). */
export function listSessionFolders(ctx: ApiContext): string[] {
  if (!fs.existsSync(ctx.sessionsDir)) return []
  return fs
    .readdirSync(ctx.sessionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

/** El id de una sesión es el prefijo numérico del slug de carpeta ("01" ← "01-entorno-trabajo"). */
export function folderToId(folder: string): string {
  const match = folder.match(/^(\d+)/)
  return match ? match[1] : folder
}

/**
 * Resuelve la carpeta real de una sesión a partir de su id, validando contra las
 * carpetas existentes en disco. Evita cualquier path traversal: si el id no mapea
 * a una carpeta real, lanza 404 en lugar de construir una ruta arbitraria.
 */
export function resolveSessionDir(ctx: ApiContext, id: string): { folder: string; dir: string } {
  const folder = listSessionFolders(ctx).find((f) => folderToId(f) === id)
  if (!folder) throw new HttpError(404, `Sesión no encontrada: ${id}`)
  return { folder, dir: path.join(ctx.sessionsDir, folder) }
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
}

export function readTextFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8')
}

/** Escritura atómica: escribe a un temporal y renombra, para no dejar el fichero a medias. */
export function writeTextFileAtomic(filePath: string, content: string): void {
  const tmpPath = `${filePath}.tmp-${process.pid}`
  fs.writeFileSync(tmpPath, content, 'utf8')
  fs.renameSync(tmpPath, filePath)
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(payload)
}

export function sendError(res: ServerResponse, err: unknown): void {
  if (err instanceof HttpError) {
    sendJson(res, err.status, { error: err.message })
    return
  }
  const message = err instanceof Error ? err.message : 'Error interno'
  sendJson(res, 500, { error: message })
}

/** Lee y parsea el body JSON de una petición Connect (sin body-parser). */
export async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw.trim()) return {} as T
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new HttpError(400, 'El cuerpo de la petición no es JSON válido')
  }
}
