import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'
import { connectDB } from '../config/database'

dotenv.config()

async function checkUser() {
  try {
    await connectDB()

    const userId = '691788551d2a4918f3810c66'
    console.log(`\n🔍 Checking user: ${userId}\n`)

    const user = await User.findById(userId)

    if (!user) {
      console.log('❌ User not found!')
      return
    }

    console.log('📋 User data:')
    console.log('━'.repeat(60))
    console.log(`Email:        ${user.email}`)
    console.log(`Name (old):   ${user.name || 'N/A'}`)
    console.log(`FirstName:    ${user.firstName || 'MISSING!'}`)
    console.log(`LastName:     ${user.lastName || 'MISSING!'}`)
    console.log(`Role:         ${user.role}`)
    console.log(`AccessLevel:  ${user.accessLevel || 'MISSING!'}`)
    console.log(`PaymentAmt:   ${user.paymentAmount || 0}`)
    console.log(`Sub Status:   ${user.subscriptionStatus || 'N/A'}`)
    console.log(`Sub End:      ${user.subscriptionEndDate || 'N/A'}`)
    console.log(`Created:      ${user.createdAt}`)
    console.log('━'.repeat(60))

    // Check for issues
    console.log('\n🔍 Checking for issues:')
    const issues = []

    if (!user.firstName || user.firstName.trim().length < 2) {
      issues.push('❌ firstName is missing or too short')
    }
    if (!user.lastName) {
      issues.push('⚠️  lastName is missing (empty string is OK)')
    }
    if (!user.accessLevel) {
      issues.push('❌ accessLevel is missing')
    }
    if (user.firstName?.includes('  ')) {
      issues.push('⚠️  firstName has double spaces')
    }
    if (user.lastName?.includes('  ')) {
      issues.push('⚠️  lastName has double spaces')
    }

    if (issues.length > 0) {
      console.log('\n⚠️  Found issues:')
      issues.forEach(issue => console.log(`  ${issue}`))

      console.log('\n💡 Suggested fix:')
      console.log('Run: npx ts-node src/scripts/fix-user.ts')
    } else {
      console.log('\n✅ No issues found - user data looks good!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

checkUser()
