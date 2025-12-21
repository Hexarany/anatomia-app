import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'

dotenv.config()

async function fixAdminEmail() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found')
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    // Step 1: Delete the teacher account with hexarany@gmail.com
    console.log('🗑️  Deleting teacher account: hexarany@gmail.com')
    const deletedTeacher = await User.findOneAndDelete({
      email: 'hexarany@gmail.com',
      role: 'teacher'
    })

    if (deletedTeacher) {
      console.log(`   ✅ Deleted: ${deletedTeacher.firstName} ${deletedTeacher.lastName} (teacher)`)
    } else {
      console.log('   ⚠️  Teacher account not found (maybe already deleted)')
    }

    // Step 2: Update admin email
    console.log('\n📝 Updating admin email: admin@anatomia.com → hexarany@gmail.com')
    const admin = await User.findOne({ email: 'admin@anatomia.com' })

    if (!admin) {
      console.log('   ❌ Admin account not found!')
      await mongoose.disconnect()
      return
    }

    console.log(`   Current: ${admin.firstName} ${admin.lastName} (${admin.role})`)

    admin.email = 'hexarany@gmail.com'
    await admin.save()

    console.log('   ✅ Email updated successfully!')

    // Step 3: Verify
    console.log('\n✅ Verification:')
    const updatedAdmin = await User.findOne({ email: 'hexarany@gmail.com' })
    if (updatedAdmin) {
      console.log(`   Name: ${updatedAdmin.firstName} ${updatedAdmin.lastName}`)
      console.log(`   Email: ${updatedAdmin.email}`)
      console.log(`   Role: ${updatedAdmin.role}`)
      console.log(`   Access: ${updatedAdmin.accessLevel}`)
    }

    console.log('\n💡 You can now login with: hexarany@gmail.com')

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixAdminEmail()
