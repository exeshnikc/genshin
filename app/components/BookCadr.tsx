'use client';
import Image from 'next/image';
import Link from 'next/link';

export function BookCard({ book }) {
    // Пока нет реальных обложек, используем заглушку со стилем
    const coverImg = book.coverUrl || '/genshin-book-placeholder.jpg';
    
    return (
        <Link href={`/books/${book.id}`} className="book-card group">
            <div className="book-cover bg-gradient-to-br from-amber-900/20 to-stone-800/20">
                {/* Картинка-заглушка в стиле Геншина */}
                <div className="w-full h-full flex items-center justify-center text-center p-4">
                    <span className="text-amber-600/50 font-serif text-sm group-hover:scale-105 transition">📖 {book.title}</span>
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-serif font-bold text-lg truncate text-amber-800 dark:text-amber-400">{book.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{book.author}</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300">
                    {book.region}
                </span>
            </div>
        </Link>
    );
}