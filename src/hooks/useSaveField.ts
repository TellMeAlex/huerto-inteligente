import { useCallback, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface SaveController {
  status: SaveStatus
  error: string | undefined
  /** Ejecuta la promesa de guardado y gestiona el estado visual. Devuelve true si fue ok. */
  run: (save: () => Promise<unknown>) => Promise<boolean>
  reset: () => void
}

/**
 * Centraliza el patrón guardar → feedback (saving/saved/error). El "saved" se
 * autolimpia a los 2s para no dejar el check permanente.
 */
export function useSaveField(): SaveController {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | undefined>(undefined)

  const run = useCallback(async (save: () => Promise<unknown>): Promise<boolean> => {
    setStatus('saving')
    setError(undefined)
    try {
      await save()
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
      return true
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : String(err))
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(undefined)
  }, [])

  return { status, error, run, reset }
}
