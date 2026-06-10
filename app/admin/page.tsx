'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const seedBooks = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/seed', { method: 'POST' });
    const data = await res.json();
    setMessage(data.message);
    setLoading(false);
  };

  return (
    <div className="admin-container">
      <h1 className="section-title">Админ панель</h1>
      
      <div className="admin-tabs">
        <button className="admin-tab active">Парсинг</button>
      </div>

      <div className="admin-panel active">
        <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem' }}>
          <h2 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Загрузка книг</h2>
          <p>Нажмите кнопку, чтобы добавить все книги из игры Genshin Impact в базу данных.</p>
          <button 
            className="btn btn-gold" 
            onClick={seedBooks} 
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Загрузка...' : '📚 Загрузить все книги'}
          </button>
          {message && <p style={{ marginTop: '1rem', color: 'var(--gold)' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
