import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, MenuItem, Snackbar, Alert } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { AnatomyModel3D } from '@/types'
import { getAnatomyModels3D, createAnatomyModel3D, updateAnatomyModel3D, deleteAnatomyModel3D } from '@/services/api'

const categories = [
  { value: 'bones', label: 'Кости / Oase' },
  { value: 'muscles', label: 'Мышцы / Mușchi' },
  { value: 'organs', label: 'Органы / Organe' },
  { value: 'nervous_system', label: 'Нервная система / Sistemul nervos' },
  { value: 'cardiovascular_system', label: 'Сердечно-сосудистая / Cardiovascular' },
  { value: 'other', label: 'Другое / Altele' },
]

const AnatomyModels3DManager = () => {
  const { token } = useAuth()
  const [models, setModels] = useState<AnatomyModel3D[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AnatomyModel3D | null>(null)
  const [formData, setFormData] = useState({
    name: { ru: '', ro: '' },
    description: { ru: '', ro: '' },
    category: 'bones' as AnatomyModel3D['category'],
    modelUrl: '',
    previewImage: '',
    difficulty: 'beginner' as AnatomyModel3D['difficulty'],
    attribution: {
      author: '',
      source: 'SketchFab',
      sourceUrl: '',
      license: 'CC BY 4.0',
    },
    order: 0,
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  useEffect(() => { loadModels() }, [])

  const loadModels = async () => {
    try {
      const data = await getAnatomyModels3D()
      setModels(data)
    } catch (error) {
      showSnackbar('Ошибка загрузки', 'error')
    }
  }

  const handleOpen = (model?: AnatomyModel3D) => {
    if (model) {
      setEditing(model)
      setFormData({
        name: model.name,
        description: model.description,
        category: model.category,
        modelUrl: model.modelUrl,
        previewImage: model.previewImage || '',
        difficulty: model.difficulty,
        attribution: model.attribution || {
          author: '',
          source: 'SketchFab',
          sourceUrl: '',
          license: 'CC BY 4.0',
        },
        order: model.order,
      })
    } else {
      setEditing(null)
      setFormData({
        name: { ru: '', ro: '' },
        description: { ru: '', ro: '' },
        category: 'bones',
        modelUrl: '',
        previewImage: '',
        difficulty: 'beginner',
        attribution: {
          author: '',
          source: 'SketchFab',
          sourceUrl: '',
          license: 'CC BY 4.0',
        },
        order: models.length,
      })
    }
    setOpen(true)
  }

  const handleSave = async () => {
    if (!token) return

    // Валидация обязательных полей
    if (!formData.name.ru.trim()) {
      showSnackbar('Заполните название на русском', 'error')
      return
    }
    if (!formData.name.ro.trim()) {
      showSnackbar('Заполните название на румынском', 'error')
      return
    }
    if (!formData.modelUrl.trim()) {
      showSnackbar('Укажите URL модели', 'error')
      return
    }

    try {
      if (editing) {
        await updateAnatomyModel3D(editing._id, formData, token)
        showSnackbar('Модель обновлена', 'success')
      } else {
        await createAnatomyModel3D(formData, token)
        showSnackbar('Модель создана', 'success')
      }
      loadModels()
      setOpen(false)
    } catch (error: any) {
      console.error('Save error:', error)
      const message = error.response?.data?.message || error.response?.data?.details || 'Ошибка сохранения'
      showSnackbar(message, 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Удалить?')) return
    try {
      await deleteAnatomyModel3D(id, token)
      showSnackbar('Модель удалена', 'success')
      loadModels()
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
        <Typography variant="h5">Управление 3D моделями</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Добавить
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          maxWidth: '100%',
          '& .MuiTable-root': {
            minWidth: { xs: 400, sm: 500, md: 'auto' },
          },
          '& .MuiTableCell-root': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 8px', sm: '12px 16px' },
          },
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: 'action.hover',
          }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Название (RU)</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Категория</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>{model.name.ru}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{categories.find(c => c.value === model.category)?.label}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpen(model)}
                    color="primary"
                    size="small"
                    sx={{ p: { xs: 0.5, sm: 1 } }}
                  >
                    <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(model._id)}
                    color="error"
                    size="small"
                    sx={{ p: { xs: 0.5, sm: 1 } }}
                  >
                    <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Редактировать' : 'Новая модель'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Название (RU)" value={formData.name.ru} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ru: e.target.value } })} fullWidth />
            <TextField label="Название (RO)" value={formData.name.ro} onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ro: e.target.value } })} fullWidth />
            <TextField label="Описание (RU)" value={formData.description.ru} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, ru: e.target.value } })} multiline rows={3} fullWidth />
            <TextField label="Описание (RO)" value={formData.description.ro} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, ro: e.target.value } })} multiline rows={3} fullWidth />
            <TextField select label="Категория" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })} fullWidth>
              {categories.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}
            </TextField>
            <TextField label="URL модели (.glb)" value={formData.modelUrl} onChange={(e) => setFormData({ ...formData, modelUrl: e.target.value })} fullWidth helperText="Cloudinary URL для .glb файла" />
            <TextField label="URL превью" value={formData.previewImage} onChange={(e) => setFormData({ ...formData, previewImage: e.target.value })} fullWidth />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Авторство (для CC BY лицензий)</Typography>
            <TextField
              label="Автор"
              value={formData.attribution.author}
              onChange={(e) => setFormData({ ...formData, attribution: { ...formData.attribution, author: e.target.value } })}
              fullWidth
              helperText="Имя создателя 3D модели"
            />
            <TextField
              label="Источник"
              value={formData.attribution.source}
              onChange={(e) => setFormData({ ...formData, attribution: { ...formData.attribution, source: e.target.value } })}
              fullWidth
              helperText="Название сайта или платформы"
            />
            <TextField
              label="URL источника"
              value={formData.attribution.sourceUrl}
              onChange={(e) => setFormData({ ...formData, attribution: { ...formData.attribution, sourceUrl: e.target.value } })}
              fullWidth
              helperText="Ссылка на оригинальную модель"
            />
            <TextField
              label="Лицензия"
              value={formData.attribution.license}
              onChange={(e) => setFormData({ ...formData, attribution: { ...formData.attribution, license: e.target.value } })}
              fullWidth
              helperText="Например: CC BY 4.0"
            />

            <TextField select label="Сложность" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })} fullWidth>
              <MenuItem value="beginner">Начальный</MenuItem>
              <MenuItem value="intermediate">Средний</MenuItem>
              <MenuItem value="advanced">Продвинутый</MenuItem>
            </TextField>
            <TextField label="Порядок" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AnatomyModels3DManager
