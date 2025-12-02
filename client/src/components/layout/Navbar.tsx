import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SchoolIcon from '@mui/icons-material/School'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { Language } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleLogout = () => {
    logout()
    handleCloseUserMenu()
    navigate('/')
  }

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value as Language)
  }

  const pages = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.categories'), path: '/#categories' },
    { name: t('nav.quizzes'), path: '/#quizzes' },
    { name: i18n.language === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj', path: '/massage-protocols' },
    { name: i18n.language === 'ru' ? 'Триггерные точки' : 'Puncte Trigger', path: '/trigger-points' },
    { name: i18n.language === 'ru' ? '3D Модели' : 'Modele 3D', path: '/anatomy-models-3d' },
    { name: i18n.language === 'ru' ? 'Гигиена и стандарты' : 'Igienă și standarde', path: '/hygiene-guidelines' },
  ]

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <SchoolIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {t('app.title')}
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                  <Typography
                    textAlign="center"
                    component={RouterLink}
                    to={page.path}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <SchoolIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {t('app.title')}
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Language Selector */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              size="small"
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '.MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value="ru">Русский</MenuItem>
              <MenuItem value="ro">Română</MenuItem>
            </Select>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{ color: 'white', p: 0 }}
                >
                  <AccountCircleIcon sx={{ fontSize: 32 }} />
                </IconButton>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar-user"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem disabled>
                    <Typography textAlign="center">
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu()
                      navigate('/profile')
                    }}
                  >
                    <Typography textAlign="center">
                      {i18n.language === 'ru' ? 'Профиль' : 'Profil'}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu()
                      navigate('/pricing')
                    }}
                  >
                    <Typography textAlign="center">
                      {i18n.language === 'ru' ? 'Тарифы' : 'Planuri tarifare'}
                    </Typography>
                  </MenuItem>
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <MenuItem
                      onClick={() => {
                        handleCloseUserMenu()
                        navigate('/admin')
                      }}
                    >
                      <Typography textAlign="center">
                        {i18n.language === 'ru' ? 'Админ-панель' : 'Panou admin'}
                      </Typography>
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">
                      {i18n.language === 'ru' ? 'Выход' : 'Ieșire'}
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ color: 'white' }}
                >
                  Вход
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Регистрация
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar
