import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createContext, HttpError, readJsonBody, sendError, sendJson } from './api/fs-helpers.ts'
import { parseRoadmap } from './api/roadmap.ts'
import {
  getProductDefinitions,
  getSessionBundle,
  listSessions,
  saveChecklist,
  saveDiagram,
  saveSessionField,
  saveText,
} from './api/sessions.ts'
import type { SaveSessionFieldPayload, SaveTextPayload } from '../shared/types.ts'

export interface DataApiPluginOptions {
  /** Raíz del repo de contenido (padre de dashboard/), donde viven sessions/ y ROADMAP.md. */
  repoRoot: string
}

/**
 * Plugin de dev que expone una pequeña API local bajo /api/* leyendo y escribiendo
 * los ficheros de sessions/. Solo se activa con `vite` en modo serve (apply: 'serve').
 */
export function dataApiPlugin(options: DataApiPluginOptions): Plugin {
  const ctx = createContext(options.repoRoot)

  return {
    name: 'roadmad-data-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req: IncomingMessage, res: ServerResponse) => {
        try {
          await route(req, res)
        } catch (err) {
          sendError(res, err)
        }
      })
    },
  }

  async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // req.url llega relativo al mount "/api" (ej. "/sessions/01"). Quitamos query.
    const url = (req.url ?? '/').split('?')[0]
    const method = req.method ?? 'GET'
    const segments = url.split('/').filter(Boolean) // ["sessions", "01", "session"]

    // GET /api/roadmap
    if (method === 'GET' && segments[0] === 'roadmap' && segments.length === 1) {
      return sendJson(res, 200, parseRoadmap(ctx))
    }

    // GET /api/product-definitions
    if (method === 'GET' && segments[0] === 'product-definitions' && segments.length === 1) {
      return sendJson(res, 200, getProductDefinitions(ctx))
    }

    if (segments[0] === 'sessions') {
      // GET /api/sessions
      if (method === 'GET' && segments.length === 1) {
        return sendJson(res, 200, listSessions(ctx))
      }

      const id = segments[1]
      if (!id) throw new HttpError(400, 'Falta el id de sesión')

      // GET /api/sessions/:id
      if (method === 'GET' && segments.length === 2) {
        return sendJson(res, 200, getSessionBundle(ctx, id))
      }

      if (method === 'PUT') {
        // PUT /api/sessions/:id/session
        if (segments[2] === 'session' && segments.length === 3) {
          const payload = await readJsonBody<SaveSessionFieldPayload>(req)
          saveSessionField(ctx, id, payload)
          return sendJson(res, 200, { ok: true })
        }
        // PUT /api/sessions/:id/checklist
        if (segments[2] === 'checklist' && segments.length === 3) {
          const payload = await readJsonBody<SaveTextPayload>(req)
          saveChecklist(ctx, id, payload)
          return sendJson(res, 200, { ok: true })
        }
        // PUT /api/sessions/:id/text/:file
        if (segments[2] === 'text' && segments.length === 4) {
          const payload = await readJsonBody<SaveTextPayload>(req)
          saveText(ctx, id, segments[3], payload)
          return sendJson(res, 200, { ok: true })
        }
        // PUT /api/sessions/:id/diagram/:filename
        if (segments[2] === 'diagram' && segments.length === 4) {
          const payload = await readJsonBody<SaveTextPayload>(req)
          saveDiagram(ctx, id, decodeURIComponent(segments[3]), payload)
          return sendJson(res, 200, { ok: true })
        }
      }
    }

    throw new HttpError(404, `Ruta no encontrada: ${method} /api${url}`)
  }
}
