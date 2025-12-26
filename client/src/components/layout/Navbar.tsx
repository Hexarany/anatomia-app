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
  Divider,
  ListItemIcon,
  ListItemText,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SpaIcon from '@mui/icons-material/Spa'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SearchIcon from '@mui/icons-material/Search'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Language } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useThemeMode } from '@/contexts/ThemeContext'
import { TELEGRAM_BOT_LINK } from '@/config/telegram'
// import NotificationBell from '@/components/NotificationBell' // Temporarily disabled

type NavItem = {
  name: string
  to?: string
  href?: string
  external?: boolean
}

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const isRu = i18n.language === 'ru'
  const mobileLabels = {
    settings: isRu ? 'Настройки' : 'Setari',
    search: isRu ? 'Поиск' : 'Cautare',
    theme: mode === 'light'
      ? (isRu ? 'Темная тема' : 'Tema intunecata')
      : (isRu ? 'Светлая тема' : 'Tema luminoasa'),
    language: isRu ? 'Язык' : 'Limba',
    login: isRu ? 'Вход' : 'Autentificare',
    register: isRu ? 'Регистрация' : 'Inregistrare',
  }
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

  const mainPages: NavItem[] = [
    { name: t('nav.home'), to: '/' },
    { name: t('nav.programs'), href: '/#programs' },
    { name: t('nav.practice'), to: '/assignments' },
    { name: t('nav.anatomy'), to: '/categories' },
    { name: t('nav.quizzes'), to: '/quizzes' },
    { name: t('nav.telegram'), href: TELEGRAM_BOT_LINK, external: true },
  ]

  const learningResources: NavItem[] = [
    { name: i18n.language === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj', to: '/massage-protocols' },
    { name: i18n.language === 'ru' ? 'Домашки и тесты' : 'Teme și teste', to: '/assignments' },
    { name: i18n.language === 'ru' ? '3D модели и атласы' : 'Modele 3D și atlase', to: '/anatomy-models-3d' },
    { name: i18n.language === 'ru' ? 'Гигиена и безопасность' : 'Igienă și siguranță', to: '/hygiene-guidelines' },
    { name: i18n.language === 'ru' ? 'Библиотека ресурсов' : 'Bibliotecă', to: '/resources' },
    { name: 'Telegram', href: TELEGRAM_BOT_LINK, external: true },
  ]

  const BrandLogo = ({ compact = false }: { compact?: boolean }) => {
    const tagline = t('app.tagline')

    return (
      <Box
        component={RouterLink}
        to="/"
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
          gap: 1,
          mr: compact ? 0 : 2,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          <SpaIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: 0,
          }}
        >
          <Typography
            noWrap
            sx={{
              fontWeight: 700,
              lineHeight: 1.1,
              fontSize: compact ? '1rem' : '1.05rem',
              maxWidth: compact ? 140 : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t('app.title')}
          </Typography>
          {!compact && tagline.trim() && (
            <Typography variant="caption" sx={{ lineHeight: 1.2, opacity: 0.85 }}>
              {tagline}
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  const renderNavButton = (page: NavItem) => {
    const commonStyles = {
      color: 'white',
      fontSize: '0.95rem',
      px: 2.5,
      py: 1,
      textTransform: 'none' as const,
      fontWeight: 500,
      borderRadius: 2,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        transform: 'translateY(-1px)',
      },
    }

    if (page.href) {
      return (
        <Button
          key={page.name}
          component="a"
          href={page.href}
          target={page.external ? '_blank' : undefined}
          rel={page.external ? 'noopener noreferrer' : undefined}
          sx={commonStyles}
        >
          {page.name}
        </Button>
      )
    }

    return (
      <Button
        key={page.name}
        component={RouterLink}
        to={page.to || '/'}
        onClick={handleCloseNavMenu}
        sx={commonStyles}
      >
        {page.name}
      </Button>
    )
  }

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <BrandLogo />
          </Box>

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
              MenuListProps={{
                sx: { py: 0.5 },
                dense: true,
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 240,
                  maxWidth: 'calc(100vw - 32px)',
                  maxHeight: 'calc(100vh - 140px)',
                  overflowY: 'auto',
                },
              }}
            >
              {mainPages.map((page) => {
                const linkProps = page.href
                  ? {
                      component: 'a' as const,
                      href: page.href,
                      target: page.external ? '_blank' : undefined,
                      rel: page.external ? 'noopener noreferrer' : undefined,
                    }
                  : {
                      component: RouterLink,
                      to: page.to || '/',
                    }

                return (
                  <MenuItem
                    key={page.name}
                    onClick={handleCloseNavMenu}
                    {...linkProps}
                    sx={{ textDecoration: 'none', color: 'inherit', py: 1 }}
                  >
                    {page.name}
                  </MenuItem>
                )
              })}
              <MenuItem disabled>
                <Typography textAlign="center" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.secondary' }}>
                  {t('nav.learning')}
                </Typography>
              </MenuItem>
              {learningResources.map((resource) => {
                const linkProps = resource.href
                  ? {
                      component: 'a' as const,
                      href: resource.href,
                      target: resource.external ? '_blank' : undefined,
                      rel: resource.external ? 'noopener noreferrer' : undefined,
                    }
                  : {
                      component: RouterLink,
                      to: resource.to || '/',
                    }

                return (
                  <MenuItem
                    key={resource.name}
                    onClick={handleCloseNavMenu}
                    sx={{ pl: 3, py: 0.75, textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}
                    {...linkProps}
                  >
                    {resource.name}
                  </MenuItem>
                )
              })}
              <Divider sx={{ my: 0.5 }} />
              <MenuItem disabled>
                <Typography textAlign="center" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.secondary' }}>
                  {mobileLabels.settings}
                </Typography>
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/search"
                onClick={handleCloseNavMenu}
              >
                <ListItemIcon>
                  <SearchIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={mobileLabels.search} />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  toggleTheme()
                  handleCloseNavMenu()
                }}
              >
                <ListItemIcon>
                  {mode === 'light' ? <Brightness4Icon fontSize="small" /> : <Brightness7Icon fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={mobileLabels.theme} />
              </MenuItem>
              <MenuItem disabled>
                <Typography textAlign="center" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.secondary' }}>
                  {mobileLabels.language}
                </Typography>
              </MenuItem>
              <MenuItem
                selected={i18n.language === 'ru'}
                onClick={() => {
                  i18n.changeLanguage('ru')
                  handleCloseNavMenu()
                }}
              >
                <ListItemText primary="RU" />
              </MenuItem>
              <MenuItem
                selected={i18n.language === 'ro'}
                onClick={() => {
                  i18n.changeLanguage('ro')
                  handleCloseNavMenu()
                }}
              >
                <ListItemText primary="RO" />
              </MenuItem>
              {!isAuthenticated && (
                <>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    component={RouterLink}
                    to="/login"
                    onClick={handleCloseNavMenu}
                  >
                    <ListItemText primary={mobileLabels.login} />
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/register"
                    onClick={handleCloseNavMenu}
                  >
                    <ListItemText primary={mobileLabels.register} />
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
            <BrandLogo compact />
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1.5, alignItems: 'center', ml: 3 }}>
            {mainPages.map(renderNavButton)}

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
              {t('nav.learning')}
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
                resource.href ? (
                  <MenuItem
                    key={resource.name}
                    component="a"
                    href={resource.href}
                    target={resource.external ? '_blank' : undefined}
                    rel={resource.external ? 'noopener noreferrer' : undefined}
                    onClick={handleCloseLearningMenu}
                  >
                    {resource.name}
                  </MenuItem>
                ) : (
                  <MenuItem
                    key={resource.name}
                    onClick={() => {
                      handleCloseLearningMenu()
                      navigate(resource.to || '/')
                    }}
                  >
                    {resource.name}
                  </MenuItem>
                )
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
                display: { xs: 'none', md: 'inline-flex' },
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
                display: { xs: 'none', md: 'inline-flex' },
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
                display: { xs: 'none', md: 'inline-flex' },
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
                  {user?.role === 'student' && (
                    <>
                      <MenuItem
                        onClick={() => {
                          handleCloseUserMenu()
                          navigate('/my-groups')
                        }}
                      >
                        <Typography textAlign="center">
                          {i18n.language === 'ru' ? '👥 Мои группы' : '👥 Grupele mele'}
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleCloseUserMenu()
                          navigate('/schedule')
                        }}
                      >
                        <Typography textAlign="center">
                          {i18n.language === 'ru' ? '📅 Расписание' : '📅 Orar'}
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleCloseUserMenu()
                          navigate('/grades')
                        }}
                      >
                        <Typography textAlign="center">
                          {i18n.language === 'ru' ? '📊 Мои оценки' : '📊 Notele mele'}
                        </Typography>
                      </MenuItem>
                    </>
                  )}
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <>
                      <MenuItem
                        onClick={() => {
                          handleCloseUserMenu()
                          navigate('/schedule')
                        }}
                      >
                        <Typography textAlign="center">
                          {i18n.language === 'ru' ? '📅 Расписание' : '📅 Orar'}
                        </Typography>
                      </MenuItem>
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
                    </>
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
                    display: { xs: 'none', md: 'inline-flex' },
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
                    display: { xs: 'none', md: 'inline-flex' },
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
