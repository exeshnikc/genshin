'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface Book {
  id: string
  title: string
  author: string
  region: string
}

interface Stats {
  metrics: { users: number; books: number; favorites: number; collected: number }
  booksByRegion: { region: string; count: number }[]
  usersByRole: { role: string; count: number }[]
  activity: { date: string; count: number }[]
}

const PIE_COLORS = ['#e4b574', '#c49a4a', '#b98b5f', '#d4a564', '#f0e0c0']

const TABS = [
  { key: 'analytics', label: 'Аналитика' },
  { key: 'users',     label: 'Пользователи' },
  { key: 'books',     label: 'Книги' },
  { key: 'reports',   label: 'Отчёты' },
  { key: 'parser',    label: 'Парсинг' },
]

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState('analytics')
  const [loading, setLoading] = useState(false)
  const [parserLog, setParserLog] = useState('')
  const [bookSearch, setBookSearch] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/auth'); return }
    const u = JSON.parse(userData)
    if (u.role !== 'ADMIN') { router.push('/'); return }
    loadData()
  }, [])

  const loadData = async () => {
    await Promise.all([loadUsers(), loadBooks(), loadStats()])
  }

  const loadUsers  = async () => { const r = await fetch('/api/admin/users'); if (r.ok) setUsers(await r.json()) }
  const loadBooks  = async () => { const r = await fetch('/api/books');        if (r.ok) setBooks((await r.json()).books) }
  const loadStats  = async () => { const r = await fetch('/api/admin/stats');  if (r.ok) setStats(await r.json()) }

  const changeUserRole = async (userId: string, newRole: string) => {
    setLoading(true)
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole })
    })
    await loadUsers()
    setLoading(false)
  }

  const deleteBook = async (bookId: string) => {
    if (!confirm('Удалить книгу? Это действие нельзя отменить.')) return
    await fetch(`/api/books/${bookId}`, { method: 'DELETE' })
    await Promise.all([loadBooks(), loadStats()])
  }

  const runParser = async () => {
    setLoading(true)
    setParserLog('Запуск парсинга...')
    const res = await fetch('/api/admin/parse', { method: 'POST' })
    const data = await res.json()
    setParserLog(data.message || 'Готово')
    await Promise.all([loadBooks(), loadStats()])
    setLoading(false)
  }

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearch.toLowerCase())
  )

  if (!stats) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))' }}
      >
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--accent)', animation: 'spin-slow 1s linear infinite' }}
        />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen py-10 px-6"
      style={{ background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8" style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
          <h1
            className="text-4xl font-bold font-[Cinzel]"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--text-primary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Административная панель
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Управление библиотекой Genshin Impact
          </p>
        </div>

        {/* Вкладки */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2 rounded-xl font-medium transition-all hover:scale-105 text-sm"
              style={{
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-dim))'
                  : 'color-mix(in srgb, var(--bg-card) 70%, transparent)',
                color: activeTab === tab.key ? '#1a120b' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.key ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {tab.label}
              {tab.key === 'users' && ` (${users.length})`}
              {tab.key === 'books' && ` (${books.length})`}
            </button>
          ))}
        </div>

        {/* АНАЛИТИКА */}
        {activeTab === 'analytics' && (
          <div className="space-y-6" style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: stats.metrics.users,     label: 'Пользователей' },
                { value: stats.metrics.books,     label: 'Книг' },
                { value: stats.metrics.favorites, label: 'В избранном' },
                { value: stats.metrics.collected, label: 'Собранных' },
              ].map(m => (
                <div
                  key={m.label}
                  className="rounded-2xl p-6 text-center border"
                  style={{
                    background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-deep))',
                    borderColor: 'var(--border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{m.value}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-6 border"
              style={{
                background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-deep))',
                borderColor: 'var(--border)',
              }}
            >
              <h2 className="text-lg font-bold mb-4 font-[Cinzel]" style={{ color: 'var(--accent)' }}>
                Книги по регионам
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.booksByRegion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="region" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card-deep)',
                      border: '1px solid var(--accent)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} name="Книг" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              className="rounded-2xl p-6 border"
              style={{
                background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-deep))',
                borderColor: 'var(--border)',
              }}
            >
              <h2 className="text-lg font-bold mb-4 font-[Cinzel]" style={{ color: 'var(--accent)' }}>
                Пользователи по ролям
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.usersByRole}
                    dataKey="count"
                    nameKey="role"
                    cx="50%" cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.usersByRole.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card-deep)',
                      border: '1px solid var(--accent)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ПОЛЬЗОВАТЕЛИ */}
        {activeTab === 'users' && (
          <div
            className="rounded-2xl border overflow-hidden shadow-xl"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', animation: 'fadeInUp 0.4s ease forwards' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b" style={{ background: 'var(--bg-card-deep)', borderColor: 'var(--border)' }}>
                  <tr>
                    {['Имя', 'Email', 'Роль', 'Дата', 'Действия'].map(h => (
                      <th key={h} className="p-4 text-left text-sm font-bold" style={{ color: 'var(--accent)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr
                      key={u.id}
                      className="border-b transition"
                      style={{ borderColor: 'var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 5%, transparent)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="p-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', color: '#1a120b' }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={e => changeUserRole(u.id, e.target.value)}
                          disabled={loading}
                          className="rounded-lg px-3 py-1.5 text-sm border outline-none"
                          style={{
                            background: 'var(--bg-input)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <option value="USER">Пользователь</option>
                          <option value="ADMIN">Администратор</option>
                        </select>
                      </td>
                      <td className="p-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(u.createdAt).toLocaleDateString('ru')}
                      </td>
                      <td className="p-4">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => changeUserRole(u.id, 'ADMIN')}
                            className="text-xs transition hover:scale-105"
                            style={{ color: 'var(--accent)' }}
                            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                          >
                            Сделать админом
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* КНИГИ */}
        {activeTab === 'books' && (
          <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 Поиск книги..."
                value={bookSearch}
                onChange={e => setBookSearch(e.target.value)}
                className="w-full max-w-sm px-4 py-2.5 rounded-xl border outline-none text-sm"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div
              className="rounded-2xl border overflow-hidden shadow-xl"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b" style={{ background: 'var(--bg-card-deep)', borderColor: 'var(--border)' }}>
                    <tr>
                      {['Название', 'Автор', 'Регион', 'Действия'].map(h => (
                        <th key={h} className="p-4 text-left text-sm font-bold" style={{ color: 'var(--accent)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map(b => (
                      <tr
                        key={b.id}
                        className="border-b transition"
                        style={{ borderColor: 'var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 5%, transparent)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="p-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                          <Link href={`/book/${b.id}`} className="hover:underline" style={{ color: 'var(--accent)' }}>
                            {b.title}
                          </Link>
                        </td>
                        <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{b.author}</td>
                        <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{b.region}</td>
                        <td className="p-4">
                          <button
                            onClick={() => deleteBook(b.id)}
                            className="px-3 py-1 rounded-lg text-xs border transition hover:scale-105"
                            style={{
                              background: 'transparent',
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ОТЧЁТЫ */}
        {activeTab === 'reports' && stats && (
          <div
            className="rounded-2xl border p-8 shadow-xl"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              animation: 'fadeInUp 0.4s ease forwards',
            }}
          >
            <h2 className="text-xl font-bold font-[Cinzel] mb-6" style={{ color: 'var(--accent)' }}>
              Экспорт отчётов
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: 'Экспорт аналитики (JSON)',
                  action: () => {
                    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' })
                    const a = Object.assign(document.createElement('a'), {
                      href: URL.createObjectURL(blob),
                      download: `analytics_${new Date().toISOString()}.json`,
                    })
                    a.click()
                    URL.revokeObjectURL(a.href)
                  },
                },
                {
                  label: 'Книги по регионам (CSV)',
                  action: () => {
                    let csv = 'Регион,Количество книг\n'
                    stats.booksByRegion.forEach(r => (csv += `${r.region},${r.count}\n`))
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                    const a = Object.assign(document.createElement('a'), {
                      href: URL.createObjectURL(blob),
                      download: `books_by_region_${new Date().toISOString()}.csv`,
                    })
                    a.click()
                    URL.revokeObjectURL(a.href)
                  },
                },
                {
                  label: 'Список пользователей (CSV)',
                  action: () => {
                    let csv = 'Имя,Email,Роль,Дата\n'
                    users.forEach(u => (csv += `"${u.name}","${u.email}","${u.role}","${new Date(u.createdAt).toLocaleDateString('ru')}"\n`))
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                    const a = Object.assign(document.createElement('a'), {
                      href: URL.createObjectURL(blob),
                      download: `users_${new Date().toISOString()}.csv`,
                    })
                    a.click()
                    URL.revokeObjectURL(a.href)
                  },
                },
                {
                  label: 'Список книг (CSV)',
                  action: () => {
                    let csv = 'Название,Автор,Регион\n'
                    books.forEach(b => (csv += `"${b.title}","${b.author}","${b.region}"\n`))
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                    const a = Object.assign(document.createElement('a'), {
                      href: URL.createObjectURL(blob),
                      download: `books_${new Date().toISOString()}.csv`,
                    })
                    a.click()
                    URL.revokeObjectURL(a.href)
                  },
                },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  className="p-5 rounded-xl border text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--bg-card-deep)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <span className="font-medium" style={{ color: 'var(--accent)' }}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ПАРСИНГ */}
        {activeTab === 'parser' && (
          <div
            className="rounded-2xl border p-8 shadow-xl text-center"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              animation: 'fadeInUp 0.4s ease forwards',
            }}
          >
            <h2 className="text-xl font-bold font-[Cinzel] mb-2" style={{ color: 'var(--accent)' }}>
              Запуск парсинга книг
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Автоматический сбор книг с вики-источников Genshin Impact
            </p>
            <button
              onClick={runParser}
              disabled={loading}
              className="px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                color: '#1a120b',
                boxShadow: loading ? 'none' : '0 0 20px var(--glow)',
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-[#1a120b] border-t-transparent animate-spin" />
                  Парсинг...
                </span>
              ) : 'Запустить парсинг'}
            </button>
            {parserLog && (
              <div
                className="mt-6 px-5 py-4 rounded-xl text-sm text-left"
                style={{
                  background: 'var(--bg-card-deep)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                }}
              >
                {parserLog}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  )
}
