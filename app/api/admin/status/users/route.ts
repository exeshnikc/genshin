import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_key_12345'

function isAdmin(request: Request): boolean {
  const cookie = request.headers.get('cookie')
  const token = cookie?.split('token=')[1]?.split(';')[0]
  if (!token) return false
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any
    return decoded.role === 'ADMIN'
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  })
  return NextResponse.json(users)
}

export async function PUT(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const { userId, role } = await request.json()
  await prisma.user.update({
    where: { id: userId },
    data: { role }
  })
  return NextResponse.json({ success: true })
}