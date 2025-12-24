import { useState, FormEvent } from 'react'
import { useSearchParams, Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

const ResetPasswordPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError(t('auth.reset.missingToken'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.reset.passwordTooShort'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.reset.mismatch'))
      return
    }

    try {
      setLoading(true)
      await axios.post(`${API_BASE_URL}/auth/password-reset/confirm`, {
        token,
        password,
      })
      setSuccess(t('auth.reset.success'))
      setTimeout(() => navigate('/login'), 1200)
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.reset.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }} elevation={3}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          {t('auth.reset.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('auth.reset.subtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label={t('auth.reset.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            autoComplete="new-password"
          />
          <TextField
            label={t('auth.reset.confirm')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            autoComplete="new-password"
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {t('auth.reset.submit')}
          </Button>
        </Box>

        <Button
          component={RouterLink}
          to="/login"
          sx={{ mt: 2 }}
        >
          {t('auth.reset.backToLogin')}
        </Button>
      </Paper>
    </Container>
  )
}

export default ResetPasswordPage
