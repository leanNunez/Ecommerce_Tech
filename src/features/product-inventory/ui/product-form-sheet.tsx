import { useEffect, useRef, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, Loader2, X } from 'lucide-react'
import {
  Button,
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
  Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/shared/ui'
import { uploadProductImage } from '@/shared/api/upload-api'
import type { Product } from '@/entities/product'
import type { NewProductPayload, UpdateProductPayload } from '../model/use-product-inventory'

const CATEGORIES = [
  { id: 'cat1', label: 'Laptops' },
  { id: 'cat2', label: 'Smartphones' },
  { id: 'cat3', label: 'Headphones' },
  { id: 'cat4', label: 'Monitors' },
  { id: 'cat5', label: 'Tablets' },
  { id: 'cat6', label: 'Components' },
]

const schema = z.object({
  name:        z.string().min(2, 'Required'),
  description: z.string().min(1, 'Required'),
  price:       z.coerce.number().positive('Must be > 0'),
  stock:       z.coerce.number().int().min(0, 'Cannot be negative'),
  categoryId:  z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

interface ProductFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onAdd: (payload: NewProductPayload) => void
  onUpdate: (id: string, payload: UpdateProductPayload) => void
}

export function ProductFormSheet({ open, onOpenChange, product, onAdd, onUpdate }: ProductFormSheetProps) {
  const isEdit = Boolean(product)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageUrl, setImageUrl]     = useState<string>('')
  const [uploading, setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: '', description: '', price: 0, stock: 0, categoryId: '' },
  })

  useEffect(() => {
    if (product) {
      form.reset({
        name:        product.name,
        description: product.description,
        price:       product.price,
        stock:       product.stock,
        categoryId:  product.categoryId,
      })
      setImageUrl(product.images[0]?.url ?? '')
    } else {
      form.reset({ name: '', description: '', price: 0, stock: 0, categoryId: '' })
      setImageUrl('')
    }
    setUploadError(null)
  }, [product, form])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const result = await uploadProductImage(file)
      setImageUrl(result.url)
    } catch {
      setUploadError('Upload failed. Check your Cloudinary credentials.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleSubmit(values: FormValues) {
    const payload = { ...values, imageUrl: imageUrl || undefined }
    if (isEdit && product) {
      onUpdate(product.id, payload)
    } else {
      onAdd(payload)
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? `Edit: ${product!.name}` : 'Add new product'}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="mt-6 space-y-4">

            {/* ── Image upload ── */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Product image</p>

              {imageUrl ? (
                <div className="relative w-full overflow-hidden rounded-lg border border-secondary/20 bg-surface">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    className="h-48 w-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/80"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-t border-secondary/20 py-2 text-xs text-muted transition-colors hover:bg-secondary/5"
                  >
                    Change image
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-secondary/30 bg-surface py-8 text-muted transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-sm font-medium">Click to upload image</span>
                      <span className="text-xs">PNG, JPG, WEBP — max 5 MB</span>
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {uploadError && (
                <p className="text-xs text-destructive">{uploadError}</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder='MacBook Pro 16"' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Input placeholder="Short product description" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={uploading}>
                {isEdit ? 'Save changes' : 'Add product'}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
