import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/global.css'
import '@/shared/i18n/config'
import { App } from './App'

// After a deploy, tabs opened on the previous build request chunk hashes that
// no longer exist. Reload once to pick up the new build; the timestamp guard
// prevents a reload loop if the chunk is genuinely broken.
const RELOAD_KEY = 'chunk-reload-at'
const RELOAD_WINDOW_MS = 10_000

window.addEventListener('vite:preloadError', (event) => {
  let lastReload = 0
  try {
    lastReload = Number(sessionStorage.getItem(RELOAD_KEY)) || 0
  } catch {
    // Storage unavailable (private mode, blocked): still try a single reload.
  }
  if (Date.now() - lastReload < RELOAD_WINDOW_MS) return

  event.preventDefault()
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // Ignore — worst case the guard doesn't persist.
  }
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
