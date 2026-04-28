const TRANSFORMS = {
  plp:      'w_400,h_400,c_fill,f_auto,q_auto',
  pdp:      'w_800,h_800,c_fill,f_auto,q_auto',
  thumb:    'w_80,h_80,c_fill,f_auto,q_auto',
  og:       'w_1200,h_630,c_fill,f_auto,q_auto',
} as const

type ImageSize = keyof typeof TRANSFORMS

export function cloudinaryUrl(rawUrl: string | null | undefined, size: ImageSize): string {
  if (!rawUrl?.includes('res.cloudinary.com')) return rawUrl ?? ''
  return rawUrl.replace('/upload/', `/upload/${TRANSFORMS[size]}/`)
}
