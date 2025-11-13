import { Box, Paper, Typography, Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import LockIcon from '@mui/icons-material/Lock'
import { useTranslation } from 'react-i18next'

interface ContentLockProps {
  previewText: string
}

const ContentLock = ({ previewText }: ContentLockProps) => {
  const { t } = useTranslation()

  return (
    <Box>
      {/* Preview content with fade effect */}
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '150px',
            background: 'linear-gradient(to bottom, transparent, white)',
            pointerEvents: 'none',
          },
        }}
      >
        <Typography
          variant="body1"
          sx={{
            maxHeight: '200px',
            overflow: 'hidden',
            color: 'text.secondary',
            lineHeight: 1.8,
          }}
        >
          {previewText}
        </Typography>
      </Box>

      {/* Lock message */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'primary.main',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            opacity: 0.1,
            fontSize: '200px',
          }}
        >
          <LockIcon sx={{ fontSize: 'inherit' }} />
        </Box>

        <Stack spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <LockIcon sx={{ fontSize: 60 }} />

          <Typography variant="h4" fontWeight="bold">
            {t('contentLock.title', 'Полный доступ для зарегистрированных пользователей')}
          </Typography>

          <Typography variant="body1" sx={{ maxWidth: '600px', opacity: 0.9 }}>
            {t(
              'contentLock.description',
              'Зарегистрируйтесь бесплатно, чтобы получить доступ к полным материалам: детальным описаниям, таблицам, техникам массажа, упражнениям и многому другому!'
            )}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
                fontWeight: 'bold',
                px: 4,
              }}
            >
              {t('contentLock.register', 'Регистрация')}
            </Button>

            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                px: 4,
              }}
            >
              {t('contentLock.login', 'Уже есть аккаунт')}
            </Button>
          </Stack>

          <Box sx={{ mt: 3, opacity: 0.8 }}>
            <Typography variant="caption" display="block">
              ✓ {t('contentLock.benefit1', 'Бесплатная регистрация')}
            </Typography>
            <Typography variant="caption" display="block">
              ✓ {t('contentLock.benefit2', 'Доступ ко всем материалам')}
            </Typography>
            <Typography variant="caption" display="block">
              ✓ {t('contentLock.benefit3', 'Обновления контента')}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ContentLock
