import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, ChevronUp, CreditCard, MapPin, Wand2 } from 'lucide-react'
import { calculateSubtotal, calculateTax, calculateTotal } from '@/entities/cart'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PageTitle,
} from '@/shared/ui'
import { OrderSummary } from '@/widgets/order-summary'
import { useCartStore } from '@/entities/cart'
import { usePlaceOrder } from '@/entities/order'
import { formatCurrency } from '@/shared/lib/format-currency'

const checkoutSchema = z.object({
  street: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  zipCode: z.string().min(3, 'Invalid ZIP'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Must be 16 digits'),
  cardHolder: z.string().min(1, 'Required'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, '3 or 4 digits'),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const { mutateAsync: placeOrder } = usePlaceOrder()
  const navigate = useNavigate()
  const isPlacingOrder = useRef(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)

  const subtotal = calculateSubtotal(items)
  const tax = calculateTax(subtotal, 0.1)
  const total = calculateTotal(subtotal, tax)

  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder.current) {
      navigate({ to: '/cart' })
    }
  }, [items.length, navigate])

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      cardNumber: '',
      cardHolder: '',
      expiry: '',
      cvv: '',
    },
  })

  function fillDemo() {
    form.reset({
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10001',
      cardNumber: '4111111111111111',
      cardHolder: 'John Doe',
      expiry: '12/28',
      cvv: '123',
    })
  }

  async function onSubmit(data: CheckoutFormValues) {
    isPlacingOrder.current = true
    setOrderError(null)
    try {
      const res = await placeOrder({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode,
        },
      })
      clearCart()
      navigate({ to: '/checkout/confirmation/$orderId', params: { orderId: res.data.id } })
    } catch {
      isPlacingOrder.current = false
      setOrderError('Something went wrong placing your order. Please try again.')
    }
  }

  if (items.length === 0) return null

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 pb-28 lg:pb-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <PageTitle>Checkout</PageTitle>
        <button
          type="button"
          onClick={fillDemo}
          className="flex items-center gap-1.5 rounded-lg border border-secondary/20 bg-surface px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-primary/30 hover:text-primary"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Fill demo data
        </button>
      </div>

      <Form {...form}>
        <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-8 lg:grid-cols-3">

            {/* ── Form sections ── */}
            <div className="flex flex-col gap-8 lg:col-span-2">

              {/* Shipping */}
              <section className="rounded-xl border border-secondary/20 bg-surface p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text">Shipping Address</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Payment */}
              <section className="rounded-xl border border-secondary/20 bg-surface p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text">Payment</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890123456" maxLength={16} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cardHolder"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" maxLength={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="123" maxLength={4} type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            </div>

            {/* ── Order summary (desktop only) ── */}
            <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-secondary/20 bg-surface p-6">
                <h2 className="mb-4 text-base font-semibold text-text">Your Order</h2>
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.variantId ?? ''}`}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={item.imageUrl || 'https://placehold.co/48x48/F9FAFB/6B7280?text=...'}
                        alt={item.name}
                        className="h-12 w-12 shrink-0 rounded-lg bg-background object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text">{item.name}</p>
                        <p className="text-xs text-secondary">Qty: {item.quantity}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-primary">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <OrderSummary items={items} />

              {orderError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {orderError}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Placing order…' : 'Place Order'}
              </Button>
            </div>

          </div>
        </form>
      </Form>

      {/* ── Sticky bottom bar — mobile only ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-secondary/20 bg-surface/95 backdrop-blur-sm">
        {/* Collapsible summary */}
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm"
        >
          <span className="font-medium text-text">Order summary</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-text">{formatCurrency(total)}</span>
            {summaryOpen ? <ChevronDown className="h-4 w-4 text-muted" /> : <ChevronUp className="h-4 w-4 text-muted" />}
          </div>
        </button>

        {summaryOpen && (
          <div className="border-t border-secondary/10 px-4 py-3 text-sm">
            <div className="flex justify-between text-secondary">
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-secondary mt-1">
              <span>Tax (10%)</span><span>{formatCurrency(tax)}</span>
            </div>
            <div className="mt-2 flex justify-between font-bold text-text border-t border-secondary/10 pt-2">
              <span>Total</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        <div className="px-4 pb-4">
          {orderError && (
            <p className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {orderError}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            form="checkout-form"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Placing order…' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  )
}
