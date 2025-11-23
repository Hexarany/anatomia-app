import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Topic from '../models/Topic'

dotenv.config()

const addImagePlaceholders = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    console.log('\n📸 Добавляем места для иллюстраций...\n')

    // Череп
    const skull = await Topic.findOne({ slug: 'skull-complete' })
    if (skull) {
      skull.images = [
        {
          url: '/images/placeholders/skull-anterior.jpg',
          filename: 'skull-anterior.jpg',
          caption: {
            ru: 'Череп - вид спереди',
            ro: 'Craniu - vedere anterioară'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/skull-lateral.jpg',
          filename: 'skull-lateral.jpg',
          caption: {
            ru: 'Череп - вид сбоку',
            ro: 'Craniu - vedere laterală'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/skull-base.jpg',
          filename: 'skull-base.jpg',
          caption: {
            ru: 'Череп - основание (вид снизу)',
            ro: 'Craniu - baza (vedere inferioară)'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/skull-sutures.jpg',
          filename: 'skull-sutures.jpg',
          caption: {
            ru: 'Швы черепа',
            ro: 'Suturile craniului'
          },
          type: 'image' as const
        }
      ]

      // Добавляем секцию иллюстраций в начало контента
      if (!skull.content.ru.includes('## 📸 Иллюстрации')) {
        skull.content.ru = skull.content.ru.replace(
          '## 📋 Введение',
          `## 📸 Иллюстрации

:::info [Визуальные материалы]
В этом разделе представлены детальные иллюстрации черепа с различных ракурсов:
- **Вид спереди** - лицевые кости, глазницы, носовая полость
- **Вид сбоку** - височная область, скуловая дуга, височная ямка
- **Основание черепа** - отверстия, каналы, затылочная кость
- **Швы черепа** - для краниосакральной терапии
:::

> 💡 **Для терапевта**: При работе с черепом важно знать расположение швов и пальпаторных ориентиров. Используйте иллюстрации для ориентации.

---

## 📋 Введение`
        )
      }

      await skull.save()
      console.log('✅ Череп: добавлено 4 места для иллюстраций')
    }

    // Позвоночник
    const spine = await Topic.findOne({ slug: 'spine-complete' })
    if (spine) {
      spine.images = [
        {
          url: '/images/placeholders/spine-overview.jpg',
          filename: 'spine-overview.jpg',
          caption: {
            ru: 'Позвоночник - общий вид',
            ro: 'Coloana vertebrală - vedere generală'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/cervical-vertebra.jpg',
          filename: 'cervical-vertebra.jpg',
          caption: {
            ru: 'Шейный позвонок - типичное строение',
            ro: 'Vertebra cervicală - structură tipică'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/thoracic-vertebra.jpg',
          filename: 'thoracic-vertebra.jpg',
          caption: {
            ru: 'Грудной позвонок',
            ro: 'Vertebra toracică'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/lumbar-vertebra.jpg',
          filename: 'lumbar-vertebra.jpg',
          caption: {
            ru: 'Поясничный позвонок',
            ro: 'Vertebra lombară'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/atlas-axis.jpg',
          filename: 'atlas-axis.jpg',
          caption: {
            ru: 'Атлант (C1) и Аксис (C2)',
            ro: 'Atlas (C1) și Axis (C2)'
          },
          type: 'image' as const
        }
      ]

      if (!spine.content.ru.includes('## 📸 Иллюстрации')) {
        spine.content.ru = spine.content.ru.replace(
          '## 📋 Введение',
          `## 📸 Иллюстрации

:::info [Визуальные материалы]
Детальные иллюстрации всех отделов позвоночника:
- **Общий вид** - все 5 отделов, изгибы позвоночника
- **Шейный отдел** - С1-С7, особенности атланта и аксиса
- **Грудной отдел** - Т1-Т12, реберные фасетки
- **Поясничный отдел** - L1-L5, массивные тела позвонков
- **Крестец и копчик** - сросшиеся позвонки
:::

> 💡 **Для терапевта**: При пальпации позвоночника используйте остистые отростки как ориентиры. Иллюстрации помогут определить уровень позвонка.

---

## 📋 Введение`
        )
      }

      await spine.save()
      console.log('✅ Позвоночник: добавлено 5 мест для иллюстраций')
    }

    // Грудная клетка
    const thorax = await Topic.findOne({ slug: 'thorax-detailed' })
    if (thorax) {
      thorax.images = [
        {
          url: '/images/placeholders/thorax-anterior.jpg',
          filename: 'thorax-anterior.jpg',
          caption: {
            ru: 'Грудная клетка - вид спереди',
            ro: 'Cutia toracică - vedere anterioară'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/ribs-structure.jpg',
          filename: 'ribs-structure.jpg',
          caption: {
            ru: 'Строение ребра',
            ro: 'Structura coastei'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/sternum.jpg',
          filename: 'sternum.jpg',
          caption: {
            ru: 'Грудина - детальное строение',
            ro: 'Sternul - structură detaliată'
          },
          type: 'image' as const
        }
      ]

      if (!thorax.content.ru.includes('## 📸 Иллюстрации')) {
        thorax.content.ru = thorax.content.ru.replace(
          '## 📋 Введение',
          `## 📸 Иллюстрации

:::info [Визуальные материалы]
Иллюстрации грудной клетки:
- **Вид спереди** - грудина, ребра, реберные хрящи
- **Строение ребра** - головка, шейка, угол, борозда
- **Грудина** - рукоятка, тело, мечевидный отросток
:::

> 💡 **Для терапевта**: Межреберные пространства - важные ориентиры для пальпации. Изучите прикрепления ребер к грудине.

---

## 📋 Введение`
        )
      }

      await thorax.save()
      console.log('✅ Грудная клетка: добавлено 3 места для иллюстраций')
    }

    // Верхняя конечность
    const upperLimb = await Topic.findOne({ slug: 'upper-limb-bones' })
    if (upperLimb) {
      upperLimb.images = [
        {
          url: '/images/placeholders/upper-limb-overview.jpg',
          filename: 'upper-limb-overview.jpg',
          caption: {
            ru: 'Кости верхней конечности - общий вид',
            ro: 'Oasele membrului superior - vedere generală'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/humerus.jpg',
          filename: 'humerus.jpg',
          caption: {
            ru: 'Плечевая кость',
            ro: 'Humerus'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/radius-ulna.jpg',
          filename: 'radius-ulna.jpg',
          caption: {
            ru: 'Лучевая и локтевая кости',
            ro: 'Radius și ulna'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/hand-bones.jpg',
          filename: 'hand-bones.jpg',
          caption: {
            ru: 'Кости кисти',
            ro: 'Oasele mâinii'
          },
          type: 'image' as const
        }
      ]

      if (!upperLimb.content.ru.includes('## 📸 Иллюстрации')) {
        upperLimb.content.ru = upperLimb.content.ru.replace(
          '## 📋 Введение',
          `## 📸 Иллюстрации

:::info [Визуальные материалы]
Детальные иллюстрации костей руки:
- **Общий вид** - от ключицы до пальцев
- **Плечевая кость** - проксимальный и дистальный концы
- **Предплечье** - лучевая и локтевая кости
- **Кисть** - запястье (8 костей), пясть (5 костей), фаланги (14 костей)
:::

> 💡 **Для терапевта**: Костные выступы - ключевые ориентиры для массажа. Используйте иллюстрации для точного определения прикреплений мышц.

---

## 📋 Введение`
        )
      }

      await upperLimb.save()
      console.log('✅ Верхняя конечность: добавлено 4 места для иллюстраций')
    }

    // Нижняя конечность
    const lowerLimb = await Topic.findOne({ slug: 'lower-limb-bones' })
    if (lowerLimb) {
      lowerLimb.images = [
        {
          url: '/images/placeholders/lower-limb-overview.jpg',
          filename: 'lower-limb-overview.jpg',
          caption: {
            ru: 'Кости нижней конечности - общий вид',
            ro: 'Oasele membrului inferior - vedere generală'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/pelvis.jpg',
          filename: 'pelvis.jpg',
          caption: {
            ru: 'Таз - тазовая кость',
            ro: 'Pelvisul - os coxae'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/femur.jpg',
          filename: 'femur.jpg',
          caption: {
            ru: 'Бедренная кость',
            ro: 'Femur'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/tibia-fibula.jpg',
          filename: 'tibia-fibula.jpg',
          caption: {
            ru: 'Большеберцовая и малоберцовая кости',
            ro: 'Tibia și fibula'
          },
          type: 'image' as const
        },
        {
          url: '/images/placeholders/foot-bones.jpg',
          filename: 'foot-bones.jpg',
          caption: {
            ru: 'Кости стопы',
            ro: 'Oasele piciorului'
          },
          type: 'image' as const
        }
      ]

      if (!lowerLimb.content.ru.includes('## 📸 Иллюстрации')) {
        lowerLimb.content.ru = lowerLimb.content.ru.replace(
          '## 📋 Введение',
          `## 📸 Иллюстрации

:::info [Визуальные материалы]
Детальные иллюстрации костей ноги:
- **Общий вид** - от таза до пальцев стопы
- **Таз** - подвздошная, седалищная, лобковая кости
- **Бедренная кость** - самая длинная кость тела
- **Голень** - большеберцовая и малоберцовая кости
- **Стопа** - предплюсна (7 костей), плюсна (5 костей), фаланги (14 костей)
:::

> 💡 **Для терапевта**: Пальпация костных ориентиров нижней конечности - основа для работы с мышцами ног. Изучите ASIS, PSIS, большой вертел бедра.

---

## 📋 Введение`
        )
      }

      await lowerLimb.save()
      console.log('✅ Нижняя конечность: добавлено 5 мест для иллюстраций')
    }

    console.log('\n🎉 Места для иллюстраций успешно добавлены!')
    console.log('\n📊 Итого:')
    console.log('   - Череп: 4 иллюстрации')
    console.log('   - Позвоночник: 5 иллюстраций')
    console.log('   - Грудная клетка: 3 иллюстрации')
    console.log('   - Верхняя конечность: 4 иллюстрации')
    console.log('   - Нижняя конечность: 5 иллюстраций')
    console.log('\n✅ Всего: 21 место для иллюстраций')

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

addImagePlaceholders()
