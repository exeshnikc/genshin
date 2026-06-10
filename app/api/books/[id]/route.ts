import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const book = await prisma.book.findUnique({ where: { id: params.id } })
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(book)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.favorite.deleteMany({ where: { bookId: params.id } })
  await prisma.collected.deleteMany({ where: { bookId: params.id } })
  await prisma.book.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
