// Tipos compartidos entre el lado React (src/) y el lado Node del plugin de Vite
// (vite-plugins/api/). El schema de session.yaml diverge por sesión, así que casi
// todo es opcional: la UI monta cada bloque solo si la API lo devuelve presente.

export interface RoadmapEntry {
  id: string
  title: string
  question: string
  folder: string
}

export interface RoadmapResponse {
  sessions: RoadmapEntry[]
}

export type SessionStatus = 'complete' | 'draft'

/** Un fichero de texto largo que la sesión puede tener (además de notes.md). */
export type SessionTextFile =
  | 'notes'
  | 'script'
  | 'links'
  | 'plan-template'
  | 'tool-selection-matrix'
  | 'validation-schema'

export interface SessionSummary {
  id: string
  slug: string
  title: string
  status: SessionStatus
  owner?: string
  durationMinutes?: number
  filesPresent: string[]
}

export interface SessionsListResponse {
  sessions: SessionSummary[]
}

// --- session.yaml (bloque `session:`) ---

export interface AgendaBlock {
  start_minute: number
  end_minute: number
  duration_minutes: number
  topic: string
}

export interface SessionTool {
  name: string
  aliases?: string[]
  role: string
  evidence?: string
}

export interface SessionAudience {
  description: string
  prior_knowledge?: string[]
}

export interface SessionObjective {
  statement: string
  observable_outcomes?: string[]
}

export interface SessionReadinessReview {
  owner: string
  criteria: string[]
}

/** Definición de producto en formato sesión 1. */
export interface SessionProduct {
  name: string
  problem: string
  initial_scope?: string[]
  non_goals_for_session_01?: string[]
  evolution?: string[]
}

/** Definición de producto en formato sesiones 2-3. */
export interface SessionProductCase {
  statement: string
  pivot_note?: string
  in_scope?: string[]
  out_of_scope?: string[]
}

export interface SessionSdd {
  ecosystem?: string
  entry_point?: string
  state_owner?: string
  state_artifacts?: string[]
  demonstration_boundary?: string
  tracks?: string
  gate_recommendations?: string[]
  code_agent?: Record<string, unknown>
}

export interface SessionContingency {
  trigger_conditions?: string[]
  fallback?: string
}

/** El objeto bajo la clave raíz `session:` de session.yaml. */
export interface SessionData {
  id: string
  slug: string
  title: string
  owner: string
  duration_minutes: number
  format?: string
  audience?: SessionAudience
  objective?: SessionObjective
  tools?: SessionTool[]
  agenda?: AgendaBlock[]
  preparation_resources?: string[]
  readiness_review?: SessionReadinessReview
  product?: SessionProduct
  product_case?: SessionProductCase
  acceptance_criteria?: string[]
  sdd?: SessionSdd
  contingency?: SessionContingency
  // Cualquier otra clave que el YAML tenga y no modelemos explícitamente.
  [key: string]: unknown
}

export interface DiagramFile {
  filename: string
  content: string
}

/** Bundle que devuelve GET /api/sessions/:id. */
export interface SessionBundle {
  id: string
  slug: string
  status: SessionStatus
  session?: SessionData
  /** checklist.yaml como texto crudo (se edita como texto, no como formulario). */
  checklist?: string
  texts: Partial<Record<SessionTextFile, string>>
  diagrams: DiagramFile[]
}

// --- Escrituras ---

export interface SaveSessionFieldPayload {
  path: (string | number)[]
  value: unknown
}

export interface SaveTextPayload {
  content: string
}

export interface ApiError {
  error: string
}

// --- Definiciones de producto ---

export interface ProductDefinitionEntry {
  sessionId: string
  sessionTitle: string
  kind: 'product' | 'product_case'
  /** Enunciado legible: `problem` (+ name) en S1, `statement` en S2/S3. */
  statement: string
  productName?: string
  scope: string[]
  outOfScope: string[]
  acceptanceCriteria: string[]
  pivotNote?: string
}

export interface ProductDefinitionsResponse {
  entries: ProductDefinitionEntry[]
}
