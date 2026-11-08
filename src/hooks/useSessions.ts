import { api } from '../lib/api-client.ts'
import { useAsync } from './useAsync.ts'

/** Carga el roadmap (ROADMAP.md) y la lista de sesiones (estado por ficheros) juntos. */
export function useRoadmap() {
  return useAsync(
    () => Promise.all([api.getRoadmap(), api.listSessions()]).then(([roadmap, sessions]) => ({
      roadmap: roadmap.sessions,
      sessions: sessions.sessions,
    })),
    [],
  )
}

/** Carga el bundle completo de una sesión. */
export function useSession(id: string) {
  return useAsync(() => api.getSession(id), [id])
}

/** Carga las definiciones de producto derivadas de todas las sesiones. */
export function useProductDefinitions() {
  return useAsync(() => api.getProductDefinitions().then((r) => r.entries), [])
}
