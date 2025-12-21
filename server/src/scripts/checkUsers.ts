import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'

dotenv.config()

async function checkUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found')
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    // Find both users
    const adminUser = await User.findOne({ email: 'admin@anatomia.com' })
    const hexaranyUser = await User.findOne({ email: 'hexarany@gmail.com' })

    console.log('📋 User 1: admin@anatomia.com')
    if (adminUser) {
      console.log(`   ID: ${adminUser._id}`)
      console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Access Level: ${adminUser.accessLevel}`)
      console.log(`   Created: ${adminUser.createdAt}`)
    } else {
      console.log('   ❌ Not found')
    }

    console.log('\n📋 User 2: hexarany@gmail.com')
    if (hexaranyUser) {
      console.log(`   ID: ${hexaranyUser._id}`)
      console.log(`   Name: ${hexaranyUser.firstName} ${hexaranyUser.lastName}`)
      console.log(`   Email: ${hexaranyUser.email}`)
      console.log(`   Role: ${hexaranyUser.role}`)
      console.log(`   Access Level: ${hexaranyUser.accessLevel}`)
      console.log(`   Created: ${hexaranyUser.createdAt}`)
    } else {
      console.log('   ❌ Not found')
    }

    console.log('\n💡 Recommendation:')
    if (adminUser && hexaranyUser) {
      if (hexaranyUser.role === 'admin') {
        console.log('   Both are admins. You should delete one of them.')
        console.log(`   Option 1: Delete admin@anatomia.com and keep hexarany@gmail.com`)
        console.log(`   Option 2: Delete hexarany@gmail.com and rename admin@anatomia.com`)
      } else {
        console.log(`   hexarany@gmail.com has role: ${hexaranyUser.role}`)
        console.log(`   You can delete it and update admin@anatomia.com to hexarany@gmail.com`)
      }
    }

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkUsers()
