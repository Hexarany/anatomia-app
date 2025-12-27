import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from '@mui/material'
import { Check as CheckIcon, Star as StarIcon, LocalOffer as OfferIcon, CreditCard as CreditCardIcon } from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import { useMainButton } from '@/contexts/MainButtonContext'
import { useTelegram } from '@/contexts/TelegramContext'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

interface TierPlan {
  id: string
  name: {
    ru: string
    ro: string
  }
  price: number
  upgradeFromBasic?: number
  currency: string
  features: {
    ru: string[]
    ro: string[]
  }
  billing?: {
    ru: string
    ro: string
  }
}

const PricingPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, token, updateUser } = useAuth()
  const { setMainButton, hideMainButton } = useMainButton()
  const { isInTelegram } = useTelegram()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [promoError, setPromoError] = useState('')
  const [validatingPromo, setValidatingPromo] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'maib' | 'paypal'>('maib')
  const [activatingTrial, setActivatingTrial] = useState(false)
  const [trialSuccess, setTrialSuccess] = useState('')

  // Определяем доступные планы
  const plans: TierPlan[] = [
    {
      id: 'free',
      name: { ru: 'Free', ro: 'Gratuit' },
      price: 0,
      currency: 'USD',
      billing: { ru: '', ro: '' },
      features: {
        ru: [
          'Ознакомление со структурой курса',
          'Без доступа к урокам и материалам',
          'Без практики и тестов',
        ],
        ro: [
          'Vizualizare structură curs',
          'Fără acces la lecții și materiale',
          'Fără practică și teste',
        ],
      },
    },
    {
      id: 'basic-monthly',
      name: { ru: 'Basic', ro: 'De bază' },
      price: 9.99,
      currency: 'USD',
      billing: { ru: 'месяц', ro: 'lună' },
      features: {
        ru: [
          '4 протокола массажа: классический, баночный, антицеллюлитный, медовый',
          'Ключевые анатомические разделы',
          'Гигиена',
          'Сопровождение в Telegram',
        ],
        ro: [
          '4 protocoale de masaj: clasic, cu ventuze, anticelulitic și cu miere',
          'Secțiuni anatomice esențiale',
          'Igienă',
          'Suport în Telegram',
        ],
      },
    },
    {
      id: 'basic-quarterly',
      name: { ru: 'Basic', ro: 'De bază' },
      price: 24.99,
      currency: 'USD',
      billing: { ru: '3 месяца', ro: '3 luni' },
      features: {
        ru: [
          'Всё из месячного Basic +',
          'Экономия $5 (17%)',
          '4 протокола массажа',
          'Анатомические разделы',
          'Гигиена',
          'Сопровождение в Telegram',
        ],
        ro: [
          'Tot din Basic lunar +',
          'Economie $5 (17%)',
          '4 protocoale de masaj',
          'Secțiuni anatomice',
          'Igienă',
          'Suport în Telegram',
        ],
      },
    },
    {
      id: 'premium-monthly',
      name: { ru: 'Premium', ro: 'Premium' },
      price: 29.99,
      currency: 'USD',
      billing: { ru: 'месяц', ro: 'lună' },
      features: {
        ru: [
          'Все протоколы массажа',
          'Триггерные точки',
          'Тесты и викторины',
          '3D модели анатомии',
          'Полный доступ ко всему контенту',
          'Приоритетная поддержка',
        ],
        ro: [
          'Toate protocoalele de masaj',
          'Puncte trigger',
          'Teste și chestionare',
          'Modele 3D de anatomie',
          'Acces complet la tot conținutul',
          'Suport prioritar',
        ],
      },
    },
    {
      id: 'premium-yearly',
      name: { ru: 'Premium', ro: 'Premium' },
      price: 99.99,
      upgradeFromBasic: 75,
      currency: 'USD',
      billing: { ru: 'год', ro: 'an' },
      features: {
        ru: [
          'Всё из месячного Premium +',
          'Экономия $260 (72%)',
          'Все протоколы массажа',
          'Триггерные точки',
          'Тесты и викторины',
          '3D модели анатомии',
          'Сертификат об окончании',
          'Приоритетная поддержка',
        ],
        ro: [
          'Tot din Premium lunar +',
          'Economie $260 (72%)',
          'Toate protocoalele de masaj',
          'Puncte trigger',
          'Teste și chestionare',
          'Modele 3D de anatomie',
          'Certificat de absolvire',
          'Suport prioritar',
        ],
      },
    },
  ]

  const handleApplyPromo = async (tierId: string) => {
    if (!promoCode.trim()) {
      setPromoError('Введите промокод')
      return
    }

    setValidatingPromo(true)
    setPromoError('')

    try {
      const response = await axios.get(
        `${API_URL}/promo-codes/validate/${promoCode}?tier=${tierId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data.valid) {
        setAppliedPromo(response.data.promoCode)
        setPromoError('')
      }
    } catch (err: any) {
      setPromoError(err.response?.data?.error?.message || 'Промокод недействителен')
      setAppliedPromo(null)
    } finally {
      setValidatingPromo(false)
    }
  }

  const handleMAIBPurchase = async (tierId: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (tierId === 'free') {
      return // Free tier doesn't require purchase
    }

    setLoading(tierId)
    setError('')

    try {
      // Create MAIB transaction with optional promo code
      const response = await axios.post(
        `${API_URL}/maib-payment/create-transaction`,
        {
          tierId,
          promoCode: appliedPromo ? promoCode : undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const { paymentUrl, transactionId, appliedPromoCode } = response.data

      // Store transaction info for completion
      if (appliedPromoCode) {
        sessionStorage.setItem('promoCodeId', appliedPromoCode._id)
      }
      sessionStorage.setItem('maibTransactionId', transactionId)
      sessionStorage.setItem('maibTierId', tierId)

      // Validate payment URL before redirect
      if (!paymentUrl) {
        throw new Error('Не получен URL для оплаты. Проверьте конфигурацию MAIB.')
      }

      // Redirect to MAIB payment page
      window.location.href = paymentUrl
    } catch (err: any) {
      console.error('MAIB Payment error:', err)
      setError(err.response?.data?.message || err.message || 'Ошибка при создании транзакции MAIB')
      setLoading(null)
    }
  }

  const handlePayPalPurchase = async (tierId: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (tierId === 'free') {
      return // Free tier doesn't require purchase
    }

    setLoading(tierId)
    setError('')

    try {
      // Create PayPal order with optional promo code
      const response = await axios.post(
        `${API_URL}/tier-payment/create-order`,
        {
          tierId,
          promoCode: appliedPromo ? promoCode : undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const { approvalUrl, appliedPromoCode, originalPrice, discount, finalPrice } = response.data

      // Store promo info for capture step
      if (appliedPromoCode) {
        sessionStorage.setItem('promoCodeId', appliedPromoCode._id)
      }

      // Validate approval URL before redirect
      if (!approvalUrl) {
        throw new Error('Не получен URL для оплаты. Проверьте конфигурацию PayPal.')
      }

      // Redirect to PayPal
      window.location.href = approvalUrl
    } catch (err: any) {
      console.error('PayPal Payment error:', err)
      setError(err.response?.data?.message || err.message || 'Ошибка при создании заказа PayPal')
      setLoading(null)
    }
  }

  const handleActivateTrial = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      setActivatingTrial(true)
      setError('')
      setTrialSuccess('')

      const response = await axios.post(
        `${API_URL}/trial/activate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setTrialSuccess(response.data.message || '3-дневный пробный период активирован!')

      // Update user data
      if (updateUser) {
        // Refresh user data to show updated access level
        const userResponse = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        updateUser(userResponse.data)
      }

      // Clear success message after 5 seconds
      setTimeout(() => setTrialSuccess(''), 5000)
    } catch (err: any) {
      console.error('Trial activation error:', err)
      setError(err.response?.data?.message || 'Ошибка при активации пробного периода')
    } finally {
      setActivatingTrial(false)
    }
  }

  const handlePurchase = async (tierId: string) => {
    if (paymentMethod === 'maib') {
      await handleMAIBPurchase(tierId)
    } else {
      await handlePayPalPurchase(tierId)
    }
  }

  const calculateDiscountedPrice = (plan: TierPlan) => {
    if (!appliedPromo) return null

    const basePrice = plan.id.startsWith('premium-') && user?.accessLevel === 'basic'
      ? (plan.upgradeFromBasic || plan.price)
      : plan.price

    const discount = appliedPromo.discountType === 'percentage'
      ? (basePrice * appliedPromo.discountValue) / 100
      : Math.min(appliedPromo.discountValue, basePrice)

    const finalPrice = basePrice - discount

    return { basePrice, discount, finalPrice }
  }

  // Определяем tier level для плана
  const getPlanTierLevel = (planId: string): number => {
    if (planId === 'free') return 0
    if (planId.startsWith('basic-')) return 1
    if (planId.startsWith('premium-')) return 2
    return 0
  }

  // Получаем текущий tier level пользователя
  const getCurrentTierLevel = (): number => {
    if (!user) return -1
    const tierMap: { [key: string]: number } = { free: 0, basic: 1, premium: 2 }
    return tierMap[user.accessLevel] || 0
  }

  const currentTierLevel = getCurrentTierLevel()

  // Можно ли купить этот план
  const canPurchase = (planId: string): boolean => {
    const planTier = getPlanTierLevel(planId)
    return planTier >= currentTierLevel
  }

  // Это текущий tier (но возможно другой billing период)
  const isSameTier = (planId: string): boolean => {
    const planTier = getPlanTierLevel(planId)
    return planTier === currentTierLevel && currentTierLevel > 0
  }

  const getButtonText = (planId: string) => {
    if (!isAuthenticated) return 'Войти'
    if (planId === 'free') return 'Текущий план'

    const planTier = getPlanTierLevel(planId)

    if (planTier < currentTierLevel) return 'У вас выше'
    if (isSameTier(planId)) return 'Продлить'
    if (planTier > currentTierLevel) {
      // Upgrade
      if (planId.startsWith('premium-') && user?.accessLevel === 'basic') {
        const plan = plans.find(p => p.id === planId)
        return `Апгрейд за $${plan?.upgradeFromBasic || plan?.price}`
      }
      return 'Купить'
    }
    return 'Купить'
  }

  // Telegram MainButton integration
  const selectedPlan = plans.find(p => p.id === selectedTier)
  const selectedPlanIndex = plans.findIndex(p => p.id === selectedTier)

  // Auto-select upgrade option for Telegram users
  useEffect(() => {
    if (!isInTelegram || !isAuthenticated) return

    if (selectedTier && selectedPlan && canPurchase(selectedTier)) {
      const buttonText = getButtonText(selectedTier)

      setMainButton({
        text: buttonText,
        onClick: () => handlePurchase(selectedTier),
        disabled: loading === selectedTier,
        progress: loading === selectedTier
      })
    } else {
      hideMainButton()
    }

    return () => hideMainButton()
  }, [isInTelegram, isAuthenticated, selectedTier, loading, selectedPlan, user?.accessLevel, setMainButton, hideMainButton])

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Тарифные планы / Planuri tarifare
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Выберите подходящий план для обучения массажу
        </Typography>
        {user && (
          <Chip
            label={`Текущий: ${user.accessLevel.toUpperCase()}`}
            color={
              user.accessLevel === 'premium'
                ? 'success'
                : user.accessLevel === 'basic'
                ? 'primary'
                : 'default'
            }
            sx={{ mt: 2 }}
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {trialSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setTrialSuccess('')}>
          {trialSuccess}
        </Alert>
      )}

      {/* Trial Activation Button */}
      {isAuthenticated && user?.accessLevel === 'free' && !user?.trialEndsAt && (
        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <StarIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Попробуйте Basic бесплатно!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Бесплатный доступ на 3 дня • Без привязки карты
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.95 }}>
              Получите полный доступ к протоколам массажа, анатомическим разделам и
              сопровождению в Telegram на 3 дня совершенно бесплатно!
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleActivateTrial}
              disabled={activatingTrial}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              {activatingTrial ? <CircularProgress size={24} /> : 'Активировать 3 дня бесплатно'}
            </Button>
          </Paper>
        </Box>
      )}

      {isAuthenticated && (
        <>
          <Box sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CreditCardIcon color="primary" />
                <Typography variant="h6">Способ оплаты / Metodă de plată</Typography>
              </Box>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'maib' | 'paypal')}
              >
                <FormControlLabel
                  value="maib"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        MAIB E-Commerce (Рекомендуется)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Карты Visa/Mastercard • Молдавский банк • Быстро и безопасно
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="paypal"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        PayPal
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Международные платежи • Требуется аккаунт PayPal
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </Paper>
          </Box>

          <Box sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <OfferIcon color="primary" />
                  <Typography variant="h6">Есть промокод?</Typography>
                </Box>
              <TextField
                fullWidth
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={validatingPromo || !!appliedPromo}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {appliedPromo ? (
                        <Button
                          size="small"
                          onClick={() => {
                            setAppliedPromo(null)
                            setPromoCode('')
                          }}
                        >
                          Удалить
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          onClick={() => handleApplyPromo('basic')}
                          disabled={validatingPromo || !promoCode.trim()}
                        >
                          {validatingPromo ? <CircularProgress size={20} /> : 'Применить'}
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
              {promoError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {promoError}
                </Alert>
              )}
              {appliedPromo && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Промокод применен!{' '}
                  {appliedPromo.discountType === 'percentage'
                    ? `Скидка ${appliedPromo.discountValue}%`
                    : `Скидка $${appliedPromo.discountValue}`}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
        </>
      )}

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => {
          const isPremium = plan.id.startsWith('premium-')
          const isPopular = plan.id === 'basic-quarterly' // Лучшее соотношение для basic
          const isBestValue = plan.id === 'premium-yearly' // Лучшее соотношение для premium
          const purchasable = canPurchase(plan.id)
          const disabled = !purchasable || loading !== null
          const discountInfo = calculateDiscountedPrice(plan)
          const billingLabel = plan.billing?.ru

          return (
            <Grid item xs={12} md={6} lg={4} key={plan.id}>
              <Card
                elevation={isBestValue ? 8 : 2}
                onClick={() => isInTelegram && purchasable && setSelectedTier(plan.id)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: selectedTier === plan.id
                    ? '3px solid'
                    : isBestValue ? '2px solid' : 'none',
                  borderColor: selectedTier === plan.id ? 'success.main' : 'primary.main',
                  transform: isBestValue ? 'scale(1.05)' : 'none',
                  cursor: isInTelegram && purchasable ? 'pointer' : 'default',
                  '&:hover': isInTelegram && purchasable ? {
                    boxShadow: 4
                  } : {}
                }}
              >
                {isPopular && (
                  <Chip
                    label="Популярный"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                    }}
                  />
                )}
                {isBestValue && (
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      py: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      <StarIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      BEST VALUE
                    </Typography>
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, pt: isPremium ? 2 : 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight={700}>
                    {plan.name.ru} / {plan.name.ro}
                  </Typography>

                  <Box sx={{ my: 3 }}>
                    {discountInfo ? (
                      <>
                        <Box>
                          <Typography
                            variant="h5"
                            component="span"
                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                          >
                            ${discountInfo.basePrice}
                          </Typography>
                        </Box>
                        <Typography variant="h3" component="span" fontWeight={700} color="success.main">
                          ${discountInfo.finalPrice.toFixed(2)}
                        </Typography>
                        <Chip
                          label={`Скидка $${discountInfo.discount.toFixed(2)}`}
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography variant="h3" component="span" fontWeight={700}>
                          ${plan.price}
                        </Typography>
                        {plan.upgradeFromBasic && user?.accessLevel === 'basic' && (
                          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                            Апгрейд с Basic: ${plan.upgradeFromBasic}
                          </Typography>
                        )}
                      </>
                    )}
                    {plan.price !== 0 && billingLabel && (
                      <Typography variant="body2" color="text.secondary">
                        / {billingLabel}
                      </Typography>
                    )}
                  </Box>

                  <List dense>
                    {plan.features.ru.map((feature, idx) => (
                      <ListItem key={idx} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: feature.startsWith('  •') ? 'text.secondary' : 'text.primary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isBestValue ? 'contained' : isPopular ? 'outlined' : 'text'}
                    size="large"
                    onClick={() => handlePurchase(plan.id)}
                    disabled={disabled}
                    sx={{ py: 1.5 }}
                  >
                    {loading === plan.id ? (
                      <CircularProgress size={24} />
                    ) : (
                      getButtonText(plan.id)
                    )}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Все платежи обрабатываются безопасно через MAIB E-Commerce или PayPal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Toate plățile sunt procesate în siguranță prin MAIB E-Commerce sau PayPal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Единоразовая оплата • Доступ на выбранный период • Без автопродления
        </Typography>
      </Box>
    </Container>
  )
}

export default PricingPage
