import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const region = searchParams.get('region') || ''

    const where: any = {}

    if (search) {
      where.title = { contains: search }
    }

    if (region && region !== 'Все') {
      where.region = region
    }

    const books = await prisma.book.findMany({ where })
    return NextResponse.json(books)
  } catch (error) {
    console.error('Ошибка API:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}