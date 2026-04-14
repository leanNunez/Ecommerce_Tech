import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })
    res.json({ success: true, data: brands })
  } catch (err) { next(err) }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({ where: { slug: req.params.slug } })
    if (!brand) { res.status(404).json({ success: false, message: 'Brand not found' }); return }
    res.json({ success: true, data: brand })
  } catch (err) { next(err) }
})

export default router
