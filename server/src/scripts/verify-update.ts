import mongoose from 'mongoose'
import Topic from '../models/Topic'

const verifyUpdate = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/anatomia')
    console.log('✅ Connected to MongoDB\n')

    // Fetch one of the updated topics to verify
    const topic = await Topic.findOne({ slug: 'spine-complete' })

    if (topic) {
      console.log('📋 Тема найдена:', topic.name.ru)
      console.log('📏 Длина контента (RU):', topic.content.ru.length, 'символов')
      console.log('📏 Длина контента (RO):', topic.content.ro.length, 'символов')
      console.log('\n🔍 Первые 500 символов контента:')
      console.log(topic.content.ru.substring(0, 500))
      console.log('\n✅ Проверка содержимого callout блоков:')
      const dangerBlocks = (topic.content.ru.match(/:::danger/g) || []).length
      const warningBlocks = (topic.content.ru.match(/:::warning/g) || []).length
      const clinicalBlocks = (topic.content.ru.match(/:::clinical/g) || []).length
      const infoBlocks = (topic.content.ru.match(/:::info/g) || []).length
      console.log(`   - danger блоков: ${dangerBlocks}`)
      console.log(`   - warning блоков: ${warningBlocks}`)
      console.log(`   - clinical блоков: ${clinicalBlocks}`)
      console.log(`   - info блоков: ${infoBlocks}`)
      console.log('\n✅ Проверка таблиц:')
      const tables = (topic.content.ru.match(/\|.*\|/g) || []).length
      console.log(`   - Строк таблиц: ${tables}`)
    } else {
      console.log('❌ Тема не найдена')
    }

    await mongoose.connection.close()
    console.log('\n✅ Проверка завершена')
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

verifyUpdate()
