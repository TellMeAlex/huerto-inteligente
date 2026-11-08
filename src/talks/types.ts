import type { ReactNode } from 'react'

export type TalkTheme = 'electric' | 'garden' | 'fire'

export type Slide = {
  id: string
  title: string
  section?: string
  notes: string
  fragments?: number
  content: (step: number) => ReactNode
}

export type Talk = {
  id: string
  number: string
  title: string
  shortTitle: string
  subtitle: string
  duration: string
  theme: TalkTheme
  description: string
  slides: Slide[]
}

export type PresentationState = {
  slide: number
  step: number
}
