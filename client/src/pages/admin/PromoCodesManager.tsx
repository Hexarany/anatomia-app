import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Button,
  Typography,
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
  Select,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import BarChartIcon from '@mui/icons-material/BarChart'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000')

interface PromoCode {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses: number
  currentUses: number
  validFrom: string
  validUntil: string
  isActive: boolean
  applicableTo: {
    tiers?: string[]
    userGroups?: string[]
  }
  metadata?: {
    description?: string
    campaign?: string
  }
}

const PromoCodesManager = () => {
  const { token } = useAuth()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    maxUses: 100,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    campaign: '',
    tiers: [] as string[],
  })

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const fetchPromoCodes = async () => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/promo-codes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch promo codes')

      const data = await response.json()
      setPromoCodes(data)
    } catch (error) {
      console.error('Error fetching promo codes:', error)
      showSnackbar('Ошибка при загрузке промокодов', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromoCodes()
  }, [token])

  const handleOpenDialog = (code?: PromoCode) => {
    if (code) {
      setEditingCode(code)
      setFormData({
        code: code.code,
        discountType: code.discountType,
        discountValue: code.discountValue,
        maxUses: code.maxUses,
        validFrom: new Date(code.validFrom).toISOString().split('T')[0],
        validUntil: new Date(code.validUntil).toISOString().split('T')[0],
        description: code.metadata?.description || '',
        campaign: code.metadata?.campaign || '',
        tiers: code.applicableTo?.tiers || [],
      })
    } else {
      setEditingCode(null)
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        maxUses: 100,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '',
        campaign: '',
        tiers: [],
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCode(null)
  }

  const handleSubmit = async () => {
    if (!token) return

    try {
      const payload = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        maxUses: formData.maxUses,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        applicableTo: {
          tiers: formData.tiers,
        },
        metadata: {
          description: formData.description,
          campaign: formData.campaign,
        },
      }

      const url = editingCode
        ? `${API_URL}/api/promo-codes/${editingCode._id}`
        : `${API_URL}/api/promo-codes`

      const method = editingCode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to save promo code')
      }

      showSnackbar(
        editingCode ? 'Промокод успешно обновлен' : 'Промокод успешно создан',
        'success'
      )
      handleCloseDialog()
      fetchPromoCodes()
    } catch (error: any) {
      console.error('Error saving promo code:', error)
      showSnackbar(error.message || 'Ошибка при сохранении промокода', 'error')
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Вы уверены, что хотите удалить промокод ${code}?`)) return
    if (!token) return

    try {
      const response = await fetch(`${API_URL}/api/promo-codes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to delete promo code')

      showSnackbar('Промокод успешно удален', 'success')
      fetchPromoCodes()
    } catch (error) {
      console.error('Error deleting promo code:', error)
      showSnackbar('Ошибка при удалении промокода', 'error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  const usagePercentage = (current: number, max: number) => {
    return ((current / max) * 100).toFixed(1)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Управление промокодами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Создать промокод
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Всего промокодов
              </Typography>
              <Typography variant="h3">{promoCodes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Активных
              </Typography>
              <Typography variant="h3" color="success.main">
                {promoCodes.filter((p) => p.isActive && !isExpired(p.validUntil)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Использовано
              </Typography>
              <Typography variant="h3" color="primary.main">
                {promoCodes.reduce((sum, p) => sum + p.currentUses, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
              <TableCell>Код</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Скидка</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Использование</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Действителен до</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Загрузка...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : promoCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Нет промокодов
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              promoCodes.map((code) => (
                <TableRow key={code._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {code.code}
                      </Typography>
                      {code.metadata?.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          {code.metadata.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {code.discountType === 'percentage'
                      ? `${code.discountValue}%`
                      : `$${code.discountValue}`}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {code.currentUses} / {code.maxUses}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        {usagePercentage(code.currentUses, code.maxUses)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{formatDate(code.validUntil)}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        !code.isActive
                          ? 'Неактивен'
                          : isExpired(code.validUntil)
                          ? 'Истек'
                          : code.currentUses >= code.maxUses
                          ? 'Исчерпан'
                          : 'Активен'
                      }
                      color={
                        code.isActive && !isExpired(code.validUntil) && code.currentUses < code.maxUses
                          ? 'success'
                          : 'default'
                      }
                      size="small"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 },
                        '& .MuiChip-label': { px: { xs: 0.5, sm: 1 } }
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenDialog(code)}
                      size="small"
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(code._id, code.code)}
                      size="small"
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCode ? 'Редактировать промокод' : 'Создать промокод'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Код промокода"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              fullWidth
              required
              helperText="Будет автоматически переведен в верхний регистр"
            />

            <FormControl fullWidth>
              <InputLabel>Тип скидки</InputLabel>
              <Select
                value={formData.discountType}
                label="Тип скидки"
                onChange={(e) =>
                  setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })
                }
              >
                <MenuItem value="percentage">Процент</MenuItem>
                <MenuItem value="fixed">Фиксированная сумма</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={formData.discountType === 'percentage' ? 'Процент скидки' : 'Сумма скидки'}
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              fullWidth
              required
              inputProps={{
                min: 0,
                max: formData.discountType === 'percentage' ? 100 : undefined,
              }}
            />

            <TextField
              label="Максимальное количество использований"
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Действителен с"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Действителен до"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              label="Кампания"
              value={formData.campaign}
              onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
              fullWidth
              helperText="Название маркетинговой кампании"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCode ? 'Сохранить' : 'Создать'}
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

export default PromoCodesManager
