import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { authenticate, requireAdmin } from '../middleware/auth.js'

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL })

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

// ── POST /api/upload ──────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' })
      return
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'premiumtech/products', resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          console.error('[cloudinary error]', error)
          res.status(500).json({ success: false, message: 'Upload failed' })
          return
        }
        res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } })
      },
    )

    stream.end(req.file.buffer)
  },
)

export default router
