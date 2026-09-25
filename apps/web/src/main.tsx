import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './router'
import './index.css'

// The browser may skip a view transition (for example when the viewport resizes mid-navigation, as when
// a phone keyboard closes). The navigation still completes; only the transition's `ready` promise rejects,
// and React Router leaves it unhandled. Swallow exactly that case so it isn't reported as an error.
window.addEventListener('unhandledrejection', (e) => {
  const r: unknown = e.reason
  if (r instanceof DOMException && (r.name === 'InvalidStateError' || r.name === 'AbortError') && /transition/i.test(r.message)) e.preventDefault()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
