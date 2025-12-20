import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getCategories } from '@/services/api'
import type { Category } from '@/types'

const CategoriesPage = () => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const lang = i18n.language as 'ru' | 'ro'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const getCategoryColor = (index: number) => {
    const colors = theme.palette.mode === 'dark'
      ? [
          { bg: alpha(theme.palette.primary.main, 0.15), border: theme.palette.primary.main },
          { bg: alpha(theme.palette.secondary.main, 0.15), border: theme.palette.secondary.main },
          { bg: alpha('#ba68c8', 0.15), border: '#ba68c8' },
          { bg: alpha('#81c784', 0.15), border: '#81c784' },
          { bg: alpha('#ffb74d', 0.15), border: '#ffb74d' },
        ]
      : [
          { bg: '#e3f2fd', border: '#1976d2' },
          { bg: '#fce4ec', border: '#c2185b' },
          { bg: '#f3e5f5', border: '#7b1fa2' },
          { bg: '#e8f5e9', border: '#388e3c' },
          { bg: '#fff3e0', border: '#f57c00' },
        ]

    return colors[index % colors.length]
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 700,
            mb: 2,
          }}
        >
          {i18n.language === 'ru' ? 'Категории' : 'Categorii'}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
        >
          {i18n.language === 'ru'
            ? 'Изучайте анатомию по категориям - от мышц до нервной системы'
            : 'Studiați anatomia pe categorii - de la mușchi la sistemul nervos'}
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : categories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {i18n.language === 'ru'
              ? 'Категории пока не добавлены'
              : 'Categoriile nu au fost adăugate încă'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category, index) => {
            const colorScheme = getCategoryColor(index)
            return (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: colorScheme.bg,
                    borderRadius: 3,
                    border: `2px solid transparent`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 24px ${alpha(colorScheme.border, 0.3)}`
                        : '0 8px 24px rgba(0,0,0,0.12)',
                      borderColor: colorScheme.border,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.mode === 'dark'
                          ? theme.palette.text.primary
                          : 'text.primary',
                      }}
                    >
                      {category.name[lang]}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {category.description[lang]}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="medium"
                      component={RouterLink}
                      to={`/category/${category._id}`}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        color: colorScheme.border,
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: alpha(colorScheme.border, 0.08),
                        },
                      }}
                    >
                      {i18n.language === 'ru' ? 'Изучить' : 'Studiază'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Container>
  )
}

export default CategoriesPage
