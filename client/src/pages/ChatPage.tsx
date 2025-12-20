import { Container, Box, Typography, Button, Card, CardContent, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import TelegramIcon from '@mui/icons-material/Telegram'
import ChatIcon from '@mui/icons-material/Chat'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import GroupIcon from '@mui/icons-material/Group'
import { useTheme } from '@mui/material'

const ChatPage = () => {
  const { i18n } = useTranslation()
  const theme = useTheme()

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, sm: 8, md: 12 } }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <TelegramIcon
          sx={{
            fontSize: 120,
            color: '#0088cc',
            mb: 3,
          }}
        />
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
          {i18n.language === 'ru' ? 'Общайтесь в Telegram!' : 'Comunicați în Telegram!'}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 4,
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
          }}
        >
          {i18n.language === 'ru'
            ? 'Мы перенесли чат в Telegram для вашего удобства'
            : 'Am mutat chat-ul în Telegram pentru confortul dumneavoastră'}
        </Typography>

        <Button
          variant="contained"
          size="large"
          href="https://t.me/AnatomiaAppBot"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<TelegramIcon />}
          sx={{
            bgcolor: '#0088cc',
            px: 5,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#0077b3',
            },
          }}
        >
          {i18n.language === 'ru' ? 'Открыть Telegram бот' : 'Deschide bot-ul Telegram'}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {[
          {
            icon: <ChatIcon sx={{ fontSize: 50, color: '#0088cc' }} />,
            title: i18n.language === 'ru' ? 'Мгновенные сообщения' : 'Mesaje instant',
            description:
              i18n.language === 'ru'
                ? 'Общайтесь с преподавателями и студентами в реальном времени'
                : 'Comunicați cu profesorii și studenții în timp real',
          },
          {
            icon: <NotificationsActiveIcon sx={{ fontSize: 50, color: '#0088cc' }} />,
            title: i18n.language === 'ru' ? 'Push-уведомления' : 'Notificări push',
            description:
              i18n.language === 'ru'
                ? 'Получайте уведомления о новых заданиях и сообщениях'
                : 'Primiți notificări despre teme și mesaje noi',
          },
          {
            icon: <GroupIcon sx={{ fontSize: 50, color: '#0088cc' }} />,
            title: i18n.language === 'ru' ? 'Групповые чаты' : 'Chat-uri de grup',
            description:
              i18n.language === 'ru'
                ? 'Участвуйте в обсуждениях со своей учебной группой'
                : 'Participați la discuții cu grupul dvs. de studiu',
          },
        ].map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 12px 24px rgba(0,0,0,0.5)'
                    : '0 12px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 6,
          p: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {i18n.language === 'ru' ? 'Как начать?' : 'Cum să începeți?'}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {i18n.language === 'ru'
            ? '1. Нажмите на кнопку выше для открытия бота в Telegram'
            : '1. Apăsați butonul de mai sus pentru a deschide bot-ul în Telegram'}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {i18n.language === 'ru'
            ? '2. Нажмите "Start" или отправьте /start'
            : '2. Apăsați "Start" sau trimiteți /start'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {i18n.language === 'ru'
            ? '3. Начните общение и изучение!'
            : '3. Începeți să comunicați și să învățați!'}
        </Typography>
      </Box>
    </Container>
  )
}

export default ChatPage
