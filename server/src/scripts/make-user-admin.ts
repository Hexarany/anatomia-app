import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'

dotenv.config()

const makeUserAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anatomia'
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // ID пользователя из логов сервера
    const userId = '6915268c6f5a6cd1c4ee35bb'

    const user = await User.findById(userId)

    if (!user) {
      console.log('❌ Пользователь не найден')
      process.exit(1)
    }

    console.log('📝 Текущие данные пользователя:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Имя: ${user.name}`)
    console.log(`   Роль: ${user.role}\n`)

    // Изменяем роль на admin
    user.role = 'admin'
    await user.save()

    console.log('✅ Роль успешно изменена на "admin"!\n')
    console.log('Теперь вы можете войти в админ-панель: http://localhost:5175/admin\n')

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

makeUserAdmin()
