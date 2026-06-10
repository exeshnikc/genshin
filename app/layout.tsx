import type { Metadata } from "next";
import { Cinzel, Merriweather } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Genshin Library",
  description: "Библиотека внутриигровой литературы Genshin Impact",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-theme="dark"
      className={`${cinzel.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))',
          color: 'var(--text-primary)',
        }}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1 page-enter">
            {children}
          </main>
          <footer
            className="text-center py-6 border-t"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <p className="text-sm">© 2026 Genshin Library — Все права защищены.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
