import type {
  ApiError,
  ProductDefinitionsResponse,
  RoadmapResponse,
  SaveSessionFieldPayload,
  SaveTextPayload,
  SessionBundle,
  SessionsListResponse,
  SessionTextFile,
} from '../../shared/types.ts'

/** Error de API con el mensaje que devolvió el servidor y el status HTTP. */
export class ApiRequestError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : {}
  if (!res.ok) {
    const message = (data as ApiError)?.error ?? `Error ${res.status}`
    throw new ApiRequestError(res.status, message)
  }
  return data as T
}

export const api = {
  getRoadmap: () => request<RoadmapResponse>('/api/roadmap'),

  listSessions: () => request<SessionsListResponse>('/api/sessions'),

  getSession: (id: string) => request<SessionBundle>(`/api/sessions/${id}`),

  saveSessionField: (id: string, payload: SaveSessionFieldPayload) =>
    request<{ ok: true }>(`/api/sessions/${id}/session`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  saveChecklist: (id: string, payload: SaveTextPayload) =>
    request<{ ok: true }>(`/api/sessions/${id}/checklist`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  saveText: (id: string, file: SessionTextFile, payload: SaveTextPayload) =>
    request<{ ok: true }>(`/api/sessions/${id}/text/${file}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  saveDiagram: (id: string, filename: string, payload: SaveTextPayload) =>
    request<{ ok: true }>(`/api/sessions/${id}/diagram/${encodeURIComponent(filename)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getProductDefinitions: () => request<ProductDefinitionsResponse>('/api/product-definitions'),
}
