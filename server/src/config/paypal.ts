import dotenv from 'dotenv'

dotenv.config()

export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox', 'live', or 'production'
  baseUrl:
    process.env.PAYPAL_MODE === 'live' || process.env.PAYPAL_MODE === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com',
}

// Validate PayPal configuration
export const validatePayPalConfig = (): boolean => {
  if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
    console.warn('⚠️  PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env')
    return false
  }
  return true
}
