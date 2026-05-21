'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  const logout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#1a0f0a]/95 to-[#0d0805]/95 backdrop-blur-md border-b border-[#e4b574]/30">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#e4b574] to-[#c49a4a] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition">
            <span className="text-[#1a120b] text-xl font-bold">К</span>
          </div>
          <span className="text-2xl font-bold font-[Cinzel] bg-gradient-to-r from-[#e4b574] to-[#f0e0c0] bg-clip-text text-transparent">
            Genshin Library
          </span>
        </Link>

        <nav className="flex gap-8">
          <Link href="/" className="text-[#f0e0c0] hover:text-[#e4b574] transition">
            Каталог
          </Link>
          {user && user.role === 'ADMIN' && (
            <Link href="/admin" className="text-[#f0e0c0] hover:text-[#e4b574] transition">
              Админ-панель
            </Link>
          )}
          {user && (
            <Link href="/profile" className="text-[#f0e0c0] hover:text-[#e4b574] transition">
              Профиль
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e4b574]/10 rounded-xl border border-[#e4b574]/30">
                <div className="w-6 h-6 bg-gradient-to-br from-[#e4b574] to-[#c49a4a] rounded-lg flex items-center justify-center">
                  <span className="text-[#1a120b] text-xs">✦</span>
                </div>
                <span className="text-[#e4b574] text-sm">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-1.5 bg-[#2f241b] border border-[#b98b5f] hover:border-[#e4b574] text-[#f0e0c0] rounded-xl transition-all hover:scale-105"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="px-6 py-1.5 bg-gradient-to-r from-[#e4b574] to-[#c49a4a] rounded-xl text-[#1a120b] font-bold hover:scale-105 transition"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}