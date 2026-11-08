import { useCallback, useEffect, useRef, useState } from 'react'
import { presentationChannel, presentationStorageKey, readPresentationState, writePresentationState } from './sync.ts'
import type { PresentationState, Talk } from './types.ts'

function clampState(talk: Talk, state: PresentationState): PresentationState {
  const slide = Math.min(Math.max(0, state.slide), talk.slides.length - 1)
  const fragments = talk.slides[slide]?.fragments ?? 0
  return { slide, step: Math.min(Math.max(0, state.step), fragments) }
}

export function usePresentation(talk: Talk) {
  const [state, setLocalState] = useState<PresentationState>(() => clampState(talk, readPresentationState(talk.id)))
  const channelRef = useRef<BroadcastChannel | null>(null)

  const update = useCallback((next: PresentationState) => {
    const safe = clampState(talk, next)
    setLocalState(safe)
    writePresentationState(talk.id, safe)
    channelRef.current?.postMessage(safe)
    void fetch(`/api/talk-sync/${talk.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safe),
    }).catch(() => undefined)
  }, [talk])

  useEffect(() => {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(presentationChannel(talk.id))
      channelRef.current = channel
      channel.onmessage = (event: MessageEvent<PresentationState>) => {
        setLocalState(clampState(talk, event.data))
      }
      return () => {
        channel.close()
        channelRef.current = null
      }
    }
  }, [talk])

  useEffect(() => {
    const events = new EventSource(`/api/talk-sync/${talk.id}/events`)
    events.onmessage = (event) => {
      try {
        const safe = clampState(talk, JSON.parse(event.data) as PresentationState)
        setLocalState(safe)
        writePresentationState(talk.id, safe)
      } catch {
        // Ignoramos un mensaje incompleto y conservamos el último estado válido.
      }
    }
    return () => events.close()
  }, [talk])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === presentationStorageKey(talk.id)) {
        setLocalState(clampState(talk, readPresentationState(talk.id)))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [talk])

  const next = useCallback(() => {
    const currentSlide = talk.slides[state.slide]
    const lastStep = currentSlide?.fragments ?? 0
    if (state.step < lastStep) update({ ...state, step: state.step + 1 })
    else if (state.slide < talk.slides.length - 1) update({ slide: state.slide + 1, step: 0 })
  }, [state, talk, update])

  const previous = useCallback(() => {
    if (state.step > 0) update({ ...state, step: state.step - 1 })
    else if (state.slide > 0) {
      const previousSlide = talk.slides[state.slide - 1]
      update({ slide: state.slide - 1, step: previousSlide.fragments ?? 0 })
    }
  }, [state, talk, update])

  const goTo = useCallback((slide: number) => update({ slide, step: 0 }), [update])

  return { state, next, previous, goTo, update }
}
