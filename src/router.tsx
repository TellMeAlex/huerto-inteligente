import { createBrowserRouter } from 'react-router-dom'
import { TalksIndexPage } from './talks/TalksIndexPage.tsx'
import { PresentationPage } from './talks/PresentationPage.tsx'
import { SpeakerPage } from './talks/SpeakerPage.tsx'

export const router = createBrowserRouter([
  { path: '/', element: <TalksIndexPage /> },
  { path: '/talks', element: <TalksIndexPage /> },
  { path: '/talks/:id', element: <PresentationPage /> },
  { path: '/talks/:id/speaker', element: <SpeakerPage /> },
], { basename: import.meta.env.BASE_URL })
