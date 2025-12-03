import { Request, Response } from 'express'
import Note from '../models/Note'

interface CustomRequest extends Request {
  userId?: string
}

// Получить все заметки пользователя
export const getUserNotes = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { contentType, contentId, isImportant, tag } = req.query

    const filter: any = { userId }
    if (contentType) filter.contentType = contentType
    if (contentId) filter.contentId = contentId
    if (isImportant === 'true') filter.isImportant = true
    if (tag) filter.tags = tag

    const notes = await Note.find(filter).sort({ isImportant: -1, updatedAt: -1 }).lean()

    res.json(notes)
  } catch (error) {
    console.error('Get notes error:', error)
    res.status(500).json({ message: 'Failed to get notes' })
  }
}

// Получить заметку по ID
export const getNoteById = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { noteId } = req.params

    const note = await Note.findOne({ _id: noteId, userId })

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json(note)
  } catch (error) {
    console.error('Get note error:', error)
    res.status(500).json({ message: 'Failed to get note' })
  }
}

// Создать заметку
export const createNote = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { contentType, contentId, title, content, isImportant, tags, color } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' })
    }

    const note = await Note.create({
      userId,
      contentType: contentType || 'general',
      contentId: contentId || undefined,
      title,
      content,
      isImportant: isImportant || false,
      tags: tags || [],
      color: color || '#fff9c4',
    })

    res.status(201).json(note)
  } catch (error) {
    console.error('Create note error:', error)
    res.status(500).json({ message: 'Failed to create note' })
  }
}

// Обновить заметку
export const updateNote = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { noteId } = req.params
    const { title, content, isImportant, tags, color } = req.body

    const note = await Note.findOne({ _id: noteId, userId })

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    if (title !== undefined) note.title = title
    if (content !== undefined) note.content = content
    if (isImportant !== undefined) note.isImportant = isImportant
    if (tags !== undefined) note.tags = tags
    if (color !== undefined) note.color = color

    await note.save()

    res.json(note)
  } catch (error) {
    console.error('Update note error:', error)
    res.status(500).json({ message: 'Failed to update note' })
  }
}

// Удалить заметку
export const deleteNote = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { noteId } = req.params

    const note = await Note.findOneAndDelete({ _id: noteId, userId })

    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    res.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Delete note error:', error)
    res.status(500).json({ message: 'Failed to delete note' })
  }
}

// Получить все теги пользователя
export const getUserTags = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId

    const tags = await Note.aggregate([
      { $match: { userId: new (require('mongoose').Types.ObjectId)(userId) } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
    ])

    res.json(tags)
  } catch (error) {
    console.error('Get tags error:', error)
    res.status(500).json({ message: 'Failed to get tags' })
  }
}
