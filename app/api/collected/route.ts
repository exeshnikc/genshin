import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_key_12345'

function getUserId(request: Request): string | null {
  const cookie = request.headers.get('cookie')
  const token = cookie?.split('token=')[1]?.split(';')[0]
  if (!token) return null
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any
    return decoded.id
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const collected = await prisma.collected.findMany({
    where: { userId },
    include: { book: true }
  })

  return NextResponse.json(collected.map(c => c.book))
}

export async function POST(request: Request) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const { bookId } = await request.json()

  const existing = await prisma.collected.findFirst({
    where: { userId, bookId }
  })

  if (existing) {
    await prisma.collected.delete({ where: { id: existing.id } })
    return NextResponse.json({ added: false })
  } else {
    await prisma.collected.create({
      data: { userId, bookId }
    })
    return NextResponse.json({ added: true })
  }
}