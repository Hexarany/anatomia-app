import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { Category } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')

const CategoriesManager = () => {
  const { token } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: { ru: '', ro: '' },
    description: { ru: '', ro: '' },
    icon: '',
    color: '#1976d2',
    order: 0,
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`)
      setCategories(response.data)
    } catch (error) {
      showSnackbar('Ошибка загрузки категорий', 'error')
    }
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        order: category.order,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: { ru: '', ro: '' },
        description: { ru: '', ro: '' },
        icon: '',
        color: '#1976d2',
        order: categories.length,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCategory(null)
  }

  const handleSave = async () => {
    if (!token) return

    try {
      if (editingCategory) {
        await axios.put(
          `${API_BASE_URL}/categories/${editingCategory._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        showSnackbar('Категория обновлена', 'success')
      } else {
        await axios.post(
          `${API_BASE_URL}/categories`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        showSnackbar('Категория создана', 'success')
      }
      loadCategories()
      handleCloseDialog()
    } catch (error) {
      showSnackbar('Ошибка сохранения', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Вы уверены? / Sunteți sigur?')) return

    try {
      await axios.delete(`${API_BASE_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      showSnackbar('Категория удалена', 'success')
      loadCategories()
    } catch (error) {
      showSnackbar('Ошибка удаления', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Управление категориями</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить категорию
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Порядок</TableCell>
              <TableCell>Название (RU)</TableCell>
              <TableCell>Название (RO)</TableCell>
              <TableCell>Иконка</TableCell>
              <TableCell>Цвет</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>{category.order}</TableCell>
                <TableCell>{category.name.ru}</TableCell>
                <TableCell>{category.name.ro}</TableCell>
                <TableCell>{category.icon}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: category.color,
                      borderRadius: 1,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(category)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(category._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название (RU)"
              value={formData.name.ru}
              onChange={(e) =>
                setFormData({ ...formData, name: { ...formData.name, ru: e.target.value } })
              }
              fullWidth
            />
            <TextField
              label="Название (RO)"
              value={formData.name.ro}
              onChange={(e) =>
                setFormData({ ...formData, name: { ...formData.name, ro: e.target.value } })
              }
              fullWidth
            />
            <TextField
              label="Описание (RU)"
              value={formData.description.ru}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, ru: e.target.value },
                })
              }
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Описание (RO)"
              value={formData.description.ro}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, ro: e.target.value },
                })
              }
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Иконка (название Material Icon)"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              fullWidth
              helperText="Например: Science, Favorite, LocalHospital"
            />
            <TextField
              label="Цвет (HEX)"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              fullWidth
            />
            <TextField
              label="Порядок"
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CategoriesManager
