import type { SaveStatus } from '../../hooks/useSaveField.ts'

/** Indicador visual compacto del estado de guardado, junto a un campo o editor. */
export function SaveIndicator({ status, error }: { status: SaveStatus; error?: string }) {
  if (status === 'saving') return <span className="text-xs text-slate-400">Guardando…</span>
  if (status === 'saved') return <span className="text-xs text-emerald-600">✓ Guardado</span>
  if (status === 'error')
    return <span className="text-xs text-red-600" title={error}>✕ {error ?? 'Error'}</span>
  return null
}
