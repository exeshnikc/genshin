import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-b from-[#1a0f0a] to-[#0d0805] text-[#f0e0c0]">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <footer className="text-center py-6 text-[#b98b5f] border-t border-[#e4b574]/30">
          <p className="text-sm">© 2026 Genshin Library. Все права защищены.</p>
        </footer>
      </body>
    </html>
  );
}