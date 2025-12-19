import { useState } from 'react'
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
} from '@mui/material'
import { Check as CheckIcon, Star as StarIcon, LocalOffer as OfferIcon } from '@mui/icons-material'
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
}

const PricingPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, token } = useAuth()
  const { setMainButton, hideMainButton } = useMainButton()
  const { isInTelegram } = useTelegram()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [promoError, setPromoError] = useState('')
  const [validatingPromo, setValidatingPromo] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  // Определяем доступные планы
  const plans: TierPlan[] = [
    {
      id: 'free',
      name: { ru: 'Free', ro: 'Gratuit' },
      price: 0,
      currency: 'USD',
      features: {
        ru: [
          'Превью всех материалов (400 символов)',
          'Доступ к базовой информации',
          'Ознакомительный режим',
        ],
        ro: [
          'Previzualizare a tuturor materialelor (400 caractere)',
          'Acces la informații de bază',
          'Mod demonstrativ',
        ],
      },
    },
    {
      id: 'basic',
      name: { ru: 'Basic', ro: 'De bază' },
      price: 20,
      currency: 'USD',
      features: {
        ru: [
          'Полный доступ к разделу Анатомия',
          'Полный доступ к Гигиене и стандартам',
          '4 основных протокола массажа:',
          '  • Классический массаж всего тела',
          '  • Медовый массаж',
          '  • Баночный (вакуумный) массаж',
          '  • Антицеллюлитный массаж',
        ],
        ro: [
          'Acces complet la secțiunea Anatomie',
          'Acces complet la Igienă și standarde',
          '4 protocoale de bază de masaj:',
          '  • Masaj clasic de corp întreg',
          '  • Masaj cu miere',
          '  • Masaj cu ventuze (vacuum)',
          '  • Masaj anticelulitic',
        ],
      },
    },
    {
      id: 'premium',
      name: { ru: 'Premium', ro: 'Premium' },
      price: 50,
      upgradeFromBasic: 30,
      currency: 'USD',
      features: {
        ru: [
          'Всё из Basic +',
          'Все оставшиеся протоколы массажа',
          'Триггерные точки',
          'Тесты и викторины',
          '3D модели анатомии',
          'Полный доступ ко всему контенту',
        ],
        ro: [
          'Tot din Basic +',
          'Toate protocoalele rămase de masaj',
          'Puncte trigger',
          'Teste și chestionare',
          'Modele 3D de anatomie',
          'Acces complet la tot conținutul',
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

  const handlePurchase = async (tierId: string) => {
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
      console.error('Payment error:', err)
      setError(err.response?.data?.message || err.message || 'Ошибка при создании заказа')
      setLoading(null)
    }
  }

  const calculateDiscountedPrice = (plan: TierPlan) => {
    if (!appliedPromo) return null

    const basePrice = plan.id === 'premium' && user?.accessLevel === 'basic'
      ? (plan.upgradeFromBasic || plan.price)
      : plan.price

    const discount = appliedPromo.discountType === 'percentage'
      ? (basePrice * appliedPromo.discountValue) / 100
      : Math.min(appliedPromo.discountValue, basePrice)

    const finalPrice = basePrice - discount

    return { basePrice, discount, finalPrice }
  }

  const getCurrentTierIndex = () => {
    if (!user) return -1
    const tierMap: { [key: string]: number } = { free: 0, basic: 1, premium: 2 }
    return tierMap[user.accessLevel] || 0
  }

  const currentTierIndex = getCurrentTierIndex()

  const canUpgrade = (planIndex: number) => {
    return planIndex > currentTierIndex
  }

  const isCurrentTier = (planIndex: number) => {
    return planIndex === currentTierIndex
  }

  const getButtonText = (planIndex: number, planId: string) => {
    if (!isAuthenticated) return 'Войти'
    if (isCurrentTier(planIndex)) return 'Текущий план'
    if (planIndex < currentTierIndex) return 'У вас выше'
    if (planId === 'premium' && user?.accessLevel === 'basic') {
      return 'Апгрейд за $30'
    }
    return 'Купить'
  }

  // Telegram MainButton integration
  const selectedPlan = plans.find(p => p.id === selectedTier)
  const selectedPlanIndex = plans.findIndex(p => p.id === selectedTier)

  // Auto-select upgrade option for Telegram users
  useEffect(() => {
    if (!isInTelegram || !isAuthenticated) return

    if (selectedTier && selectedPlan && canUpgrade(selectedPlanIndex)) {
      const buttonText = selectedTier === 'premium' && user?.accessLevel === 'basic'
        ? 'Апгрейд за $30'
        : `Купить ${selectedPlan.name.ru}`

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
  }, [isInTelegram, isAuthenticated, selectedTier, loading, selectedPlan, selectedPlanIndex, user?.accessLevel, setMainButton, hideMainButton])

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

      {isAuthenticated && (
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
      )}

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan, index) => {
          const isPremium = plan.id === 'premium'
          const isPopular = plan.id === 'basic'
          const disabled =
            !canUpgrade(index) || isCurrentTier(index) || loading !== null
          const discountInfo = calculateDiscountedPrice(plan)

          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                elevation={isPremium ? 8 : 2}
                onClick={() => isInTelegram && canUpgrade(index) && !isCurrentTier(index) && setSelectedTier(plan.id)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: selectedTier === plan.id
                    ? '3px solid'
                    : isPremium ? '2px solid' : 'none',
                  borderColor: selectedTier === plan.id ? 'success.main' : 'primary.main',
                  transform: isPremium ? 'scale(1.05)' : 'none',
                  cursor: isInTelegram && canUpgrade(index) && !isCurrentTier(index) ? 'pointer' : 'default',
                  '&:hover': isInTelegram && canUpgrade(index) && !isCurrentTier(index) ? {
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
                {isPremium && (
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
                        <Typography variant="body1" component="span" color="text.secondary">
                          {' '}
                          {plan.price === 0 ? '' : '/ единоразово'}
                        </Typography>
                        {plan.upgradeFromBasic && user?.accessLevel === 'basic' && (
                          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                            Апгрейд с Basic: ${plan.upgradeFromBasic}
                          </Typography>
                        )}
                      </>
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
                    variant={isPremium ? 'contained' : isPopular ? 'outlined' : 'text'}
                    size="large"
                    onClick={() => handlePurchase(plan.id)}
                    disabled={disabled}
                    sx={{ py: 1.5 }}
                  >
                    {loading === plan.id ? (
                      <CircularProgress size={24} />
                    ) : (
                      getButtonText(index, plan.id)
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
          Все платежи обрабатываются через PayPal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Единоразовая оплата • Без подписки • Пожизненный доступ
        </Typography>
      </Box>
    </Container>
  )
}

export default PricingPage
