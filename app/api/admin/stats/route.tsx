import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_key_12345'

interface DecodedToken {
  id: string
  email: string
  role: string
}

function isAdmin(request: Request): boolean {
  const cookie = request.headers.get('cookie')
  const token = cookie?.split('token=')[1]?.split(';')[0]
  if (!token) return false
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken
    return decoded.role === 'ADMIN'
  } catch {
    return false
  }
}

interface BookGroup {
  region: string
  _count: { region: number }
}

interface UserGroup {
  role: string
  _count: { role: number }
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  const [usersCount, booksCount, favoritesCount, collectedCount] = await Promise.all([
    prisma.user.count(),
    prisma.book.count(),
    prisma.favorite.count(),
    prisma.collected.count()
  ])

  const booksByRegionRaw: BookGroup[] = await prisma.book.groupBy({
    by: ['region'],
    _count: { region: true }
  })

  const usersByRoleRaw: UserGroup[] = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true }
  })

  const booksByRegion = booksByRegionRaw.map((item: BookGroup) => ({ 
    region: item.region, 
    count: item._count.region 
  }))

  const usersByRole = usersByRoleRaw.map((item: UserGroup) => ({ 
    role: item.role, 
    count: item._count.role 
  }))

  return NextResponse.json({
    metrics: {
      users: usersCount,
      books: booksCount,
      favorites: favoritesCount,
      collected: collectedCount
    },
    booksByRegion,
    usersByRole,
    activity: []
  })
}