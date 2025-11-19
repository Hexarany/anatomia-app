
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Topic from '../models/Topic'

dotenv.config()

const finalIllustrationCleanup = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error("❌ MONGODB_URI не определен. Проверьте ваш файл .env")
    }

    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    console.log('✅ Connected to MongoDB')

    const topics = await Topic.find({})
    let updatedCount = 0

    const ILLUSTRATION_PLACEHOLDER_RU = '## 🖼️ Иллюстрации'
    const ILLUSTRATION_PLACEHOLDER_RO = '## 🖼️ Ilustrații'

    for (const topic of topics) {
      let ruContent = topic.content.ru
      let roContent = topic.content.ro
      let changed = false
      
      // Проверка и добавление на русском
      if (ruContent && !ruContent.includes(ILLUSTRATION_PLACEHOLDER_RU)) {
        ruContent = `${ILLUSTRATION_PLACEHOLDER_RU}\n* [Image placeholder] - Здесь будет иллюстрация.\n\n${ruContent}`.trim()
        changed = true
      }
      
      // Проверка и добавление на румынском
      if (roContent && !roContent.includes(ILLUSTRATION_PLACEHOLDER_RO)) {
        roContent = `${ILLUSTRATION_PLACEHOLDER_RO}\n* [Image placeholder] - Aici va fi ilustrația.\n\n${roContent}`.trim()
        changed = true
      }
      
      if (changed) {
        topic.content.ru = ruContent
        topic.content.ro = roContent
        await topic.save()
        updatedCount++
      }
    }

    console.log(`\n🎉 Финальная чистка завершена!`)
    console.log(`   Обновлено тем: ${updatedCount}`)
    console.log(`   Все ${topics.length} тем теперь имеют блок иллюстраций.`)

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error in final illustration cleanup:', error)
    process.exit(1)
  }
}

finalIllustrationCleanup()
