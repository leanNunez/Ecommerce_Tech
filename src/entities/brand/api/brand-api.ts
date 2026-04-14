import { apiClient } from '@/shared/api/axios-instance'
import type { ApiResponse } from '@/shared/types/api.types'
import type { Brand } from '../model/brand.types'

export function getBrands(): Promise<ApiResponse<Brand[]>> {
  return apiClient.get<ApiResponse<Brand[]>>('/api/brands').then((r) => r.data)
}

export function getBrandBySlug(slug: string): Promise<ApiResponse<Brand>> {
  return apiClient.get<ApiResponse<Brand>>(`/api/brands/${slug}`).then((r) => r.data)
}
