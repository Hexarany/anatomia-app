import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia, getMediaList, deleteMedia } from '@/services/api'
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

// ВАЖНО: Предполагаем, что uploadMedia был добавлен в client/src/services/api.ts

interface UploadedFile {
  _id: string
  url: string
  filename: string
  originalName?: string
  mimetype: string
  size: number
}

const MediaManager = () => {
  const { token } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  // Загрузка списка файлов при монтировании компонента
  useEffect(() => {
    const fetchMediaList = async () => {
      if (!token) return

      setIsLoading(true)
      try {
        const mediaList = await getMediaList(token)
        setFiles(mediaList)
      } catch (error) {
        console.error('Error fetching media list:', error)
        showSnackbar('Ошибка при загрузке списка файлов.', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMediaList()
  }, [token])
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !token) return

    // Проверка размера файла (10 МБ лимит)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      showSnackbar(
        `Файл слишком большой! Размер: ${(file.size / (1024 * 1024)).toFixed(2)} МБ. Максимум: 10 МБ.`,
        'error'
      )
      // Сброс поля ввода файла
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setIsUploading(true)
    try {
      // Использование API-сервиса для загрузки
      const result = await uploadMedia(file, token)
      // После загрузки перезагружаем весь список, чтобы получить _id
      const mediaList = await getMediaList(token)
      setFiles(mediaList)
      showSnackbar(`Файл ${file.name} успешно загружен!`, 'success')
    } catch (error: any) {
      console.error('Upload error:', error)
      const errorMessage = error?.response?.data?.error?.message || 'Ошибка загрузки файла. Проверьте права и настройки сервера.'
      showSnackbar(errorMessage, 'error')
    } finally {
      setIsUploading(false)
      // Сброс поля ввода файла
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteFile = async (id: string, displayName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить файл ${displayName}?`)) return
    if (!token) return

    try {
      await deleteMedia(id, token)
      setFiles(prev => prev.filter(f => f._id !== id))
      showSnackbar(`Файл ${displayName} успешно удален.`, 'success')
    } catch (error) {
      console.error('Delete error:', error)
      showSnackbar('Ошибка при удалении файла.', 'error')
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      // Если URL уже полный (из Cloudinary), используем его напрямую
      // Иначе формируем полный URL для локальных файлов
      const fullUrl = url.startsWith('http')
        ? url
        : `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000')}${url}`

      await navigator.clipboard.writeText(fullUrl)
      showSnackbar('URL скопирован в буфер обмена!', 'success')
    } catch (error) {
      console.error('Copy error:', error)
      showSnackbar('Ошибка при копировании URL.', 'error')
    }
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Управление медиафайлами
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Файлы сохраняются в папку `server/uploads` на сервере.
        Для Production рекомендуется настроить облачное хранилище (AWS S3 / Cloudinary).
      </Alert>

      <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input
          type="file"
          ref={fileInputRef}
          hidden
          onChange={handleFileChange}
          accept="image/*,video/*,.glb,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        />
        <Button
          variant="contained"
          startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          size="large"
        >
          {isUploading ? 'Загрузка...' : 'Выбрать файл для загрузки'}
        </Button>
        <Typography variant="caption" sx={{ mt: 1 }}>
            Макс. 10MB. Поддерживаются изображения, видео, 3D-модели (.glb), документы (PDF, Word, Excel, PowerPoint), архивы
        </Typography>
      </Paper>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Загруженные файлы
      </Typography>
      <Paper>
        <List>
          {isLoading ? (
            <ListItem>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 2 }}>
                <CircularProgress />
              </Box>
            </ListItem>
          ) : files.length === 0 ? (
            <ListItem>
              <ListItemText secondary="Нет загруженных файлов." />
            </ListItem>
          ) : (
            files.map((file, index) => (
              <Box key={file._id}>
                <ListItem>
                  <ListItemText
                    primary={file.originalName || file.filename}
                    secondary={`Тип: ${file.mimetype} | Размер: ${formatFileSize(file.size)} | URL: ${file.url}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      aria-label="copy"
                      onClick={() => handleCopyUrl(file.url)}
                      sx={{ mr: 1 }}
                    >
                      <ContentCopyIcon color="primary" />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file._id, file.originalName || file.filename)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < files.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>

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

export default MediaManager