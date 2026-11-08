import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getTalk } from './talks.tsx'
import { usePresentation } from './usePresentation.ts'
import './talks.css'

export function PresentationPage() {
  const { id } = useParams()
  const talk = getTalk(id)
  if (!talk) return <Navigate to="/talks" replace />
  return <Presentation talk={talk} />
}

function Presentation({ talk }: { talk: NonNullable<ReturnType<typeof getTalk>> }) {
  const { state, next, previous } = usePresentation(talk)
  const [helpOpen, setHelpOpen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const hideTimer = useRef<number | undefined>(undefined)
  const slide = talk.slides[state.slide]

  const showControls = () => {
    setControlsVisible(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), 2200)
  }

  useEffect(() => {
    showControls()
    return () => window.clearTimeout(hideTimer.current)
  }, [])

  useEffect(() => {
    const assetVersions: Record<string, string> = {
      'ovejas-electricas': 'visual-sequence-v1',
      'huerto-inteligente': 'garden-arm-fix-v2',
      'this-is-fine': 'anatomy-fix',
    }
    const version = assetVersions[talk.id]
    if (!version) return
    for (const stage of [1, 2, 3, 4]) {
      const image = new Image()
      image.src = `/talk-assets/${talk.id}/stage-${stage}.png?v=${version}`
    }
  }, [talk.id])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); next() }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); previous() }
      if (event.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) void document.exitFullscreen()
        else void document.documentElement.requestFullscreen()
      }
      if (event.key.toLowerCase() === 's') window.open(`/talks/${talk.id}/speaker`, `${talk.id}-speaker`, 'popup,width=1400,height=900')
      if (event.key === '?' || event.key.toLowerCase() === 'h') setHelpOpen((value) => !value)
      if (event.key === 'Escape') setHelpOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [next, previous, talk.id])

  const progress = ((state.slide + (state.step ? 0.45 : 0)) / Math.max(1, talk.slides.length - 1)) * 100

  return (
    <main className={`presentation theme-${talk.theme} ${controlsVisible ? 'controls-visible' : ''}`} onMouseMove={showControls}>
      <div className="ambient" aria-hidden="true"><i/><i/><i/></div>
      <section className="slide-stage">
        <div className="slide-content">{slide.content(state.step)}</div>
        <div className="slide-meta"><span>{talk.number} / {talk.shortTitle}</span><span>{String(state.slide + 1).padStart(2, '0')}</span></div>
      </section>
      <div className="progress-track"><i style={{ width: `${progress}%` }}/></div>
      <nav className="presentation-controls" aria-label="Controles de presentación">
        <Link to="/talks" title="Volver a las charlas">⌂</Link>
        <button onClick={previous} aria-label="Anterior">←</button>
        <span>{state.slide + 1} / {talk.slides.length}</span>
        <button onClick={next} aria-label="Siguiente">→</button>
        <button onClick={() => window.open(`/talks/${talk.id}/speaker`, `${talk.id}-speaker`, 'popup,width=1400,height=900')} title="Abrir vista del ponente">▣</button>
        <button onClick={() => setHelpOpen(true)} title="Ayuda">?</button>
      </nav>
      <button className="click-zone left" onClick={previous} aria-label="Diapositiva anterior" />
      <button className="click-zone right" onClick={next} aria-label="Siguiente diapositiva" />
      {helpOpen && <div className="help-overlay" onClick={() => setHelpOpen(false)}><div onClick={(e) => e.stopPropagation()}><button className="close-help" onClick={() => setHelpOpen(false)}>×</button><EyebrowText>Controles</EyebrowText><h2>Presenta sin mirar el ratón.</h2><dl><dt>→ / espacio</dt><dd>Avanzar slide o animación</dd><dt>←</dt><dd>Retroceder</dd><dt>F</dt><dd>Pantalla completa</dd><dt>S</dt><dd>Abrir vista del ponente</dd><dt>H / ?</dt><dd>Mostrar esta ayuda</dd></dl><p>Las dos ventanas se sincronizan automáticamente si comparten el mismo origen.</p></div></div>}
    </main>
  )
}

function EyebrowText({ children }: { children: React.ReactNode }) {
  return <span className="index-kicker">{children}</span>
}
