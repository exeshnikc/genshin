'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  region: string
  content: string
}

export default function BookPage() {
  const { id } = useParams()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/books/${id}`)
      .then(res => res.json())
      .then(data => {
        setBook(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0805] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e4b574] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0805] flex flex-col items-center justify-center">
        <p className="text-[#b98b5f] text-lg mb-4">Книга не найдена</p>
        <Link href="/" className="px-6 py-2 bg-gradient-to-r from-[#e4b574] to-[#c49a4a] rounded-xl text-[#1a120b] font-bold hover:scale-105 transition">
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0a] to-[#0d0805] py-12 px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-block mb-6 text-[#b98b5f] hover:text-[#e4b574] transition">
          ← Вернуться в каталог
        </Link>

        <div className="bg-gradient-to-br from-[#2f241b] to-[#1f1812] rounded-2xl border border-[#e4b574]/20 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#e4b574]/10 to-transparent p-8 border-b border-[#e4b574]/20">
            <h1 className="text-4xl font-bold font-[Cinzel] text-[#e4b574]">{book.title}</h1>
            <div className="flex gap-4 mt-3 text-[#b98b5f]">
              <span>Автор: {book.author}</span>
              <span>Регион: {book.region}</span>
            </div>
          </div>

          <div className="p-8">
            <div className="reader-content prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: book.content }} />
          </div>
        </div>
      </div>
    </div>
  )
}