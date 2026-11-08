import { useState, type ReactNode } from 'react'

export interface TabDef {
  key: string
  label: string
  /** Contador opcional mostrado como pill (ej. nº de herramientas). */
  count?: number
  render: () => ReactNode
}

interface TabsProps {
  tabs: TabDef[]
}

/** Tabs simple sin librería externa. Monta solo el panel activo. */
export function Tabs({ tabs }: TabsProps) {
  const [active, setActive] = useState(tabs[0]?.key)
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab?.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    isActive ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="py-6">{activeTab?.render()}</div>
    </div>
  )
}
