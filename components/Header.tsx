'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'

export default function Header() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: `linear-gradient(to right, color-mix(in srgb, var(--bg-primary) 95%, transparent), color-mix(in srgb, var(--bg-secondary) 95%, transparent))`,
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
        {/* Логотип */}
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))' }}
          >
            <span className="text-[#1a120b] text-xl font-bold">К</span>
          </div>
          <span
            className="text-xl font-bold font-[Cinzel] hidden sm:block"
            style={{ color: 'var(--accent)' }}
          >
            Genshin Library
          </span>
        </Link>

        {/* Навигация */}
        <nav className="hidden md:flex gap-6">
          <Link
            href="/"
            className="transition-colors hover:scale-105 duration-200 font-medium"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            Каталог
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="transition-colors hover:scale-105 duration-200 font-medium"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              Админ
            </Link>
          )}
          {user && (
            <Link
              href="/profile"
              className="transition-colors hover:scale-105 duration-200 font-medium"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              Профиль
            </Link>
          )}
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-3">
          {/* Переключатель темы */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            aria-label="Переключить тему"
          >
            <div className="knob" />
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                style={{ background: 'rgba(228,181,116,0.08)', borderColor: 'var(--border)' }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', color: '#1a120b' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  {user.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-1.5 rounded-xl border transition-all hover:scale-105 text-sm"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--text-secondary)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-secondary)'
                }}
              >
                Выйти
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-5 py-1.5 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                color: '#1a120b',
                boxShadow: '0 0 0 transparent',
              }}
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
