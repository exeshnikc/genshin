'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BookCard from '@/components/BookCard'

interface Book {
  id: string
  title: string
  author: string
  region: string
  coverUrl: string
}

export default function Home() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('Все')
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [collected, setCollected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const regions = ['Все', 'Мондштадт', 'Ли Юэ', 'Инадзума', 'Сумеру', 'Фонтейн']

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      loadUserData()
    }
    fetchBooks()
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [search, region])

  const fetchBooks = async () => {
    try {
      const res = await fetch(`/api/books?search=${search}&region=${region}`)
      const data = await res.json()
      setBooks(data)
    } catch (error) {
      console.error('Ошибка загрузки книг:', error)
    }
  }

  const loadUserData = async () => {
    await Promise.all([
      fetch('/api/favorites').then(res => res.json()).then(data => setFavorites(new Set(data.map((b: Book) => b.id)))),
      fetch('/api/collected').then(res => res.json()).then(data => setCollected(new Set(data.map((b: Book) => b.id))))
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
    if (data.added) {
      setFavorites(prev => new Set(prev).add(bookId))
    } else {
      setFavorites(prev => { const newSet = new Set(prev); newSet.delete(bookId); return newSet })
    }
  }

  const toggleCollected = async (bookId: string) => {
    if (!user) { router.push('/auth'); return }
    const res = await fetch('/api/collected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId })
    })
    const data = await res.json()
    if (data.added) {
      setCollected(prev => new Set(prev).add(bookId))
    } else {
      setCollected(prev => { const newSet = new Set(prev); newSet.delete(bookId); return newSet })
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Звёздный фон */}
      <div className="star-bg">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold font-[Cinzel] bg-gradient-to-r from-[#e4b574] via-[#f0e0c0] to-[#e4b574] bg-clip-text text-transparent mb-4">
            Genshin Library
          </h1>
          <p className="text-[#b98b5f] text-lg">Открой для себя мир книг Тейвата</p>
        </div>

        <div className="flex gap-4 mb-10">
          <input
            type="text"
            placeholder="🔍 Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-5 py-3 bg-[#2f241b]/80 backdrop-blur-sm border border-[#e4b574]/30 rounded-xl text-[#f0e0c0] focus:outline-none focus:border-[#e4b574] focus:ring-1 focus:ring-[#e4b574] transition-all"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="px-5 py-3 bg-[#2f241b]/80 backdrop-blur-sm border border-[#e4b574]/30 rounded-xl text-[#f0e0c0] focus:outline-none focus:border-[#e4b574] cursor-pointer"
          >
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e4b574] mx-auto mb-4"></div>
              <p className="text-[#b98b5f]">Загрузка книг...</p>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#b98b5f] text-lg">Книг не найдено</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => (
              <div key={book.id} className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e4b574]/30 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <BookCard {...book} />
                {user && (
                  <div className="absolute top-3 left-3 flex gap-2 z-10">
                    <button
                      onClick={() => toggleFavorite(book.id)}
                      className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                        favorites.has(book.id)
                          ? 'bg-[#e4b574] text-[#1a120b]'
                          : 'bg-black/50 text-[#b98b5f] hover:bg-[#e4b574]/30'
                      }`}
                    >
                      {favorites.has(book.id) ? '★' : '☆'}
                    </button>
                    <button
                      onClick={() => toggleCollected(book.id)}
                      className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                        collected.has(book.id)
                          ? 'bg-[#e4b574] text-[#1a120b]'
                          : 'bg-black/50 text-[#b98b5f] hover:bg-[#e4b574]/30'
                      }`}
                    >
                      {collected.has(book.id) ? '✓' : '□'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}