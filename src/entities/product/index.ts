export type { Product, ProductVariant, ProductImage, ProductFilters } from './model/product.types'
export { getProducts, getProductBySlug, getAllProductsAdmin, createProduct, updateProduct, deleteProduct } from './api/product-api'
export type { CreateProductPayload } from './api/product-api'
export {
  productKeys,
  useProducts,
  useProductBySlug,
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './model/product-queries'
