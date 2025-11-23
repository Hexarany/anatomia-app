import { Request, Response } from 'express'
import Topic from '../models/Topic'
import mongoose from 'mongoose'

// Расширяем Request для доступа к данным пользователя после аутентификации
interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
  hasActiveSubscription?: boolean 
}

// Helper: Проверяет, авторизован ли пользователь для получения полного контента
const isAuthorizedForFullContent = (req: CustomRequest): boolean => {
  // Если пользователь авторизован (есть userRole), даем полный доступ
  return !!req.userRole;
};

// Helper: Применяет блокировку контента
const createSafeTopic = (topic: any, isAuthorized: boolean) => {
    // Получаем превью контента (первые 400 символов)
    const previewContentRu = topic.content.ru ? topic.content.ru.substring(0, 400) + '...' : '';
    const previewContentRo = topic.content.ro ? topic.content.ro.substring(0, 400) + '...' : '';

    return {
        ...topic.toObject(),
        categoryId: topic.categoryId, 
        
        content: isAuthorized 
          ? topic.content 
          : { ru: previewContentRu, ro: previewContentRo },
        hasFullContentAccess: isAuthorized,
    };
};


export const getAllTopics = async (req: Request, res: Response) => {
  try {
    // Оптимизация: populate только нужные поля
    const topics = await Topic.find().sort({ order: 1 }).populate('categoryId', 'name slug') 
    
    // В списке тем не блокируем контент, только в детальном просмотре
    res.json(topics)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch topics' } })
  }
}

// ОБНОВЛЕНО: Поддержка ID или SLUG + Content Lock
export const getTopicById = async (req: Request, res: Response) => {
  try {
    const slugOrId = req.params.id;

    // Определяем, ищем по ID или по Slug
    const query = mongoose.Types.ObjectId.isValid(slugOrId)
      ? { _id: slugOrId }
      : { slug: slugOrId };

    const topic = await Topic.findOne(query).populate('categoryId', 'name slug');

    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }

    // Применяем логику Content Lock
    const isAuthorized = isAuthorizedForFullContent(req as CustomRequest);
    const safeTopic = createSafeTopic(topic, isAuthorized);

    res.json(safeTopic)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch topic' } })
  }
}

export const getTopicsByCategory = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({ categoryId: req.params.categoryId })
      .sort({ order: 1 })
      .populate('categoryId', 'name slug') 
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
    ).populate('categoryId', 'name slug'); // Populate для лучшего ответа
    
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

// Управление иллюстрациями
export const addImageToTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params
    const { url, filename, caption } = req.body

    const topic = await Topic.findById(topicId)
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }

    // Добавляем изображение в массив images
    topic.images.push({
      url,
      filename,
      caption: caption || { ru: '', ro: '' },
      type: 'image'
    } as any)

    await topic.save()
    res.json(topic)
  } catch (error) {
    console.error('Error adding image to topic:', error)
    res.status(500).json({ error: { message: 'Failed to add image to topic' } })
  }
}

export const removeImageFromTopic = async (req: Request, res: Response) => {
  try {
    const { topicId, imageId } = req.params

    const topic = await Topic.findById(topicId)
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }

    // Удаляем изображение по _id
    topic.images = topic.images.filter((img: any) => img._id.toString() !== imageId)

    await topic.save()
    res.json(topic)
  } catch (error) {
    console.error('Error removing image from topic:', error)
    res.status(500).json({ error: { message: 'Failed to remove image from topic' } })
  }
}

export const updateImageCaption = async (req: Request, res: Response) => {
  try {
    const { topicId, imageId } = req.params
    const { caption } = req.body

    const topic = await Topic.findById(topicId)
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }

    // Находим изображение и обновляем подпись
    const image = topic.images.find((img: any) => img._id.toString() === imageId)
    if (!image) {
      return res.status(404).json({ error: { message: 'Image not found' } })
    }

    image.caption = caption

    await topic.save()
    res.json(topic)
  } catch (error) {
    console.error('Error updating image caption:', error)
    res.status(500).json({ error: { message: 'Failed to update image caption' } })
  }
}

// Управление видео
export const addVideoToTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params
    const { url, filename, caption } = req.body

    const topic = await Topic.findById(topicId)
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }

    // Добавляем видео в массив videos
    topic.videos.push({
      url,
      filename,
      caption: caption || { ru: '', ro: '' },
      type: 'video'
    } as any)

    await topic.save()
    res.json(topic)
  } catch (error) {
    console.error('Error adding video to topic:', error)
    res.status(500).json({ error: { message: 'Failed to add video to topic' } })
  }
}

export const removeVideoFromTopic = async (req: Request, res: Response) => {
  try {
    const { topicId, videoId } = req.params

    const topic = await Topic.findById(topicId)
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }

    // Удаляем видео по _id
    topic.videos = topic.videos.filter((vid: any) => vid._id.toString() !== videoId)

    await topic.save()
    res.json(topic)
  } catch (error) {
    console.error('Error removing video from topic:', error)
    res.status(500).json({ error: { message: 'Failed to remove video from topic' } })
  }
}

export const updateVideoCaption = async (req: Request, res: Response) => {
  try {
    const { topicId, videoId } = req.params
    const { caption } = req.body

    const topic = await Topic.findById(topicId)
    if (!topic) {
      return res.status(404).json({ error: { message: 'Topic not found' } })
    }

    // Находим видео и обновляем подпись
    const video = topic.videos.find((vid: any) => vid._id.toString() === videoId)
    if (!video) {
      return res.status(404).json({ error: { message: 'Video not found' } })
    }

    video.caption = caption

    await topic.save()
    res.json(topic)
  } catch (error) {
    console.error('Error updating video caption:', error)
    res.status(500).json({ error: { message: 'Failed to update video caption' } })
  }
}