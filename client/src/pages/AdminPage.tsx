import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  AlertTitle,
} from '@mui/material'
import ConstructionIcon from '@mui/icons-material/Construction'

const AdminPage = () => {
  const { t } = useTranslation()

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t('admin.title')}
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ConstructionIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Alert severity="info">
          <AlertTitle>В разработке / În dezvoltare</AlertTitle>
          Админ-панель находится в разработке. Здесь вы сможете управлять
          контентом, добавлять новые темы, загружать медиа файлы и создавать
          тесты.
          <br />
          <br />
          Panoul de administrare este în curs de dezvoltare. Aici veți putea
          gestiona conținutul, adăuga subiecte noi, încărca fișiere media și
          crea teste.
        </Alert>

        <Box sx={{ mt: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            Планируемый функционал:
          </Typography>
          <ul>
            <li>Управление категориями и темами</li>
            <li>Загрузка и управление 3D моделями</li>
            <li>Загрузка изображений и видео</li>
            <li>Создание и редактирование тестов</li>
            <li>Мультиязычный контент (RU/RO)</li>
            <li>Статистика и аналитика</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  )
}

export default AdminPage
