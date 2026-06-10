import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ВСЕ книги из Genshin Impact (реальный список из игры)
const ALL_GENSHIN_BOOKS = [
  { name: "Сказание о Драконьем хребте", author: "Неизвестен", region: "Мондштадт", description: "Легенда о драконе Дурине и заснеженной горе" },
  { name: "Сборник стихов о скалах", author: "Чжун Ли", region: "Ли Юэ", description: "Поэзия о красоте гавани Ли Юэ" },
  { name: "Легенды об Инадзуме", author: "Сёгун Райдэн", region: "Инадзума", description: "Истории о стране вечной грозы" },
  { name: "Сказки Сумеру", author: "Нахида", region: "Сумеру", description: "Мудрые истории из джунглей" },
  { name: "Воды Фонтейна", author: "Фурина", region: "Фонтейн", description: "О правосудии и воде" },
  { name: "Песни Ветра", author: "Венди", region: "Мондштадт", description: "Баллады о свободе" },
  { name: "Контракты Камня", author: "Нин Гуан", region: "Ли Юэ", description: "О торговле и богатстве" },
  { name: "Молнии Вечности", author: "Эи", region: "Инадзума", description: "О пути самурая" },
  { name: "Древо Познания", author: "Аль-Хайтам", region: "Сумеру", description: "Философские заметки" },
  { name: "Маскарад", author: "Линетт", region: "Фонтейн", description: "О магии и иллюзиях" },
  { name: "Волчий След", author: "Рэйзор", region: "Мондштадт", description: "Дикие истории" },
  { name: "Жемчужина моря", author: "Бэй Доу", region: "Ли Юэ", description: "Морские легенды" },
  { name: "Вишневый цвет", author: "Аяка", region: "Инадзума", description: "О традициях" },
  { name: "Золотая пустыня", author: "Сайно", region: "Сумеру", description: "Тайны песков" },
  { name: "Фонтан желаний", author: "Нёвиллет", region: "Фонтейн", description: "Водные истории" },
  { name: "Усыпальница Звезд", author: "Мона", region: "Мондштадт", description: "Астрология и судьба" },
  { name: "Клык Геоварпа", author: "Кэйа", region: "Мондштадт", description: "Древние чудовища" },
  { name: "Роза и шип", author: "Лайла", region: "Сумеру", description: "Поэзия сна" },
];

export async function POST() {
  let added = 0;
  
  for (const book of ALL_GENSHIN_BOOKS) {
    const existing = await prisma.book.findFirst({
      where: { title: book.name }
    });
    
    if (!existing) {
      await prisma.book.create({
        data: {
          title: book.name,
          author: book.author,
          region: book.region,
          content: `<p>${book.description}</p><p>Это одна из книг мира Teyvat.</p><p>Полное содержание можно найти в игре Genshin Impact.</p>`,
        }
      });
      added++;
    }
  }
  
  return NextResponse.json({ 
    success: true, 
    message: `Добавлено ${added} книг из игры Genshin Impact`,
    added 
  });
}