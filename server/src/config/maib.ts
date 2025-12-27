import dotenv from 'dotenv'

dotenv.config()

/**
 * MAIB E-Commerce configuration
 *
 * Required environment variables:
 * - MAIB_MERCHANT_ID: Your merchant ID from MAIB
 * - MAIB_MERCHANT_URL: MAIB payment gateway URL
 * - MAIB_CERT_PATH: Path to your certificate file (.pem)
 * - MAIB_CERT_PASSWORD: Certificate password
 * - MAIB_CALLBACK_URL: URL for payment callbacks
 *
 * MAIB Test environment:
 * - URL: https://ecomm.maib.md:21440/ecomm/MerchantHandler
 * - Test cards: https://docs.maib.md/en/testing
 *
 * MAIB Production environment:
 * - URL: https://ecomm.maib.md:4499/ecomm/MerchantHandler
 */

export const maibConfig = {
  // Merchant credentials
  merchantId: process.env.MAIB_MERCHANT_ID || '',

  // Gateway URL (test or production)
  gatewayUrl: process.env.MAIB_MERCHANT_URL || 'https://ecomm.maib.md:21440/ecomm/MerchantHandler',

  // Certificate for authentication
  certPath: process.env.MAIB_CERT_PATH || '',
  certPassword: process.env.MAIB_CERT_PASSWORD || '',

  // Callback URLs
  callbackUrl: process.env.MAIB_CALLBACK_URL || `${process.env.CLIENT_URL}/payment-callback`,

  // Currency (MDL = 498, USD = 840, EUR = 978)
  defaultCurrency: process.env.MAIB_CURRENCY || '840', // USD by default

  // Language (en, ro, ru)
  defaultLanguage: process.env.MAIB_LANGUAGE || 'ru',

  // Is production mode
  isProduction: process.env.NODE_ENV === 'production',
}

// Validate required configuration
export function validateMAIBConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!maibConfig.merchantId) {
    errors.push('MAIB_MERCHANT_ID is not set')
  }

  if (!maibConfig.certPath) {
    errors.push('MAIB_CERT_PATH is not set')
  }

  if (!maibConfig.certPassword) {
    errors.push('MAIB_CERT_PASSWORD is not set')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Currency codes
export const MAIB_CURRENCIES = {
  MDL: '498', // Moldovan Leu
  USD: '840', // US Dollar
  EUR: '978', // Euro
}

// Language codes
export const MAIB_LANGUAGES = {
  EN: 'en',
  RO: 'ro',
  RU: 'ru',
}

// Transaction types
export const MAIB_TRANSACTION_TYPES = {
  SMS: 'SMS', // Authorization (hold funds)
  DMS: 'DMS', // Two-step transaction
  DMSAuth: 'DMS_AUTH', // First step of DMS
  DMSComplete: 'DMS_COMPLETE', // Complete DMS transaction
}
