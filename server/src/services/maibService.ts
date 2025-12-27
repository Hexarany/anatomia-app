import axios from 'axios'
import https from 'https'
import fs from 'fs'
import { maibConfig, MAIB_CURRENCIES } from '../config/maib'

/**
 * MAIB E-Commerce Service
 *
 * Based on MAIB documentation:
 * https://docs.maib.md/
 */

interface MAIBTransactionResponse {
  TRANSACTION_ID: string
  error?: string
  result?: string
}

// Create HTTPS agent with certificate (if available)
function createHTTPSAgent() {
  if (!maibConfig.certPath || !fs.existsSync(maibConfig.certPath)) {
    console.warn('⚠️  MAIB certificate not found. Using default HTTPS agent.')
    return undefined
  }

  try {
    const cert = fs.readFileSync(maibConfig.certPath)
    return new https.Agent({
      cert,
      passphrase: maibConfig.certPassword,
      rejectUnauthorized: !maibConfig.isProduction, // Allow self-signed in test
    })
  } catch (error) {
    console.error('❌ Error loading MAIB certificate:', error)
    return undefined
  }
}

/**
 * Register SMS transaction (single-step payment)
 * This creates a payment and immediately authorizes it
 */
export async function registerSMSTransaction(
  amount: number,
  currency: string = 'USD',
  description: string,
  clientIpAddr: string = '127.0.0.1'
): Promise<MAIBTransactionResponse> {
  try {
    // Convert amount to minor units (cents)
    const amountInCents = Math.round(amount * 100)

    // Get currency code
    const currencyCode = currency === 'USD' ? MAIB_CURRENCIES.USD : MAIB_CURRENCIES.MDL

    const params = new URLSearchParams({
      command: 'v',
      amount: amountInCents.toString(),
      currency: currencyCode,
      client_ip_addr: clientIpAddr,
      description: description.substring(0, 125), // Max 125 chars
      language: maibConfig.defaultLanguage,
    })

    const response = await axios.post(
      maibConfig.gatewayUrl,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: createHTTPSAgent(),
      }
    )

    // Parse response (format: "TRANSACTION_ID: 12345\n")
    const data = response.data as string
    const lines = data.split('\n').filter(Boolean)

    const result: MAIBTransactionResponse = {
      TRANSACTION_ID: '',
    }

    for (const line of lines) {
      const [key, value] = line.split(':').map(s => s.trim())
      if (key === 'TRANSACTION_ID') {
        result.TRANSACTION_ID = value
      } else if (key === 'error') {
        result.error = value
      } else if (key === 'RESULT') {
        result.result = value
      }
    }

    if (!result.TRANSACTION_ID || result.error) {
      throw new Error(result.error || 'Failed to register transaction')
    }

    return result
  } catch (error: any) {
    console.error('❌ MAIB registerSMSTransaction error:', error)
    throw new Error(`Failed to register MAIB transaction: ${error.message}`)
  }
}

/**
 * Get transaction result
 * Check the status of a transaction
 */
export async function getTransactionResult(
  transactionId: string,
  clientIpAddr: string = '127.0.0.1'
): Promise<any> {
  try {
    const params = new URLSearchParams({
      command: 'c',
      trans_id: transactionId,
      client_ip_addr: clientIpAddr,
    })

    const response = await axios.post(
      maibConfig.gatewayUrl,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: createHTTPSAgent(),
      }
    )

    // Parse response
    const data = response.data as string
    const lines = data.split('\n').filter(Boolean)

    const result: any = {}

    for (const line of lines) {
      const [key, value] = line.split(':').map(s => s.trim())
      result[key] = value
    }

    return result
  } catch (error: any) {
    console.error('❌ MAIB getTransactionResult error:', error)
    throw new Error(`Failed to get transaction result: ${error.message}`)
  }
}

/**
 * Reverse transaction (refund)
 * Reverse an authorized payment
 */
export async function reverseTransaction(
  transactionId: string,
  amount: number
): Promise<any> {
  try {
    const amountInCents = Math.round(amount * 100)

    const params = new URLSearchParams({
      command: 'r',
      trans_id: transactionId,
      amount: amountInCents.toString(),
    })

    const response = await axios.post(
      maibConfig.gatewayUrl,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent: createHTTPSAgent(),
      }
    )

    const data = response.data as string
    const lines = data.split('\n').filter(Boolean)

    const result: any = {}

    for (const line of lines) {
      const [key, value] = line.split(':').map(s => s.trim())
      result[key] = value
    }

    return result
  } catch (error: any) {
    console.error('❌ MAIB reverseTransaction error:', error)
    throw new Error(`Failed to reverse transaction: ${error.message}`)
  }
}

/**
 * Get payment page URL
 * Construct the URL where user will be redirected to pay
 */
export function getPaymentPageURL(transactionId: string): string {
  const baseUrl = maibConfig.gatewayUrl.replace('/MerchantHandler', '')
  return `${baseUrl}/ClientHandler?trans_id=${transactionId}`
}
