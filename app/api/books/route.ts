import { NextResponse } from 'next/server';
import * as genshindb from 'genshin-db';

export async function GET() {
  try {
    const books = genshindb.books('all', { matchCategories: true, verbose: false });
    
    const formatted = books.map((book: any) => ({
      id: book.id,
      title: book.name,
      author: book.author || 'Неизвестный автор',
      region: book.region || 'Teyvat',
      description: book.description,
      coverUrl: book.cover || null
    }));
    
    return NextResponse.json({ books: formatted });
  } catch (error) {
    return NextResponse.json({ books: [] });
  }
}