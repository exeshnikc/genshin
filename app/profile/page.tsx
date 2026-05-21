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

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<Book[]>([])
  const [collected, setCollected] = useState<Book[]>([])
  const [activeTab, setActiveTab] = useState<'favorites' | 'collected'>('favorites')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth')
      return
    }
    setUser(JSON.parse(userData))
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([
      fetch('/api/favorites').then(res => res.json()).then(setFavorites),
      fetch('/api/collected').then(res => res.json()).then(setCollected)
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

  if (!user) return <div className="p-8 text-center">Загрузка...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0805] py-12 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Карточка профиля */}
        <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-8 mb-8 border border-[#e4b574]/20 shadow-2xl">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#e4b574] to-[#c49a4a] rounded-xl flex items-center justify-center">
                  <span className="text-[#1a120b] text-xl font-bold">К</span>
                </div>
                <h1 className="text-3xl font-bold font-[Cinzel] text-[#e4b574]">Личный кабинет</h1>
              </div>
              <p className="text-[#b98b5f] mt-2">Добро пожаловать, <span className="text-[#e4b574]">{user.name}</span></p>
              <p className="text-[#b98b5f] text-sm mt-1">Email: {user.email}</p>
              <p className="text-[#b98b5f] text-sm">Роль: {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}</p>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2 bg-[#2f241b] border border-[#b98b5f] hover:border-[#e4b574] text-[#f0e0c0] rounded-xl transition"
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>

        {/* Вкладки */}
        <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl border border-[#e4b574]/20 overflow-hidden">
          <div className="flex border-b border-[#e4b574]/20">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-[#e4b574]/20 to-transparent text-[#e4b574] border-b-2 border-[#e4b574]'
                  : 'text-[#b98b5f] hover:bg-[#e4b574]/10'
              }`}
            >
              Избранное ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('collected')}
              className={`flex-1 py-4 text-center font-medium transition ${
                activeTab === 'collected'
                  ? 'bg-gradient-to-r from-[#e4b574]/20 to-transparent text-[#e4b574] border-b-2 border-[#e4b574]'
                  : 'text-[#b98b5f] hover:bg-[#e4b574]/10'
              }`}
            >
              Собранные книги ({collected.length})
            </button>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-[#e4b574] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#b98b5f] mt-4">Загрузка...</p>
              </div>
            ) : activeTab === 'favorites' ? (
              favorites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-[#b98b5f]">Нет избранных книг</p>
                  <Link href="/" className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-[#e4b574] to-[#c49a4a] rounded-xl text-[#1a120b] font-medium hover:scale-105 transition">
                    Перейти к каталогу
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((book) => (
                    <div key={book.id} className="bg-[#1a120b] rounded-xl p-5 border border-[#e4b574]/20 hover:border-[#e4b574]/50 transition">
                      <h3 className="text-lg font-bold text-[#e4b574]">{book.title}</h3>
                      <p className="text-[#b98b5f] text-sm mt-1">Автор: {book.author}</p>
                      <p className="text-[#b98b5f] text-sm">Регион: {book.region}</p>
                      <div className="flex gap-3 mt-4">
                        <Link href={`/book/${book.id}`} className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-[#e4b574] to-[#c49a4a] rounded-lg text-[#1a120b] font-medium hover:scale-105 transition">
                          Читать
                        </Link>
                        <button
                          onClick={() => removeFromFavorites(book.id)}
                          className="px-4 py-2 bg-[#2f241b] border border-[#b98b5f] rounded-lg text-[#b98b5f] hover:border-red-500 hover:text-red-500 transition"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              collected.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📖</div>
                  <p className="text-[#b98b5f]">Нет собранных книг</p>
                  <Link href="/" className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-[#e4b574] to-[#c49a4a] rounded-xl text-[#1a120b] font-medium hover:scale-105 transition">
                    Перейти к каталогу
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collected.map((book) => (
                    <div key={book.id} className="bg-[#1a120b] rounded-xl p-5 border border-[#e4b574]/20 hover:border-[#e4b574]/50 transition">
                      <h3 className="text-lg font-bold text-[#e4b574]">{book.title}</h3>
                      <p className="text-[#b98b5f] text-sm mt-1">Автор: {book.author}</p>
                      <p className="text-[#b98b5f] text-sm">Регион: {book.region}</p>
                      <div className="flex gap-3 mt-4">
                        <Link href={`/book/${book.id}`} className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-[#e4b574] to-[#c49a4a] rounded-lg text-[#1a120b] font-medium hover:scale-105 transition">
                          Читать
                        </Link>
                        <button
                          onClick={() => removeFromCollected(book.id)}
                          className="px-4 py-2 bg-[#2f241b] border border-[#b98b5f] rounded-lg text-[#b98b5f] hover:border-red-500 hover:text-red-500 transition"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {user.role === 'ADMIN' && (
          <div className="mt-8">
            <Link href="/admin">
              <button className="w-full py-4 bg-gradient-to-r from-[#e4b574]/20 to-transparent border border-[#e4b574]/30 rounded-xl text-[#e4b574] font-medium hover:bg-[#e4b574]/10 transition">
                Перейти в административную панель
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}