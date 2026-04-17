import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter      from './routes/auth.js'
import uploadRouter    from './routes/upload.js'
import productsRouter  from './routes/products.js'
import categoriesRouter from './routes/categories.js'
import brandsRouter    from './routes/brands.js'
import ordersRouter    from './routes/orders.js'
import cartRouter      from './routes/cart.js'
import addressesRouter from './routes/addresses.js'
import usersRouter     from './routes/users.js'
import { errorHandler } from './middleware/error.js'

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

export const app = express()

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth',       authRouter)
app.use('/api/upload',     uploadRouter)
app.use('/api/products',   productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/brands',     brandsRouter)
app.use('/api/orders',     ordersRouter)
app.use('/api/cart',       cartRouter)
app.use('/api/addresses',  addressesRouter)
app.use('/api/users',      usersRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)
