import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { formatRoomCode, type RelayStatus } from './relay.ts'

const statusLabel: Record<RelayStatus, string> = {
  online: 'Relé conectado',
  connecting: 'Conectando con el relé…',
  offline: 'Sin conexión con el relé',
}

export function RelayStatusBadge({ status }: { status: RelayStatus }) {
  return <span className={`relay-status is-${status}`}><i aria-hidden="true" />{statusLabel[status]}</span>
}

type Props = {
  talkId: string
  room: string
  status: RelayStatus
  projected?: boolean
  onNewRoom: () => void
  onClose: () => void
}

/** QR + room code that opens the speaker view on the phone, joined to this room. */
export function RemotePairing({ talkId, room, status, projected = false, onNewRoom, onClose }: Props) {
  const url = `${window.location.origin}${import.meta.env.BASE_URL}talks/${talkId}/speaker?room=${room}`
  const [qr, setQr] = useState('')

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, { margin: 1, width: 560, errorCorrectionLevel: 'M', color: { dark: '#102a1b', light: '#fff8e8' } })
      .then((data) => { if (!cancelled) setQr(data) })
      .catch(() => setQr(''))
    return () => { cancelled = true }
  }, [url])

  return (
    <div className="pairing-overlay" onClick={onClose}>
      <div className="pairing-panel" onClick={(event) => event.stopPropagation()}>
        <button className="close-help" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="pairing-qr">{qr ? <img src={qr} alt="Código QR para abrir la vista del ponente en el móvil" /> : <span>Generando QR…</span>}</div>
        <div className="pairing-copy">
          <span className="index-kicker">Control remoto</span>
          <h2>Escanea con el móvil para pasar diapositivas.</h2>
          <p className="pairing-code">{formatRoomCode(room)}</p>
          <RelayStatusBadge status={status} />
          <p className="pairing-url">{url}</p>
          {projected && <p className="pairing-warning">Si estás duplicando pantalla, la sala ve este código y cualquiera podría pasar tus diapositivas. Ábrelo desde la vista del ponente.</p>}
          <p className="pairing-note">La sincronización viaja por ntfy.sh y necesita internet en ambos dispositivos. «Nueva sala» desconecta a los móviles emparejados.</p>
          <button className="pairing-new" onClick={onNewRoom}>Nueva sala</button>
        </div>
      </div>
    </div>
  )
}
