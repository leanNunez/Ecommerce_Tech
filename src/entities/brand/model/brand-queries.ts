import { useQuery } from '@tanstack/react-query'
import { getBrands, getBrandBySlug } from '../api/brand-api'

export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: () => [...brandKeys.lists()] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (slug: string) => [...brandKeys.details(), slug] as const,
} as const

export function useBrands() {
  return useQuery({
    queryKey: brandKeys.list(),
    queryFn: getBrands,
  })
}

export function useBrandBySlug(slug: string) {
  return useQuery({
    queryKey: brandKeys.detail(slug),
    queryFn: () => getBrandBySlug(slug),
    enabled: Boolean(slug),
  })
}
