import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const region = searchParams.get('region') || ''

  const books = await prisma.book.findMany({
    where: {
      AND: [
        search
          ? { OR: [{ title: { contains: search } }, { author: { contains: search } }] }
          : {},
        region && region !== 'Все' ? { region } : {},
      ],
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true, author: true, region: true, coverUrl: true },
  })

  return NextResponse.json({ books })
}
