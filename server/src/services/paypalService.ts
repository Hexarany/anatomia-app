import axios from 'axios'
import { paypalConfig } from '../config/paypal'

// Get PayPal access token
export const getPayPalAccessToken = async (): Promise<string> => {
  try {
    // Validate PayPal credentials
    if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
      throw new Error(
        'PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in environment variables.'
      )
    }

    const auth = Buffer.from(
      `${paypalConfig.clientId}:${paypalConfig.clientSecret}`
    ).toString('base64')

    const response = await axios.post(
      `${paypalConfig.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response.data.access_token
  } catch (error: any) {
    console.error('Error getting PayPal access token:', error.response?.data || error.message)
    throw new Error('Не удалось получить токен доступа PayPal')
  }
}

// Create PayPal order
export const createPayPalOrder = async (
  amount: number,
  currency: string = 'USD',
  planName: string,
  tierId: string
): Promise<any> => {
  try {
    const accessToken = await getPayPalAccessToken()

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: planName,
        },
      ],
      application_context: {
        return_url: `${process.env.CLIENT_URL}/payment-callback?tierId=${tierId}`,
        cancel_url: `${process.env.CLIENT_URL}/payment-callback?cancelled=true`,
        brand_name: 'Anatomia Atlas',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
      },
    }

    const response = await axios.post(
      `${paypalConfig.baseUrl}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Error creating PayPal order:', error.response?.data || error.message)
    throw new Error('Не удалось создать заказ PayPal')
  }
}

// Capture PayPal payment
export const capturePayPalPayment = async (orderId: string): Promise<any> => {
  try {
    const accessToken = await getPayPalAccessToken()

    const response = await axios.post(
      `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Error capturing PayPal payment:', error.response?.data || error.message)
    throw new Error('Не удалось завершить платеж PayPal')
  }
}

// Get PayPal order details
export const getPayPalOrderDetails = async (orderId: string): Promise<any> => {
  try {
    const accessToken = await getPayPalAccessToken()

    const response = await axios.get(
      `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Error getting PayPal order details:', error.response?.data || error.message)
    throw new Error('Не удалось получить детали заказа PayPal')
  }
}

// Verify webhook signature (for security)
export const verifyPayPalWebhook = async (
  webhookId: string,
  headers: any,
  body: any
): Promise<boolean> => {
  try {
    const accessToken = await getPayPalAccessToken()

    const verificationData = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body,
    }

    const response = await axios.post(
      `${paypalConfig.baseUrl}/v1/notifications/verify-webhook-signature`,
      verificationData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.verification_status === 'SUCCESS'
  } catch (error: any) {
    console.error('Error verifying PayPal webhook:', error.response?.data || error.message)
    return false
  }
}
