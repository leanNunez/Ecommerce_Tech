import 'dotenv/config'
import { randomUUID } from 'crypto'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import authRouter      from './routes/auth.js'
import uploadRouter    from './routes/upload.js'
import productsRouter  from './routes/products.js'
import categoriesRouter from './routes/categories.js'
import brandsRouter    from './routes/brands.js'
import ordersRouter    from './routes/orders.js'
import cartRouter      from './routes/cart.js'
import addressesRouter from './routes/addresses.js'
import usersRouter     from './routes/users.js'
import searchRouter    from './routes/search.js'
import assistantRouter from './routes/assistant.js'
import { errorHandler } from './middleware/error.js'
import { logger } from './lib/logger.js'

const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((s) => s.trim())

export const app = express()

app.set('trust proxy', 1)
app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed`))
      }
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
  const requestId = randomUUID()
  res.setHeader('X-Request-Id', requestId)
  res.locals.requestId = requestId
  logger.info(`${req.method} ${req.url}`, { requestId })
  next()
})

app.use('/api/auth',       authRouter)
app.use('/api/upload',     uploadRouter)
app.use('/api/products',   productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/brands',     brandsRouter)
app.use('/api/orders',     ordersRouter)
app.use('/api/cart',       cartRouter)
app.use('/api/addresses',  addressesRouter)
app.use('/api/users',      usersRouter)
app.use('/api/search',    searchRouter)
app.use('/api/assistant', assistantRouter)

const IS_PROD = process.env.NODE_ENV === 'production'
const HEALTH_TOKEN = process.env.HEALTH_TOKEN ?? ''

app.get('/health', (req, res) => {
  if (IS_PROD && HEALTH_TOKEN && req.headers['x-health-token'] !== HEALTH_TOKEN) {
    res.status(404).end()
    return
  }
  res.json({ status: 'ok' })
})

app.use(errorHandler)
