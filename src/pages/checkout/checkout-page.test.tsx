import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CheckoutPage } from './checkout-page'

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
const { mockClearCart } = vi.hoisted(() => ({ mockClearCart: vi.fn() }))

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/entities/cart', () => ({
  useCartStore: (selector: (s: { items: unknown[]; clearCart: () => void }) => unknown) =>
    selector({
      items: [{ productId: 'p1', name: 'MacBook Pro', price: 2499, quantity: 1, imageUrl: '' }],
      clearCart: mockClearCart,
    }),
  calculateSubtotal: () => 2499,
  calculateTax:      () => 249.9,
  calculateTotal:    () => 2748.9,
}))

vi.mock('@/entities/order', () => ({
  usePlaceOrder: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ data: { id: 'order-123' } }),
  }),
}))

// ── Helpers ────────────────────────────────────────────────────────────────────

function fillShipping() {
  fireEvent.change(screen.getByPlaceholderText('123 Main St'), { target: { value: '123 Main St' } })
  fireEvent.change(screen.getByPlaceholderText('New York'),    { target: { value: 'New York' } })
  fireEvent.change(screen.getByPlaceholderText('NY'),          { target: { value: 'NY' } })
  fireEvent.change(screen.getByPlaceholderText('10001'),       { target: { value: '10001' } })
  fireEvent.change(screen.getByPlaceholderText('United States'), { target: { value: 'US' } })
}

// Both desktop and mobile render a Continue button — click the first
function clickContinue() {
  fireEvent.click(screen.getAllByRole('button', { name: /continue/i })[0]!)
}

function clickBack() {
  fireEvent.click(screen.getAllByRole('button', { name: /back/i })[0]!)
}

// ── Tests ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockNavigate.mockReset()
  mockClearCart.mockReset()
})

describe('CheckoutPage — stepper navigation', () => {
  it('starts on the shipping step — card number field is not rendered', () => {
    render(<CheckoutPage />)
    expect(screen.getByPlaceholderText('123 Main St')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('1234567890123456')).not.toBeInTheDocument()
  })

  it('blocks Continue and shows validation errors when shipping is empty', async () => {
    render(<CheckoutPage />)
    clickContinue()

    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0)
    })
    // Still on shipping — payment form not visible
    expect(screen.queryByPlaceholderText('1234567890123456')).not.toBeInTheDocument()
  })

  it('advances to payment step after filling all shipping fields', async () => {
    render(<CheckoutPage />)
    fillShipping()
    clickContinue()

    await waitFor(() => {
      expect(screen.getByPlaceholderText('1234567890123456')).toBeInTheDocument()
    })
    expect(screen.queryByPlaceholderText('123 Main St')).not.toBeInTheDocument()
  })

  it('returns to shipping step when Back is clicked on payment step', async () => {
    render(<CheckoutPage />)
    fillShipping()
    clickContinue()

    await waitFor(() => expect(screen.getByPlaceholderText('1234567890123456')).toBeInTheDocument())

    clickBack()

    expect(screen.getByPlaceholderText('123 Main St')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('1234567890123456')).not.toBeInTheDocument()
  })
})
