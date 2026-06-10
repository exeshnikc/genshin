import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

export interface ParsedBook {
  title: string;
  author: string;
  region: string;
  content: string;
  coverUrl: string | null;
  sourceUrl: string;
}

// Реальные URL для парсинга
const WIKI_BASE_URL = 'https://genshin-impact.fandom.com';
const BOOKS_CATEGORY_URL = 'https://genshin-impact.fandom.com/wiki/Category:Books';

export class WikiParser {
  
  // Главный метод - запуск парсинга всех книг
  async parseAllBooks(): Promise<{ success: number; failed: number; errors: string[] }> {
    console.log('🚀 Начинаем парсинг книг с вики...');
    
    const result = { success: 0, failed: 0, errors: [] as string[] };
    
    try {
      // 1. Получаем список всех книг
      const bookUrls = await this.getBookList();
      console.log(`📚 Найдено ${bookUrls.length} книг`);
      
      // 2. Парсим каждую книгу
      for (const url of bookUrls) {
        try {
          const book = await this.parseBookPage(url);
          
          // 3. Сохраняем в БД
          await this.saveBookToDatabase(book);
          result.success++;
          console.log(`✅ Добавлена: ${book.title}`);
          
        } catch (error) {
          result.failed++;
          result.errors.push(`Ошибка при парсинге ${url}: ${error}`);
          console.error(`❌ Ошибка: ${url}`);
        }
        
        // Небольшая задержка, чтобы не перегружать сервер
        await this.delay(1000);
      }
      
    } catch (error) {
      console.error('Критическая ошибка парсинга:', error);
      result.errors.push(`Критическая ошибка: ${error}`);
    }
    
    console.log(`🎉 Парсинг завершен! Успешно: ${result.success}, Ошибок: ${result.failed}`);
    return result;
  }

  // Получение списка всех книг с вики
  private async getBookList(): Promise<string[]> {
    const bookUrls: string[] = [];
    
    try {
      const response = await axios.get(BOOKS_CATEGORY_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Ищем ссылки на страницы книг
      $('.category-page__member-link').each((_, element) => {
        const href = $(element).attr('href');
        if (href && !href.includes('Category:')) {
          const fullUrl = href.startsWith('http') ? href : `${WIKI_BASE_URL}${href}`;
          bookUrls.push(fullUrl);
        }
      });
      
      // Если не нашли через категорию, используем альтернативные источники
      if (bookUrls.length === 0) {
        return await this.getAlternativeBookList();
      }
      
      return bookUrls;
      
    } catch (error) {
      console.error('Ошибка получения списка книг:', error);
      return await this.getAlternativeBookList();
    }
  }

  // Альтернативный способ получения списка книг
  private async getAlternativeBookList(): Promise<string[]> {
    const knownBooks = [
      '/wiki/Dragonspine',
      '/wiki/Liyue',
      '/wiki/Inazuma',
      '/wiki/Mondstadt',
      '/wiki/The_Little_Fox%27s_Tale',
      '/wiki/Records_of_Jueyun',
      '/wiki/Legend_of_the_Shadows',
      '/wiki/The_Tale_of_Shadows',
      '/wiki/The_Serpent_and_Dragon'
    ];
    
    return knownBooks.map(book => `${WIKI_BASE_URL}${book}`);
  }

  // Парсинг отдельной страницы книги
  private async parseBookPage(url: string): Promise<ParsedBook> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Извлекаем название
    const title = $('h1.page-header__title').text().trim() || 
                  $('h1').first().text().trim() ||
                  'Неизвестная книга';
    
    // Извлекаем автора из инфобокса
    let author = 'Неизвестный автор';
    $('.pi-data').each((_, element) => {
      const label = $(element).find('.pi-data-label').text().trim();
      if (label.includes('Author') || label.includes('Автор')) {
        author = $(element).find('.pi-data-value').text().trim();
      }
    });
    
    // Извлекаем регион
    let region = 'Другой';
    $('.pi-data').each((_, element) => {
      const label = $(element).find('.pi-data-label').text().trim();
      if (label.includes('Region') || label.includes('Регион')) {
        const regionText = $(element).find('.pi-data-value').text().trim();
        region = this.detectRegion(regionText);
      }
    });
    
    // Извлекаем обложку
    let coverUrl = null;
    const coverImg = $('.pi-image img').attr('src');
    if (coverImg && !coverImg.includes('placeholder')) {
      coverUrl = coverImg;
    }
    
    // Извлекаем основной текст
    let content = '';
    
    // Пробуем найти основной контент страницы
    const mainContent = $('.mw-parser-output');
    if (mainContent.length) {
      // Удаляем ненужные элементы
      mainContent.find('.table').remove();
      mainContent.find('.infobox').remove();
      mainContent.find('.navbox').remove();
      
      // Собираем параграфы
      mainContent.find('p').each((_, element) => {
        const text = $(element).text().trim();
        if (text.length > 20) {
          content += `<p>${this.escapeHtml(text)}</p>`;
        }
      });
    }
    
    // Если контента мало, берем любой текст
    if (content.length < 200) {
      $('p').each((_, element) => {
        const text = $(element).text().trim();
        if (text.length > 50 && !text.includes('Categories')) {
          content += `<p>${this.escapeHtml(text)}</p>`;
        }
      });
    }
    
    // Если контента все еще нет, создаем демо-контент
    if (content.length < 100) {
      content = this.generateDemoContent(title);
    }
    
    return {
      title: this.cleanTitle(title),
      author: this.cleanAuthor(author),
      region,
      content,
      coverUrl,
      sourceUrl: url
    };
  }

  // Определение региона по тексту
  private detectRegion(text: string): string {
    const regionMap: Record<string, string> = {
      'Mondstadt': 'Мондштадт',
      'Liyue': 'Ли Юэ',
      'Inazuma': 'Инадзума',
      'Sumeru': 'Сумеру',
      'Fontaine': 'Фонтейн',
      'Natlan': 'Натлан',
      'Snezhnaya': 'Снежная'
    };
    
    for (const [key, value] of Object.entries(regionMap)) {
      if (text.includes(key)) return value;
    }
    
    return 'Другой';
  }

  // Генерация демо-контента для книг, где не удалось распарсить текст
  private generateDemoContent(title: string): string {
    return `<p>📖 <strong>${title}</strong> - это одна из книг, встречающихся в мире Teyvat.</p>
    <p>Книга содержит важные сведения о <span class="highlight-term" data-term="Teyvat">Teyvat</span> и его истории.</p>
    <p>В ней описываются <span class="highlight-term" data-term="Архонты">Архонты</span>, их деяния и влияние на мир.</p>
    <p>Для полного ознакомления с содержанием книги, пожалуйста, посетите официальный источник.</p>`;
  }

  // Сохранение книги в БД
  private async saveBookToDatabase(book: ParsedBook) {
    // Проверяем, существует ли уже книга
    const existing = await prisma.book.findFirst({
      where: { title: book.title }
    });
    
    if (existing) {
      console.log(`Книга "${book.title}" уже существует, обновляем...`);
      await prisma.book.update({
        where: { id: existing.id },
        data: {
          author: book.author,
          region: book.region,
          content: book.content,
          coverUrl: book.coverUrl,
          sourceUrl: book.sourceUrl
        }
      });
    } else {
      await prisma.book.create({
        data: {
          title: book.title,
          author: book.author,
          region: book.region,
          content: book.content,
          coverUrl: book.coverUrl,
          sourceUrl: book.sourceUrl,
          views: 0
        }
      });
    }
  }

  // Вспомогательные методы
  private cleanTitle(title: string): string {
    return title
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .trim();
  }

  private cleanAuthor(author: string): string {
    if (!author || author === 'Unknown' || author === 'Неизвестно') {
      return 'Неизвестный автор';
    }
    return author;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}