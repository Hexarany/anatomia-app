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
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { MassageProtocol } from '@/types'
import {
  getMassageProtocols,
  createMassageProtocol,
  updateMassageProtocol,
  deleteMassageProtocol,
} from '@/services/api'

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Порядок</TableCell>
              <TableCell>Название (RU)</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Длительность</TableCell>
              <TableCell>Сложность</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {protocols.map((protocol) => (
              <TableRow key={protocol._id}>
                <TableCell>{protocol.order}</TableCell>
                <TableCell>{protocol.name.ru}</TableCell>
                <TableCell>{protocol.type}</TableCell>
                <TableCell>{protocol.duration} мин</TableCell>
                <TableCell>{protocol.difficulty}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(protocol)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(protocol._id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingProtocol ? 'Редактировать протокол' : 'Новый протокол'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label="Основное" />
              <Tab label="Описание" />
              <Tab label="Польза" />
              <Tab label="Противопоказания" />
              <Tab label="Техника" />
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

export default MassageProtocolsManager
