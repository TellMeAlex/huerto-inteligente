import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getTalk } from './talks.tsx'
import { usePresentation } from './usePresentation.ts'
import './talks.css'

export function SpeakerPage() {
  const { id } = useParams()
  const talk = getTalk(id)
  if (!talk) return <Navigate to="/talks" replace />
  return <Speaker talk={talk} />
}

function Speaker({ talk }: { talk: NonNullable<ReturnType<typeof getTalk>> }) {
  const { state, next, previous, goTo } = usePresentation(talk)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [overview, setOverview] = useState(false)
  const current = talk.slides[state.slide]
  const upcoming = talk.slides[state.slide + 1]

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (startedAt) setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [startedAt])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); next() }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); previous() }
      if (event.key.toLowerCase() === 'g') setOverview((value) => !value)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [next, previous])

  const clock = useClock()
  const formattedElapsed = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
  const progress = Math.round(((state.slide + 1) / talk.slides.length) * 100)

  return (
    <main className={`speaker-view theme-${talk.theme}`}>
      <header className="speaker-header">
        <div><Link to="/talks">TECH TALKS</Link><span>{talk.shortTitle}</span></div>
        <div className="speaker-status"><span className="live-dot"/> sincronizado <strong>{clock}</strong></div>
      </header>
      <section className="speaker-grid">
        <div className="speaker-main">
          <div className="speaker-label"><span>EN PANTALLA</span><strong>{state.slide + 1} / {talk.slides.length}</strong></div>
          <div className="speaker-slide"><div className="slide-content">{current.content(state.step)}</div></div>
        </div>
        <aside className="speaker-side">
          <div className="next-panel"><div className="speaker-label"><span>SIGUIENTE</span></div>{upcoming ? <div className="speaker-slide next"><div className="slide-content">{upcoming.content(0)}</div></div> : <div className="end-card">FIN</div>}</div>
          <div className="timer-panel"><div><small>TIEMPO</small><strong>{formattedElapsed}</strong></div><button onClick={() => { if (startedAt) { setStartedAt(null) } else { setStartedAt(Date.now() - elapsed * 1000) } }}>{startedAt ? 'Pausar' : elapsed ? 'Seguir' : 'Iniciar'}</button><button className="quiet" onClick={() => { setStartedAt(null); setElapsed(0) }}>↺</button></div>
        </aside>
        <section className="notes-panel"><div className="speaker-label"><span>NOTAS · {current.title}</span></div><p>{current.notes}</p></section>
      </section>
      <footer className="speaker-controls">
        <button onClick={previous}>← <span>Anterior</span></button>
        <div className="speaker-progress"><i style={{width:`${progress}%`}}/><span>{progress}%</span></div>
        <button className="overview-button" onClick={() => setOverview(true)}>▦ <span>Vista general</span></button>
        <button className="primary" onClick={next}><span>Siguiente</span> →</button>
      </footer>
      {overview && <div className="overview-overlay"><header><div><span className="index-kicker">Navegador</span><h2>{talk.shortTitle}</h2></div><button onClick={() => setOverview(false)}>×</button></header><div className="slide-grid">{talk.slides.map((slide,index)=><button className={index===state.slide?'active':''} onClick={()=>{goTo(index);setOverview(false)}} key={slide.id}><span>{String(index+1).padStart(2,'0')}</span><div className="mini-slide"><div className="slide-content">{slide.content(0)}</div></div><strong>{slide.title}</strong></button>)}</div></div>}
    </main>
  )
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  return useMemo(() => now.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' }), [now])
}
