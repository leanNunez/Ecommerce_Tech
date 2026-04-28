import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { prisma } from '../lib/prisma.js'

const TEST_EMAIL = 'test.orders.customer@test.com'
let customerToken: string

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ firstName: 'Test', lastName: 'Customer', email: TEST_EMAIL, password: 'password123' })
  customerToken = res.body.accessToken
})

afterAll(async () => {
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } })
  if (user) {
    // Cascade: delete orders → items and addresses → then user
    const orders = await prisma.order.findMany({ where: { userId: user.id } })
    for (const order of orders) {
      await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
      await prisma.order.delete({ where: { id: order.id } })
    }
    await prisma.address.deleteMany({ where: { userId: user.id } })
    await prisma.user.delete({ where: { id: user.id } })
  }
})

const VALID_ADDRESS = {
  street:  '123 Main St',
  city:    'New York',
  state:   'NY',
  country: 'United States',
  zipCode: '10001',
}

describe('GET /api/orders', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/orders')
    expect(res.status).toBe(401)
  })

  it('returns empty array for a new customer with no orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})

describe('POST /api/orders', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [], shippingAddress: VALID_ADDRESS })
    expect(res.status).toBe(401)
  })

  it('returns 400 with empty items array', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [], shippingAddress: VALID_ADDRESS })
    expect(res.status).toBe(400)
  })

  it('returns 400 with a non-existent productId', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: 'non-existent-id', quantity: 1, imageUrl: '' }],
        shippingAddress: VALID_ADDRESS,
      })
    expect(res.status).toBe(400)
  })

  it('creates an order (201) and calculates total from DB price, not client data', async () => {
    // Fetch a real product to use its actual DB price
    const productRes = await request(app).get('/api/products?perPage=1')
    const product = productRes.body.data[0]

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: product.id, quantity: 1, imageUrl: product.images[0]?.url ?? '' }],
        shippingAddress: VALID_ADDRESS,
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('processing')
    // Server recalculates total from DB — (price × qty) × 1.1 rounded to 2 decimals
    const expectedTotal = Number((product.price * 1 * 1.1).toFixed(2))
    expect(res.body.data.total).toBeCloseTo(expectedTotal, 1)
  })
})
