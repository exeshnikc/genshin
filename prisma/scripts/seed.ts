import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const books = [
  {
    title: 'Путеводитель по Тейвату',
    author: 'Неизвестный автор',
    region: 'Ли Юэ',
    content: '<p>Первая глава книги. Термин <term>Чжун Ли</term> встречается здесь.</p>',
    coverUrl: ''
  },
  {
    title: 'Шесть предписаний',
    author: 'Неизвестный автор',
    region: 'Ли Юэ',
    content: '<p>Шесть древних законов. <term>Чжун Ли</term> был их хранителем.</p>',
    coverUrl: ''
  },
  {
    title: 'Путешествие по морю',
    author: 'Бэй Доу',
    region: 'Ли Юэ',
    content: '<p>Капитан <term>Бэй Доу</term> рассказывает о приключениях.</p>',
    coverUrl: ''
  },
  {
    title: 'Сказание о ветрах',
    author: 'Вэньди',
    region: 'Мондштадт',
    content: '<p>В <term>Мондштадте</term> жил бард <term>Венди</term>.</p>',
    coverUrl: ''
  },
  {
    title: 'Сакоку. Запечатанный',
    author: 'Сёгун Райдэн',
    region: 'Инадзума',
    content: '<p>Указ подписал <term>Сёгун Райдэн</term>.</p>',
    coverUrl: ''
  },
  {
    title: 'Мудрость Сумеру',
    author: 'Нахида',
    region: 'Сумеру',
    content: '<p><term>Сумеру</term> — земля знаний. <term>Нахида</term> заботится о жителях.</p>',
    coverUrl: ''
  }
]

async function main() {
  console.log('Начинаю обновление базы данных...')
  
  // Удаляем старые книги
  await prisma.book.deleteMany()
  console.log('Старые книги удалены')
  
  // Добавляем книги
  for (const book of books) {
    await prisma.book.create({
      data: book
    })
  }
  console.log(`✅ Добавлено книг: ${books.length}`)
  
  // Создаём админа (если ещё нет)
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  })
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        name: 'Администратор',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Администратор создан: admin@example.com / admin123')
  } else {
    console.log('Администратор уже существует')
  }
}

main()
  .catch(e => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })