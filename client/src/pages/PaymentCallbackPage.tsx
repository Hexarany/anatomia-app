import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

const PaymentCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token, updateUser } = useAuth()

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState('')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    const processPayPalPayment = async (orderId: string, tierId: string) => {
      try {
        // Get promo code ID from session storage if exists
        const promoCodeId = sessionStorage.getItem('promoCodeId')

        // Capture the PayPal payment
        const response = await axios.post(
          `${API_URL}/tier-payment/capture-order`,
          {
            orderId,
            tierId,
            promoCodeId: promoCodeId || undefined,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        // Clear promo code from session storage
        sessionStorage.removeItem('promoCodeId')

        setPaymentDetails(response.data.paymentDetails)
        updateUser(response.data.user)
        setStatus('success')
      } catch (err: any) {
        console.error('PayPal payment capture error:', err)
        setStatus('error')
        setError(err.response?.data?.message || 'Ошибка при обработке платежа PayPal')
      }
    }

    const processMAIBPayment = async (transactionId: string, tierId: string) => {
      try {
        // Get promo code ID from session storage if exists
        const promoCodeId = sessionStorage.getItem('promoCodeId')

        // Complete MAIB transaction
        const response = await axios.post(
          `${API_URL}/maib-payment/complete-transaction`,
          {
            transactionId,
            tierId,
            promoCodeId: promoCodeId || undefined,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        // Clear session storage
        sessionStorage.removeItem('promoCodeId')
        sessionStorage.removeItem('maibTransactionId')
        sessionStorage.removeItem('maibTierId')

        setPaymentDetails(response.data.paymentDetails)
        updateUser(response.data.user)
        setStatus('success')
      } catch (err: any) {
        console.error('MAIB payment completion error:', err)
        setStatus('error')
        setError(err.response?.data?.message || 'Ошибка при завершении платежа MAIB')
      }
    }

    const processPayment = async () => {
      // Check if user cancelled the payment
      const cancelled = searchParams.get('cancelled')
      if (cancelled === 'true') {
        setStatus('error')
        setError('Платеж был отменен')
        return
      }

      // Check for PayPal callback (has 'token' param)
      const paypalOrderId = searchParams.get('token')
      const tierId = searchParams.get('tierId')

      if (paypalOrderId && tierId) {
        // PayPal payment
        await processPayPalPayment(paypalOrderId, tierId)
        return
      }

      // Check for MAIB callback (uses sessionStorage)
      const maibTransactionId = sessionStorage.getItem('maibTransactionId')
      const maibTierId = sessionStorage.getItem('maibTierId')

      if (maibTransactionId && maibTierId) {
        // MAIB payment
        await processMAIBPayment(maibTransactionId, maibTierId)
        return
      }

      // No valid payment method found
      setStatus('error')
      setError('Не найдены данные платежа. Пожалуйста, попробуйте снова.')
    }

    processPayment()
  }, [searchParams, token])

  if (status === 'processing') {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={64} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Обработка платежа...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Пожалуйста, подождите. Не закрывайте эту страницу.
          </Typography>
        </Box>
      </Container>
    )
  }

  if (status === 'error') {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Ошибка платежа
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {error}
            </Alert>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ваша карта не была списана. Пожалуйста, попробуйте снова или свяжитесь с
              поддержкой.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
              >
                На главную
              </Button>
              <Button variant="contained" onClick={() => navigate('/pricing')}>
                Попробовать снова
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    )
  }

  // Success
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <SuccessIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Оплата успешна!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Спасибо за покупку
          </Typography>

          <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
            Ваш доступ был успешно обновлен. Теперь вы можете пользоваться всеми
            преимуществами вашего тарифного плана.
          </Alert>

          {paymentDetails && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                Детали платежа:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={paymentDetails.transactionId ? "Transaction ID" : "Order ID"}
                    secondary={paymentDetails.transactionId || paymentDetails.orderId}
                    secondaryTypographyProps={{ sx: { wordBreak: 'break-all' } }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Сумма"
                    secondary={`${paymentDetails.amount} ${paymentDetails.currency}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Статус"
                    secondary={paymentDetails.status || paymentDetails.result}
                  />
                </ListItem>
                {paymentDetails.resultCode && (
                  <ListItem>
                    <ListItemText
                      primary="Код результата"
                      secondary={paymentDetails.resultCode}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Квитанция отправлена на вашу почту. Вы можете начать использовать платформу прямо
            сейчас!
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              На главную
            </Button>
            <Button variant="contained" onClick={() => navigate('/anatomy')}>
              Начать обучение
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default PaymentCallbackPage
