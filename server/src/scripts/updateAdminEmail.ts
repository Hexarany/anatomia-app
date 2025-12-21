import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'

// Load environment variables
dotenv.config()

async function updateAdminEmail() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables')
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Find admin user by old email
    const admin = await User.findOne({ email: 'admin@anatomia.com' })

    if (!admin) {
      console.log('⚠️  User with email admin@anatomia.com not found')
      console.log('Checking if hexarany@gmail.com already exists...')

      const existingUser = await User.findOne({ email: 'hexarany@gmail.com' })
      if (existingUser) {
        console.log('✅ User with hexarany@gmail.com already exists:')
        console.log(`   Name: ${existingUser.firstName} ${existingUser.lastName}`)
        console.log(`   Role: ${existingUser.role}`)
        console.log(`   Email: ${existingUser.email}`)
      } else {
        console.log('❌ No admin user found with either email')
      }

      await mongoose.disconnect()
      return
    }

    console.log('\n📋 Found admin user:')
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`)
    console.log(`   Current Email: ${admin.email}`)
    console.log(`   Role: ${admin.role}`)

    // Update email
    admin.email = 'hexarany@gmail.com'
    await admin.save()

    console.log('\n✅ Email updated successfully!')
    console.log(`   New Email: ${admin.email}`)
    console.log('\n💡 You can now login with: hexarany@gmail.com')

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error updating admin email:', error)
    process.exit(1)
  }
}

updateAdminEmail()
