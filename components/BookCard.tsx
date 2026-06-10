'use client'

import Link from 'next/link'

interface BookCardProps {
  id: string
  title: string
  author: string
  region: string
  coverUrl: string
}

const REGION_COLORS: Record<string, { from: string; to: string }> = {
  'Мондштадт': { from: 'rgba(34,197,94,0.25)', to: 'rgba(21,128,61,0.25)' },
  'Ли Юэ':    { from: 'rgba(234,179,8,0.25)',  to: 'rgba(202,138,4,0.25)' },
  'Инадзума':  { from: 'rgba(168,85,247,0.25)', to: 'rgba(219,39,119,0.25)' },
  'Сумеру':    { from: 'rgba(16,185,129,0.25)', to: 'rgba(20,184,166,0.25)' },
  'Фонтейн':   { from: 'rgba(59,130,246,0.25)', to: 'rgba(6,182,212,0.25)' },
  'Натлан':    { from: 'rgba(239,68,68,0.25)',  to: 'rgba(234,88,12,0.25)' },
  'Снежная':   { from: 'rgba(147,197,253,0.25)', to: 'rgba(186,230,253,0.25)' },
}

export default function BookCard({ id, title, author, region, coverUrl }: BookCardProps) {
  const colors = REGION_COLORS[region] || { from: 'rgba(100,100,100,0.2)', to: 'rgba(50,50,50,0.2)' }

  return (
    <div
      className="book-card rounded-xl overflow-hidden shadow-xl border"
      style={{
        background: `linear-gradient(160deg, color-mix(in srgb, var(--bg-card) 85%, transparent), var(--bg-card)), linear-gradient(160deg, ${colors.from}, ${colors.to})`,
        borderColor: 'var(--border)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="relative h-52 overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${colors.from}, ${colors.to})` }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
            <svg
              className="w-14 h-14 opacity-50"
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--accent)' }}
            >
              <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
            </svg>
            <span className="text-center text-xs font-medium leading-tight" style={{ color: 'var(--accent)' }}>
              {title}
            </span>
          </div>
        )}

        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to top, var(--bg-card), transparent)' }}
        />
      </div>

      <div className="p-4">
        <h3
          className="text-lg font-bold font-[Cinzel] mb-1 line-clamp-2 leading-snug"
          style={{ color: 'var(--accent)' }}
        >
          {title}
        </h3>
        <p className="text-xs mb-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
          {author}
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          {region}
        </p>

        <Link href={`/book/${id}`}>
          <button
            className="btn-gold btn-shimmer w-full font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm"
            style={{ color: '#1a120b' }}
          >
            Читать
          </button>
        </Link>
      </div>
    </div>
  )
}
