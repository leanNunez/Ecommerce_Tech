// Cold-start detector for the free-tier backend.
//
// The demo API sleeps when idle; the first request after a cold start hangs
// while the service spins up (often 30–60s). We can't know real progress, so we
// count in-flight requests and, if the queue stays non-empty past a short
// grace period, flag "the server is waking up" for the UI.

type Listener = () => void

// If a request is still pending after this long, assume a cold start.
const GRACE_MS = 2500

let pendingCount = 0
let isWaking = false
let graceTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener()
}

function setWaking(next: boolean) {
  if (isWaking === next) return
  isWaking = next
  emit()
}

function clearGraceTimer() {
  if (graceTimer !== null) {
    clearTimeout(graceTimer)
    graceTimer = null
  }
}

/** Call when an HTTP attempt starts. */
export function reportRequestStart() {
  pendingCount += 1
  if (pendingCount === 1 && !isWaking && graceTimer === null) {
    graceTimer = setTimeout(() => {
      graceTimer = null
      if (pendingCount > 0) setWaking(true)
    }, GRACE_MS)
  }
}

/** Call when an HTTP attempt settles (success or error). */
export function reportRequestEnd() {
  pendingCount = Math.max(0, pendingCount - 1)
  if (pendingCount === 0) {
    clearGraceTimer()
    setWaking(false)
  }
}

export const coldStartStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot() {
    return isWaking
  },
}
