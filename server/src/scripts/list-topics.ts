import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Topic from '../models/Topic'

dotenv.config()

const listTopics = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const topics = await Topic.find({}).sort({ createdAt: 1 })

    console.log('\n📚 Все темы в базе данных:\n')
    topics.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic.slug}`)
      console.log(`   RU: ${topic.name.ru}`)
      console.log(`   RO: ${topic.name.ro}`)
      console.log('')
    })

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

listTopics()
