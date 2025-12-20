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
import SearchIcon from '@mui/icons-material/Search'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Language } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useThemeMode } from '@/contexts/ThemeContext'
// import NotificationBell from '@/components/NotificationBell' // Temporarily disabled

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, hasAccess } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const [anchorElLearning, setAnchorElLearning] = useState<null | HTMLElement>(null)

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

  const handleOpenLearningMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElLearning(event.currentTarget)
  }

  const handleCloseLearningMenu = () => {
    setAnchorElLearning(null)
  }

  const handleLogout = () => {
    logout()
    handleCloseUserMenu()
    navigate('/')
  }

  const handleLanguageChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value as Language)
  }

  // Main navigation items (simplified)
  const mainPages = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.categories'), path: '/categories' },
    { name: t('nav.quizzes'), path: '/quizzes' },
  ]

  // Learning resources (grouped in dropdown)
  const learningResources = [
    { name: i18n.language === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj', path: '/massage-protocols' },
    { name: i18n.language === 'ru' ? 'Триггерные точки' : 'Puncte Trigger', path: '/trigger-points' },
    { name: i18n.language === 'ru' ? '3D Модели' : 'Modele 3D', path: '/anatomy-models-3d' },
    { name: i18n.language === 'ru' ? 'Гигиена и стандарты' : 'Igienă și standarde', path: '/hygiene-guidelines' },
    { name: i18n.language === 'ru' ? 'Библиотека' : 'Bibliotecă', path: '/resources' },
  ]

  const allMainPages = [...mainPages]

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
              {allMainPages.map((page) => (
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
              <MenuItem disabled>
                <Typography textAlign="center" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.secondary' }}>
                  {i18n.language === 'ru' ? 'Обучение' : 'Învățare'}
                </Typography>
              </MenuItem>
              {learningResources.map((resource) => (
                <MenuItem key={resource.name} onClick={handleCloseNavMenu} sx={{ pl: 3 }}>
                  <Typography
                    textAlign="center"
                    component={RouterLink}
                    to={resource.path}
                    sx={{ textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}
                  >
                    {resource.name}
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
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1.5, alignItems: 'center', ml: 3 }}>
            {allMainPages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  color: 'white',
                  fontSize: '0.95rem',
                  px: 2.5,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {page.name}
              </Button>
            ))}

            {/* Learning Resources Dropdown */}
            <Button
              onClick={handleOpenLearningMenu}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                color: 'white',
                fontSize: '0.95rem',
                px: 2.5,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                backgroundColor: anchorElLearning ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {i18n.language === 'ru' ? 'Обучение' : 'Învățare'}
            </Button>
            <Menu
              anchorEl={anchorElLearning}
              open={Boolean(anchorElLearning)}
              onClose={handleCloseLearningMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              {learningResources.map((resource) => (
                <MenuItem
                  key={resource.name}
                  onClick={() => {
                    handleCloseLearningMenu()
                    navigate(resource.path)
                  }}
                >
                  {resource.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Right side icons and menus */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Search Icon */}
            <IconButton
              component={RouterLink}
              to="/search"
              sx={{
                color: 'white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>

            {/* Notifications */}
            {/* <NotificationBell /> */} {/* Temporarily disabled */}

            {/* Theme Toggle */}
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: 'white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
              aria-label="toggle theme"
              title={mode === 'light'
                ? (i18n.language === 'ru' ? 'Тёмная тема' : 'Temă întunecată')
                : (i18n.language === 'ru' ? 'Светлая тема' : 'Temă luminoasă')
              }
            >
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            {/* Language Selector */}
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              size="small"
              sx={{
                color: 'white',
                borderRadius: 1.5,
                transition: 'all 0.2s ease',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '.MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value="ru">RU</MenuItem>
              <MenuItem value="ro">RO</MenuItem>
            </Select>

            {/* Auth buttons / User menu */}
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{
                    color: 'white',
                    p: 0.5,
                    ml: 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      transform: 'translateY(-1px)',
                    },
                  }}
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
                    <Typography textAlign="center" sx={{ fontWeight: 600 }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu()
                      navigate('/dashboard')
                    }}
                  >
                    <Typography textAlign="center">
                      {i18n.language === 'ru' ? 'Мой прогресс' : 'Progresul meu'}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu()
                      navigate('/assignments')
                    }}
                  >
                    <Typography textAlign="center">
                      {i18n.language === 'ru' ? '📝 Задания' : '📝 Teme'}
                    </Typography>
                  </MenuItem>
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <MenuItem
                      onClick={() => {
                        handleCloseUserMenu()
                        navigate('/admin?tab=10')
                      }}
                    >
                      <Typography textAlign="center">
                        {i18n.language === 'ru' ? '👥 Группы' : '👥 Grupuri'}
                      </Typography>
                    </MenuItem>
                  )}
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
                      navigate('/certificates')
                    }}
                  >
                    <Typography textAlign="center">
                      {i18n.language === 'ru' ? 'Сертификаты' : 'Certificate'}
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
                  sx={{
                    color: 'white',
                    fontSize: '0.9rem',
                    px: 2,
                    py: 0.75,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    },
                  }}
                >
                  {i18n.language === 'ru' ? 'Вход' : 'Autentificare'}
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    px: 2.5,
                    py: 0.75,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {i18n.language === 'ru' ? 'Регистрация' : 'Înregistrare'}
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
