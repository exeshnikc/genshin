'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setShowAuth(false);
      window.location.reload();
    } else {
      alert(data.error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="logo">📚 Библиотека Teyvat</Link>
        <div className="nav-links">
          <Link href="/">Главная</Link>
          <Link href="/catalog">Каталог</Link>
          {user && <Link href="/admin">Админ</Link>}
          {user ? (
            <>
              <span style={{ color: 'var(--gold)' }}>{user.name}</span>
              <button className="btn btn-outline" onClick={logout}>Выйти</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => { setIsLogin(true); setShowAuth(true); }}>Войти</button>
              <button className="btn btn-gold" onClick={() => { setIsLogin(false); setShowAuth(true); }}>Регистрация</button>
            </>
          )}
        </div>
      </nav>

      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
              )}
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
              {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
              <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}