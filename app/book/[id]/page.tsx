'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  region: string
  content: string
}

interface Tooltip {
  term: string
  x: number
  y: number
  explanation: string | null
  loading: boolean
}

// Известные термины Genshin Impact
const GENSHIN_TERMS: Record<string, string> = {
  'Тейват': 'Мир, в котором происходят события Genshin Impact. Состоит из семи регионов, каждым из которых управляет Архонт.',
  'Архонт': 'Бог-покровитель региона в мире Тейвата. Каждый Архонт обладает Гнозисом — символом власти, дарованным Небом.',
  'Гнозис': 'Кубический символ силы, принадлежащий каждому Архонту. Олицетворяет их связь с Небом.',
  'Паймон': 'Верный спутник Путешественника, маленькое загадочное существо с белыми волосами и фиолетовым нарядом.',
  'Мондштадт': 'Город Ветра, управляемый Архонтом Ветра — Барбатосом (Вэнти). Известен виноделием и поклонением ветру.',
  'Ли Юэ': 'Гавань Прилива, управляемая Архонтом Гео — Морахом (Чжун Ли). Центр торговли и культуры.',
  'Инадзума': 'Страна Вечности, управляемая Архонтом Электро — Баал (Рэйдэн Сёгун). Изолирована от внешнего мира.',
  'Сумеру': 'Страна Мудрости, управляемая Архонтом Дендро — Меньей. Центр науки и Академии.',
  'Фонтейн': 'Страна Справедливости, управляемая Архонтом Гидро. Известна своей системой судопроизводства.',
  'Натлан': 'Страна Войны, управляемая Архонтом Пиро. Родина народа с пламенными способностями.',
  'Снежная': 'Суровое северное государство. Управляется царицей-архонтом Царицей Снежной.',
  'Путешественник': 'Главный герой игры, прибывший в Тейват из другого мира.',
  'Видение': 'Кристаллический артефакт, позволяющий своему владельцу использовать силу одной из семи стихий.',
  'Стихия': 'Одна из семи природных сил Тейвата: Анемо, Гео, Электро, Дендро, Гидро, Пиро, Крио.',
  'Анемо': 'Стихия Ветра. Соответствует богу Барбатосу в Мондштадте.',
  'Гео': 'Стихия Земли. Соответствует богу Морахсу в Ли Юэ.',
  'Электро': 'Стихия Молнии. Соответствует богине Баал в Инадзуме.',
  'Дендро': 'Стихия Природы. Соответствует богу в Сумеру.',
  'Гидро': 'Стихия Воды. Соответствует богу во Фонтейне.',
  'Пиро': 'Стихия Огня. Соответствует богу в Натлане.',
  'Крио': 'Стихия Льда. Соответствует богу в Снежной.',
  'Абисс': 'Таинственная тьма, противостоящая Тейвату. Источник монстров — Абиссальный Орден.',
  'Хранитель Бездны': 'Мощный монстр из Бездны, охраняющий её владения.',
  'Блеск': 'Уникальная категория персонажей или предметов высочайшей ценности в Тейвате.',
  'Рэйдэн Сёгун': 'Правительница Инадзумы, Электро Архонт, стремящаяся к Вечности.',
  'Чжун Ли': 'Бывший Гео Архонт Морах, проживающий в Ли Юэ под обличием смертного.',
  'Вэнти': 'Анемо Архонт Барбатос, странствующий бард Мондштадта.',
  'Барбатос': 'Архонт Ветра, покровитель Мондштадта, один из семи Архонтов Тейвата.',
  'Морах': 'Гео Архонт, бывший правитель Ли Юэ, один из старейших Архонтов.',
}

function highlightTerms(html: string): string {
  const sortedTerms = Object.keys(GENSHIN_TERMS).sort((a, b) => b.length - a.length)
  const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')

  // Replace only in text nodes, not inside tags or existing spans
  return html.replace(/>([^<]+)</g, (match, text) => {
    const highlighted = text.replace(pattern, (term: string) => {
      const key = Object.keys(GENSHIN_TERMS).find(k => k.toLowerCase() === term.toLowerCase())
      if (!key) return term
      return `<span class="term" data-term="${key}">${term}</span>`
    })
    return `>${highlighted}<`
  })
}

export default function BookPage() {
  const { id } = useParams()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const [readingProgress, setReadingProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/books/${id}`)
      .then(r => r.json())
      .then(data => { setBook(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  // Трекинг прогресса чтения
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return
      const el = contentRef.current
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight
      const scrolled = Math.max(0, window.innerHeight - rect.top)
      const pct = Math.min(100, Math.round((scrolled / total) * 100))
      setReadingProgress(pct)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [book])

  // Клик по термину
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.classList.contains('term')) return

    const term = target.getAttribute('data-term')
    if (!term) return

    const rect = target.getBoundingClientRect()
    const scrollY = window.scrollY

    setTooltip({
      term,
      x: Math.min(rect.left + window.scrollX, window.innerWidth - 320),
      y: rect.bottom + scrollY + 8,
      explanation: GENSHIN_TERMS[term] ?? null,
      loading: false,
    })
  }, [])

  // Закрытие тултипа при клике вне
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltip(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))' }}
      >
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--accent)', animation: 'spin-slow 1s linear infinite' }}
        />
      </div>
    )
  }

  if (!book) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))' }}
      >
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Книга не найдена</p>
        <Link
          href="/"
          className="px-6 py-2 rounded-xl font-bold transition hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', color: '#1a120b' }}
        >
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  const processedContent = book.content ? highlightTerms(book.content) : ''

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))' }}
    >
      {/* Прогресс-бар чтения */}
      <div
        className="fixed top-0 left-0 z-[100] h-1 transition-all duration-300"
        style={{
          width: `${readingProgress}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--accent-dim))',
          boxShadow: '0 0 8px var(--glow)',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 transition-all hover:gap-3"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          ← Вернуться в каталог
        </Link>

        <div
          className="rounded-2xl border shadow-2xl overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
        >
          {/* Заголовок */}
          <div
            className="p-8 border-b"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, transparent), transparent)',
              borderColor: 'var(--border)',
            }}
          >
            <h1
              className="text-3xl md:text-4xl font-bold font-[Cinzel] mb-3 leading-tight"
              style={{ color: 'var(--accent)' }}
            >
              {book.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>{book.author}</span>
              <span>{book.region}</span>
            </div>
          </div>

          {/* Подсказка по терминам */}
          <div
            className="mx-8 mt-6 mb-2 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
            style={{
              background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>✦</span>
            Нажимайте на <span
              className="term cursor-pointer"
              style={{
                color: 'var(--accent)',
                textDecoration: 'underline dotted',
                textUnderlineOffset: '3px',
              }}
            >выделенные термины</span> для просмотра пояснений
          </div>

          {/* Контент книги */}
          <div className="p-8" onClick={handleContentClick} ref={contentRef}>
            <div
              className="reader-content prose max-w-none"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </div>

          {/* Прогресс внизу */}
          <div
            className="px-8 py-4 border-t flex items-center gap-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-input)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${readingProgress}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-dim))',
                }}
              />
            </div>
            <span className="text-sm shrink-0" style={{ color: 'var(--text-secondary)' }}>
              {readingProgress}% прочитано
            </span>
          </div>
        </div>
      </div>

      {/* Тултип с пояснением термина */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className="tooltip-popup fixed z-50 max-w-xs rounded-xl shadow-2xl border p-4"
          style={{
            left: Math.max(8, Math.min(tooltip.x, window.innerWidth - 320)),
            top: tooltip.y - window.scrollY,
            background: 'var(--bg-card-deep)',
            borderColor: 'var(--accent)',
            boxShadow: '0 0 20px var(--glow)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold font-[Cinzel] text-sm" style={{ color: 'var(--accent)' }}>
              ✦ {tooltip.term}
            </h4>
            <button
              onClick={() => setTooltip(null)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition hover:scale-110"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
            >
              ✕
            </button>
          </div>
          {tooltip.loading ? (
            <div className="flex items-center gap-2 py-2">
              <div
                className="w-4 h-4 rounded-full border border-t-transparent"
                style={{ borderColor: 'var(--accent)', animation: 'spin-slow 0.8s linear infinite' }}
              />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Загрузка...</span>
            </div>
          ) : (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {tooltip.explanation ?? 'Пояснение не найдено.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
