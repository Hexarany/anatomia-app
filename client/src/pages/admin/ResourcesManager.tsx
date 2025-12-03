import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { getResources, createResource, updateResource, deleteResource, type Resource } from '@/services/api'
import axios from 'axios'

const ResourcesManager = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState({
    titleRu: '',
    titleRo: '',
    descriptionRu: '',
    descriptionRo: '',
    type: 'pdf' as 'pdf' | 'doc' | 'book' | 'article' | 'link' | 'video',
    category: '',
    fileUrl: '',
    externalUrl: '',
    thumbnail: '',
    author: '',
    publishedYear: new Date().getFullYear(),
    accessLevel: 'free' as 'free' | 'basic' | 'premium',
    tags: '',
    isPublished: true,
  })

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      setLoading(true)
      const data = await getResources()
      setResources(data)
    } catch (err) {
      setError('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource)
      setFormData({
        titleRu: resource.title.ru,
        titleRo: resource.title.ro,
        descriptionRu: resource.description.ru,
        descriptionRo: resource.description.ro,
        type: resource.type,
        category: resource.category,
        fileUrl: resource.fileUrl || '',
        externalUrl: resource.externalUrl || '',
        thumbnail: resource.thumbnail || '',
        author: resource.author || '',
        publishedYear: resource.publishedYear || new Date().getFullYear(),
        accessLevel: resource.accessLevel,
        tags: resource.tags.join(', '),
        isPublished: resource.isPublished,
      })
    } else {
      setEditingResource(null)
      setFormData({
        titleRu: '',
        titleRo: '',
        descriptionRu: '',
        descriptionRo: '',
        type: 'pdf',
        category: '',
        fileUrl: '',
        externalUrl: '',
        thumbnail: '',
        author: '',
        publishedYear: new Date().getFullYear(),
        accessLevel: 'free',
        tags: '',
        isPublished: true,
      })
    }
    setDialogOpen(true)
    setError('')
    setSuccess('')
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingResource(null)
  }

  const handleSubmit = async () => {
    try {
      const data = {
        title: {
          ru: formData.titleRu,
          ro: formData.titleRo,
        },
        description: {
          ru: formData.descriptionRu,
          ro: formData.descriptionRo,
        },
        type: formData.type,
        category: formData.category,
        fileUrl: formData.fileUrl || undefined,
        externalUrl: formData.externalUrl || undefined,
        thumbnail: formData.thumbnail || undefined,
        author: formData.author || undefined,
        publishedYear: formData.publishedYear || undefined,
        accessLevel: formData.accessLevel,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        isPublished: formData.isPublished,
      }

      if (editingResource) {
        await updateResource(editingResource._id, data)
        setSuccess('Ресурс успешно обновлен')
      } else {
        await createResource(data)
        setSuccess('Ресурс успешно создан')
      }

      handleCloseDialog()
      loadResources()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения ресурса')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот ресурс?')) return

    try {
      await deleteResource(id)
      setSuccess('Ресурс успешно удален')
      loadResources()
    } catch (err) {
      setError('Ошибка удаления ресурса')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Проверка размера файла (макс 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер: 500MB')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      setError('')

      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const token = localStorage.getItem('token')
      const response = await axios.post('/api/media/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadProgress(progress)
        },
      })

      // Устанавливаем URL загруженного файла
      setFormData({ ...formData, fileUrl: response.data.url })
      setSuccess('Файл успешно загружен!')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка загрузки файла')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <strong>Всего ресурсов:</strong> {resources.length}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Добавить ресурс
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Доступ</TableCell>
              <TableCell>Загрузок</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource._id}>
                <TableCell>
                  {resource.title.ru}
                  {resource.author && <><br /><small>({resource.author})</small></>}
                </TableCell>
                <TableCell>
                  <Chip label={resource.type.toUpperCase()} size="small" />
                </TableCell>
                <TableCell>{resource.category}</TableCell>
                <TableCell>
                  <Chip
                    label={resource.accessLevel}
                    size="small"
                    color={resource.accessLevel === 'free' ? 'success' : resource.accessLevel === 'basic' ? 'info' : 'warning'}
                  />
                </TableCell>
                <TableCell>{resource.downloads}</TableCell>
                <TableCell>
                  <Chip
                    label={resource.isPublished ? 'Опубликован' : 'Черновик'}
                    size="small"
                    color={resource.isPublished ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenDialog(resource)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(resource._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingResource ? 'Редактировать ресурс' : 'Добавить ресурс'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название (RU)"
              value={formData.titleRu}
              onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Название (RO)"
              value={formData.titleRo}
              onChange={(e) => setFormData({ ...formData, titleRo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Описание (RU)"
              value={formData.descriptionRu}
              onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Описание (RO)"
              value={formData.descriptionRo}
              onChange={(e) => setFormData({ ...formData, descriptionRo: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Тип"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                sx={{ flex: 1 }}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="doc">Документ</MenuItem>
                <MenuItem value="book">Книга</MenuItem>
                <MenuItem value="article">Статья</MenuItem>
                <MenuItem value="link">Ссылка</MenuItem>
                <MenuItem value="video">Видео</MenuItem>
              </TextField>

              <TextField
                select
                label="Уровень доступа"
                value={formData.accessLevel}
                onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value as any })}
                sx={{ flex: 1 }}
              >
                <MenuItem value="free">Бесплатно</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
              </TextField>
            </Box>

            <TextField
              label="Категория"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
              required
              helperText="Например: Анатомия, Массаж, Физиология"
            />

            <Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  label="URL файла (Cloudinary или прямая ссылка)"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  fullWidth
                  helperText="Для PDF/DOC/Книг - ссылка на файл"
                />
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  disabled={uploading}
                  sx={{ minWidth: '150px', height: '56px' }}
                >
                  {uploading ? 'Загрузка...' : 'Загрузить'}
                  <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" />
                </Button>
              </Box>
              {uploading && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Box sx={{ textAlign: 'center', mt: 0.5 }}>
                    <small>{uploadProgress}%</small>
                  </Box>
                </Box>
              )}
            </Box>

            <TextField
              label="Внешняя ссылка"
              value={formData.externalUrl}
              onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
              fullWidth
              helperText="Для статей/видео - ссылка на внешний ресурс"
            />

            <TextField
              label="Thumbnail URL"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              fullWidth
              helperText="Ссылка на изображение превью"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Автор"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                sx={{ flex: 2 }}
              />
              <TextField
                label="Год публикации"
                type="number"
                value={formData.publishedYear}
                onChange={(e) => setFormData({ ...formData, publishedYear: parseInt(e.target.value) })}
                sx={{ flex: 1 }}
              />
            </Box>

            <TextField
              label="Теги (через запятую)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              fullWidth
              helperText="Например: анатомия, обучение, практика"
            />

            <TextField
              select
              label="Статус"
              value={formData.isPublished ? 'published' : 'draft'}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'published' })}
              fullWidth
            >
              <MenuItem value="published">Опубликован</MenuItem>
              <MenuItem value="draft">Черновик</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingResource ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ResourcesManager
