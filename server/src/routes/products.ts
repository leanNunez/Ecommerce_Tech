import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

const PRODUCT_INCLUDE = {
  images:   { orderBy: { order: 'asc' as const } },
  variants: true,
  category: true,
  brand:    true,
}

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { category, brand, minPrice, maxPrice, search, sortBy, page = '1', perPage = '12' } =
      req.query as Record<string, string>

    const where: any = { isActive: true }

    if (category) where.category = { slug: category }
    if (brand)    where.brand    = { slug: brand }
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const orderBy: any =
      sortBy === 'price_asc'  ? { price: 'asc' }  :
      sortBy === 'price_desc' ? { price: 'desc' } :
      sortBy === 'newest'     ? { createdAt: 'desc' } :
      { createdAt: 'desc' }

    const perPageN = Math.min(Number(perPage), 100)
    const pageN    = Number(page)

    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip:    (pageN - 1) * perPageN,
        take:    perPageN,
        include: PRODUCT_INCLUDE,
      }),
    ])

    res.json({
      success: true,
      data,
      meta: { total, page: pageN, perPage: perPageN, totalPages: Math.ceil(total / perPageN) },
    })
  } catch (err) { next(err) }
})

// ── GET /api/products/admin/all — admin: all products incl. inactive ──────────
router.get('/admin/all', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const data = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: PRODUCT_INCLUDE,
    })
    res.json({ success: true, data })
  } catch (err) { next(err) }
})

// ── GET /api/products/:slug ───────────────────────────────────────────────────
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where:   { slug: req.params.slug },
      include: PRODUCT_INCLUDE,
    })
    if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return }
    res.json({ success: true, data: product })
  } catch (err) { next(err) }
})

// ── POST /api/products — admin ────────────────────────────────────────────────
const variantInputSchema = z.object({
  sku:      z.string().min(1),
  name:     z.string().min(1),
  price:    z.number().positive(),
  stock:    z.number().int().min(0),
  imageUrl: z.string().url().optional().nullable(),
  attributes: z.record(z.string()).optional(),
})

const createProductSchema = z.object({
  name:           z.string().min(2),
  description:    z.string().min(1),
  price:          z.number().positive(),
  compareAtPrice: z.number().nonnegative().optional(),
  stock:          z.number().int().min(0),
  categoryId:     z.string().min(1),
  brandId:        z.string().optional(),
  imageUrl:       z.string().url().optional(),
  isActive:       z.boolean().optional(),
  variants:       z.array(variantInputSchema).optional(),
})

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const data = createProductSchema.parse(req.body)
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const existing = await prisma.product.findUnique({ where: { slug: baseSlug } })
    const slug     = existing ? `${baseSlug}-${Date.now()}` : baseSlug

    const product = await prisma.product.create({
      data: {
        slug,
        name:           data.name,
        description:    data.description,
        price:          data.price,
        compareAtPrice: data.compareAtPrice,
        stock:          data.stock,
        categoryId:     data.categoryId,
        brandId:        data.brandId ?? 'brand1',
        isActive:       data.isActive ?? true,
        images: data.imageUrl
          ? { create: [{ url: data.imageUrl }] }
          : undefined,
        variants: data.variants?.length
          ? {
              create: data.variants.map((v, i) => ({
                sku:        v.sku || `${slug}-v${i + 1}`,
                name:       v.name,
                price:      v.price,
                stock:      v.stock,
                imageUrl:   v.imageUrl ?? null,
                attributes: v.attributes ?? {},
              })),
            }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    })
    res.status(201).json({ success: true, data: product })
  } catch (err) { next(err) }
})

// ── PATCH /api/products/:id — admin ──────────────────────────────────────────
const updateProductSchema = z.object({
  name:           z.string().min(2).optional(),
  description:    z.string().min(1).optional(),
  price:          z.number().positive().optional(),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  stock:          z.number().int().min(0).optional(),
  categoryId:     z.string().min(1).optional(),
  brandId:        z.string().optional(),
  imageUrl:       z.string().url().optional().nullable(),
  isActive:       z.boolean().optional(),
  variants:       z.array(variantInputSchema).optional(),
})

router.patch('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updates = updateProductSchema.parse(req.body)
    const { imageUrl, variants, ...restWithoutVariants } = updates
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data:  {
        ...restWithoutVariants,
        ...(imageUrl !== undefined && {
          images: {
            deleteMany: {},
            ...(imageUrl ? { create: [{ url: imageUrl }] } : {}),
          },
        }),
        ...(variants !== undefined && {
          variants: {
            deleteMany: {},
            create: variants.map((v, i) => ({
              sku:        v.sku || `${req.params.id}-v${i + 1}`,
              name:       v.name,
              price:      v.price,
              stock:      v.stock,
              imageUrl:   v.imageUrl ?? null,
              attributes: v.attributes ?? {},
            })),
          },
        }),
      },
      include: PRODUCT_INCLUDE,
    })
    res.json({ success: true, data: product })
  } catch (err) { next(err) }
})

// ── DELETE /api/products/:id — admin ─────────────────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export default router
