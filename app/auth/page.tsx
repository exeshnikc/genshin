'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url = isLogin ? '/api/auth/login' : '/api/auth/register'
    const body = isLogin ? { email, password } : { name, email, password }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка')
      }

      if (isLogin) {
        document.cookie = `token=${data.token}; path=/; max-age=604800`
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/')
      } else {
        setIsLogin(true)
        setError('Регистрация успешна! Теперь войдите')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0805] flex items-center justify-center py-12 px-8">
      <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl p-8 max-w-md w-full border border-[#e4b574]/20 shadow-2xl">
        <h1 className="text-3xl font-bold font-[Cinzel] text-center bg-gradient-to-r from-[#e4b574] to-[#f0e0c0] bg-clip-text text-transparent mb-6">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-[#b98b5f] mb-1 text-sm">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a120b] border border-[#e4b574]/30 rounded-xl text-[#f0e0c0] focus:outline-none focus:border-[#e4b574] focus:ring-1 focus:ring-[#e4b574] transition"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[#b98b5f] mb-1 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a120b] border border-[#e4b574]/30 rounded-xl text-[#f0e0c0] focus:outline-none focus:border-[#e4b574] focus:ring-1 focus:ring-[#e4b574] transition"
              required
            />
          </div>

          <div>
            <label className="block text-[#b98b5f] mb-1 text-sm">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a120b] border border-[#e4b574]/30 rounded-xl text-[#f0e0c0] focus:outline-none focus:border-[#e4b574] focus:ring-1 focus:ring-[#e4b574] transition"
              required
            />
          </div>

          {error && (
            <div className={`text-sm ${error.includes('успешна') ? 'text-green-500' : 'text-red-400'}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#e4b574] to-[#c49a4a] rounded-xl text-[#1a120b] font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#b98b5f] hover:text-[#e4b574] transition"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </div>
    </div>
  )
}