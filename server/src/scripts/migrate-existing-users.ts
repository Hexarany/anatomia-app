import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'

dotenv.config()

/**
 * Migration script for existing users with basic/premium access
 *
 * IMPORTANT DECISION:
 * Users who paid before had "lifetime access" promise on pricing page.
 *
 * Options:
 * A) Give them TRUE lifetime access (subscriptionEndsAt = null means "forever")
 * B) Set a very far future date (2099-12-31) for "grandfathered" users
 * C) Convert them to 1-year subscription and notify them
 *
 * RECOMMENDATION: Option A or B to honor the original promise
 */

const GRANDFATHERED_DATE = new Date('2099-12-31') // Far future date for "lifetime" users

async function migrateExistingUsers() {
  try {
    console.log('🔄 Starting migration for existing users...\n')

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || '')
    console.log('✅ Connected to database\n')

    // Find all users with basic or premium BUT no subscriptionEndsAt
    const existingPaidUsers = await User.find({
      accessLevel: { $in: ['basic', 'premium'] },
      $or: [
        { subscriptionEndsAt: { $exists: false } },
        { subscriptionEndsAt: null }
      ]
    })

    console.log(`📊 Found ${existingPaidUsers.length} existing paid users:\n`)

    if (existingPaidUsers.length === 0) {
      console.log('✅ No users to migrate. All done!')
      await mongoose.disconnect()
      return
    }

    // Show statistics
    const basicCount = existingPaidUsers.filter(u => u.accessLevel === 'basic').length
    const premiumCount = existingPaidUsers.filter(u => u.accessLevel === 'premium').length

    console.log(`   - Basic users: ${basicCount}`)
    console.log(`   - Premium users: ${premiumCount}\n`)

    console.log('⚠️  MIGRATION STRATEGY:')
    console.log('   These users paid when "lifetime access" was promised.')
    console.log('   We will give them grandfathered status with subscriptionEndsAt = 2099-12-31')
    console.log('   This effectively gives them lifetime access.\n')

    // Uncomment ONE of the options below:

    // OPTION A: TRUE Lifetime (subscriptionEndsAt stays null)
    // This requires updating hasAccessToContent to handle null as "forever"
    /*
    console.log('📝 Strategy: Keep subscriptionEndsAt = null (true lifetime)')
    console.log('   Note: This requires no changes, null = lifetime\n')
    */

    // OPTION B: Grandfathered date (RECOMMENDED)
    console.log('📝 Strategy: Set subscriptionEndsAt = 2099-12-31 (grandfathered)')

    let updated = 0
    for (const user of existingPaidUsers) {
      user.subscriptionEndsAt = GRANDFATHERED_DATE
      await user.save()
      updated++

      console.log(`   ✓ ${user.email} (${user.accessLevel}) → grandfathered until 2099`)
    }

    console.log(`\n✅ Migration complete! Updated ${updated} users.`)
    console.log(`\n📋 Summary:`)
    console.log(`   - All existing paid users now have subscriptionEndsAt = 2099-12-31`)
    console.log(`   - They will keep their access "forever" (honoring original promise)`)
    console.log(`   - New users from now on will have time-limited subscriptions\n`)

    await mongoose.disconnect()
    console.log('✅ Disconnected from database')

  } catch (error) {
    console.error('❌ Migration error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

// Run migration
migrateExistingUsers()
