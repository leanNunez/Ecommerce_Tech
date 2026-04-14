import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/shared/ui'
import { useSearch } from '../model/use-search'

interface SearchBarProps {
  onSearch?: () => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const { currentQ, search } = useSearch()
  const [value, setValue] = useState(currentQ)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(currentQ)
  }, [currentQ])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const term = e.target.value
    setValue(term)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (term.trim()) {
        search(term.trim())
        onSearch?.()
      }
    }, 300)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (timerRef.current) clearTimeout(timerRef.current)
    if (value.trim()) {
      search(value.trim())
      onSearch?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full">
      <Input
        type="search"
        placeholder="Search products…"
        value={value}
        onChange={handleChange}
        aria-label="Search products"
        className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex shrink-0 items-center justify-center rounded-r-md bg-accent px-4 text-white transition-colors hover:bg-accent-dark"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}
