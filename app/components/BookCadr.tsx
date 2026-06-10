'use client'
import Link from 'next/link'

interface BookProps {
  id: string
  title: string
  author: string
  region: string
  coverUrl?: string | null
}

export function BookCard({ book }: { book: BookProps }) {
  return (
    <Link href={`/book/${book.id}`} className="book-card group">
      <div className="p-4">
        <h3 className="font-bold font-[Cinzel] text-lg truncate" style={{ color: 'var(--accent)' }}>{book.title}</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{book.author}</p>
        <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
          {book.region}
        </span>
      </div>
    </Link>
  )
}
