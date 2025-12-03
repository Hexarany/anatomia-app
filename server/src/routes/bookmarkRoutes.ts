import express from 'express'
import {
  getUserBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  checkBookmark,
  getUserFolders,
  createFolder,
  updateFolder,
  deleteFolder,
} from '../controllers/bookmarkController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Все роуты требуют аутентификации
router.use(authenticateToken)

// Закладки
router.get('/bookmarks', getUserBookmarks)
router.post('/bookmarks', addBookmark)
router.put('/bookmarks/:bookmarkId', updateBookmark)
router.delete('/bookmarks/:bookmarkId', deleteBookmark)
router.get('/bookmarks/check', checkBookmark)

// Папки
router.get('/folders', getUserFolders)
router.post('/folders', createFolder)
router.put('/folders/:folderId', updateFolder)
router.delete('/folders/:folderId', deleteFolder)

export default router
