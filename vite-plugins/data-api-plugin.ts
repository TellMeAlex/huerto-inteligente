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
  const talkClients = new Map<string, Set<ServerResponse>>()
  const talkStates = new Map<string, { slide: number; step: number }>()

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

    // Canal local para sincronizar proyector y vista de ponente, incluso entre
    // navegadores distintos conectados al mismo servidor de desarrollo.
    if (segments[0] === 'talk-sync' && segments[1]) {
      const talkId = segments[1]
      if (method === 'GET' && segments[2] === 'events') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        })
        res.write(': connected\n\n')
        const clients = talkClients.get(talkId) ?? new Set<ServerResponse>()
        clients.add(res)
        talkClients.set(talkId, clients)
        const current = talkStates.get(talkId)
        if (current) res.write(`data: ${JSON.stringify(current)}\n\n`)
        await new Promise<void>((resolve) => req.on('close', () => {
          clients.delete(res)
          resolve()
        }))
        return
      }

      if (method === 'POST' && segments.length === 2) {
        const state = await readJsonBody<{ slide: number; step: number }>(req)
        if (!Number.isFinite(state.slide) || !Number.isFinite(state.step)) {
          throw new HttpError(400, 'Estado de presentación no válido')
        }
        talkStates.set(talkId, state)
        const message = `data: ${JSON.stringify(state)}\n\n`
        for (const client of talkClients.get(talkId) ?? []) client.write(message)
        return sendJson(res, 200, { ok: true })
      }
    }

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
