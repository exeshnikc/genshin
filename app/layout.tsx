import './globals.css'
import { Inter, Cinzel } from 'next/font/google'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })
const cinzel = Cinzel({ subsets: ['latin'] })

export const metadata = {
  title: 'Genshin Library',
  description: 'Все книги мира Teyvat',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}