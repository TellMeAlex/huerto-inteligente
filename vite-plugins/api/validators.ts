import { HttpError } from './fs-helpers.ts'
import type { AgendaBlock, SessionData } from '../../shared/types.ts'

/**
 * Guardarraíles ligeros al guardar un campo de session.yaml. NO sustituye a
 * validate_session.py; solo evita escribir datos claramente rotos.
 *
 * Recibe el objeto `session` YA con el cambio aplicado (proyección plana) para
 * poder validar invariantes globales como la suma de la agenda.
 */
export function validateSessionField(
  fieldPath: (string | number)[],
  value: unknown,
  projected: SessionData,
): void {
  const topKey = fieldPath[0]

  // 1. Campos obligatorios no vacíos.
  if (topKey === 'title' || topKey === 'owner') {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new HttpError(400, `El campo "${topKey}" no puede estar vacío`)
    }
  }
  if (topKey === 'duration_minutes') {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n) || n <= 0) {
      throw new HttpError(400, 'La duración debe ser un número mayor que 0')
    }
  }

  // 2. Coherencia de la agenda: la suma de duraciones debe cuadrar con duration_minutes.
  const touchesAgenda = topKey === 'agenda' || topKey === 'duration_minutes'
  if (touchesAgenda) {
    assertAgendaSum(projected)
  }
}

function assertAgendaSum(session: SessionData): void {
  const agenda = session.agenda
  if (!Array.isArray(agenda) || agenda.length === 0) return

  const sum = agenda.reduce((acc: number, block: AgendaBlock) => {
    const d = Number(block?.duration_minutes ?? 0)
    return acc + (Number.isFinite(d) ? d : 0)
  }, 0)

  const expected = Number(session.duration_minutes)
  if (Number.isFinite(expected) && sum !== expected) {
    throw new HttpError(
      400,
      `La agenda suma ${sum} min pero la sesión declara ${expected} min. ` +
        'Ajusta las duraciones para que cuadren antes de guardar.',
    )
  }
}
