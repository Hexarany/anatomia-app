import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import DescriptionIcon from '@mui/icons-material/Description'
import axios from 'axios'

interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

interface PreviewData {
  totalRows: number
  columns: string[]
  preview: any[]
}

const DataImportPage = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'

  const [tab, setTab] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const importTypes = [
    { value: 'topics', label: lang === 'ru' ? 'Темы' : 'Teme', endpoint: '/api/import/topics/csv' },
    { value: 'quizzes', label: lang === 'ru' ? 'Тесты' : 'Teste', endpoint: '/api/import/quizzes/csv' },
    { value: 'protocols', label: lang === 'ru' ? 'Протоколы массажа' : 'Protocoale de masaj', endpoint: '/api/import/protocols/csv' },
    { value: 'triggerPoints', label: lang === 'ru' ? 'Триггерные точки' : 'Puncte Trigger', endpoint: '/api/import/trigger-points/csv' },
  ]

  const currentType = importTypes[tab]

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)
    setError(null)
    setPreview(null)

    // Preview CSV
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const token = localStorage.getItem('token')
      const response = await axios.post('/api/import/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })

      setPreview(response.data)
    } catch (err: any) {
      console.error('Error previewing file:', err)
      setError(err.response?.data?.message || 'Failed to preview file')
    }
  }

  const handleImport = async () => {
    if (!file) return

    try {
      setUploading(true)
      setError(null)
      setResult(null)

      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await axios.post(currentType.endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })

      setResult(response.data)
      if (response.data.imported > 0) {
        setFile(null)
        setPreview(null)
      }
    } catch (err: any) {
      console.error('Error importing:', err)
      setError(err.response?.data?.message || 'Failed to import data')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadTemplate = (type: string) => {
    let template = ''
    let filename = ''

    switch (type) {
      case 'topics':
        template = 'categoryId,slug,title_ru,title_ro,description_ru,description_ro,content_ru,content_ro\n'
        template += '123abc,anatomiya-skeleta,Анатомия скелета,Anatomia scheletului,Описание...,Descriere...,Контент...,Conținut...'
        filename = 'topics_template.csv'
        break
      case 'quizzes':
        template = 'quiz_slug,quiz_title_ru,quiz_title_ro,quiz_description_ru,quiz_description_ro,question_ru,question_ro,option1_ru,option1_ro,option2_ru,option2_ro,option3_ru,option3_ro,option4_ru,option4_ro,correct_answer\n'
        template += 'test-skeleta,Тест по скелету,Test despre schelet,Описание,Descriere,Вопрос 1?,Întrebarea 1?,Ответ 1,Răspuns 1,Ответ 2,Răspuns 2,Ответ 3,Răspuns 3,Ответ 4,Răspuns 4,0'
        filename = 'quizzes_template.csv'
        break
      case 'protocols':
        template = 'slug,title_ru,title_ro,description_ru,description_ro,duration,difficulty,category\n'
        template += 'massage-back,Массаж спины,Masaj spate,Описание...,Descriere...,60,intermediate,therapeutic'
        filename = 'protocols_template.csv'
        break
      case 'triggerPoints':
        template = 'slug,name_ru,name_ro,muscle_ru,muscle_ro,location_ru,location_ro,symptoms_ru,symptoms_ro,treatment_ru,treatment_ro\n'
        template += 'tp-trapezius,Трапеция,Trapez,Трапециевидная мышца,Mușchiul trapez,Верхняя часть спины,Partea superioară a spatelui,Боль в шее,Durere de gât,Массаж...,Masaj...'
        filename = 'trigger_points_template.csv'
        break
    }

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        <CloudUploadIcon sx={{ fontSize: 32, verticalAlign: 'middle', mr: 1 }} />
        {lang === 'ru' ? 'Импорт данных' : 'Import date'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {lang === 'ru'
          ? 'Массовая загрузка контента из CSV файлов'
          : 'Încărcare în masă a conținutului din fișiere CSV'}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {importTypes.map((type, index) => (
            <Tab key={type.value} label={type.label} />
          ))}
        </Tabs>

        <CardContent>
          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>{lang === 'ru' ? 'Инструкции:' : 'Instrucțiuni:'}</strong>
            </Typography>
            <Typography variant="body2" component="div">
              1. {lang === 'ru' ? 'Скачайте шаблон CSV' : 'Descărcați șablonul CSV'}<br />
              2. {lang === 'ru' ? 'Заполните данные в Excel/Google Sheets' : 'Completați datele în Excel/Google Sheets'}<br />
              3. {lang === 'ru' ? 'Сохраните как CSV (UTF-8)' : 'Salvați ca CSV (UTF-8)'}<br />
              4. {lang === 'ru' ? 'Загрузите файл для предпросмотра' : 'Încărcați fișierul pentru previzualizare'}<br />
              5. {lang === 'ru' ? 'Подтвердите импорт' : 'Confirmați importul'}
            </Typography>
          </Alert>

          {/* Download Template */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => handleDownloadTemplate(currentType.value)}
            >
              {lang === 'ru' ? 'Скачать шаблон CSV' : 'Descarcă șablon CSV'}
            </Button>
          </Box>

          {/* File Upload */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={uploading}
            >
              {lang === 'ru' ? 'Выбрать CSV файл' : 'Selectează fișier CSV'}
              <input
                type="file"
                hidden
                accept=".csv,text/csv"
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Chip
                label={file.name}
                onDelete={() => {
                  setFile(null)
                  setPreview(null)
                  setResult(null)
                }}
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          {/* Preview */}
          {preview && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {lang === 'ru' ? 'Предпросмотр' : 'Previzualizare'}
              </Typography>
              <Alert severity="success" sx={{ mb: 2 }}>
                {lang === 'ru' ? 'Найдено строк' : 'Rânduri găsite'}: <strong>{preview.totalRows}</strong><br />
                {lang === 'ru' ? 'Столбцов' : 'Coloane'}: <strong>{preview.columns.length}</strong>
              </Alert>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {preview.columns.map((col) => (
                        <TableCell key={col}><strong>{col}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.preview.map((row, idx) => (
                      <TableRow key={idx}>
                        {preview.columns.map((col) => (
                          <TableCell key={col}>{row[col]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {lang === 'ru' ? 'Показаны первые 5 строк' : 'Primele 5 rânduri afișate'}
              </Typography>
            </Box>
          )}

          {/* Import Button */}
          {preview && (
            <Button
              variant="contained"
              size="large"
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
              onClick={handleImport}
              disabled={uploading}
            >
              {uploading
                ? (lang === 'ru' ? 'Импорт...' : 'Import...')
                : (lang === 'ru' ? 'Начать импорт' : 'Începe importul')}
            </Button>
          )}

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {/* Result */}
          {result && (
            <Box sx={{ mt: 3 }}>
              <Alert
                severity={result.failed === 0 ? 'success' : 'warning'}
                icon={result.failed === 0 ? <CheckCircleIcon /> : <ErrorIcon />}
              >
                <Typography variant="body1" gutterBottom>
                  <strong>{lang === 'ru' ? 'Результат импорта:' : 'Rezultat import:'}</strong>
                </Typography>
                <Typography variant="body2">
                  ✅ {lang === 'ru' ? 'Успешно импортировано' : 'Importat cu succes'}: <strong>{result.imported}</strong><br />
                  {result.failed > 0 && (
                    <>❌ {lang === 'ru' ? 'Ошибок' : 'Erori'}: <strong>{result.failed}</strong></>
                  )}
                </Typography>
              </Alert>

              {result.errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>{lang === 'ru' ? 'Ошибки:' : 'Erori:'}</strong>
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>{lang === 'ru' ? 'Строка' : 'Rând'}</strong></TableCell>
                          <TableCell><strong>{lang === 'ru' ? 'Ошибка' : 'Eroare'}</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.errors.map((err, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{err.row}</TableCell>
                            <TableCell>{err.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

export default DataImportPage
