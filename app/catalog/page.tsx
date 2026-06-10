'use client';

import { useState, useEffect } from 'react';
import BookCard from '@/components/BookCard';

interface Book {
  id: string;
  title: string;
  author: string;
  region: string;
  coverUrl: string | null;
}

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [search, region]);

  const fetchBooks = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (region) params.append('region', region);
    
    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    setBooks(data.books || []);
    setLoading(false);
  };

  return (
    <div className="catalog-container">
      <h1 className="section-title">Каталог книг</h1>
      
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Поиск книг..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-gold" onClick={fetchBooks}>Поиск</button>
        </div>
        
        <div className="filters">
          <select className="filter-select" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Все регионы</option>
            <option value="Мондштадт">Мондштадт</option>
            <option value="Ли Юэ">Ли Юэ</option>
            <option value="Инадзума">Инадзума</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Книги не найдены</p>
          <button className="btn btn-gold" onClick={() => window.location.href = '/admin'}>Запустить парсинг</button>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}