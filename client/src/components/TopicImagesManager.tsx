import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { addImageToTopic, removeImageFromTopic, getMediaList } from '@/services/api'
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
} from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import DeleteIcon from '@mui/icons-material/Delete'

interface Image {
  _id?: string
  url: string
  filename: string
  caption?: {
    ru: string
    ro: string
  }
}

interface TopicImagesManagerProps {
  topicId: string
  images: Image[]
  onUpdate: () => void
}

const TopicImagesManager: React.FC<TopicImagesManagerProps> = ({ topicId, images, onUpdate }) => {
  const { token } = useAuth()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ url: string; filename: string } | null>(null)
  const [captionRu, setCaptionRu] = useState('')
  const [captionRo, setCaptionRo] = useState('')
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)

  const handleOpenDialog = async () => {
    setOpenDialog(true)
    // Загружаем список доступных медиафайлов
    if (token) {
      setLoadingMedia(true)
      try {
        const files = await getMediaList(token)
        setMediaFiles(files)
      } catch (error) {
        console.error('Error loading media files:', error)
      } finally {
        setLoadingMedia(false)
      }
    }
  }

  const handleAddImage = async () => {
    if (!selectedImage || !token) return

    try {
      await addImageToTopic(
        topicId,
        {
          url: selectedImage.url,
          filename: selectedImage.filename,
          caption: { ru: captionRu, ro: captionRo },
        },
        token
      )
      onUpdate()
      setOpenDialog(false)
      setSelectedImage(null)
      setCaptionRu('')
      setCaptionRo('')
    } catch (error) {
      console.error('Error adding image:', error)
      alert('Ошибка при добавлении изображения')
    }
  }

  const handleRemoveImage = async (imageId: string) => {
    if (!token) return
    if (!confirm('Удалить изображение?')) return

    try {
      await removeImageFromTopic(topicId, imageId, token)
      onUpdate()
    } catch (error) {
      console.error('Error removing image:', error)
      alert('Ошибка при удалении изображения')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Иллюстрации</Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={handleOpenDialog}
        >
          Добавить изображение
        </Button>
      </Box>

      {images && images.length > 0 ? (
        <List>
          {images.map((image, index) => (
            <Paper key={image._id || index} sx={{ mb: 1, p: 1 }}>
              <ListItem>
                <Box
                  component="img"
                  src={`http://localhost:3000${image.url}`}
                  alt={image.caption?.ru || image.filename}
                  sx={{ width: 80, height: 80, objectFit: 'cover', mr: 2, borderRadius: 1 }}
                />
                <ListItemText
                  primary={image.filename}
                  secondary={
                    <>
                      <Typography variant="body2">RU: {image.caption?.ru || '—'}</Typography>
                      <Typography variant="body2">RO: {image.caption?.ro || '—'}</Typography>
                    </>
                  }
                />
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => image._id && handleRemoveImage(image._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Нет добавленных иллюстраций
        </Typography>
      )}

      {/* Dialog для добавления изображения */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить изображение к топику</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Выберите изображение из медиатеки:
          </Typography>

          {loadingMedia ? (
            <Typography>Загрузка...</Typography>
          ) : (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {mediaFiles.map((file) => (
                <Grid item xs={4} key={file._id}>
                  <Paper
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      border: selectedImage?.url === file.url ? '2px solid primary.main' : '1px solid',
                      borderColor: selectedImage?.url === file.url ? 'primary.main' : 'divider',
                    }}
                    onClick={() => setSelectedImage({ url: file.url, filename: file.filename })}
                  >
                    <Box
                      component="img"
                      src={`http://localhost:3000${file.url}`}
                      alt={file.filename}
                      sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <Typography variant="caption" noWrap>
                      {file.filename}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          <TextField
            fullWidth
            label="Подпись (RU)"
            value={captionRu}
            onChange={(e) => setCaptionRu(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Подпись (RO)"
            value={captionRo}
            onChange={(e) => setCaptionRo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleAddImage} variant="contained" disabled={!selectedImage}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TopicImagesManager
