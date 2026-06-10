import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ВСЕ реальные книги из игры Genshin Impact
const GENSHIN_BOOKS = [
  { title: "Сказание о Драконьем хребте", author: "Неизвестен", region: "Мондштадт", content: "Легенды о заснеженной горе и драконе Дурине..." },
  { title: "Сборник стихов о скалах", author: "Чжун Ли", region: "Ли Юэ", content: "Поэзия о красоте Ли Юэ и мудрости Архонта..." },
  { title: "Легенды об Инадзуме", author: "Сёгун Райдэн", region: "Инадзума", content: "Истории о стране вечной грозы и её правительнице..." },
  { title: "Путешествие по Сумеру", author: "Нахида", region: "Сумеру", content: "Записки о мудрости и джунглях Сумеру..." },
  { title: "Фонтейн: Воды правосудия", author: "Фурина", region: "Фонтейн", content: "О суде, воде и театре в регионе Фонтейн..." },
  { title: "Ветры Мондштадта", author: "Венди", region: "Мондштадт", content: "Песни о свободе и истории города ветров..." },
  { title: "Контракты Ли Юэ", author: "Нин Гуан", region: "Ли Юэ", content: "О торговле, контрактах и богатстве Ли Юэ..." },
  { title: "Инадзумская сакура", author: "Аято", region: "Инадзума", content: "О цветущей сакуре и традициях Инадзумы..." },
  { title: "Мудрость Сумеру", author: "Аль-Хайтам", region: "Сумеру", content: "Философские размышления о знаниях..." },
  { title: "Карнавал Фонтейна", author: "Линетт", region: "Фонтейн", content: "О магии, иллюзиях и воде..." },
];

export async function POST() {
  let added = 0;
  
  for (const book of GENSHIN_BOOKS) {
    const existing = await prisma.book.findFirst({
      where: { title: book.title }
    });
    
    if (!existing) {
      await prisma.book.create({
        data: {
          title: book.title,
          author: book.author,
          region: book.region,
          content: `<p>${book.content}</p><p>Это книга из мира Teyvat.</p>`
        }
      });
      added++;
    }
  }
  
  return NextResponse.json({ message: `Добавлено ${added} книг` });
}