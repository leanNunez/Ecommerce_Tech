import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// ── GET /api/categories ───────────────────────────────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    res.json({ success: true, data: categories })
  } catch (err) { next(err) }
})

// ── GET /api/categories/:slug ─────────────────────────────────────────────────
router.get('/:slug', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({ where: { slug: req.params.slug } })
    if (!category) { res.status(404).json({ success: false, message: 'Category not found' }); return }
    res.json({ success: true, data: category })
  } catch (err) { next(err) }
})

// ── POST /api/categories — admin ──────────────────────────────────────────────
const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
})

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body)
    const category = await prisma.category.create({ data })
    res.status(201).json({ success: true, data: category })
  } catch (err) { next(err) }
})

// ── PATCH /api/categories/:id — admin ─────────────────────────────────────────
const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
})

router.patch('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = updateCategorySchema.parse(req.body)
    const category = await prisma.category.update({ where: { id: req.params.id }, data })
    res.json({ success: true, data: category })
  } catch (err) { next(err) }
})

// ── DELETE /api/categories/:id — admin ────────────────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export default router
