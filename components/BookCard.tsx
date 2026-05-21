'use client'

import Link from 'next/link'

interface BookCardProps {
  id: string
  title: string
  author: string
  region: string
  coverUrl: string
}

export default function BookCard({ id, title, author, region, coverUrl }: BookCardProps) {
  // Функция для получения цвета региона
  const getRegionColor = (region: string) => {
    const colors: Record<string, string> = {
      'Мондштадт': 'from-green-600/30 to-green-800/30',
      'Ли Юэ': 'from-yellow-600/30 to-orange-800/30',
      'Инадзума': 'from-purple-600/30 to-pink-800/30',
      'Сумеру': 'from-emerald-600/30 to-teal-800/30',
      'Фонтейн': 'from-blue-500/30 to-cyan-700/30',
    }
    return colors[region] || 'from-gray-600/30 to-gray-800/30'
  }

  return (
    <div className={`book-card bg-gradient-to-b ${getRegionColor(region)} bg-[#2f241b] rounded-xl overflow-hidden shadow-2xl border border-[#e4b574]/30 backdrop-blur-sm`}>
      <div className="relative h-48 bg-gradient-to-b from-[#e4b574]/20 to-transparent">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-[#e4b574]/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4V6zm2-4h12v2H6V2zm16 4H2v16h20V6zM4 8h16v10H4V8z"/>
              </svg>
              <span className="text-[#e4b574] text-sm mt-2 block">{title}</span>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 bg-[#e4b574]/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-[#e4b574] text-xs">✦</span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-[#e4b574] mb-1 font-[Cinzel]">{title}</h3>
        <p className="text-[#b98b5f] text-sm mb-1">Автор: {author}</p>
        <p className="text-[#b98b5f] text-sm mb-4">Регион: {region}</p>
        
        <Link href={`/book/${id}`}>
          <button className="btn-gold btn-shimmer w-full text-[#1a120b] font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
            <span>📖</span>
            Читать
          </button>
        </Link>
      </div>
    </div>
  )
}