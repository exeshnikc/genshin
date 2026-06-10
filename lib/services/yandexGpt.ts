import axios from 'axios';
import { prisma } from '@/lib/prisma';

interface YandexGPTResponse {
  result: {
    alternatives: Array<{
      message: {
        text: string;
      };
    }>;
  };
}

export class YandexGPTService {
  private apiKey: string;
  private folderId: string;
  private apiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';
  
  // Встроенный словарь терминов Genshin (резервный)
  private fallbackDictionary: Record<string, string> = {
    'Архонт': 'Архонт — один из семи богов Teyvat, каждый из которых связан с определенным элементом (Анемо, Гео, Электро, Гидро, Пиро, Крио, Дендро). Архонты правят семью регионами и обладают божественной силой.',
    
    'Teyvat': 'Teyvat — континент, на котором происходит действие Genshin Impact. Семь регионов Teyvat находятся под управлением семи Архонтов, каждый из которых связан с определенным элементом.',
    
    'Глаз Бога': 'Глаз Бога (Vision) — магический кристалл, даруемый богами избранным людям. Он позволяет владельцу использовать элементальную силу. Все игровые персонажи (кроме Путешественника) владеют Глазом Бога.',
    
    'Бездна': 'Бездна (The Abyss) — таинственная организация и место, которое угрожает Teyvat. Бесы — существа Бездны, которые противостоят человечеству. Орден Бездны возглавляет Принц/Принцесса — потерянный близнец Путешественника.',
    
    'Фатуи': 'Фатуи (Fatui) — военная организация из Снежной (Snezhnaya), подчиняющаяся Царице. Состоит из одиннадцати Предвестников, каждый из которых обладает огромной силой. Основные антагонисты в сюжете игры.',
    
    'Путешественник': 'Путешественник (Traveler) — главный герой игры, прибывший из другого мира в поисках своего потерянного близнеца. Может использовать силу нескольких элементов без Глаза Бога. Имя можно выбрать в начале игры.',
    
    'Паймон': 'Паймон (Paimon) — верный спутник и гид Путешественника. Несмотря на свой маленький рост, очень болтлива и часто попадает в забавные ситуации. Всегда готова помочь советом.',
    
    'Венди': 'Венди (Venti) — бард из Мондштадта, который на самом деле является Анемо Архонтом, известным как Барбатос. Любит музыку, поэзию и вино. Один из первых игровых персонажей.',
    
    'Чжун Ли': 'Чжун Ли (Zhongli) — ритуальный консультант из Ли Юэ, на самом деле являющийся Гео Архонтом Мораксом (Рекс Лписом). Обладает огромными знаниями о древней истории.',
    
    'Сёгун Райдэн': 'Сёгун Райдэн (Raiden Shogun) — Электро Архонт, правительница Инадзумы. Стремится к вечности и изолировала свою страну от внешнего мира.',
    
    'Нахида': 'Нахида (Nahida) — Дендро Архонт, известная как Мудрый Король. Правит регионом Сумеру. Является самым молодым из действующих Архонтов.'
  };

  constructor() {
    this.apiKey = process.env.YANDEX_GPT_API_KEY || '';
    this.folderId = process.env.YANDEX_FOLDER_ID || '';
  }

  async getExplanation(term: string, context?: string): Promise<string> {
    try {
      // 1. Проверяем кэш в БД
      const cached = await prisma.termCache.findFirst({
        where: {
          term: term.toLowerCase(),
          ...(context && { context: { contains: context.substring(0, 100) } })
        }
      });
      
      if (cached && Date.now() - cached.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000) {
        console.log(`📦 Кэш: термин "${term}" найден в БД`);
        return cached.explanation;
      }
      
      // 2. Если нет ключа API, используем fallback словарь
      if (!this.apiKey || this.apiKey === 'your_yandex_gpt_api_key_here') {
        console.log(`⚠️ Нет API ключа Yandex GPT, используем fallback словарь для "${term}"`);
        return this.getFallbackExplanation(term);
      }
      
      // 3. Запрос к реальной Yandex GPT
      console.log(`🤖 Запрос к Yandex GPT для термина "${term}"...`);
      
      const prompt = `Ты - эксперт по игре Genshin Impact. Объясни термин "${term}" в контексте игры.
${context ? `Контекст: "${context.substring(0, 300)}..."` : ''}

Дай краткое, но информативное объяснение (3-5 предложений), которое поможет игроку понять значение этого термина в мире Teyvat.
Объяснение должно быть точным и соответствовать официальному лору игры.`;

      const response = await axios.post<YandexGPTResponse>(
        this.apiUrl,
        {
          modelUri: `gpt://${this.folderId}/yandexgpt-lite/latest`,
          completionOptions: {
            stream: false,
            temperature: 0.3,
            maxTokens: 500
          },
          messages: [
            {
              role: "system",
              text: "Ты - помощник-эксперт по игре Genshin Impact. Отвечай только по теме игры, будь точен и информативен."
            },
            {
              role: "user",
              text: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Api-Key ${this.apiKey}`,
            'Content-Type': 'application/json',
            'x-folder-id': this.folderId
          },
          timeout: 10000
        }
      );
      
      let explanation = response.data.result.alternatives[0]?.message.text || '';
      
      if (!explanation) {
        throw new Error('Пустой ответ от нейросети');
      }
      
      // 4. Сохраняем в кэш
      await prisma.termCache.create({
        data: {
          term: term.toLowerCase(),
          context: context?.substring(0, 200),
          explanation
        }
      });
      
      console.log(`✅ Получено объяснение для "${term}" от Yandex GPT`);
      return explanation;
      
    } catch (error) {
      console.error(`❌ Ошибка Yandex GPT для "${term}":`, error);
      return this.getFallbackExplanation(term);
    }
  }

  private getFallbackExplanation(term: string): string {
    // Ищем точное совпадение
    if (this.fallbackDictionary[term]) {
      return this.fallbackDictionary[term];
    }
    
    // Ищем частичное совпадение
    for (const [key, value] of Object.entries(this.fallbackDictionary)) {
      if (term.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(term.toLowerCase())) {
        return value;
      }
    }
    
    // Если не нашли
    return `📖 **${term}** - термин из мира Teyvat. В игре Genshin Impact это может относиться к персонажу, географическому объекту или историческому событию. Для получения подробной информации, пожалуйста, посетите официальные источники Genshin Impact или обратитесь к внутриигровой энциклопедии.`;
  }
}

export const yandexGpt = new YandexGPTService();