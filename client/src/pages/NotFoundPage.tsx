import { Link as RouterLink } from 'react-router-dom'
import { Container, Typography, Button, Box } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'

const NotFoundPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Страница не найдена / Pagina nu a fost găsită
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Запрашиваемая страница не существует или была перемещена.
        <br />
        Pagina solicitată nu există sau a fost mutată.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/"
          startIcon={<HomeIcon />}
        >
          На главную / Acasă
        </Button>
      </Box>
    </Container>
  )
}

export default NotFoundPage
