# Dashboard de sesiones

Pantalla local para gestionar y visualizar las charlas del roadmap: vista general de las 9
sesiones, detalle editable de cada una y la evolución de las definiciones de producto.

Lee y **escribe** directamente los ficheros de `sessions/` (YAML/Markdown/Mermaid) del repo,
así que edita el contenido real del curso — no una copia.

## Uso

```bash
cd dashboard
npm install
npm run dev        # http://localhost:5173
```

## Tech talks

Las tres presentaciones web están disponibles en `http://localhost:5173/talks`.

- `/talks/:id`: vista 16:9 para el proyector.
- `/talks/:id/speaker`: vista del ponente con diapositiva siguiente, notas, reloj,
  cronómetro y navegador de slides.
- `←`/`→` o espacio: navegación; `F`: pantalla completa; `S`: abre la vista del
  ponente; `?`: ayuda.

Las vistas se sincronizan mediante `BroadcastChannel` y, mientras se ejecutan con
`npm run dev`, también mediante un canal local del servidor. Esto permite usar dos
ventanas, dos pantallas o incluso dos navegadores distintos conectados al mismo host.

Solo local (no hay build de producción). Al guardar desde la UI, los cambios van al disco
en `../sessions/`; revísalos con `git diff` como cualquier otra edición.

## Cómo funciona

- **Frontend**: Vite + React 19 + TypeScript + Tailwind v4 (SPA).
- **API local**: un plugin de Vite (`vite-plugins/data-api-plugin.ts`) expone `/api/*` en el
  propio dev server; lee/escribe `sessions/` y `ROADMAP.md`. No hay backend separado.
- **YAML**: se edita con `yaml` (eemeli) mutando por ruta (`setIn`) para que el diff al
  guardar sea quirúrgico y no reordene el resto del fichero.

### Guardarraíles al guardar

- La agenda debe sumar exactamente `duration_minutes` (se muestra en vivo y el servidor
  bloquea el guardado si no cuadra).
- `title`, `owner` y `duration_minutes` no pueden quedar vacíos.
- El YAML resultante se re-valida antes de tocar el disco.
- No se crean ficheros nuevos desde la UI: solo se edita lo que ya existe (las sesiones
  borrador, 04-09, solo muestran `notes.md`).

Esto es un guardarraíl ligero, no sustituye a `.claude/skills/preparar-sesion/scripts/validate_session.py`.
