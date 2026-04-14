import { ZodError } from 'zod'
import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({ success: false, message: 'Validation error', errors: err.errors })
    return
  }
  console.error('[error]', err)
  const message = err instanceof Error ? err.message : 'Internal server error'
  res.status(500).json({ success: false, message })
}
