import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User'

dotenv.config()

/**
 * Fix subscription dates:
 * 1. Наталья (natalie2016xl@gmail.com) - Lifetime Premium (2099)
 * 2. Basic test users (10 people) - 30 days trial (they didn't pay)
 * 3. Other Premium grandfathered - convert to 30 days (test users)
 */

const BASIC_TRIAL_DAYS = 30 // 30 days for test Basic users
const LIFETIME_DATE = new Date('2099-12-31') // Lifetime for Наталья
const NATALYA_EMAIL = 'natalie2016xl@gmail.com'

async function fixBasicUsers() {
  try {
    console.log('🔄 Fixing user subscription dates...\n')

    await mongoose.connect(process.env.MONGODB_URI || '')
    console.log('✅ Connected to database\n')

    // STEP 1: Give Наталья lifetime Premium
    console.log('📝 Step 1: Giving Наталья lifetime Premium access\n')
    const natalya = await User.findOne({ email: NATALYA_EMAIL })
    if (natalya) {
      natalya.subscriptionEndsAt = LIFETIME_DATE
      natalya.accessLevel = 'premium'
      await natalya.save()
      console.log(`   ✅ ${natalya.email} → Lifetime Premium (до 2099-12-31)\n`)
    } else {
      console.log(`   ⚠️  Наталья not found\n`)
    }

    // STEP 2: Fix Basic test users (30 days)
    console.log('📝 Step 2: Fixing Basic test users (30 days trial)\n')
    const basicUsers = await User.find({
      accessLevel: 'basic',
      subscriptionEndsAt: { $gte: new Date('2099-01-01') }
    })

    console.log(`   Found ${basicUsers.length} Basic users with grandfathered status\n`)

    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + BASIC_TRIAL_DAYS * 24 * 60 * 60 * 1000)

    let fixedBasic = 0
    for (const user of basicUsers) {
      user.subscriptionEndsAt = trialEndsAt
      await user.save()
      fixedBasic++
      console.log(`   ✓ ${user.email} → 30 days trial (до ${trialEndsAt.toISOString().split('T')[0]})`)
    }

    // STEP 3: Check other Premium grandfathered users
    console.log(`\n📝 Step 3: Checking other Premium users\n`)
    const otherPremium = await User.find({
      accessLevel: 'premium',
      subscriptionEndsAt: { $gte: new Date('2099-01-01') },
      email: { $ne: NATALYA_EMAIL }
    })

    console.log(`   Found ${otherPremium.length} other Premium grandfathered users\n`)

    let fixedPremium = 0
    for (const user of otherPremium) {
      user.subscriptionEndsAt = trialEndsAt
      await user.save()
      fixedPremium++
      console.log(`   ✓ ${user.email} → 30 days trial (до ${trialEndsAt.toISOString().split('T')[0]})`)
    }

    console.log(`\n✅ Migration complete!`)
    console.log(`\n📋 Summary:`)
    console.log(`   - Наталья Свирская: Lifetime Premium ✅`)
    console.log(`   - m.stiv@mail.ru: Premium до 2026-03-24 (unchanged) ✅`)
    console.log(`   - ${fixedBasic} Basic test users: 30 days trial`)
    console.log(`   - ${fixedPremium} Premium test users: 30 days trial`)
    console.log(`   - Trial expires: ${trialEndsAt.toISOString().split('T')[0]}\n`)

    await mongoose.disconnect()
    console.log('✅ Disconnected from database')

  } catch (error) {
    console.error('❌ Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

fixBasicUsers()
