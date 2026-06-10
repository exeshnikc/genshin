'use client'
import { useState } from 'react'

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
    const payload = isLogin ? { email, password } : { email, password, name }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (res.ok) {
      document.cookie = `token=${data.token}; path=/; max-age=604800`
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.reload()
    } else {
      alert(data.error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="rounded-2xl p-8 w-96 border shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <h2 className="text-2xl font-bold font-[Cinzel] text-center mb-6" style={{ color: 'var(--accent)' }}>
          {isLogin ? 'Добро пожаловать' : 'Регистрация'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text" placeholder="Имя" value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required
            />
          )}
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border outline-none"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            required
          />
          <input
            type="password" placeholder="Пароль" value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border outline-none"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', color: '#1a120b' }}
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--accent)' }}>
            {isLogin ? 'Создать' : 'Войти'}
          </button>
        </p>
        <button onClick={onClose} className="absolute top-4 right-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          ✕
        </button>
      </div>
    </div>
  )
}
