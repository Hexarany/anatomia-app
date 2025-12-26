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
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import UploadIcon from '@mui/icons-material/Upload'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import type { MassageProtocol } from '@/types'
import {
  getMassageProtocols,
  createMassageProtocol,
  updateMassageProtocol,
  deleteMassageProtocol,
  uploadMedia,
  addImageToMassageProtocol,
  removeImageFromMassageProtocol,
  updateMassageProtocolImageCaption,
  addVideoToMassageProtocol,
  removeVideoFromMassageProtocol,
  updateMassageProtocolVideoCaption,
} from '@/services/api'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || (import.meta.env.PROD ? '' : 'http://localhost:3000')

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

const MassageProtocolsManager = () => {
  const { token } = useAuth()
  const [protocols, setProtocols] = useState<MassageProtocol[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingProtocol, setEditingProtocol] = useState<MassageProtocol | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    name: { ru: '', ro: '' },
    description: { ru: '', ro: '' },
    content: { ru: '', ro: '' },
    type: '',
    duration: 60,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    benefits: { ru: '', ro: '' },
    contraindications: { ru: '', ro: '' },
    technique: { ru: '', ro: '' },
    order: 0,
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [uploading, setUploading] = useState(false)
  const [editingCaption, setEditingCaption] = useState<{
    imageId?: string
    videoId?: string
    caption: { ru: string; ro: string }
  } | null>(null)

  useEffect(() => {
    loadProtocols()
  }, [])

  const loadProtocols = async () => {
    try {
      const data = await getMassageProtocols()
      setProtocols(data)
    } catch (error) {
      showSnackbar('Ошибка загрузки протоколов', 'error')
    }
  }

  const handleOpenDialog = (protocol?: MassageProtocol) => {
    if (protocol) {
      setEditingProtocol(protocol)
      setFormData({
        name: protocol.name,
        description: protocol.description,
        content: protocol.content,
        type: protocol.type,
        duration: protocol.duration,
        difficulty: protocol.difficulty,
        benefits: protocol.benefits,
        contraindications: protocol.contraindications,
        technique: protocol.technique,
        order: protocol.order,
      })
    } else {
      setEditingProtocol(null)
      setFormData({
        name: { ru: '', ro: '' },
        description: { ru: '', ro: '' },
        content: { ru: '', ro: '' },
        type: '',
        duration: 60,
        difficulty: 'beginner',
        benefits: { ru: '', ro: '' },
        contraindications: { ru: '', ro: '' },
        technique: { ru: '', ro: '' },
        order: protocols.length,
      })
    }
    setOpenDialog(true)
    setActiveTab(0)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingProtocol(null)
  }

  const handleSave = async () => {
    if (!token) return

    try {
      const dataToSend = {
        ...formData,
        order: formData.order === 0 && !editingProtocol ? protocols.length + 1 : formData.order
      }

      if (editingProtocol) {
        await updateMassageProtocol(editingProtocol._id, dataToSend, token)
        showSnackbar('Протокол обновлен', 'success')
      } else {
        await createMassageProtocol(dataToSend, token)
        showSnackbar('Протокол создан', 'success')
      }
      loadProtocols()
      handleCloseDialog()
    } catch (error) {
      showSnackbar('Ошибка сохранения', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Вы уверены?')) return

    try {
      await deleteMassageProtocol(id, token)
      showSnackbar('Протокол удален', 'success')
      loadProtocols()
    } catch (error) {
      showSnackbar('Ошибка удаления', 'error')
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !token || !editingProtocol) return

    const file = event.target.files[0]

    try {
      setUploading(true)
      // Upload file to server
      const uploadResult = await uploadMedia(file, token)

      // Add image to protocol
      const updated = await addImageToMassageProtocol(
        editingProtocol._id,
        {
          url: uploadResult.url,
          filename: uploadResult.filename,
          caption: { ru: '', ro: '' },
        },
        token
      )

      setEditingProtocol(updated)
      showSnackbar('Изображение загружено', 'success')
      loadProtocols()
    } catch (error) {
      showSnackbar('Ошибка загрузки изображения', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !token || !editingProtocol) return

    const file = event.target.files[0]

    try {
      setUploading(true)
      // Upload file to server
      const uploadResult = await uploadMedia(file, token)

      // Add video to protocol
      const updated = await addVideoToMassageProtocol(
        editingProtocol._id,
        {
          url: uploadResult.url,
          filename: uploadResult.filename,
          caption: { ru: '', ro: '' },
        },
        token
      )

      setEditingProtocol(updated)
      showSnackbar('Видео загружено', 'success')
      loadProtocols()
    } catch (error) {
      showSnackbar('Ошибка загрузки видео', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!token || !editingProtocol || !confirm('Удалить изображение?')) return

    try {
      const updated = await removeImageFromMassageProtocol(editingProtocol._id, imageId, token)
      setEditingProtocol(updated)
      showSnackbar('Изображение удалено', 'success')
      loadProtocols()
    } catch (error) {
      showSnackbar('Ошибка удаления изображения', 'error')
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!token || !editingProtocol || !confirm('Удалить видео?')) return

    try {
      const updated = await removeVideoFromMassageProtocol(editingProtocol._id, videoId, token)
      setEditingProtocol(updated)
      showSnackbar('Видео удалено', 'success')
      loadProtocols()
    } catch (error) {
      showSnackbar('Ошибка удаления видео', 'error')
    }
  }

  const handleUpdateCaption = async () => {
    if (!token || !editingProtocol || !editingCaption) return

    try {
      if (editingCaption.imageId) {
        const updated = await updateMassageProtocolImageCaption(
          editingProtocol._id,
          editingCaption.imageId,
          editingCaption.caption,
          token
        )
        setEditingProtocol(updated)
        showSnackbar('Подпись обновлена', 'success')
      } else if (editingCaption.videoId) {
        const updated = await updateMassageProtocolVideoCaption(
          editingProtocol._id,
          editingCaption.videoId,
          editingCaption.caption,
          token
        )
        setEditingProtocol(updated)
        showSnackbar('Подпись обновлена', 'success')
      }
      setEditingCaption(null)
      loadProtocols()
    } catch (error) {
      showSnackbar('Ошибка обновления подписи', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Управление протоколами массажа</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить протокол
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          maxWidth: '100%',
          '& .MuiTable-root': {
            minWidth: { xs: 500, sm: 700, md: 'auto' },
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
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Порядок</TableCell>
              <TableCell>Название (RU)</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Тип</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Длительность</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Сложность</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Медиа</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {protocols.map((protocol) => (
              <TableRow key={protocol._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{protocol.order}</TableCell>
                <TableCell>{protocol.name.ru}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{protocol.type}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{protocol.duration} мин</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{protocol.difficulty}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {protocol.images && protocol.images.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ImageIcon fontSize="small" color="primary" />
                        <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          {protocol.images.length}
                        </Typography>
                      </Box>
                    )}
                    {protocol.videos && protocol.videos.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VideoLibraryIcon fontSize="small" color="secondary" />
                        <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          {protocol.videos.length}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenDialog(protocol)}
                    color="primary"
                    size="small"
                    sx={{ p: { xs: 0.5, sm: 1 } }}
                  >
                    <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(protocol._id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingProtocol ? 'Редактировать протокол' : 'Новый протокол'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable">
              <Tab label="Основное" />
              <Tab label="Описание" />
              <Tab label="Польза" />
              <Tab label="Противопоказания" />
              <Tab label="Техника" />
              {editingProtocol && <Tab label="Медиа" icon={<ImageIcon />} iconPosition="start" />}
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                label="Краткое описание (RU)"
                value={formData.description.ru}
                onChange={(e) =>
                  setFormData({ ...formData, description: { ...formData.description, ru: e.target.value } })
                }
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Краткое описание (RO)"
                value={formData.description.ro}
                onChange={(e) =>
                  setFormData({ ...formData, description: { ...formData.description, ro: e.target.value } })
                }
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Тип массажа"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                fullWidth
                helperText="Например: классический, баночный, антицеллюлитный"
              />
              <TextField
                label="Длительность (минут)"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
                fullWidth
              />
              <TextField
                select
                label="Сложность"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value as any })
                }
                fullWidth
              >
                <MenuItem value="beginner">Начальный</MenuItem>
                <MenuItem value="intermediate">Средний</MenuItem>
                <MenuItem value="advanced">Продвинутый</MenuItem>
              </TextField>
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
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Описание (RU) - Markdown"
                value={formData.content.ru}
                onChange={(e) =>
                  setFormData({ ...formData, content: { ...formData.content, ru: e.target.value } })
                }
                multiline
                rows={15}
                fullWidth
              />
              <TextField
                label="Описание (RO) - Markdown"
                value={formData.content.ro}
                onChange={(e) =>
                  setFormData({ ...formData, content: { ...formData.content, ro: e.target.value } })
                }
                multiline
                rows={15}
                fullWidth
              />
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Польза (RU) - Markdown"
                value={formData.benefits.ru}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: { ...formData.benefits, ru: e.target.value } })
                }
                multiline
                rows={10}
                fullWidth
              />
              <TextField
                label="Польза (RO) - Markdown"
                value={formData.benefits.ro}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: { ...formData.benefits, ro: e.target.value } })
                }
                multiline
                rows={10}
                fullWidth
              />
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Противопоказания (RU) - Markdown"
                value={formData.contraindications.ru}
                onChange={(e) =>
                  setFormData({ ...formData, contraindications: { ...formData.contraindications, ru: e.target.value } })
                }
                multiline
                rows={10}
                fullWidth
              />
              <TextField
                label="Противопоказания (RO) - Markdown"
                value={formData.contraindications.ro}
                onChange={(e) =>
                  setFormData({ ...formData, contraindications: { ...formData.contraindications, ro: e.target.value } })
                }
                multiline
                rows={10}
                fullWidth
              />
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Техника выполнения (RU) - Markdown"
                value={formData.technique.ru}
                onChange={(e) =>
                  setFormData({ ...formData, technique: { ...formData.technique, ru: e.target.value } })
                }
                multiline
                rows={15}
                fullWidth
              />
              <TextField
                label="Техника выполнения (RO) - Markdown"
                value={formData.technique.ro}
                onChange={(e) =>
                  setFormData({ ...formData, technique: { ...formData.technique, ro: e.target.value } })
                }
                multiline
                rows={15}
                fullWidth
              />
            </Box>
          </TabPanel>

          {editingProtocol && (
            <TabPanel value={activeTab} index={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Images Section */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Изображения / Схемы</Typography>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      component="label"
                      disabled={uploading}
                    >
                      {uploading ? 'Загрузка...' : 'Загрузить изображение'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    {editingProtocol.images && editingProtocol.images.map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={image._id || index}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="200"
                            image={image.url.startsWith('http') ? image.url : `${API_BASE_URL}${image.url}`}
                            alt={image.caption?.ru || 'Изображение'}
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              {image.filename}
                            </Typography>
                            {image.caption && (
                              <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>RU:</strong> {image.caption.ru || '-'}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>RO:</strong> {image.caption.ro || '-'}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              onClick={() =>
                                setEditingCaption({
                                  imageId: image._id,
                                  caption: image.caption || { ru: '', ro: '' },
                                })
                              }
                            >
                              Редактировать
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteImage(image._id!)}
                            >
                              Удалить
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {(!editingProtocol.images || editingProtocol.images.length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Нет загруженных изображений
                    </Typography>
                  )}
                </Box>

                {/* Videos Section */}
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Видео</Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<UploadIcon />}
                      component="label"
                      disabled={uploading}
                    >
                      {uploading ? 'Загрузка...' : 'Загрузить видео'}
                      <input
                        type="file"
                        hidden
                        accept="video/*"
                        onChange={handleVideoUpload}
                      />
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    {editingProtocol.videos && editingProtocol.videos.map((video, index) => (
                      <Grid item xs={12} md={6} key={video._id || index}>
                        <Card>
                          <Box sx={{ position: 'relative', paddingTop: '56.25%', backgroundColor: 'black' }}>
                            <video
                              controls
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                              }}
                              src={video.url.startsWith('http') ? video.url : `${API_BASE_URL}${video.url}`}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </Box>
                          <CardContent>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              {video.filename}
                            </Typography>
                            {video.caption && (
                              <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>RU:</strong> {video.caption.ru || '-'}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>RO:</strong> {video.caption.ro || '-'}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              onClick={() =>
                                setEditingCaption({
                                  videoId: video._id,
                                  caption: video.caption || { ru: '', ro: '' },
                                })
                              }
                            >
                              Редактировать
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteVideo(video._id!)}
                            >
                              Удалить
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {(!editingProtocol.videos || editingProtocol.videos.length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Нет загруженных видео
                    </Typography>
                  )}
                </Box>
              </Box>
            </TabPanel>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Caption Edit Dialog */}
      <Dialog open={!!editingCaption} onClose={() => setEditingCaption(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать подпись</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Подпись (RU)"
              value={editingCaption?.caption.ru || ''}
              onChange={(e) =>
                setEditingCaption(
                  editingCaption
                    ? {
                        ...editingCaption,
                        caption: { ...editingCaption.caption, ru: e.target.value },
                      }
                    : null
                )
              }
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Подпись (RO)"
              value={editingCaption?.caption.ro || ''}
              onChange={(e) =>
                setEditingCaption(
                  editingCaption
                    ? {
                        ...editingCaption,
                        caption: { ...editingCaption.caption, ro: e.target.value },
                      }
                    : null
                )
              }
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCaption(null)}>Отмена</Button>
          <Button onClick={handleUpdateCaption} variant="contained">
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

export default MassageProtocolsManager
