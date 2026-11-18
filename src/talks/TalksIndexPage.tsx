import { Link } from 'react-router-dom'
import { talks } from './talks.tsx'
import './talks.css'

export function TalksIndexPage() {
  return (
    <main className="talks-index">
      <header>
        <div>
          <span className="index-kicker">TECH TALKS · COLECCIÓN 2026</span>
          <h1>Tres historias sobre vivir<br/>con inteligencias artificiales.</h1>
        </div>
        <p>Presentaciones web preparadas para escenario, con notas de ponente y control remoto entre ventanas.</p>
      </header>
      <section className="talk-catalogue">
        {talks.map((talk) => (
          <article className={`talk-card theme-${talk.theme}`} key={talk.id}>
            <div className="talk-card-top"><span>{talk.number}</span><small>{talk.duration} · {talk.slides.length} slides</small></div>
            <div>
              <p>{talk.subtitle}</p>
              <h2>{talk.title}</h2>
              <p className="talk-description">{talk.description}</p>
            </div>
            <div className="talk-actions">
              <Link to={`/talks/${talk.id}`}>Presentar <span>↗</span></Link>
              <Link className="secondary" to={`/talks/${talk.id}/speaker`}>Vista del ponente</Link>
            </div>
          </article>
        ))}
      </section>
      <footer className="index-help"><span>← →</span> navegar <span>F</span> pantalla completa <span>S</span> vista del ponente <span>?</span> ayuda</footer>
    </main>
  )
}
