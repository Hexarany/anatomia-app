import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
  MenuItem,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { HygieneGuideline } from '@/types'
import {
  getHygieneGuidelines,
  createHygieneGuideline,
  updateHygieneGuideline,
  deleteHygieneGuideline,
} from '@/services/api'

const categories = [
  { value: 'sterilization', labelRu: 'Методы стерилизации', labelRo: 'Metode de sterilizare' },
  { value: 'disinfection', labelRu: 'Методы дезинфекции', labelRo: 'Metode de dezinfecție' },
  { value: 'ergonomics', labelRu: 'Эргономика', labelRo: 'Ergonomie' },
  { value: 'office_requirements', labelRu: 'Требования к кабинету', labelRo: 'Cerințe pentru cabinet' },
  { value: 'therapist_requirements', labelRu: 'Требования к массажисту', labelRo: 'Cerințe pentru terapeut' },
  { value: 'dress_code', labelRu: 'Форма одежды', labelRo: 'Cod vestimentar' },
]

const HygieneGuidelinesManager = () => {
  const { token } = useAuth()
  const [guidelines, setGuidelines] = useState<HygieneGuideline[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingGuideline, setEditingGuideline] = useState<HygieneGuideline | null>(null)
  const [formData, setFormData] = useState({
    title: { ru: '', ro: '' },
    category: 'sterilization' as HygieneGuideline['category'],
    content: { ru: '', ro: '' },
    order: 0,
    isPublished: true,
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  useEffect(() => {
    loadGuidelines()
  }, [])

  const loadGuidelines = async () => {
    try {
      const data = await getHygieneGuidelines()
      setGuidelines(data)
    } catch (error) {
      showSnackbar('Ошибка загрузки', 'error')
    }
  }

  const handleOpenDialog = (guideline?: HygieneGuideline) => {
    if (guideline) {
      setEditingGuideline(guideline)
      setFormData({
        title: guideline.title,
        category: guideline.category,
        content: guideline.content,
        order: guideline.order,
        isPublished: guideline.isPublished,
      })
    } else {
      setEditingGuideline(null)
      setFormData({
        title: { ru: '', ro: '' },
        category: 'sterilization',
        content: { ru: '', ro: '' },
        order: guidelines.length,
        isPublished: true,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingGuideline(null)
  }

  const handleSave = async () => {
    if (!token) return

    try {
      if (editingGuideline) {
        await updateHygieneGuideline(editingGuideline._id, formData, token)
        showSnackbar('Рекомендация обновлена', 'success')
      } else {
        await createHygieneGuideline(formData, token)
        showSnackbar('Рекомендация создана', 'success')
      }
      loadGuidelines()
      handleCloseDialog()
    } catch (error) {
      showSnackbar('Ошибка сохранения', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Вы уверены?')) return

    try {
      await deleteHygieneGuideline(id, token)
      showSnackbar('Рекомендация удалена', 'success')
      loadGuidelines()
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
        <Typography variant="h5">Управление рекомендациями по гигиене</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название (RU)</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Порядок</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guidelines.map((guideline) => (
              <TableRow key={guideline._id}>
                <TableCell>{guideline.title.ru}</TableCell>
                <TableCell>{categories.find(c => c.value === guideline.category)?.labelRu}</TableCell>
                <TableCell>{guideline.order}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(guideline)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(guideline._id)} color="error">
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
          {editingGuideline ? 'Редактировать' : 'Новая рекомендация'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название (RU)"
              value={formData.title.ru}
              onChange={(e) => setFormData({ ...formData, title: { ...formData.title, ru: e.target.value } })}
              fullWidth
            />
            <TextField
              label="Название (RO)"
              value={formData.title.ro}
              onChange={(e) => setFormData({ ...formData, title: { ...formData.title, ro: e.target.value } })}
              fullWidth
            />
            <TextField
              select
              label="Категория"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              fullWidth
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.labelRu}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Контент (RU) - Markdown"
              value={formData.content.ru}
              onChange={(e) => setFormData({ ...formData, content: { ...formData.content, ru: e.target.value } })}
              multiline
              rows={10}
              fullWidth
            />
            <TextField
              label="Контент (RO) - Markdown"
              value={formData.content.ro}
              onChange={(e) => setFormData({ ...formData, content: { ...formData.content, ro: e.target.value } })}
              multiline
              rows={10}
              fullWidth
            />
            <TextField
              label="Порядок"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
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

export default HygieneGuidelinesManager
