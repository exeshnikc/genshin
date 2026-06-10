'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  region: string
  coverUrl: string
}

type Tab = 'favorites' | 'collected'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<Book[]>([])
  const [collected, setCollected] = useState<Book[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('favorites')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/auth'); return }
    setUser(JSON.parse(userData))
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([
      fetch('/api/favorites').then(r => r.json()).then(setFavorites),
      fetch('/api/collected').then(r => r.json()).then(setCollected),
    ])
    setLoading(false)
  }

  const removeFromFavorites = async (bookId: string) => {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId })
    })
    setFavorites(prev => prev.filter(b => b.id !== bookId))
  }

  const removeFromCollected = async (bookId: string) => {
    await fetch('/api/collected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId })
    })
    setCollected(prev => prev.filter(b => b.id !== bookId))
  }

  const logout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem('user')
    router.push('/auth')
  }

  if (!user) return null

  const displayBooks = activeTab === 'favorites' ? favorites : collected
  const removeBook = activeTab === 'favorites' ? removeFromFavorites : removeFromCollected

  const progress = collected.length + favorites.length > 0
    ? Math.round((collected.length / Math.max(collected.length + favorites.length, 1)) * 100)
    : 0

  return (
    <div
      className="min-h-screen py-10 px-6"
      style={{ background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))' }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div
          className="rounded-2xl border p-8 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-deep))',
            borderColor: 'var(--border)',
            animation: 'fadeInUp 0.4s ease forwards',
          }}
        >
          <div className="flex flex-wrap justify-between items-start gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                    color: '#1a120b',
                    boxShadow: '0 0 20px var(--glow)',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {user.role === 'ADMIN' && (
                  <div
                    className="absolute -bottom-1 -right-1 text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'var(--accent)', color: '#1a120b' }}
                  >
                    ADM
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold font-[Cinzel]" style={{ color: 'var(--accent)' }}>
                  {user.name}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {user.email}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Роль: {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-end">
              <button
                onClick={logout}
                className="px-5 py-2 rounded-xl border transition-all hover:scale-105 text-sm"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--text-secondary)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--text-secondary)')}
              >
                Выйти из аккаунта
              </button>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="px-5 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                    color: '#1a120b',
                  }}
                >
                  Админ-панель
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Избранных', value: favorites.length },
              { label: 'Собрано', value: collected.length },
              { label: 'Прогресс', value: `${progress}%` },
            ].map(stat => (
              <div
                key={stat.label}
                className="rounded-xl p-4 text-center border"
                style={{
                  background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {stat.value}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Прогресс коллекции</span>
              <span>{collected.length}/{collected.length + favorites.length}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-dim))',
                }}
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border overflow-hidden shadow-xl"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            animation: 'fadeInUp 0.5s ease forwards',
          }}
        >
          <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
            {([
              { key: 'favorites' as Tab, label: 'Избранное', count: favorites.length },
              { key: 'collected' as Tab, label: 'Собранные книги', count: collected.length },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                  background: activeTab === tab.key
                    ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
                    : 'transparent',
                }}
              >
                {tab.label}
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: activeTab === tab.key
                      ? 'color-mix(in srgb, var(--accent) 20%, transparent)'
                      : 'var(--bg-input)',
                    color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div
                  className="w-10 h-10 rounded-full border-2 border-t-transparent"
                  style={{ borderColor: 'var(--accent)', animation: 'spin-slow 1s linear infinite' }}
                />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Загрузка...</p>
              </div>
            ) : displayBooks.length === 0 ? (
              <div className="text-center py-16">
                <p style={{ color: 'var(--text-secondary)' }}>
                  {activeTab === 'favorites' ? 'Нет избранных книг' : 'Нет собранных книг'}
                </p>
                <Link
                  href="/"
                  className="inline-block mt-4 px-6 py-2 rounded-xl font-medium transition hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                    color: '#1a120b',
                  }}
                >
                  Перейти к каталогу
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayBooks.map((book, idx) => (
                  <div
                    key={book.id}
                    className="rounded-xl p-4 border transition-all hover:scale-[1.01]"
                    style={{
                      background: 'var(--bg-card-deep)',
                      borderColor: 'var(--border)',
                      animation: `fadeInUp ${0.1 + idx * 0.05}s ease forwards`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <h3 className="font-bold font-[Cinzel] text-base leading-snug mb-1" style={{ color: 'var(--accent)' }}>
                      {book.title}
                    </h3>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {book.author}
                    </p>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {book.region}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/book/${book.id}`}
                        className="flex-1 text-center py-2 rounded-lg text-xs font-bold transition hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                          color: '#1a120b',
                        }}
                      >
                        Читать
                      </Link>
                      <button
                        onClick={() => removeBook(book.id)}
                        className="px-3 py-2 rounded-lg text-xs border transition hover:scale-105"
                        style={{
                          background: 'var(--bg-card)',
                          borderColor: 'var(--text-secondary)',
                          color: 'var(--text-secondary)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#ef4444'
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--text-secondary)'
                          e.currentTarget.style.color = 'var(--text-secondary)'
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
