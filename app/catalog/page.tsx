'use client'

import { useState, useEffect } from 'react'
import BookCard from '@/components/BookCard'
import { useRouter } from 'next/navigation'

export default function CatalogPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/') }, [])
  return null
}
