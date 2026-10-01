import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Footer } from './footer'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

describe('Footer', () => {
  it('links to the author portfolio as a followed link', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /leandro nuñez/i })
    expect(link).toHaveAttribute('href', 'https://leannunez.github.io/myportfolio/')
    expect(link.getAttribute('rel') ?? '').not.toMatch(/nofollow/)
  })
})
