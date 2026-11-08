import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar.tsx'

export function AppShell() {
  return (
    <div className="min-h-full">
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
