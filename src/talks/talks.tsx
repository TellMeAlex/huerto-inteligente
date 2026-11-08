import type { ReactNode } from 'react'
import type { Talk } from './types.ts'

function Reveal({ at, step, children }: { at: number; step: number; children: ReactNode }) {
  return <div className={`reveal ${step >= at ? 'is-visible' : ''}`}>{children}</div>
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="slide-eyebrow">{children}</div>
}

function BigQuote({ children, by }: { children: ReactNode; by?: string }) {
  return (
    <blockquote className="big-quote">
      <span className="quote-mark">“</span>
      <p>{children}</p>
      {by && <footer>{by}</footer>}
    </blockquote>
  )
}

function Pills({ items, step }: { items: string[]; step: number }) {
  return (
    <div className="pill-row">
      {items.map((item, index) => (
        <Reveal at={index + 1} step={step} key={item}><span className="pill">{item}</span></Reveal>
      ))}
    </div>
  )
}

function NumberedList({ items, step }: { items: Array<{ title: string; text?: string }>; step: number }) {
  return (
    <div className="numbered-list">
      {items.map((item, index) => (
        <Reveal at={index + 1} step={step} key={item.title}>
          <div className="numbered-item">
            <span>0{index + 1}</span>
            <div><strong>{item.title}</strong>{item.text && <p>{item.text}</p>}</div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

function FireScene({ stage, children, climax = false }: { stage: 1 | 2 | 3 | 4; children: ReactNode; climax?: boolean }) {
  const assetPath = `${import.meta.env.BASE_URL}talk-assets/this-is-fine/stage-${stage}.png?v=anatomy-fix`
  return (
    <div className={`fire-scene stage-${stage} ${climax ? 'is-climax' : ''}`}>
      <img src={assetPath} alt="" aria-hidden="true" />
      <div className="fire-scene-shade" />
      <div className="fire-scene-copy">{children}</div>
      <span className="fire-stage-label">FUEGO · 0{stage}</span>
    </div>
  )
}

function StoryScene({ kind, stage, children, climax = false }: { kind: 'electric' | 'garden'; stage: 1 | 2 | 3 | 4; children: ReactNode; climax?: boolean }) {
  const talkId = kind === 'electric' ? 'ovejas-electricas' : 'huerto-inteligente'
  const assetVersion = kind === 'garden' ? 'garden-arm-fix-v2' : 'visual-sequence-v1'
  const assetPath = `${import.meta.env.BASE_URL}talk-assets/${talkId}/stage-${stage}.png?v=${assetVersion}`
  return (
    <div className={`story-scene ${kind}-scene stage-${stage} ${climax ? 'is-climax' : ''}`}>
      <img src={assetPath} alt="" aria-hidden="true" />
      <div className="story-scene-shade" />
      <div className="story-scene-fx" aria-hidden="true" />
      <div className="story-scene-copy">{children}</div>
      <span className="story-stage-label">{kind === 'electric' ? 'SEÑAL' : 'CULTIVO'} · 0{stage}</span>
    </div>
  )
}

const electricSlides: Talk['slides'] = [
  {
    id: 'portada', title: 'De programador a psicólogo de ovejas eléctricas',
    notes: 'La oveja aparece como un esquema eléctrico todavía sencillo. Abrir con calma. Contar que elegiste informática porque hablar con ordenadores parecía más sencillo que hablar con personas. Pausa antes del remate: la industria respondió creando ordenadores con los que hay que hablar como si fueran personas.',
    content: () => <StoryScene kind="electric" stage={1}><div className="electric-cover-copy"><Eyebrow>01 · Oficio, criterio e IA</Eyebrow><h1>De programador a<br/><em>psicólogo</em> de ovejas eléctricas</h1><p className="lead">Cómo pasé de escribir instrucciones a negociar intenciones.</p></div></StoryScene>,
  },
  {
    id: 'antes', title: 'La época feliz del determinismo', fragments: 2,
    notes: 'Contrastar el error clásico con la experiencia actual. No idealizar el pasado: la gracia está en que el bug era reproducible. Dejar que cada columna aparezca por separado.',
    content: (step) => <div><Eyebrow>Antes / ahora</Eyebrow><h2>Antes, el ordenador<br/>fallaba <em>siempre igual</em>.</h2><div className="comparison"><Reveal at={1} step={step}><article><small>ANTES</small><strong>Error: línea 42</strong><p>Frío. Preciso. Reproducible.</p></article></Reveal><Reveal at={2} step={step}><article className="accent-card"><small>AHORA</small><strong>«¡Por supuesto!»</strong><p>Y tres párrafos explicando algo que no existe.</p></article></Reveal></div></div>,
  },
  {
    id: 'consulta', title: 'La consulta', fragments: 3,
    notes: 'Interpretar los tres papeles con voces ligeramente distintas. El chiste es reconocernos en comportamientos que antes reservábamos a conversaciones humanas.',
    content: (step) => <div><Eyebrow>Nuevas competencias</Eyebrow><h2>Bienvenidos a la consulta.</h2><div className="chat-stack"><Reveal at={1} step={step}><div className="chat user">Hazme una solución sencilla.</div></Reveal><Reveal at={2} step={step}><div className="chat ai">He diseñado una arquitectura distribuida con 14 servicios.</div></Reveal><Reveal at={3} step={step}><div className="chat user">Eso está muy bien. ¿Qué parte de «sencilla» te ha hecho sentir insegura?</div></Reveal></div></div>,
  },
  {
    id: 'diagnosticos', title: 'Diagnósticos frecuentes', fragments: 4,
    notes: 'Segunda aparición: la oveja habla, sus circuitos se multiplican y aparece un contorno fantasma de alucinación. Presentarlo como una clasificación clínica absurda. Añadir una alucinación propia. Estos patrones justifican la verificación.',
    content: (step) => <StoryScene kind="electric" stage={2}><div className="electric-compact-copy"><Eyebrow>Manual diagnóstico</Eyebrow><h2>Patologías de la<br/>oveja eléctrica</h2><div className="scene-story-list">{['Paquete imaginario','Amnesia selectiva','Optimismo compilatorio','Horror vacui'].map((item,index)=><Reveal at={index+1} step={step} key={item}><span><b>0{index+1}</b>{item}</span></Reveal>)}</div></div></StoryScene>,
  },
  {
    id: 'espejo', title: 'El espejo del conocimiento', fragments: 2,
    notes: 'Tercera aparición: una mano humana inspecciona el corazón del sistema. Este es el giro de la charla. Con conocimiento detectamos el error; sin él, la misma seguridad nos convence. La IA no corrige nuestra ignorancia automáticamente.',
    content: (step) => <StoryScene kind="electric" stage={3}><div className="electric-compact-copy"><Eyebrow>El experimento incómodo</Eyebrow><h2>La misma respuesta.<br/>Dos lectores distintos.</h2><div className="scene-contrast"><Reveal at={1} step={step}><span><b>CON CRITERIO</b>«Aquí falta contexto.»</span></Reveal><Reveal at={2} step={step}><span><b>SIN CRITERIO</b>«Qué bien explicado.»</span></Reveal></div></div></StoryScene>,
  },
  {
    id: 'fundamentos', title: 'Los fundamentos no caducan', fragments: 6,
    notes: 'Hacer aparecer conceptos de uno en uno. Adaptar la lista al perfil del público. Mensaje: quizá escribimos menos sintaxis, pero tomamos más decisiones y necesitamos reconocer las consecuencias.',
    content: (step) => <div className="centered"><Eyebrow>Lo que permanece</Eyebrow><h2>Programar menos no significa<br/><em>entender menos</em>.</h2><Pills step={step} items={['Arquitectura','Modelado','Seguridad','Concurrencia','Testing','Dominio']}/></div>,
  },
  {
    id: 'valor', title: 'La ecuación del valor', fragments: 3,
    notes: 'Esta es la tesis condensada. Código abundante no equivale a producto correcto. Explicar brevemente cada sumando y reservar «responsabilidad» para el final.',
    content: (step) => <div><Eyebrow>La nueva ecuación</Eyebrow><h2>El código se abarata.<br/>El criterio se revaloriza.</h2><div className="equation"><Reveal at={1} step={step}><span>contexto</span></Reveal><b>+</b><Reveal at={2} step={step}><span>criterio</span></Reveal><b>+</b><Reveal at={3} step={step}><span>responsabilidad</span></Reveal><strong>= valor</strong></div></div>,
  },
  {
    id: 'flujo', title: 'Una relación profesional sana', fragments: 4,
    notes: 'Presentar un flujo práctico que la audiencia pueda llevarse. Definir antes de pedir, pedir alternativas, verificar con pruebas y decidir nosotros. Señalar que delegamos producción, no responsabilidad.',
    content: (step) => <div><Eyebrow>Protocolo de consulta</Eyebrow><h2>Delegar la producción.<br/>No delegar la decisión.</h2><div className="process-line">{['Definir','Explorar','Verificar','Decidir'].map((x,i)=><Reveal at={i+1} step={step} key={x}><div><span>{i+1}</span><strong>{x}</strong></div></Reveal>)}</div></div>,
  },
  {
    id: 'donde', title: 'Dónde aportamos valor', fragments: 4,
    notes: 'Bajar del plano técnico al humano. La organización necesita a alguien que entienda qué importa, para quién y qué consecuencias acepta. La IA propone; nosotros respondemos.',
    content: (step) => <div><Eyebrow>La parte que no cabe en el prompt</Eyebrow><h2>Sabemos cosas que el modelo<br/>no puede vivir.</h2><NumberedList step={step} items={[{title:'Qué problema merece resolverse'},{title:'Qué compromiso es aceptable'},{title:'A quién afecta la decisión'},{title:'Quién responde cuando sale mal'}]}/></div>,
  },
  {
    id: 'cierre', title: 'Entender importa más',
    notes: 'La oveja ya forma parte de una red, pero el hilo coral continúa en una mano humana: guía y responsabilidad. Cerrar despacio. La primera frase provoca risa; la segunda deja la idea. Terminar aquí.',
    content: () => <StoryScene kind="electric" stage={4} climax><div className="electric-climax-copy"><BigQuote>La IA no ha hecho innecesario saber programar. Ha hecho más fácil <em>parecer</em> que sabemos programar.</BigQuote><p>Por eso entender lo que hacemos importa más que nunca.</p></div></StoryScene>,
  },
]

const gardenSlides: Talk['slides'] = [
  {
    id:'portada', title:'El agotamiento de vivir en la frontera',
    notes:'El primer brote es el inicio de toda la secuencia. El personaje está basado en ti, ya fuera del traje y en un contexto tangible. Abrir contando la sensación de perseguir la siguiente novedad. Después revelar que la salida no fue alejarte de la tecnología, sino usarla para acercarte a algo real.',
    content:()=> <StoryScene kind="garden" stage={1}><div className="garden-cover-copy"><Eyebrow>02 · IA aplicada a la vida</Eyebrow><h1>El agotamiento de vivir<br/>en <em>la frontera</em></h1><p className="lead">Y cómo la IA me ayudó a cultivar un huerto.</p></div></StoryScene>,
  },
  {
    id:'ruido', title:'Todo lo cambia todo', fragments:4,
    notes:'Acelerar el ritmo con cada aparición. Hacer que la audiencia sienta el ruido. Puedes insertar nombres de herramientas actuales oralmente, pero la slide evita caducar.',
    content:(step)=><div><Eyebrow>Última hora · cada hora</Eyebrow><h2>Todo. Lo cambia. Todo.</h2><div className="headline-wall">{['NUEVO MODELO','NUEVO AGENTE','NUEVO PROTOCOLO','LA PROGRAMACIÓN HA MUERTO'].map((x,i)=><Reveal at={i+1} step={step} key={x}><span>{x}</span></Reveal>)}</div></div>,
  },
  {
    id:'pregunta', title:'Cambiar la pregunta', fragments:2,
    notes:'Marcar una pausa real entre las dos preguntas. La segunda cambia el foco desde el catálogo de herramientas hacia la intención personal.',
    content:(step)=><div className="question-shift"><Reveal at={1} step={step}><div className="crossed"><small>La pregunta agotadora</small><p>¿Qué herramienta nueva debería aprender hoy?</p></div></Reveal><Reveal at={2} step={step}><div><small>La pregunta fértil</small><h2>¿Qué quiero ser capaz de <em>hacer</em>?</h2></div></Reveal></div>,
  },
  {
    id:'tomates', title:'Cuatro tomates', fragments:2,
    notes:'Contar el origen real del huerto. La comicidad está en el contraste entre una aspiración sencilla y el reflejo profesional de convertirla en un sistema.',
    content:(step)=><div><Eyebrow>Proyecto personal · alcance inicial</Eyebrow><h2>Yo solo quería plantar<br/>cuatro tomates.</h2><div className="tomato-row"><Reveal at={1} step={step}><span>🍅</span><span>🍅</span><span>🍅</span><span>🍅</span></Reveal><Reveal at={2} step={step}><p>Y terminé diseñando una infraestructura crítica.</p></Reveal></div></div>,
  },
  {
    id:'arquitectura', title:'Arquitectura del huerto', fragments:4,
    notes:'Segunda etapa: ya hay cuatro tomateras, riego por goteo, sensor y temporizador. Recorrer cada capa como si fuera una arquitectura empresarial. La naturaleza es el sistema legacy, el clima una dependencia externa y los caracoles los threat actors.',
    content:(step)=><StoryScene kind="garden" stage={2}><div className="garden-compact-copy"><Eyebrow>Arquitectura de referencia</Eyebrow><h2>El huerto también<br/>tenía stack.</h2><div className="scene-story-list garden-list">{['Sensores · observabilidad','Riego · automatización','Clima · dependencia externa','Caracoles · threat actors'].map((item,index)=><Reveal at={index+1} step={step} key={item}><span><b>0{index+1}</b>{item}</span></Reveal>)}</div></div></StoryScene>,
  },
  {
    id:'plagas', title:'Detectar plagas', fragments:3,
    notes:'Tercera etapa: el huerto ya está vivo y aparece el primer problema real. Contar la secuencia concreta: ves una hoja dañada, haces una foto, obtienes hipótesis y después verificas. La IA ayuda a empezar; no convierte una foto en diagnóstico infalible.',
    content:(step)=><StoryScene kind="garden" stage={3}><div className="garden-compact-copy"><Eyebrow>Del síntoma a la acción</Eyebrow><h2>Una foto no me<br/>hizo experto.</h2><div className="garden-diagnosis"><Reveal at={1} step={step}><span><b>01</b>Observar</span></Reveal><Reveal at={2} step={step}><span><b>02</b>Formular una hipótesis</span></Reveal><Reveal at={3} step={step}><span><b>03</b>Verificar antes de actuar</span></Reveal></div><p className="scene-footnote">Me ayudó a hacer una pregunta mejor.</p></div></StoryScene>,
  },
  {
    id:'cadena', title:'Una curiosidad llama a otra', fragments:5,
    notes:'Hacer avanzar la cadena paso a paso. El valor no es solo la respuesta final: cada respuesta permite formular la siguiente pregunta y entrar en disciplinas nuevas.',
    content:(step)=><div><Eyebrow>Aprendizaje generativo</Eyebrow><h2>Una capacidad abrió la siguiente.</h2><div className="learning-path">{['Cultivar','Regar','Sensorizar','Interpretar','Comprender'].map((x,i)=><Reveal at={i+1} step={step} key={x}><div><span>{i+1}</span><strong>{x}</strong>{i<4&&<b>↗</b>}</div></Reveal>)}</div></div>,
  },
  {
    id:'paradoja', title:'La paradoja', fragments:2,
    notes:'Este es el giro emocional de la charla. La tecnología que parecía encerrarnos en una pantalla también puede ser una puerta hacia lo físico, si elegimos bien el propósito.',
    content:(step)=><div className="centered"><Eyebrow>La paradoja</Eyebrow><h2>Usé más inteligencia artificial…</h2><Reveal at={1} step={step}><p className="giant-follow">para depender menos de una pantalla.</p></Reveal><Reveal at={2} step={step}><div className="sun-line"><span>☀</span><i/></div></Reveal></div>,
  },
  {
    id:'lugar', title:'La tecnología en su lugar', fragments:4,
    notes:'No presentar el huerto como receta universal. Puede ser cerámica, cocina, música o reparar una bicicleta. El criterio es que la tecnología deje una capacidad, no solo dependencia.',
    content:(step)=><div><Eyebrow>Una brújula, no un destino</Eyebrow><h2>La tecnología está en su lugar cuando…</h2><NumberedList step={step} items={[{title:'Amplía mi autonomía'},{title:'Convierte curiosidad en acción'},{title:'Me conecta con el mundo físico'},{title:'Me deja una capacidad nueva'}]}/></div>,
  },
  {
    id:'cierre', title:'Tecnología y tomates',
    notes:'La tecnología queda finalmente en el bolsillo; el centro es la cosecha. Cerrar con una imagen optimista y concreta. Pausa después de “ordenador”. El último remate puede acompañarse con una sonrisa, no necesita explicación.',
    content:()=> <StoryScene kind="garden" stage={4} climax><div className="garden-climax-copy"><BigQuote>Pensaba que usar IA consistía en pasar más tiempo delante del ordenador. Terminó ayudándome a pasar más tiempo fuera de él.</BigQuote><p>El futuro puede ser tecnología <em>y</em> mejores tomates.</p></div></StoryScene>,
  },
]

const fireSlides: Talk['slides'] = [
  {
    id:'portada', title:'Cuando “This is fine” se convirtió en mi filosofía para la IA',
    notes:'La pequeña llama de la esquina es el primer personaje de la charla. Presentar el tono como un manual de supervivencia: reconocemos el caos, nos reímos y salimos con prácticas concretas. La misma llama volverá, cada vez más grande.',
    content:()=> <FireScene stage={1}><div className="fire-cover-copy"><Eyebrow>03 · Manual de supervivencia</Eyebrow><h1>Cuando<br/><em>“This is fine”</em><br/>se convirtió en mi filosofía para la IA</h1><p className="lead">Trabajar mientras el futuro arde educadamente.</p></div></FireScene>,
  },
  {
    id:'velocidad', title:'Legacy en el kickoff', fragments:3,
    notes:'Aumentar el ritmo con cada frase. La tercera aparición contiene el remate. Esta slide establece el problema: la velocidad no es una excepción, es el entorno.',
    content:(step)=><div><Eyebrow>Velocidad de crucero</Eyebrow><h2>Mi proyecto se quedó obsoleto…</h2><div className="time-cards"><Reveal at={1} step={step}><div><small>LUNES</small><strong>Idea</strong></div></Reveal><Reveal at={2} step={step}><div><small>MARTES</small><strong>Kickoff</strong></div></Reveal><Reveal at={3} step={step}><div className="danger"><small>MIÉRCOLES</small><strong>Legacy</strong></div></Reveal></div></div>,
  },
  {
    id:'ciclo', title:'El ciclo de la novedad', fragments:5,
    notes:'Segunda aparición del perro: la llama ya se multiplica bajo la mesa. Recorrer el ciclo con ritmo; en “producción” bajar el entusiasmo. La salida no es acelerar, sino introducir criterios antes de integrar.',
    content:(step)=><FireScene stage={2}><div className="fire-compact-copy"><Eyebrow>El ciclo infinito</Eyebrow><h2>La vida útil de<br/>«esto lo cambia todo»</h2><div className="fire-story-list">{['Imposible','Demo','Urgente','Producción','Nuevo modelo'].map((x,i)=><Reveal at={i+1} step={step} key={x}><span><b>0{i+1}</b>{x}</span></Reveal>)}</div></div></FireScene>,
  },
  {
    id:'demo', title:'La demo y producción', fragments:2,
    notes:'Contraste visual sencillo. Una demo demuestra posibilidad, no fiabilidad. Mencionar variabilidad, entradas reales, costes, latencia y casos límite.',
    content:(step)=><div><Eyebrow>Dos ecosistemas</Eyebrow><h2>Funcionó una vez.<br/>Delante de mí.</h2><div className="demo-prod"><Reveal at={1} step={step}><article><span>✨</span><strong>DEMO</strong><p>Una entrada limpia.<br/>Un camino feliz.<br/>Aplausos.</p></article></Reveal><Reveal at={2} step={step}><article className="prod"><span>🔥</span><strong>PRODUCCIÓN</strong><p>Usuarios reales.<br/>Datos reales.<br/>Viernes, 18:47.</p></article></Reveal></div></div>,
  },
  {
    id:'incendios', title:'Incendios habituales', fragments:4,
    notes:'Tercera aparición: ya hay portátil, alertas y servidor; la referencia técnica al meme debe ser evidente. Elegir ejemplos reales. No dramatizar: el reconocimiento de la audiencia hace el trabajo.',
    content:(step)=><FireScene stage={3}><div className="fire-compact-copy"><Eyebrow>Parte de incidencias</Eyebrow><h2>¿Qué está<br/>ardiendo hoy?</h2><div className="fire-story-list incidents">{['El prompt es infraestructura','El modelo cambió de personalidad','El agente necesita supervisión','El presupuesto era una demo'].map((x,i)=><Reveal at={i+1} step={step} key={x}><span><b>0{i+1}</b>{x}</span></Reveal>)}</div></div></FireScene>,
  },
  {
    id:'triaje', title:'Triaje del caos', fragments:3,
    notes:'Primera herramienta del kit. No toda novedad merece una reacción. Clasificar: observar, experimentar de forma acotada o actuar porque hay impacto verificable.',
    content:(step)=><div><Eyebrow>Regla número 1</Eyebrow><h2>No todo humo exige evacuar.</h2><div className="triage">{[{s:'01',t:'Observar',p:'Interesante, sin caso propio.'},{s:'02',t:'Experimentar',p:'Hipótesis y tiempo limitados.'},{s:'03',t:'Actuar',p:'Valor y riesgo demostrables.'}].map((x,i)=><Reveal at={i+1} step={step} key={x.t}><article><span>{x.s}</span><strong>{x.t}</strong><p>{x.p}</p></article></Reveal>)}</div></div>,
  },
  {
    id:'kit', title:'Kit de supervivencia', fragments:6,
    notes:'El corazón práctico de la charla. Hacer aparecer cada elemento con ritmo. Señalar que estos mecanismos sirven para aprender sin convertir cada experimento en arquitectura permanente.',
    content:(step)=><div><Eyebrow>Mochila de emergencia</Eyebrow><h2>Seis cosas antes del extintor</h2><Pills step={step} items={['Experimento pequeño','Evaluación repetible','Límites claros','Observabilidad','Salida manual','Presupuesto de novedad']}/></div>,
  },
  {
    id:'semantica', title:'Tres significados de “fine”', fragments:3,
    notes:'Reapropiarse del meme. “Fine” no es negar. Es aceptar incertidumbre sin renunciar al juicio. Dar un ejemplo breve de cada nivel.',
    content:(step)=><div><Eyebrow>Una filosofía con matices</Eyebrow><h2>“Fine” necesita contexto.</h2><div className="fine-levels"><Reveal at={1} step={step}><div><span>●</span><strong>Esto es incómodo</strong><p>Podemos observar.</p></div></Reveal><Reveal at={2} step={step}><div><span>▲</span><strong>Esto es incierto</strong><p>Podemos experimentar.</p></div></Reveal><Reveal at={3} step={step}><div className="danger"><span>✦</span><strong>Esto es peligroso</strong><p>Tenemos que parar.</p></div></Reveal></div></div>,
  },
  {
    id:'madurez', title:'Madurez técnica', fragments:3,
    notes:'Tesis final práctica. La madurez no es ausencia de caos, es capacidad de distinguir. Hacer aparecer las tres categorías y dejar una pausa antes del remate oral.',
    content:(step)=><div className="centered"><Eyebrow>La habilidad que permanece</Eyebrow><h2>Distinguir…</h2><div className="distinguish"><Reveal at={1} step={step}><span>una chispa</span></Reveal><Reveal at={2} step={step}><span>una chimenea</span></Reveal><Reveal at={3} step={step}><span>una evacuación</span></Reveal></div></div>,
  },
  {
    id:'cierre', title:'Nada definitivo',
    notes:'La llama ocupa por fin toda la escena, pero el perro sigue con el café. Cerrar con serenidad, bajando el ritmo. La frase final convierte la volatilidad en una competencia profesional, no en una condena.',
    content:()=> <FireScene stage={4} climax><div className="fire-climax-copy"><BigQuote>Nuestro objetivo no puede ser dominar para siempre una herramienta concreta.</BigQuote><p>Es aprender a trabajar cuando nada parece definitivo.</p></div></FireScene>,
  },
]

void electricSlides
void fireSlides

export const talks: Talk[] = [
  { id:'huerto-inteligente', number:'01', shortTitle:'El huerto inteligente', title:'El agotamiento de vivir en la frontera', subtitle:'Y cómo la IA me ayudó a cultivar un huerto', duration:'30 min', theme:'garden', description:'Una historia sobre salir del ruido de las novedades y usar la IA para adquirir capacidades reales.', slides:gardenSlides },
]

export function getTalk(id: string | undefined) {
  return talks.find((talk) => talk.id === id)
}
