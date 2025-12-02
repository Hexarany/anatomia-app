import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'
import { connectDB } from '../config/database'

dotenv.config()

async function fixUser() {
  try {
    await connectDB()

    const userId = '691788551d2a4918f3810c66'
    console.log(`\n🔧 Fixing user: ${userId}\n`)

    const user = await User.findById(userId)

    if (!user) {
      console.log('❌ User not found!')
      return
    }

    console.log('Before:')
    console.log(`  firstName: "${user.firstName}"`)
    console.log(`  lastName:  "${user.lastName}"`)

    // Fix missing or invalid lastName
    if (!user.lastName || user.lastName.trim().length === 0) {
      user.lastName = ''  // Set to empty string (valid)
      console.log('\n✅ Fixed: Set lastName to empty string')
    }

    // Ensure accessLevel is set
    if (!user.accessLevel) {
      user.accessLevel = 'free'
      console.log('✅ Fixed: Set accessLevel to free')
    }

    // Save with validation disabled to avoid issues
    await user.save({ validateBeforeSave: false })

    console.log('\nAfter:')
    console.log(`  firstName: "${user.firstName}"`)
    console.log(`  lastName:  "${user.lastName}"`)
    console.log(`  accessLevel: "${user.accessLevel}"`)

    console.log('\n✅ User fixed successfully!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

fixUser()
