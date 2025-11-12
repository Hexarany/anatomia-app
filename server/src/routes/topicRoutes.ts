import express from 'express'
import {
  getAllTopics,
  getTopicById,
  getTopicsByCategory,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../controllers/topicController'

const router = express.Router()

router.get('/', getAllTopics)
router.get('/:id', getTopicById)
router.get('/category/:categoryId', getTopicsByCategory)
router.post('/', createTopic)
router.put('/:id', updateTopic)
router.delete('/:id', deleteTopic)

export default router
