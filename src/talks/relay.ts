import type { PresentationState } from './types.ts'

/**
 * Cross-device sync through ntfy.sh, a public pub/sub service reachable from a static site
 * (GitHub Pages) over HTTPS/443. Every device publishes its absolute state to a topic derived
 * from a random room code and listens to the same topic with SSE.
 *
 * Convergence: ntfy delivers messages to every subscriber in the same server order, so each
 * device applies remote messages in that order. A device also applies the echo of its own
 * message when it is still its latest one, which settles races where two devices click at once.
 */
const RELAY_URL = 'https://ntfy.sh'
const ROOM_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const ROOM_LENGTH = 12

export type RelayStatus = 'connecting' | 'online' | 'offline'

export type RelayMessage = PresentationState & { from: string; seq: number }

export function createRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ROOM_LENGTH))
  return Array.from(bytes, (byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length]).join('')
}

export function normalizeRoomCode(raw: string | null | undefined): string | null {
  const code = (raw ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return code.length === ROOM_LENGTH ? code : null
}

export function formatRoomCode(room: string): string {
  return room.match(/.{1,4}/g)?.join('-') ?? room
}

function topicFor(talkId: string, room: string) {
  return `talk-${talkId}-${room}`
}

function isRelayMessage(value: unknown): value is RelayMessage {
  const candidate = value as Partial<RelayMessage> | null
  return !!candidate
    && Number.isFinite(candidate.slide)
    && Number.isFinite(candidate.step)
    && Number.isFinite(candidate.seq)
    && typeof candidate.from === 'string'
}

export async function publishState(talkId: string, room: string, message: RelayMessage): Promise<void> {
  const response = await fetch(`${RELAY_URL}/${topicFor(talkId, room)}`, { method: 'POST', body: JSON.stringify(message) })
  if (!response.ok) throw new Error(`Relay responded ${response.status}`)
}

/** Subscribes to the room; `since=latest` replays the current state as soon as a device joins. */
export function subscribeToRoom(
  talkId: string,
  room: string,
  onMessage: (message: RelayMessage) => void,
  onStatus: (status: RelayStatus) => void,
): () => void {
  onStatus('connecting')
  const events = new EventSource(`${RELAY_URL}/${topicFor(talkId, room)}/sse?since=latest`)
  events.onopen = () => onStatus('online')
  events.onerror = () => onStatus(events.readyState === EventSource.CLOSED ? 'offline' : 'connecting')
  events.onmessage = (event: MessageEvent<string>) => {
    try {
      const envelope = JSON.parse(event.data) as { event?: string; message?: string }
      if (envelope.event !== 'message' || !envelope.message) return
      const payload: unknown = JSON.parse(envelope.message)
      if (isRelayMessage(payload)) onMessage(payload)
    } catch {
      // Ignore malformed messages: anyone can publish to a public topic.
    }
  }
  return () => events.close()
}
