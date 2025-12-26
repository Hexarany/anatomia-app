import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { TriggerPoint } from '@/types'
import { getTriggerPoints, deleteTriggerPoint, createTriggerPoint, updateTriggerPoint } from '@/services/api'

const categories = [
  { value: 'head_neck', label: 'Голова/Шея / Cap/Gât' },
  { value: 'shoulder_arm', label: 'Плечо/Рука / Umăr/Braț' },
  { value: 'back', label: 'Спина / Spate' },
  { value: 'chest', label: 'Грудь / Piept' },
  { value: 'hip_leg', label: 'Бедро/Нога / Șold/Picior' },
  { value: 'other', label: 'Другое / Altele' },
]

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

const TriggerPointsManager = () => {
  const { token } = useAuth()
  const [points, setPoints] = useState<TriggerPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPoint, setEditingPoint] = useState<TriggerPoint | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    name: { ru: '', ro: '' },
    muscle: '',
    location: { ru: '', ro: '' },
    symptoms: { ru: '', ro: '' },
    referralPattern: { ru: '', ro: '' },
    technique: { ru: '', ro: '' },
    contraindications: { ru: '', ro: '' },
    category: 'head_neck' as 'head_neck' | 'shoulder_arm' | 'back' | 'chest' | 'hip_leg' | 'other',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    order: 0,
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  useEffect(() => { loadPoints() }, [])

  const loadPoints = async () => {
    try {
      setLoading(true)
      const data = await getTriggerPoints()
      setPoints(data)
    } catch (error) {
      showSnackbar('Ошибка загрузки', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (point?: TriggerPoint) => {
    if (point) {
      setEditingPoint(point)
      setFormData({
        name: point.name,
        muscle: point.muscle,
        location: point.location,
        symptoms: point.symptoms,
        referralPattern: point.referralPattern,
        technique: point.technique,
        contraindications: point.contraindications || { ru: '', ro: '' },
        category: point.category,
        difficulty: point.difficulty,
        order: point.order,
      })
    } else {
      setEditingPoint(null)
      setFormData({
        name: { ru: '', ro: '' },
        muscle: '',
        location: { ru: '', ro: '' },
        symptoms: { ru: '', ro: '' },
        referralPattern: { ru: '', ro: '' },
        technique: { ru: '', ro: '' },
        contraindications: { ru: '', ro: '' },
        category: 'head_neck',
        difficulty: 'beginner',
        order: points.length + 1,
      })
    }
    setOpenDialog(true)
    setActiveTab(0)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingPoint(null)
  }

  const handleSave = async () => {
    if (!token) return

    // Validation
    if (!formData.name.ru || !formData.name.ro) {
      showSnackbar('Заполните название на обоих языках', 'error')
      return
    }
    if (!formData.muscle) {
      showSnackbar('Укажите название мышцы', 'error')
      return
    }

    try {
      const dataToSend = {
        ...formData,
        order: formData.order === 0 && !editingPoint ? points.length + 1 : formData.order,
      }

      if (editingPoint) {
        await updateTriggerPoint(editingPoint._id, dataToSend, token)
        showSnackbar('Триггерная точка обновлена', 'success')
      } else {
        await createTriggerPoint(dataToSend, token)
        showSnackbar('Триггерная точка создана', 'success')
      }
      loadPoints()
      handleCloseDialog()
    } catch (error) {
      showSnackbar('Ошибка сохранения', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить триггерную точку?') || !token) return

    try {
      await deleteTriggerPoint(id, token)
      setPoints(prev => prev.filter(p => p._id !== id))
      showSnackbar('Точка удалена', 'success')
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
        <Typography variant="h5">Управление триггерными точками</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить точку
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Мышца</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Категория</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Сложность</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {points.map((point) => (
                <TableRow key={point._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{point.order}</TableCell>
                  <TableCell>{point.name.ru}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{point.muscle}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{categories.find(c => c.value === point.category)?.label}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{point.difficulty}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenDialog(point)}
                      color="primary"
                      size="small"
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(point._id)}
                      color="error"
                      size="small"
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {points.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Нет триггерных точек. Добавьте первую точку используя кнопку выше.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingPoint ? 'Редактировать триггерную точку' : 'Новая триггерная точка'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label="Основное" />
              <Tab label="Локализация и симптомы" />
              <Tab label="Техника" />
              <Tab label="Противопоказания" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Название точки (RU)"
                value={formData.name.ru}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...formData.name, ru: e.target.value } })
                }
                fullWidth
                required
              />
              <TextField
                label="Название точки (RO)"
                value={formData.name.ro}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...formData.name, ro: e.target.value } })
                }
                fullWidth
                required
              />
              <TextField
                label="Название мышцы (на латыни)"
                value={formData.muscle}
                onChange={(e) => setFormData({ ...formData, muscle: e.target.value })}
                fullWidth
                required
                helperText="Например: Trapezius, Levator Scapulae"
              />
              <TextField
                select
                label="Категория"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
                fullWidth
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Сложность"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value as any })
                }
                fullWidth
              >
                <MenuItem value="beginner">Начальный / Începător</MenuItem>
                <MenuItem value="intermediate">Средний / Intermediar</MenuItem>
                <MenuItem value="advanced">Продвинутый / Avansat</MenuItem>
              </TextField>
              <TextField
                label="Порядок сортировки"
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
                label="Локализация (RU)"
                value={formData.location.ru}
                onChange={(e) =>
                  setFormData({ ...formData, location: { ...formData.location, ru: e.target.value } })
                }
                multiline
                rows={4}
                fullWidth
                helperText="Опишите, где находится триггерная точка"
              />
              <TextField
                label="Локализация (RO)"
                value={formData.location.ro}
                onChange={(e) =>
                  setFormData({ ...formData, location: { ...formData.location, ro: e.target.value } })
                }
                multiline
                rows={4}
                fullWidth
              />
              <TextField
                label="Симптомы (RU)"
                value={formData.symptoms.ru}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: { ...formData.symptoms, ru: e.target.value } })
                }
                multiline
                rows={4}
                fullWidth
                helperText="Опишите симптомы, которые вызывает эта точка"
              />
              <TextField
                label="Симптомы (RO)"
                value={formData.symptoms.ro}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: { ...formData.symptoms, ro: e.target.value } })
                }
                multiline
                rows={4}
                fullWidth
              />
              <TextField
                label="Паттерн иррадиации боли (RU)"
                value={formData.referralPattern.ru}
                onChange={(e) =>
                  setFormData({ ...formData, referralPattern: { ...formData.referralPattern, ru: e.target.value } })
                }
                multiline
                rows={4}
                fullWidth
                helperText="Куда отдает боль от этой точки"
              />
              <TextField
                label="Паттерн иррадиации боли (RO)"
                value={formData.referralPattern.ro}
                onChange={(e) =>
                  setFormData({ ...formData, referralPattern: { ...formData.referralPattern, ro: e.target.value } })
                }
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Поддерживается Markdown форматирование (списки, выделение и т.д.)
              </Alert>
              <TextField
                label="Техника массажа (RU) - Markdown"
                value={formData.technique.ru}
                onChange={(e) =>
                  setFormData({ ...formData, technique: { ...formData.technique, ru: e.target.value } })
                }
                multiline
                rows={15}
                fullWidth
                helperText="Подробное описание техники работы с точкой"
              />
              <TextField
                label="Техника массажа (RO) - Markdown"
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

          <TabPanel value={activeTab} index={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Противопоказания (RU)"
                value={formData.contraindications.ru}
                onChange={(e) =>
                  setFormData({ ...formData, contraindications: { ...formData.contraindications, ru: e.target.value } })
                }
                multiline
                rows={8}
                fullWidth
                helperText="Опишите противопоказания (необязательно)"
              />
              <TextField
                label="Противопоказания (RO)"
                value={formData.contraindications.ro}
                onChange={(e) =>
                  setFormData({ ...formData, contraindications: { ...formData.contraindications, ro: e.target.value } })
                }
                multiline
                rows={8}
                fullWidth
              />
            </Box>
          </TabPanel>
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

export default TriggerPointsManager
