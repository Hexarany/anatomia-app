import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from '../models/Category'
import Topic from '../models/Topic'

dotenv.config()

const checkCategories = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(MONGODB_URI)

    const categories = await Category.find()
    console.log('📊 Статус всех категорий:\n')

    for (const cat of categories) {
      const count = await Topic.countDocuments({ categoryId: cat._id })
      const status = count > 0 ? '✅' : '⏳'
      console.log(`${status} ${cat.name.ru} (${cat.name.ro})`)
      console.log(`   ID: ${cat._id}`)
      console.log(`   Тем: ${count}\n`)
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkCategories()
