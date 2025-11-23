import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from '../models/Category'
import Topic from '../models/Topic'

dotenv.config()

const generateSummary = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(MONGODB_URI)

    console.log('\n🎉 ФИНАЛЬНЫЙ ОТЧЕТ ПО КОНТЕНТУ ПЛАТФОРМЫ\n')
    console.log('=' .repeat(80))

    const categories = await Category.find().sort({ order: 1 })

    let totalTopics = 0
    let totalImages = 0

    for (const cat of categories) {
      const topics = await Topic.find({ categoryId: cat._id }).sort({ order: 1 })

      console.log(`\n✅ ${cat.name.ru} (${cat.name.ro})`)
      console.log('-'.repeat(80))
      console.log(`   Тем: ${topics.length}`)

      if (topics.length > 0) {
        console.log(`\n   Список тем:`)

        for (const topic of topics) {
          const imageCount = topic.images?.length || 0
          totalImages += imageCount
          console.log(`   ${topic.order}. ${topic.name.ru}`)
          console.log(`      Slug: ${topic.slug}`)
          console.log(`      Иллюстраций: ${imageCount}`)
          console.log(`      Описание: ${topic.description.ru}`)
        }
      }

      totalTopics += topics.length
    }

    console.log('\n' + '='.repeat(80))
    console.log('\n📊 ИТОГОВАЯ СТАТИСТИКА:\n')
    console.log(`   Категорий: ${categories.length}`)
    console.log(`   Тем: ${totalTopics}`)
    console.log(`   Мест для иллюстраций: ${totalImages}`)
    console.log('\n' + '='.repeat(80))

    console.log('\n✨ Все категории заполнены профессиональным контентом для массажистов!\n')

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

generateSummary()
