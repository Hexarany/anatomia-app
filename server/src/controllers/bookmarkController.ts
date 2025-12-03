import { Request, Response } from 'express'
import Bookmark from '../models/Bookmark'
import BookmarkFolder from '../models/BookmarkFolder'
import Topic from '../models/Topic'
import MassageProtocol from '../models/MassageProtocol'
import TriggerPoint from '../models/TriggerPoint'
import HygieneGuideline from '../models/HygieneGuideline'
import AnatomyModel3D from '../models/AnatomyModel3D'
import Quiz from '../models/Quiz'

interface CustomRequest extends Request {
  userId?: string
}

// Получить все закладки пользователя
export const getUserBookmarks = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { folderId, contentType } = req.query

    const filter: any = { userId }
    if (folderId) filter.folderId = folderId === 'null' ? null : folderId
    if (contentType) filter.contentType = contentType

    const bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 }).lean()

    // Получаем детали контента для каждой закладки
    const bookmarksWithContent = await Promise.all(
      bookmarks.map(async (bookmark: any) => {
        let content = null

        try {
          switch (bookmark.contentType) {
            case 'topic':
              content = await Topic.findById(bookmark.contentId)
                .select('name description slug')
                .populate('categoryId', 'name')
                .lean()
              break
            case 'protocol':
              content = await MassageProtocol.findById(bookmark.contentId).select('name description slug thumbnail').lean()
              break
            case 'trigger_point':
              content = await TriggerPoint.findById(bookmark.contentId).select('name muscleName slug thumbnail').lean()
              break
            case 'hygiene':
              content = await HygieneGuideline.findById(bookmark.contentId).select('title category').lean()
              break
            case 'model_3d':
              content = await AnatomyModel3D.findById(bookmark.contentId).select('name description slug thumbnail').lean()
              break
            case 'quiz':
              content = await Quiz.findById(bookmark.contentId)
                .select('title description')
                .populate('categoryId', 'name')
                .lean()
              break
          }
        } catch (error) {
          console.error(`Error fetching content for bookmark ${bookmark._id}:`, error)
        }

        return {
          ...bookmark,
          content,
        }
      })
    )

    // Фильтруем закладки, у которых контент был удален
    const validBookmarks = bookmarksWithContent.filter((b) => b.content !== null)

    res.json(validBookmarks)
  } catch (error) {
    console.error('Get bookmarks error:', error)
    res.status(500).json({ message: 'Failed to get bookmarks' })
  }
}

// Добавить закладку
export const addBookmark = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { contentType, contentId, folderId, notes } = req.body

    if (!contentType || !contentId) {
      return res.status(400).json({ message: 'Content type and ID are required' })
    }

    // Проверяем, существует ли уже такая закладка
    const existingBookmark = await Bookmark.findOne({
      userId,
      contentType,
      contentId,
    })

    if (existingBookmark) {
      return res.status(400).json({ message: 'Bookmark already exists' })
    }

    const bookmark = await Bookmark.create({
      userId,
      contentType,
      contentId,
      folderId: folderId || null,
      notes,
    })

    res.status(201).json(bookmark)
  } catch (error) {
    console.error('Add bookmark error:', error)
    res.status(500).json({ message: 'Failed to add bookmark' })
  }
}

// Обновить закладку (переместить в папку, изменить заметки)
export const updateBookmark = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { bookmarkId } = req.params
    const { folderId, notes } = req.body

    const bookmark = await Bookmark.findOne({ _id: bookmarkId, userId })

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' })
    }

    if (folderId !== undefined) bookmark.folderId = folderId === null ? undefined : folderId
    if (notes !== undefined) bookmark.notes = notes

    await bookmark.save()

    res.json(bookmark)
  } catch (error) {
    console.error('Update bookmark error:', error)
    res.status(500).json({ message: 'Failed to update bookmark' })
  }
}

// Удалить закладку
export const deleteBookmark = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { bookmarkId } = req.params

    const bookmark = await Bookmark.findOneAndDelete({ _id: bookmarkId, userId })

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' })
    }

    res.json({ message: 'Bookmark deleted successfully' })
  } catch (error) {
    console.error('Delete bookmark error:', error)
    res.status(500).json({ message: 'Failed to delete bookmark' })
  }
}

// Проверить, добавлен ли контент в закладки
export const checkBookmark = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { contentType, contentId } = req.query

    if (!contentType || !contentId) {
      return res.status(400).json({ message: 'Content type and ID are required' })
    }

    const bookmark = await Bookmark.findOne({
      userId,
      contentType,
      contentId,
    })

    res.json({ isBookmarked: !!bookmark, bookmark })
  } catch (error) {
    console.error('Check bookmark error:', error)
    res.status(500).json({ message: 'Failed to check bookmark' })
  }
}

// === ПАПКИ ===

// Получить все папки пользователя
export const getUserFolders = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId

    const folders = await BookmarkFolder.find({ userId }).sort({ order: 1, createdAt: 1 }).lean()

    // Подсчитываем количество закладок в каждой папке
    const foldersWithCount = await Promise.all(
      folders.map(async (folder: any) => {
        const count = await Bookmark.countDocuments({ userId, folderId: folder._id })
        return {
          ...folder,
          bookmarksCount: count,
        }
      })
    )

    res.json(foldersWithCount)
  } catch (error) {
    console.error('Get folders error:', error)
    res.status(500).json({ message: 'Failed to get folders' })
  }
}

// Создать папку
export const createFolder = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { name, color, icon } = req.body

    if (!name || !name.ru || !name.ro) {
      return res.status(400).json({ message: 'Folder name (ru and ro) is required' })
    }

    // Получаем максимальный order
    const maxOrderFolder = await BookmarkFolder.findOne({ userId }).sort({ order: -1 }).lean()
    const order = maxOrderFolder ? maxOrderFolder.order + 1 : 0

    const folder = await BookmarkFolder.create({
      userId,
      name,
      color: color || '#2196f3',
      icon: icon || 'folder',
      order,
    })

    res.status(201).json({ ...folder.toObject(), bookmarksCount: 0 })
  } catch (error) {
    console.error('Create folder error:', error)
    res.status(500).json({ message: 'Failed to create folder' })
  }
}

// Обновить папку
export const updateFolder = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { folderId } = req.params
    const { name, color, icon, order } = req.body

    const folder = await BookmarkFolder.findOne({ _id: folderId, userId })

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' })
    }

    if (name) folder.name = name
    if (color) folder.color = color
    if (icon) folder.icon = icon
    if (order !== undefined) folder.order = order

    await folder.save()

    const bookmarksCount = await Bookmark.countDocuments({ userId, folderId: folder._id })

    res.json({ ...folder.toObject(), bookmarksCount })
  } catch (error) {
    console.error('Update folder error:', error)
    res.status(500).json({ message: 'Failed to update folder' })
  }
}

// Удалить папку
export const deleteFolder = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId
    const { folderId } = req.params

    const folder = await BookmarkFolder.findOneAndDelete({ _id: folderId, userId })

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' })
    }

    // Перемещаем все закладки из этой папки в "Без папки"
    await Bookmark.updateMany({ userId, folderId: folder._id }, { $unset: { folderId: 1 } })

    res.json({ message: 'Folder deleted successfully' })
  } catch (error) {
    console.error('Delete folder error:', error)
    res.status(500).json({ message: 'Failed to delete folder' })
  }
}
