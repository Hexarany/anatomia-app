import express from 'express'
import { getUserNotes, getNoteById, createNote, updateNote, deleteNote, getUserTags } from '../controllers/noteController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

router.use(authenticateToken)

router.get('/notes', getUserNotes)
router.get('/notes/tags', getUserTags)
router.get('/notes/:noteId', getNoteById)
router.post('/notes', createNote)
router.put('/notes/:noteId', updateNote)
router.delete('/notes/:noteId', deleteNote)

export default router
