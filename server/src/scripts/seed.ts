import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from '../models/Category'
import Topic from '../models/Topic'
import Quiz from '../models/Quiz'

dotenv.config()

const seedDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Category.deleteMany({})
    await Topic.deleteMany({})
    await Quiz.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Seed Categories
    const categories = await Category.insertMany([
      {
        name: {
          ru: 'Остеология',
          ro: 'Osteologie',
        },
        description: {
          ru: 'Изучение костной системы человека',
          ro: 'Studiul sistemului osos uman',
        },
        slug: 'osteology',
        order: 1,
      },
      {
        name: {
          ru: 'Миология',
          ro: 'Miologie',
        },
        description: {
          ru: 'Изучение мышечной системы',
          ro: 'Studiul sistemului muscular',
        },
        slug: 'myology',
        order: 2,
      },
      {
        name: {
          ru: 'Артрология',
          ro: 'Artrologie',
        },
        description: {
          ru: 'Изучение суставов и связок',
          ro: 'Studiul articulațiilor și ligamentelor',
        },
        slug: 'arthrology',
        order: 3,
      },
      {
        name: {
          ru: 'Нервная система',
          ro: 'Sistemul nervos',
        },
        description: {
          ru: 'Изучение центральной и периферической нервной системы',
          ro: 'Studiul sistemului nervos central și periferic',
        },
        slug: 'nervous',
        order: 4,
      },
      {
        name: {
          ru: 'Сердечно-сосудистая система',
          ro: 'Sistemul cardiovascular',
        },
        description: {
          ru: 'Изучение сердца и кровеносных сосудов',
          ro: 'Studiul inimii și vaselor de sânge',
        },
        slug: 'cardiovascular',
        order: 5,
      },
    ])
    console.log('✅ Created categories')

    // Seed Topics for Osteology
    const osteologyCategory = categories.find((c) => c.slug === 'osteology')
    const topics = await Topic.insertMany([
      {
        categoryId: osteologyCategory!._id,
        name: {
          ru: 'Череп',
          ro: 'Craniul',
        },
        description: {
          ru: 'Костная структура головы, защищающая мозг',
          ro: 'Structura osoasă a capului care protejează creierul',
        },
        content: {
          ru: `Череп человека состоит из 23 костей, которые делятся на две группы:

1. Мозговой череп (8 костей) - защищает головной мозг
   - Лобная кость
   - Теменные кости (2)
   - Височные кости (2)
   - Затылочная кость
   - Клиновидная кость
   - Решетчатая кость

2. Лицевой череп (15 костей) - формирует лицо
   - Нижняя челюсть
   - Верхнечелюстные кости (2)
   - Скуловые кости (2)
   - Носовые кости (2)
   - Слёзные кости (2)
   - Нёбные кости (2)
   - Сошник
   - Нижние носовые раковины (2)
   - Подъязычная кость

Кости черепа соединены неподвижными швами, за исключением нижней челюсти.`,
          ro: `Craniul uman constă din 23 de oase, care sunt împărțite în două grupuri:

1. Craniul cerebral (8 oase) - protejează creierul
   - Osul frontal
   - Oasele parietale (2)
   - Oasele temporale (2)
   - Osul occipital
   - Osul sfenoid
   - Osul etmoid

2. Craniul facial (15 oase) - formează fața
   - Mandibula
   - Oasele maxilare (2)
   - Oasele zigomatice (2)
   - Oasele nazale (2)
   - Oasele lacrimale (2)
   - Oasele palatine (2)
   - Vomer
   - Cornete nazale inferioare (2)
   - Osul hioid

Oasele craniului sunt conectate prin suturi imobile, cu excepția mandibulei.`,
        },
        images: [],
        videos: [],
        slug: 'skull',
        order: 1,
      },
      {
        categoryId: osteologyCategory!._id,
        name: {
          ru: 'Позвоночник',
          ro: 'Coloana vertebrală',
        },
        description: {
          ru: 'Осевой скелет, состоящий из позвонков',
          ro: 'Scheletul axial format din vertebre',
        },
        content: {
          ru: `Позвоночный столб состоит из 33-34 позвонков, разделенных на 5 отделов:

1. Шейный отдел (7 позвонков) - C1-C7
2. Грудной отдел (12 позвонков) - T1-T12
3. Поясничный отдел (5 позвонков) - L1-L5
4. Крестцовый отдел (5 сросшихся позвонков)
5. Копчиковый отдел (3-5 сросшихся позвонков)

Функции позвоночника:
- Защита спинного мозга
- Опора тела
- Участие в движениях туловища
- Амортизация при ходьбе и прыжках`,
          ro: `Coloana vertebrală este formată din 33-34 vertebre, împărțite în 5 regiuni:

1. Regiunea cervicală (7 vertebre) - C1-C7
2. Regiunea toracică (12 vertebre) - T1-T12
3. Regiunea lombară (5 vertebre) - L1-L5
4. Regiunea sacrală (5 vertebre fuzionate)
5. Regiunea coccidiană (3-5 vertebre fuzionate)

Funcțiile coloanei vertebrale:
- Protecția măduvei spinării
- Suport pentru corp
- Participarea la mișcările trunchiului
- Amortizare la mers și sărituri`,
        },
        images: [],
        videos: [],
        slug: 'spine',
        order: 2,
      },
    ])
    console.log('✅ Created topics')

    // Seed Quizzes
    const skullTopic = topics.find((t) => t.slug === 'skull')
    await Quiz.insertMany([
      {
        topicId: skullTopic!._id,
        categoryId: osteologyCategory!._id,
        title: {
          ru: 'Тест по остеологии: Череп',
          ro: 'Test de osteologie: Craniul',
        },
        description: {
          ru: 'Проверьте свои знания о строении черепа человека',
          ro: 'Testați-vă cunoștințele despre structura craniului uman',
        },
        questions: [
          {
            question: {
              ru: 'Сколько костей входит в состав черепа человека?',
              ro: 'Câte oase formează craniul uman?',
            },
            options: [
              { ru: '20 костей', ro: '20 oase' },
              { ru: '23 кости', ro: '23 oase' },
              { ru: '26 костей', ro: '26 oase' },
              { ru: '29 костей', ro: '29 oase' },
            ],
            correctAnswer: 1,
            explanation: {
              ru: 'Череп человека состоит из 23 костей: 8 костей мозгового черепа и 15 костей лицевого черепа.',
              ro: 'Craniul uman constă din 23 de oase: 8 oase craniene cerebrale și 15 oase faciale.',
            },
          },
          {
            question: {
              ru: 'Какая кость черепа является подвижной?',
              ro: 'Care os al craniului este mobil?',
            },
            options: [
              { ru: 'Лобная кость', ro: 'Osul frontal' },
              { ru: 'Нижняя челюсть', ro: 'Mandibula' },
              { ru: 'Затылочная кость', ro: 'Osul occipital' },
              { ru: 'Височная кость', ro: 'Osul temporal' },
            ],
            correctAnswer: 1,
            explanation: {
              ru: 'Нижняя челюсть - единственная подвижная кость черепа, образующая височно-нижнечелюстной сустав.',
              ro: 'Mandibula este singurul os mobil al craniului, formând articulația temporomandibulară.',
            },
          },
          {
            question: {
              ru: 'Сколько костей входит в состав мозгового черепа?',
              ro: 'Câte oase formează craniul cerebral?',
            },
            options: [
              { ru: '6 костей', ro: '6 oase' },
              { ru: '8 костей', ro: '8 oase' },
              { ru: '10 костей', ro: '10 oase' },
              { ru: '12 костей', ro: '12 oase' },
            ],
            correctAnswer: 1,
            explanation: {
              ru: 'Мозговой череп состоит из 8 костей, которые защищают головной мозг.',
              ro: 'Craniul cerebral constă din 8 oase care protejează creierul.',
            },
          },
        ],
        slug: 'skull-quiz',
      },
    ])
    console.log('✅ Created quizzes')

    console.log('\n✅ Database seeded successfully!')
    console.log('\nSummary:')
    console.log(`- Categories: ${categories.length}`)
    console.log(`- Topics: ${topics.length}`)
    console.log(`- Quizzes: 1`)

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
