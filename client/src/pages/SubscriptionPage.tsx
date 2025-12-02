import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Box, CircularProgress, Typography } from '@mui/material'

/**
 * Legacy SubscriptionPage - redirects to new tier-based PricingPage
 * This page is kept for backward compatibility with old links
 */
const SubscriptionPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to new pricing page
    navigate('/pricing', { replace: true })
  }, [navigate])

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
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Перенаправление на страницу тарифов...
        </Typography>
      </Box>
    </Container>
  )
}

export default SubscriptionPage
