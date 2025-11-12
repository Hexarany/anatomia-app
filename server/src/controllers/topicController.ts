import { Request, Response } from 'express'
import Topic from '../models/Topic'

export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find().sort({ order: 1 }).populate('categoryId')
    res.json(topics)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch topics' } })
  }
}

export const getTopicById = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('categoryId')
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }
    res.json(topic)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch topic' } })
  }
}

export const getTopicsByCategory = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({ categoryId: req.params.categoryId })
      .sort({ order: 1 })
      .populate('categoryId')
    res.json(topics)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch topics' } })
  }
}

export const createTopic = async (req: Request, res: Response) => {
  try {
    const topic = new Topic(req.body)
    await topic.save()
    res.status(201).json(topic)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to create topic' } })
  }
}

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }
    res.json(topic)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to update topic' } })
  }
}

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id)
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }
    res.json({ message: 'Topic deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete topic' } })
  }
}
