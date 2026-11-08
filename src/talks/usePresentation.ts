import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoomCode, normalizeRoomCode, publishState, subscribeToRoom, type RelayStatus } from './relay.ts'
import { presentationChannel, presentationStorageKey, readPresentationState, writePresentationState } from './sync.ts'
import type { PresentationState, Talk } from './types.ts'

function clampState(talk: Talk, state: PresentationState): PresentationState {
  const slide = Math.min(Math.max(0, state.slide), talk.slides.length - 1)
  const fragments = talk.slides[slide]?.fragments ?? 0
  return { slide, step: Math.min(Math.max(0, state.step), fragments) }
}

function roomStorageKey(talkId: string) {
  return `roadmad-talk:${talkId}:room`
}

function storeRoom(talkId: string, room: string) {
  try { localStorage.setItem(roomStorageKey(talkId), room) } catch { /* private mode: room lives in memory */ }
}

/** A `?room=` link (from the QR) wins; otherwise reuse the stored room or create one. */
function resolveRoom(talkId: string): string {
  const fromUrl = normalizeRoomCode(new URLSearchParams(window.location.search).get('room'))
  if (fromUrl) { storeRoom(talkId, fromUrl); return fromUrl }
  try {
    const stored = normalizeRoomCode(localStorage.getItem(roomStorageKey(talkId)))
    if (stored) return stored
  } catch { /* fall through */ }
  const fresh = createRoomCode()
  storeRoom(talkId, fresh)
  return fresh
}

export function usePresentation(talk: Talk) {
  const [state, setLocalState] = useState<PresentationState>(() => clampState(talk, readPresentationState(talk.id)))
  const [room, setRoom] = useState(() => resolveRoom(talk.id))
  const [relayStatus, setRelayStatus] = useState<RelayStatus>('connecting')
  const channelRef = useRef<BroadcastChannel | null>(null)
  const clientId = useRef(createRoomCode())
  const lastSentSeq = useRef(0)

  const applyState = useCallback((next: PresentationState) => {
    const safe = clampState(talk, next)
    setLocalState(safe)
    writePresentationState(talk.id, safe)
  }, [talk])

  const update = useCallback((next: PresentationState) => {
    const safe = clampState(talk, next)
    applyState(safe)
    channelRef.current?.postMessage(safe)
    const seq = ++lastSentSeq.current
    publishState(talk.id, room, { ...safe, from: clientId.current, seq })
      .then(() => setRelayStatus('online'))
      .catch(() => setRelayStatus('offline'))
  }, [talk, room, applyState])

  // Same browser (projector + speaker window on the laptop): instant, works offline.
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel(presentationChannel(talk.id))
    channelRef.current = channel
    channel.onmessage = (event: MessageEvent<PresentationState>) => applyState(event.data)
    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [talk, applyState])

  // Other devices (phone): ntfy relay in server order.
  useEffect(() => subscribeToRoom(talk.id, room, (message) => {
    const isOwnStaleEcho = message.from === clientId.current && message.seq !== lastSentSeq.current
    if (!isOwnStaleEcho) applyState(message)
  }, setRelayStatus), [talk, room, applyState])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === presentationStorageKey(talk.id)) setLocalState(clampState(talk, readPresentationState(talk.id)))
      if (event.key === roomStorageKey(talk.id)) {
        const next = normalizeRoomCode(event.newValue)
        if (next) setRoom(next)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [talk])

  const newRoom = useCallback(() => {
    const fresh = createRoomCode()
    storeRoom(talk.id, fresh)
    setRoom(fresh)
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

  return { state, next, previous, goTo, update, room, relayStatus, newRoom }
}
