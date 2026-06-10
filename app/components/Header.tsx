'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <nav style={{
      background: '#1a1a2e',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid #d4af37'
    }}>
      <Link href="/" style={{ color: '#d4af37', fontSize: '1.5rem', textDecoration: 'none' }}>
        📚 Genshin Library
      </Link>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Главная</Link>
        <Link href="/catalog" style={{ color: 'white', textDecoration: 'none' }}>Каталог</Link>
      </div>
    </nav>
  );
}