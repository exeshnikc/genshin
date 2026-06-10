import { NextResponse } from 'next/server';
import * as genshindb from 'genshin-db';

export async function GET() {
    try {
        // Получаем все книги из библиотеки genshin-db
        // Сортируем по регионам для удобства
        const allBooks = genshindb.books('all', { matchCategories: true });
        
        // Приводим к формату для фронта
        const formattedBooks = allBooks.map(book => ({
            id: book.id,
            title: book.name,
            author: book.author || 'Неизвестный автор',
            region: book.region || 'Teyvat',
            coverUrl: `/covers/${book.id}.png`, // Плейсхолдер
            description: book.description
        }));

        return NextResponse.json({ books: formattedBooks });
    } catch (error) {
        console.error(error);
        // Фолбэк: если пакет не нашел, возвращаем структуру для отладки
        return NextResponse.json({ books: [], error: "Data source error" }, { status: 500 });
    }
}