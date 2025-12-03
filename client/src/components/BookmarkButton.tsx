import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import { addBookmark, deleteBookmark, checkBookmark, getUserFolders, type BookmarkFolder } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface BookmarkButtonProps {
  contentType: 'topic' | 'protocol' | 'trigger_point' | 'hygiene' | 'model_3d' | 'quiz'
  contentId: string
  size?: 'small' | 'medium' | 'large'
}

const BookmarkButton = ({ contentType, contentId, size = 'medium' }: BookmarkButtonProps) => {
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'ro'
  const { isAuthenticated } = useAuth()

  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [folders, setFolders] = useState<BookmarkFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      checkBookmarkStatus()
    }
  }, [contentType, contentId, isAuthenticated])

  const checkBookmarkStatus = async () => {
    try {
      const result = await checkBookmark(contentType, contentId)
      setIsBookmarked(result.isBookmarked)
      if (result.bookmark) {
        setBookmarkId(result.bookmark._id)
      }
    } catch (error) {
      console.error('Error checking bookmark:', error)
    }
  }

  const loadFolders = async () => {
    try {
      const foldersData = await getUserFolders()
      setFolders(foldersData)
    } catch (error) {
      console.error('Error loading folders:', error)
    }
  }

  const handleClick = () => {
    if (!isAuthenticated) {
      return
    }

    if (isBookmarked) {
      handleRemove()
    } else {
      loadFolders()
      setDialogOpen(true)
    }
  }

  const handleAdd = async () => {
    try {
      setLoading(true)
      const bookmark = await addBookmark(contentType, contentId, selectedFolder || undefined, notes || undefined)
      setIsBookmarked(true)
      setBookmarkId(bookmark._id)
      setDialogOpen(false)
      setSelectedFolder('')
      setNotes('')
    } catch (error) {
      console.error('Error adding bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!bookmarkId) return

    try {
      setLoading(true)
      await deleteBookmark(bookmarkId)
      setIsBookmarked(false)
      setBookmarkId(null)
    } catch (error) {
      console.error('Error removing bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setDialogOpen(false)
    setSelectedFolder('')
    setNotes('')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Tooltip title={isBookmarked ? (lang === 'ru' ? 'Убрать из избранного' : 'Elimină din favorite') : (lang === 'ru' ? 'Добавить в избранное' : 'Adaugă la favorite')}>
        <IconButton onClick={handleClick} size={size} disabled={loading} color={isBookmarked ? 'primary' : 'default'}>
          {loading ? <CircularProgress size={20} /> : isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      </Tooltip>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{lang === 'ru' ? 'Добавить в избранное' : 'Adaugă la favorite'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>{lang === 'ru' ? 'Папка' : 'Dosar'}</InputLabel>
            <Select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)} label={lang === 'ru' ? 'Папка' : 'Dosar'}>
              <MenuItem value="">{lang === 'ru' ? 'Без папки' : 'Fără dosar'}</MenuItem>
              {folders.map((folder) => (
                <MenuItem key={folder._id} value={folder._id}>
                  {folder.name[lang]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label={lang === 'ru' ? 'Заметки (необязательно)' : 'Notițe (opțional)'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={lang === 'ru' ? 'Добавьте заметки к этой закладке...' : 'Adăugați notițe la acest semn de carte...'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{lang === 'ru' ? 'Отмена' : 'Anulează'}</Button>
          <Button onClick={handleAdd} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : lang === 'ru' ? 'Добавить' : 'Adaugă'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BookmarkButton
