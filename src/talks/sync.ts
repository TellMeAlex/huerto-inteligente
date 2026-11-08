import type { PresentationState } from './types.ts'

const defaultState: PresentationState = { slide: 0, step: 0 }

function storageKey(talkId: string) {
  return `roadmad-talk:${talkId}:state`
}

export function readPresentationState(talkId: string): PresentationState {
  try {
    const raw = localStorage.getItem(storageKey(talkId))
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<PresentationState>
    return {
      slide: Number.isFinite(parsed.slide) ? Math.max(0, parsed.slide ?? 0) : 0,
      step: Number.isFinite(parsed.step) ? Math.max(0, parsed.step ?? 0) : 0,
    }
  } catch {
    return defaultState
  }
}

export function writePresentationState(talkId: string, state: PresentationState) {
  localStorage.setItem(storageKey(talkId), JSON.stringify(state))
}

export function presentationChannel(talkId: string) {
  return `roadmad-talk:${talkId}`
}

export function presentationStorageKey(talkId: string) {
  return storageKey(talkId)
}
