import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { coldStartStore } from '@/shared/api/cold-start'

// Rough upper bound for a free-tier cold start; drives the progress estimate.
const ESTIMATE_MS = 60_000
const TICK_MS = 200
// How long to keep the full bar on screen after the server responds.
const FINISH_MS = 600

type Phase = 'idle' | 'waking' | 'finishing'

export function ServerWakingBanner() {
  const { t } = useTranslation()
  const isWaking = useSyncExternalStore(
    coldStartStore.subscribe,
    coldStartStore.getSnapshot,
    () => false,
  )

  const [progress, setProgress] = useState(0)
  const stateRef = useRef<{ phase: Phase; startedAt: number }>({
    phase: 'idle',
    startedAt: 0,
  })

  useEffect(() => {
    const st = stateRef.current
    if (!isWaking && st.phase === 'idle') return

    let timer = 0

    // Runs off a timer (never synchronously in the effect body) so state
    // updates don't trigger cascading renders.
    const loop = () => {
      if (isWaking) {
        if (st.phase !== 'waking') {
          st.phase = 'waking'
          st.startedAt = Date.now()
        }
        const elapsed = Date.now() - st.startedAt
        // Ease-out estimate — approaches but never reaches 95% until the
        // server actually responds.
        const pct = 95 * (1 - Math.exp(-elapsed / (ESTIMATE_MS / 3)))
        setProgress(Math.min(95, pct))
        timer = window.setTimeout(loop, TICK_MS)
      } else if (st.phase === 'waking') {
        st.phase = 'finishing'
        setProgress(100)
        timer = window.setTimeout(loop, FINISH_MS)
      } else {
        st.phase = 'idle'
        setProgress(0)
      }
    }

    timer = window.setTimeout(loop, 0)
    return () => window.clearTimeout(timer)
  }, [isWaking])

  if (!isWaking && progress === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[100] border-b border-primary/20 bg-surface shadow-md"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3">
        <p className="text-sm leading-snug text-text">
          <span className="font-semibold">{t('serverWaking.title')}</span>{' '}
          {t('serverWaking.description')}
        </p>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
