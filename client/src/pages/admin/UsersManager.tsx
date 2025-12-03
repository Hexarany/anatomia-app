import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'teacher' | 'admin'
  accessLevel: 'free' | 'basic' | 'premium'
  paymentAmount?: number
  paymentDate?: string
  createdAt: string
}

interface UserStats {
  totalUsers: number
  byRole: {
    student: number
    teacher: number
    admin: number
  }
  byAccessLevel: {
    free: number
    basic: number
    premium: number
  }
  revenue: {
    total: number
    recentPayments: number
  }
  recentActivity: {
    newUsersLast7Days: number
  }
}

const UsersManager = () => {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Фильтры и пагинация
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [totalUsers, setTotalUsers] = useState(0)
  const [roleFilter, setRoleFilter] = useState('all')
  const [accessLevelFilter, setAccessLevelFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Диалог редактирования
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    accessLevel: 'free' as 'free' | 'basic' | 'premium',
  })

  // Диалог удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Загрузка статистики
  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/users-management/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStats(response.data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  // Загрузка пользователей
  const loadUsers = async () => {
    setLoading(true)
    setError('')

    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      }

      if (roleFilter !== 'all') params.role = roleFilter
      if (accessLevelFilter !== 'all') params.accessLevel = accessLevelFilter
      if (searchQuery) params.search = searchQuery

      const response = await axios.get(`${API_URL}/users-management`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })

      setUsers(response.data.users)
      setTotalUsers(response.data.pagination.total)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadUsers()
  }, [page, rowsPerPage, roleFilter, accessLevelFilter, searchQuery])

  // Открыть диалог редактирования
  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accessLevel: user.accessLevel,
    })
    setEditDialogOpen(true)
  }

  // Сохранить изменения пользователя
  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      await axios.put(
        `${API_URL}/users-management/${selectedUser._id}`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setEditDialogOpen(false)
      loadUsers()
      loadStats()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления пользователя')
    }
  }

  // Открыть диалог удаления
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  // Подтвердить удаление
  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      await axios.delete(`${API_URL}/users-management/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setDeleteDialogOpen(false)
      setUserToDelete(null)
      loadUsers()
      loadStats()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка удаления пользователя')
    }
  }

  // Цвета для chip
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error'
      case 'teacher':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'premium':
        return 'success'
      case 'basic':
        return 'primary'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Управление пользователями</Typography>
        <IconButton onClick={() => { loadUsers(); loadStats(); }} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Всего пользователей
                </Typography>
                <Typography variant="h4">{stats.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Premium пользователей
                </Typography>
                <Typography variant="h4">{stats.byAccessLevel.premium}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Общий доход
                </Typography>
                <Typography variant="h4">${stats.revenue.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Новых за 7 дней
                </Typography>
                <Typography variant="h4">{stats.recentActivity.newUsersLast7Days}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Поиск"
              placeholder="Имя, фамилия или email"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select
                value={roleFilter}
                label="Роль"
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(0)
                }}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="student">Студент</MenuItem>
                <MenuItem value="teacher">Учитель</MenuItem>
                <MenuItem value="admin">Админ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Уровень доступа</InputLabel>
              <Select
                value={accessLevelFilter}
                label="Уровень доступа"
                onChange={(e) => {
                  setAccessLevelFilter(e.target.value)
                  setPage(0)
                }}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица пользователей */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Уровень доступа</TableCell>
              <TableCell>Оплачено</TableCell>
              <TableCell>Дата регистрации</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.accessLevel}
                      color={getAccessLevelColor(user.accessLevel)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${user.paymentAmount || 0}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditClick(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </TableContainer>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать пользователя</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Имя"
              value={editFormData.firstName}
              onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Фамилия"
              value={editFormData.lastName}
              onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Роль</InputLabel>
              <Select
                value={editFormData.role}
                label="Роль"
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    role: e.target.value as 'student' | 'teacher' | 'admin',
                  })
                }
              >
                <MenuItem value="student">Студент</MenuItem>
                <MenuItem value="teacher">Учитель</MenuItem>
                <MenuItem value="admin">Админ</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Уровень доступа</InputLabel>
              <Select
                value={editFormData.accessLevel}
                label="Уровень доступа"
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    accessLevel: e.target.value as 'free' | 'basic' | 'premium',
                  })
                }
              >
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveUser} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить пользователя{' '}
            <strong>
              {userToDelete?.firstName} {userToDelete?.lastName}
            </strong>
            ? Это действие необратимо.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsersManager
