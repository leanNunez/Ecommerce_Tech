import { Heart } from 'lucide-react'
import { Button } from '@/shared/ui'
import { useWishlistStore } from '@/entities/wishlist'

interface WishlistToggleButtonProps {
  productId: string
}

export function WishlistToggleButton({ productId }: WishlistToggleButtonProps) {
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(productId))
  const addToWishlist = useWishlistStore((s) => s.addToWishlist)
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist)

  function handleToggle() {
    if (isInWishlist) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle} aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
      <Heart
        className="h-5 w-5"
        fill={isInWishlist ? 'currentColor' : 'none'}
      />
    </Button>
  )
}
