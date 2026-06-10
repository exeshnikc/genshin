'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import BookCard from '@/components/BookCard'

interface Book {
  id: string
  title: string
  author: string
  region: string
  coverUrl: string
}

const REGIONS = ['Все', 'Мондштадт', 'Ли Юэ', 'Инадзума', 'Сумеру', 'Фонтейн', 'Натлан', 'Снежная']
const PAGE_SIZE = 12

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: ((i * 137.5) % 100).toFixed(1),
  top: ((i * 97.3) % 100).toFixed(1),
  size: (((i * 7) % 3) + 1).toFixed(1),
  delay: (((i * 11) % 50) / 10).toFixed(1),
  duration: (((i * 13) % 30) / 10 + 2).toFixed(1),
}))

export default function Home() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('Все')
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [collected, setCollected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      loadUserData()
    } else {
      setLoading(false)
    }
    fetchBooks()
  }, [])

  useEffect(() => {
    setPage(1)
    fetchBooks()
  }, [search, region])

  const fetchBooks = async () => {
    try {
      const res = await fetch(`/api/books?search=${encodeURIComponent(search)}&region=${encodeURIComponent(region)}`)
      const data = await res.json()
      setBooks(data.books)
    } catch {
      setBooks([])
    }
  }

  const loadUserData = async () => {
    await Promise.all([
      fetch('/api/favorites').then(r => r.json()).then(d => setFavorites(new Set(d.map((b: Book) => b.id)))),
      fetch('/api/collected').then(r => r.json()).then(d => setCollected(new Set(d.map((b: Book) => b.id))))
    ])
    setLoading(false)
  }

  const toggleFavorite = async (bookId: string) => {
    if (!user) { router.push('/auth'); return }
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId })
    })
    const data = await res.json()
    setFavorites(prev => {
      const s = new Set(prev)
      data.added ? s.add(bookId) : s.delete(bookId)
      return s
    })
  }

  const toggleCollected = async (bookId: string) => {
    if (!user) { router.push('/auth'); return }
    const res = await fetch('/api/collected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId })
    })
    const data = await res.json()
    setCollected(prev => {
      const s = new Set(prev)
      data.added ? s.add(bookId) : s.delete(bookId)
      return s
    })
  }

  const totalPages = Math.ceil(books.length / PAGE_SIZE)
  const paginated = useMemo(
    () => books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [books, page]
  )

  return (
    <div className="min-h-screen relative">
      <div className="star-bg">
        {STARS.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-12" style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
          <div className="inline-block mb-4">
            <div
              className="text-6xl md:text-7xl font-bold font-[Cinzel] mb-3"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #fff8e7, var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200%',
                animation: 'shimmer 4s infinite linear',
              }}
            >
              Genshin Library
            </div>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Открой для себя мир книг Тейвата
          </p>
          {!loading && books.length > 0 && (
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
              {books.length} книг в коллекции
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8" style={{ animation: 'fadeInUp 0.7s ease forwards' }}>
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Поиск по названию или автору..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-3 rounded-xl border backdrop-blur-sm transition-all outline-none"
              style={{
                background: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="px-5 py-3 rounded-xl border backdrop-blur-sm outline-none cursor-pointer transition-all"
            style={{
              background: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {REGIONS.map(r => (
              <option key={r} value={r} style={{ background: 'var(--bg-card)' }}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-8" style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{
                background: region === r
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-dim))'
                  : 'color-mix(in srgb, var(--bg-card) 70%, transparent)',
                color: region === r ? '#1a120b' : 'var(--text-secondary)',
                border: `1px solid ${region === r ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div
              className="w-14 h-14 rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--accent)', animation: 'spin-slow 1s linear infinite' }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>Загрузка коллекции...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Книг не найдено
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 px-6 py-2 rounded-xl transition hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                  color: '#1a120b',
                }}
              >
                Сбросить поиск
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map((book, idx) => (
                <div
                  key={book.id}
                  className="relative"
                  style={{ animation: `fadeInUp ${0.1 + idx * 0.04}s ease forwards` }}
                >
                  <BookCard {...book} />
                  {user && (
                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                      <button
                        onClick={() => toggleFavorite(book.id)}
                        title={favorites.has(book.id) ? 'Убрать из избранного' : 'В избранное'}
                        className="w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          background: favorites.has(book.id)
                            ? 'linear-gradient(135deg, var(--accent), var(--accent-dim))'
                            : 'rgba(0,0,0,0.55)',
                          color: favorites.has(book.id) ? '#1a120b' : 'var(--text-secondary)',
                        }}
                      >
                        {favorites.has(book.id) ? '★' : '☆'}
                      </button>
                      <button
                        onClick={() => toggleCollected(book.id)}
                        title={collected.has(book.id) ? 'Убрать из собранных' : 'Отметить собранной'}
                        className="w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          background: collected.has(book.id)
                            ? 'linear-gradient(135deg, var(--accent), var(--accent-dim))'
                            : 'rgba(0,0,0,0.55)',
                          color: collected.has(book.id) ? '#1a120b' : 'var(--text-secondary)',
                        }}
                      >
                        {collected.has(book.id) ? '✓' : '□'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Назад
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                      acc.push('...')
                    }
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} className="px-2" style={{ color: 'var(--text-secondary)' }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className="w-10 h-10 rounded-xl border transition-all hover:scale-110 font-medium"
                        style={{
                          background: page === p
                            ? 'linear-gradient(135deg, var(--accent), var(--accent-dim))'
                            : 'var(--bg-card)',
                          borderColor: page === p ? 'transparent' : 'var(--border)',
                          color: page === p ? '#1a120b' : 'var(--text-primary)',
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Вперёд
                </button>
              </div>
            )}

            <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
              Показаны {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, books.length)} из {books.length}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
