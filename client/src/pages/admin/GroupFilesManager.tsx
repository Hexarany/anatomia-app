import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getAllGroups,
  getMediaList,
  sendFileToGroup,
  getGroupFiles,
  retryFailedDeliveries,
  deleteGroupFile,
  getGroupDeliveryStats,
} from '@/services/api'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  SelectChangeEvent,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import RefreshIcon from '@mui/icons-material/Refresh'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import type { Group } from '@/types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const GroupFilesManager = () => {
  const { token, user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [groups, setGroups] = useState<Group[]>([])
  const [mediaList, setMediaList] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedMedia, setSelectedMedia] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [groupFiles, setGroupFiles] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [detailsDialog, setDetailsDialog] = useState<any>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      loadGroupFiles()
      loadStats()
    }
  }, [selectedGroup])

  const loadData = async () => {
    if (!token) return

    try {
      const [groupsData, mediaData] = await Promise.all([
        getAllGroups(token),
        getMediaList(token),
      ])
      setGroups(groupsData)
      setMediaList(mediaData)
    } catch (error) {
      console.error('Error loading data:', error)
      showSnackbar('Ошибка загрузки данных', 'error')
    }
  }

  const loadGroupFiles = async () => {
    if (!token || !selectedGroup) return

    try {
      const files = await getGroupFiles(selectedGroup, token)
      setGroupFiles(files)
    } catch (error) {
      console.error('Error loading group files:', error)
      showSnackbar('Ошибка загрузки файлов группы', 'error')
    }
  }

  const loadStats = async () => {
    if (!token || !selectedGroup) return

    try {
      const statsData = await getGroupDeliveryStats(selectedGroup, token)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSendFile = async () => {
    if (!token || !selectedGroup || !selectedMedia) {
      showSnackbar('Выберите группу и файл', 'error')
      return
    }

    setLoading(true)
    try {
      const result = await sendFileToGroup(
        selectedGroup,
        selectedMedia,
        title,
        description,
        token
      )

      showSnackbar(result.message || 'Файл отправлен!', 'success')
      setTitle('')
      setDescription('')
      setSelectedMedia('')
      loadGroupFiles()
      loadStats()
    } catch (error: any) {
      console.error('Error sending file:', error)
      showSnackbar(
        error.response?.data?.error?.message || 'Ошибка отправки файла',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async (fileId: string) => {
    if (!token) return

    setLoading(true)
    try {
      const result = await retryFailedDeliveries(fileId, token)
      showSnackbar(result.message || 'Повторная отправка выполнена', 'success')
      loadGroupFiles()
      loadStats()
    } catch (error: any) {
      console.error('Error retrying:', error)
      showSnackbar('Ошибка повторной отправки', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!token || !confirm('Удалить запись о файле?')) return

    setLoading(true)
    try {
      await deleteGroupFile(fileId, token)
      showSnackbar('Файл удален', 'success')
      loadGroupFiles()
      loadStats()
    } catch (error: any) {
      console.error('Error deleting:', error)
      showSnackbar('Ошибка удаления', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (file: any) => {
    setDetailsDialog(file)
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const selectedMediaData = mediaList.find((m) => m._id === selectedMedia)
  const selectedGroupData = groups.find((g) => g._id === selectedGroup)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Отправка файлов группам
      </Typography>

      <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} sx={{ mb: 3 }}>
        <Tab label="Отправить файл" />
        <Tab label="История отправлений" />
        <Tab label="Статистика" />
      </Tabs>

      {/* Выбор группы для всех вкладок */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Группа</InputLabel>
        <Select
          value={selectedGroup}
          onChange={(e: SelectChangeEvent) => setSelectedGroup(e.target.value)}
          label="Группа"
        >
          <MenuItem value="">
            <em>Выберите группу</em>
          </MenuItem>
          {groups.map((group) => (
            <MenuItem key={group._id} value={group._id}>
              {group.name.ru} ({(group.students as any[]).length} студентов)
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Вкладка 1: Отправить файл */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Выберите файл
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Файл</InputLabel>
                  <Select
                    value={selectedMedia}
                    onChange={(e: SelectChangeEvent) => setSelectedMedia(e.target.value)}
                    label="Файл"
                  >
                    <MenuItem value="">
                      <em>Выберите файл</em>
                    </MenuItem>
                    {mediaList.map((media) => (
                      <MenuItem key={media._id} value={media._id}>
                        {media.originalName} ({(media.size / 1024 / 1024).toFixed(2)} MB)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Название (опционально)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Описание (опционально)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SendIcon />}
                  onClick={handleSendFile}
                  disabled={loading || !selectedGroup || !selectedMedia}
                >
                  Отправить файл студентам
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Предпросмотр
                </Typography>

                {selectedGroupData && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Группа: <strong>{selectedGroupData.name.ru}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Студентов: <strong>{(selectedGroupData.students as any[]).length}</strong>
                    </Typography>
                  </Box>
                )}

                {selectedMediaData && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Файл: <strong>{selectedMediaData.originalName}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Размер: <strong>{(selectedMediaData.size / 1024 / 1024).toFixed(2)} MB</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Тип: <strong>{selectedMediaData.mimetype}</strong>
                    </Typography>
                  </Box>
                )}

                {!selectedGroup && (
                  <Alert severity="info">Выберите группу для отправки</Alert>
                )}
                {selectedGroup && !selectedMedia && (
                  <Alert severity="info">Выберите файл для отправки</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Вкладка 2: История */}
      <TabPanel value={tabValue} index={1}>
        {!selectedGroup && (
          <Alert severity="info">Выберите группу для просмотра истории</Alert>
        )}
        {selectedGroup && (
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
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Файл</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Дата</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Доставлено</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupFiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Файлов пока нет
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {groupFiles.map((file) => {
                  const delivered = file.deliveryStatus.filter(
                    (d: any) => d.delivered
                  ).length
                  const total = file.deliveryStatus.length
                  const failedCount = total - delivered

                  return (
                    <TableRow key={file._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{file.media?.originalName}</TableCell>
                      <TableCell>{file.title || '-'}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {new Date(file.createdAt).toLocaleString('ru-RU')}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Students: {delivered}/{total}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Group: {file.sentToTelegramGroup ? 'sent' : 'not sent'}
                          </Typography>
                          {failedCount > 0 && (
                            <Chip
                              label={`${failedCount} student errors`}
                              color={file.sentToTelegramGroup ? 'warning' : 'error'}
                              size="small"
                              sx={{
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                height: { xs: 20, sm: 24 },
                                '& .MuiChip-label': { px: { xs: 0.5, sm: 1 } }
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleViewDetails(file)}
                          size="small"
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <VisibilityIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                        {failedCount > 0 && (
                          <IconButton
                            onClick={() => handleRetry(file._id)}
                            size="small"
                            color="primary"
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            <RefreshIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                          </IconButton>
                        )}
                        <IconButton
                          onClick={() => handleDelete(file._id)}
                          size="small"
                          color="error"
                          sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                          <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Вкладка 3: Статистика */}
      <TabPanel value={tabValue} index={2}>
        {!selectedGroup && (
          <Alert severity="info">Выберите группу для просмотра статистики</Alert>
        )}
        {selectedGroup && stats && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{stats.totalFiles}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего файлов
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {stats.successfulDeliveries}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Успешных доставок
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="error.main">
                    {stats.failedDeliveries}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Неудачных доставок
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {stats.totalDeliveries > 0
                      ? Math.round(
                          (stats.successfulDeliveries / stats.totalDeliveries) * 100
                        )
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Успешность
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Диалог деталей */}
      <Dialog
        open={!!detailsDialog}
        onClose={() => setDetailsDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {detailsDialog && (
          <>
            <DialogTitle>
              Детали файла: {detailsDialog.media?.originalName}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Название:</strong> {detailsDialog.title || 'Не указано'}
                </Typography>
                <Typography variant="body2">
                  <strong>Описание:</strong>{' '}
                  {detailsDialog.description || 'Не указано'}
                </Typography>
                <Typography variant="body2">
                  <strong>Group delivery:</strong> {detailsDialog.sentToTelegramGroup ? 'sent' : 'not sent'}
                </Typography>
                <Typography variant="body2">
                  <strong>Дата отправки:</strong>{' '}
                  {new Date(detailsDialog.createdAt).toLocaleString('ru-RU')}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Статусы доставки:
              </Typography>
              <List>
                {detailsDialog.deliveryStatus.map((delivery: any, idx: number) => {
                  const studentName = [delivery.student?.firstName, delivery.student?.lastName]
                    .filter(Boolean)
                    .join(' ')
                  const displayName = studentName || delivery.student?.email || 'Unknown user'
                  return (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={displayName}
                        secondary={
                          delivery.delivered
                            ? `Доставлено ${new Date(
                              delivery.deliveredAt
                            ).toLocaleString('ru-RU')}`
                            : delivery.error || 'Не доставлено'
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={delivery.delivered ? 'Доставлено' : 'Ошибка'}
                          color={delivery.delivered ? 'success' : 'error'}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  )
                })}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(null)}>Закрыть</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Loading */}
      {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} />}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default GroupFilesManager
