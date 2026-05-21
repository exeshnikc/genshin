'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
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
  metrics: {
    users: number
    books: number
    favorites: number
    collected: number
  }
  booksByRegion: { region: string; count: number }[]
  usersByRole: { role: string; count: number }[]
  activity: { date: string; count: number }[]
}

const COLORS = ['#e4b574', '#c49a4a', '#b98b5f', '#d4a564', '#f0e0c0']

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState('analytics')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth')
      return
    }
    const user = JSON.parse(userData)
    if (user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    await Promise.all([loadUsers(), loadBooks(), loadStats()])
  }

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
  }

  const loadBooks = async () => {
    const res = await fetch('/api/books')
    if (res.ok) setBooks(await res.json())
  }

  const loadStats = async () => {
    const res = await fetch('/api/admin/stats')
    if (res.ok) setStats(await res.json())
  }

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
    if (!confirm('Удалить книгу?')) return
    await fetch(`/api/books/${bookId}`, { method: 'DELETE' })
    await loadBooks()
    await loadStats()
  }

  const runParser = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/parse', { method: 'POST' })
    const data = await res.json()
    alert(data.message)
    await loadBooks()
    await loadStats()
    setLoading(false)
  }

  if (!stats) return <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0805] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#e4b574] border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0805] py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold font-[Cinzel] text-center bg-gradient-to-r from-[#e4b574] to-[#f0e0c0] bg-clip-text text-transparent mb-8">
          Административная панель
        </h1>

        {/* Навигация */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {['analytics', 'users', 'books', 'reports', 'parser'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl font-medium transition ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[#e4b574] to-[#c49a4a] text-[#1a120b]'
                  : 'bg-[#2f241b]/50 border border-[#e4b574]/30 text-[#b98b5f] hover:bg-[#e4b574]/10'
              }`}
            >
              {tab === 'analytics' && 'Аналитика'}
              {tab === 'users' && `Пользователи (${users.length})`}
              {tab === 'books' && `Книги (${books.length})`}
              {tab === 'reports' && 'Отчёты'}
              {tab === 'parser' && 'Парсинг'}
            </button>
          ))}
        </div>

        {/* Аналитика */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-6 text-center border border-[#e4b574]/20">
                <div className="text-4xl font-bold text-[#e4b574]">{stats.metrics.users}</div>
                <div className="text-[#b98b5f] mt-1">Пользователей</div>
              </div>
              <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-6 text-center border border-[#e4b574]/20">
                <div className="text-4xl font-bold text-[#e4b574]">{stats.metrics.books}</div>
                <div className="text-[#b98b5f] mt-1">Книг</div>
              </div>
              <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-6 text-center border border-[#e4b574]/20">
                <div className="text-4xl font-bold text-[#e4b574]">{stats.metrics.favorites}</div>
                <div className="text-[#b98b5f] mt-1">В избранном</div>
              </div>
              <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-6 text-center border border-[#e4b574]/20">
                <div className="text-4xl font-bold text-[#e4b574]">{stats.metrics.collected}</div>
                <div className="text-[#b98b5f] mt-1">Собранных книг</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-6 border border-[#e4b574]/20">
              <h2 className="text-xl font-bold text-[#e4b574] mb-4">Книги по регионам</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.booksByRegion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#b98b5f" opacity={0.3} />
                  <XAxis dataKey="region" stroke="#b98b5f" />
                  <YAxis stroke="#b98b5f" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f1812', borderColor: '#e4b574', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#e4b574" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-6 border border-[#e4b574]/20">
              <h2 className="text-xl font-bold text-[#e4b574] mb-4">Пользователи по ролям</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.usersByRole} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={100} label>
                    {stats.usersByRole.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f1812', borderColor: '#e4b574', borderRadius: '12px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Пользователи */}
        {activeTab === 'users' && (
          <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl border border-[#e4b574]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a120b] border-b border-[#e4b574]/20">
                  <tr>
                    <th className="p-4 text-left text-[#e4b574]">Имя</th>
                    <th className="p-4 text-left text-[#e4b574]">Email</th>
                    <th className="p-4 text-left text-[#e4b574]">Роль</th>
                    <th className="p-4 text-left text-[#e4b574]">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-[#e4b574]/10 hover:bg-[#e4b574]/5">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4 text-[#b98b5f]">{user.email}</td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => changeUserRole(user.id, e.target.value)}
                          disabled={loading}
                          className="bg-[#1a120b] border border-[#b98b5f] rounded-lg px-3 py-1 text-[#f0e0c0] focus:border-[#e4b574] focus:outline-none"
                        >
                          <option value="USER">Пользователь</option>
                          <option value="ADMIN">Администратор</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => changeUserRole(user.id, 'ADMIN')}
                            className="text-[#e4b574] hover:underline"
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

        {/* Книги */}
        {activeTab === 'books' && (
          <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl border border-[#e4b574]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a120b] border-b border-[#e4b574]/20">
                  <tr>
                    <th className="p-4 text-left text-[#e4b574]">Название</th>
                    <th className="p-4 text-left text-[#e4b574]">Автор</th>
                    <th className="p-4 text-left text-[#e4b574]">Регион</th>
                    <th className="p-4 text-left text-[#e4b574]">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id} className="border-b border-[#e4b574]/10 hover:bg-[#e4b574]/5">
                      <td className="p-4">{book.title}</td>
                      <td className="p-4 text-[#b98b5f]">{book.author}</td>
                      <td className="p-4 text-[#b98b5f]">{book.region}</td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteBook(book.id)}
                          className="px-4 py-1 bg-[#2f241b] border border-[#b98b5f] rounded-lg text-[#b98b5f] hover:border-red-500 hover:text-red-500 transition"
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
        )}

        {/* Отчёты */}
        {activeTab === 'reports' && (
          <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-8 border border-[#e4b574]/20">
            <h2 className="text-xl font-bold text-[#e4b574] mb-6">Экспорт отчётов</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => {
                  const data = JSON.stringify(stats, null, 2)
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `report_${new Date().toISOString()}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="p-4 bg-[#1a120b] border border-[#e4b574]/30 rounded-xl text-[#e4b574] hover:border-[#e4b574] hover:bg-[#e4b574]/10 transition"
              >
                Экспорт аналитики (JSON)
              </button>
              <button
                onClick={() => {
                  let csv = "Регион,Количество книг\n"
                  stats.booksByRegion.forEach(r => csv += `${r.region},${r.count}\n`)
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `books_by_region_${new Date().toISOString()}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="p-4 bg-[#1a120b] border border-[#e4b574]/30 rounded-xl text-[#e4b574] hover:border-[#e4b574] hover:bg-[#e4b574]/10 transition"
              >
                Экспорт книг по регионам (CSV)
              </button>
            </div>
          </div>
        )}

        {/* Парсинг */}
        {activeTab === 'parser' && (
          <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-8 border border-[#e4b574]/20 text-center">
            <h2 className="text-xl font-bold text-[#e4b574] mb-4">Запуск парсинга книг</h2>
            <p className="text-[#b98b5f] mb-6">Нажмите кнопку, чтобы запустить сбор книг с вики-сайтов (демо-режим)</p>
            <button
              onClick={runParser}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-[#e4b574] to-[#c49a4a] rounded-xl text-[#1a120b] font-bold hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'Запустить парсинг'}
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-[#b98b5f] hover:text-[#e4b574] transition">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  )
}