'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('/api/books').then(res => res.json()).then(data => setBooks(data.books || []));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1030]">
      <div className="relative h-[70vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://static.wikia.nocookie.net/gensin-impact/images/4/4f/Liyue_Harbor.png')] bg-cover bg-center opacity-30" />
        <div className="relative z-10">
          <h1 className="text-6xl md:text-7xl font-serif bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-4">
            Библиотека Teyvat
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Все книги, легенды и сказания мира Genshin Impact
          </p>
          <Link href="/catalog" className="px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-full text-white font-semibold transition">
            Начать чтение
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-serif text-amber-400 text-center mb-12">Популярные книги</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {books.slice(0, 10).map((book: any) => (
            <Link key={book.id} href={`/book/${book.id}`} 
                  className="group bg-white/5 backdrop-blur rounded-xl overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition">
              <div className="h-48 bg-gradient-to-br from-amber-900/30 to-purple-900/30 flex items-center justify-center">
                <span className="text-5xl group-hover:scale-110 transition">📖</span>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-amber-400 truncate">{book.title}</h3>
                <p className="text-xs text-gray-400 truncate">{book.author}</p>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-amber-500/20 rounded-full text-amber-400">
                  {book.region}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}