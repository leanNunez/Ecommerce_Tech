import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { Server } from 'lucide-react'
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

  const pct = Math.round(progress)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-md rounded-2xl border border-primary/15 bg-surface p-6 shadow-2xl sm:p-8"
      >
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Server className="size-7 motion-safe:animate-pulse" aria-hidden="true" />
        </div>

        <h2 className="text-center text-lg font-semibold text-text">
          {t('serverWaking.title')}
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          {t('serverWaking.description')}
        </p>

        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              {t('serverWaking.loading')}
            </span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              {pct}%
            </span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-primary/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={t('serverWaking.loading')}
          >
            <div
              className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-primary to-primary-dark transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent motion-safe:animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
