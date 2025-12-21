import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addStudentToGroup,
  removeStudentFromGroup,
  getUsersByRole
} from '@/services/api'
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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  SelectChangeEvent,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import PeopleIcon from '@mui/icons-material/People'
import type { Group, CreateGroupDto, UserBasic } from '@/types'

const GroupsManager = () => {
  const { token, user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [teachers, setTeachers] = useState<UserBasic[]>([])
  const [students, setStudents] = useState<UserBasic[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openStudentsDialog, setOpenStudentsDialog] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [managingGroup, setManagingGroup] = useState<Group | null>(null)
  const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState<string[]>([])
  const [formData, setFormData] = useState<CreateGroupDto>({
    name: { ru: '', ro: '' },
    description: { ru: '', ro: '' },
    teacher: '',
    students: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!token) return

    try {
      const [groupsData, teachersData, studentsData] = await Promise.all([
        getAllGroups(token),
        getUsersByRole('teacher', token),
        getUsersByRole('student', token)
      ])

      setGroups(groupsData)
      setTeachers(teachersData)
      setStudents(studentsData)
    } catch (error) {
      console.error('Error loading data:', error)
      showSnackbar('Ошибка загрузки данных', 'error')
    }
  }

  const handleOpenDialog = (group?: Group) => {
    if (group) {
      setEditingGroup(group)
      setFormData({
        name: group.name,
        description: group.description,
        teacher: typeof group.teacher === 'object' ? group.teacher._id : group.teacher,
        students: group.students.map(s => s._id),
        startDate: new Date(group.startDate).toISOString().split('T')[0],
        endDate: group.endDate ? new Date(group.endDate).toISOString().split('T')[0] : '',
        isActive: group.isActive,
      })
    } else {
      setEditingGroup(null)
      setFormData({
        name: { ru: '', ro: '' },
        description: { ru: '', ro: '' },
        teacher: '',
        students: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingGroup(null)
  }

  const handleOpenStudentsDialog = (group: Group) => {
    setManagingGroup(group)
    setSelectedStudentsToAdd([])
    setOpenStudentsDialog(true)
  }

  const handleCloseStudentsDialog = () => {
    setOpenStudentsDialog(false)
    setManagingGroup(null)
    setSelectedStudentsToAdd([])
  }

  const handleSave = async () => {
    if (!token) return

    // Validation
    if (!formData.name.ru || !formData.name.ro) {
      showSnackbar('Пожалуйста, заполните название на обоих языках', 'error')
      return
    }

    if (!formData.teacher) {
      showSnackbar('Пожалуйста, выберите преподавателя', 'error')
      return
    }

    if (!formData.startDate) {
      showSnackbar('Пожалуйста, укажите дату начала', 'error')
      return
    }

    try {
      if (editingGroup) {
        await updateGroup(editingGroup._id, formData, token)
        showSnackbar('Группа обновлена', 'success')
      } else {
        await createGroup(formData, token)
        showSnackbar('Группа создана', 'success')
      }
      loadData()
      handleCloseDialog()
    } catch (error: any) {
      console.error('Error saving group:', error)
      const errorMessage = error?.response?.data?.error?.message || 'Ошибка сохранения группы'
      showSnackbar(errorMessage, 'error')
    }
  }

  const handleDelete = async (id: string, groupName: string) => {
    if (!token || !confirm(`Вы уверены, что хотите удалить группу "${groupName}"?`)) return

    try {
      await deleteGroup(id, token)
      showSnackbar('Группа удалена', 'success')
      loadData()
    } catch (error: any) {
      console.error('Error deleting group:', error)
      const errorMessage = error?.response?.data?.error?.message || 'Ошибка удаления группы'
      showSnackbar(errorMessage, 'error')
    }
  }

  const handleAddStudents = async () => {
    if (!token || !managingGroup || selectedStudentsToAdd.length === 0) return

    try {
      for (const studentId of selectedStudentsToAdd) {
        await addStudentToGroup(managingGroup._id, studentId, token)
      }
      showSnackbar(`Добавлено студентов: ${selectedStudentsToAdd.length}`, 'success')
      loadData()
      handleCloseStudentsDialog()
    } catch (error: any) {
      console.error('Error adding students:', error)
      const errorMessage = error?.response?.data?.error?.message || 'Ошибка при добавлении студентов'
      showSnackbar(errorMessage, 'error')
    }
  }

  const handleRemoveStudent = async (groupId: string, studentId: string, studentName: string) => {
    if (!token || !confirm(`Удалить студента ${studentName} из группы?`)) return

    try {
      await removeStudentFromGroup(groupId, studentId, token)
      showSnackbar('Студент удален из группы', 'success')
      loadData()

      // Обновляем managingGroup если диалог открыт
      if (managingGroup && managingGroup._id === groupId) {
        const updatedGroup = groups.find(g => g._id === groupId)
        if (updatedGroup) {
          setManagingGroup(updatedGroup)
        }
      }
    } catch (error: any) {
      console.error('Error removing student:', error)
      const errorMessage = error?.response?.data?.error?.message || 'Ошибка при удалении студента'
      showSnackbar(errorMessage, 'error')
    }
  }

  const handleStudentSelectChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setSelectedStudentsToAdd(typeof value === 'string' ? value.split(',') : value)
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const getTeacherName = (teacher: UserBasic | undefined | null) => {
    if (!teacher) return 'Не указан'
    if (teacher.name) return teacher.name
    return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.email || 'Неизвестно'
  }

  const getStudentName = (student: UserBasic | undefined | null) => {
    if (!student) return 'Неизвестно'
    if (student.name) return student.name
    return `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'Неизвестно'
  }

  const getAvailableStudents = () => {
    if (!managingGroup) return students

    const currentStudentIds = managingGroup.students.map(s => s._id)
    return students.filter(s => !currentStudentIds.includes(s._id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Управление группами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Создать группу
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Название (RU)</TableCell>
              <TableCell>Название (RO)</TableCell>
              <TableCell>Преподаватель</TableCell>
              <TableCell>Студентов</TableCell>
              <TableCell>Дата начала</TableCell>
              <TableCell>Дата окончания</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Нет групп
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => (
                <TableRow key={group._id}>
                  <TableCell>{group.name.ru}</TableCell>
                  <TableCell>{group.name.ro}</TableCell>
                  <TableCell>{getTeacherName(group.teacher)}</TableCell>
                  <TableCell>{group.students.length}</TableCell>
                  <TableCell>{formatDate(group.startDate)}</TableCell>
                  <TableCell>{group.endDate ? formatDate(group.endDate) : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={group.isActive ? 'Активна' : 'Неактивна'}
                      color={group.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenStudentsDialog(group)}
                      title="Управление студентами"
                    >
                      <PeopleIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(group)}
                      title="Редактировать"
                    >
                      <EditIcon />
                    </IconButton>
                    {isAdmin && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(group._id, group.name.ru)}
                        title="Удалить"
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog для создания/редактирования группы */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingGroup ? 'Редактировать группу' : 'Создать группу'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Название (RU)"
              value={formData.name.ru}
              onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ru: e.target.value } })}
              fullWidth
              required
            />
            <TextField
              label="Название (RO)"
              value={formData.name.ro}
              onChange={(e) => setFormData({ ...formData, name: { ...formData.name, ro: e.target.value } })}
              fullWidth
              required
            />
            <TextField
              label="Описание (RU)"
              value={formData.description?.ru || ''}
              onChange={(e) => setFormData({
                ...formData,
                description: {
                  ru: e.target.value,
                  ro: formData.description?.ro || ''
                }
              })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Описание (RO)"
              value={formData.description?.ro || ''}
              onChange={(e) => setFormData({
                ...formData,
                description: {
                  ru: formData.description?.ru || '',
                  ro: e.target.value
                }
              })}
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth required>
              <InputLabel>Преподаватель</InputLabel>
              <Select
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                label="Преподаватель"
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>
                    {getTeacherName(teacher)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Дата начала"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Дата окончания (опционально)"
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Группа активна"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            {editingGroup ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog для управления студентами */}
      <Dialog open={openStudentsDialog} onClose={handleCloseStudentsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Управление студентами: {managingGroup?.name.ru}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Текущие студенты ({managingGroup?.students.length || 0})
            </Typography>
            {managingGroup && managingGroup.students.length > 0 ? (
              <List>
                {managingGroup.students.map((student) => (
                  <ListItem key={student._id}>
                    <ListItemText
                      primary={getStudentName(student)}
                      secondary={student.email}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveStudent(managingGroup._id, student._id, getStudentName(student))}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                В группе пока нет студентов
              </Typography>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Добавить студентов
            </Typography>
            {getAvailableStudents().length > 0 ? (
              <FormControl fullWidth>
                <InputLabel>Выберите студентов</InputLabel>
                <Select
                  multiple
                  value={selectedStudentsToAdd}
                  onChange={handleStudentSelectChange}
                  label="Выберите студентов"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const student = students.find(s => s._id === value)
                        return student ? (
                          <Chip key={value} label={getStudentName(student)} size="small" />
                        ) : null
                      })}
                    </Box>
                  )}
                >
                  {getAvailableStudents().map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {getStudentName(student)} ({student.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography color="text.secondary">
                Все студенты уже добавлены в группу
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStudentsDialog}>Закрыть</Button>
          {selectedStudentsToAdd.length > 0 && (
            <Button onClick={handleAddStudents} variant="contained">
              Добавить ({selectedStudentsToAdd.length})
            </Button>
          )}
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

export default GroupsManager
