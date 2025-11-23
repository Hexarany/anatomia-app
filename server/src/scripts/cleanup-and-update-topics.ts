import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Topic from '../models/Topic'

dotenv.config()

const cleanupAndUpdateTopics = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // 1. УДАЛЯЕМ ДУБЛИКАТЫ
    console.log('\n🗑️  Удаляем дубликаты...')

    // Удаляем старую тему черепа (skull-complete)
    const oldSkull = await Topic.findOneAndDelete({ slug: 'skull-complete' })
    if (oldSkull) {
      console.log('   ✅ Удалена старая тема: Череп (skull-complete)')
    }

    // 2. ПЕРЕИМЕНОВЫВАЕМ skull-detailed -> skull-complete
    console.log('\n📝 Переименовываем темы...')
    const newSkull = await Topic.findOne({ slug: 'skull-detailed' })
    if (newSkull) {
      newSkull.slug = 'skull-complete'
      newSkull.name = {
        ru: 'Череп - Полная анатомия для мануального терапевта',
        ro: 'Craniu - Anatomie completă pentru terapeuți manuali'
      }
      newSkull.description = {
        ru: 'Детальное описание всех костей черепа для мануальных терапевтов и массажистов',
        ro: 'Descriere detaliată a tuturor oaselor craniului pentru terapeuți manuali și masaj'
      }
      await newSkull.save()
      console.log('   ✅ Череп переименован в skull-complete')
    }

    // 3. ОБНОВЛЯЕМ ОСТАЛЬНЫЕ ТЕМЫ

    // Удаляем cervical-spine (оставляем только полную версию позвоночника)
    const oldCervical = await Topic.findOneAndDelete({ slug: 'cervical-spine' })
    if (oldCervical) {
      console.log('   ✅ Удалена старая тема: Шейный отдел (cervical-spine)')
    }

    // Обновляем Позвоночник
    const spine = await Topic.findOne({ slug: 'spine-complete' })
    if (spine) {
      spine.name = {
        ru: 'Позвоночник - Полная анатомия для мануального терапевта',
        ro: 'Coloana vertebrală - Anatomie completă pentru terapeuți manuali'
      }
      spine.description = {
        ru: 'Детальное описание всех отделов позвоночника для мануальных терапевтов',
        ro: 'Descriere detaliată a tuturor regiunilor coloanei vertebrale pentru terapeuți manuali'
      }
      await spine.save()
      console.log('   ✅ Позвоночник обновлен')
    }

    // Обновляем Грудную клетку
    const thorax = await Topic.findOne({ slug: 'thorax-detailed' })
    if (thorax) {
      thorax.name = {
        ru: 'Грудная клетка - Анатомия для мануального терапевта',
        ro: 'Cutia toracică - Anatomie pentru terapeuți manuali'
      }
      thorax.description = {
        ru: 'Ребра, грудина и межреберные пространства - руководство для массажистов',
        ro: 'Coaste, stern și spații intercostale - ghid pentru masaj'
      }
      await thorax.save()
      console.log('   ✅ Грудная клетка обновлена')
    }

    // Обновляем Верхнюю конечность
    const upperLimb = await Topic.findOne({ slug: 'upper-limb-bones' })
    if (upperLimb) {
      upperLimb.name = {
        ru: 'Кости верхней конечности - Руководство для массажистов',
        ro: 'Oasele membrului superior - Ghid pentru masaj'
      }
      upperLimb.description = {
        ru: 'Анатомия костей руки от плеча до кисти для мануальных терапевтов',
        ro: 'Anatomia oaselor brațului de la umăr la mână pentru terapeuți manuali'
      }
      await upperLimb.save()
      console.log('   ✅ Кости верхней конечности обновлены')
    }

    // Обновляем Нижнюю конечность
    const lowerLimb = await Topic.findOne({ slug: 'lower-limb-bones' })
    if (lowerLimb) {
      lowerLimb.name = {
        ru: 'Кости нижней конечности - Руководство для массажистов',
        ro: 'Oasele membrului inferior - Ghid pentru masaj'
      }
      lowerLimb.description = {
        ru: 'Анатомия костей ноги от таза до стопы для мануальных терапевтов',
        ro: 'Anatomia oaselor piciorului de la pelvis la picior pentru terapeuți manuali'
      }
      await lowerLimb.save()
      console.log('   ✅ Кости нижней конечности обновлены')
    }

    console.log('\n🎉 Все темы успешно обновлены!')
    console.log('\n📊 Итоговый список тем:')
    console.log('   1. Череп - Полная анатомия для мануального терапевта (skull-complete)')
    console.log('   2. Позвоночник - Полная анатомия для мануального терапевта (spine-complete)')
    console.log('   3. Грудная клетка - Анатомия для мануального терапевта (thorax-detailed)')
    console.log('   4. Кости верхней конечности - Руководство для массажистов (upper-limb-bones)')
    console.log('   5. Кости нижней конечности - Руководство для массажистов (lower-limb-bones)')

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanupAndUpdateTopics()
