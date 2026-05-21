import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const book = await prisma.book.findUnique({
      where: { id }
    })
    
    if (!book) {
      return NextResponse.json({ error: 'Книга не найдена' }, { status: 404 })
    }
    
    return NextResponse.json(book)
  } catch (error) {
    console.error('Ошибка API:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}