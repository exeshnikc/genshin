import { NextResponse } from 'next/server'
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

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }

  await new Promise(resolve => setTimeout(resolve, 2000))

  return NextResponse.json({ 
    message: 'Парсинг завершён (демо-режим).'
  })
}