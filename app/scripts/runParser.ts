import { WikiParser } from 'lib/parser/wikiParser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runParser() {
  console.log('🚀 ЗАПУСК ПАРСЕРА КНИГ GENSHIN IMPACT');
  console.log('=======================================\n');
  
  const parser = new WikiParser();
  const result = await parser.parseAllBooks();
  
  console.log('\n=======================================');
  console.log(`✅ Успешно добавлено: ${result.success}`);
  console.log(`❌ Ошибок: ${result.failed}`);
  
  if (result.errors.length > 0) {
    console.log('\n📋 Детали ошибок:');
    result.errors.forEach(err => console.log(`  - ${err}`));
  }
  
  await prisma.$disconnect();
}

runParser().catch(console.error);
//C:\Users\acer\Desktop\genshin-library-new\lib\parser\wikiParser.ts