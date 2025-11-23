import { Request, Response } from 'express'
import MassageProtocol from '../models/MassageProtocol'
import mongoose from 'mongoose'

interface CustomRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
  hasActiveSubscription?: boolean
}

// Helper: Проверяет, авторизован ли пользователь для получения полного контента
const isAuthorizedForFullContent = (req: CustomRequest): boolean => {
  return !!req.userRole
}

// Helper: Применяет блокировку контента
const createSafeProtocol = (protocol: any, isAuthorized: boolean) => {
  const previewContentRu = protocol.content.ru ? protocol.content.ru.substring(0, 400) + '...' : ''
  const previewContentRo = protocol.content.ro ? protocol.content.ro.substring(0, 400) + '...' : ''

  return {
    ...protocol.toObject(),
    content: isAuthorized
      ? protocol.content
      : { ru: previewContentRu, ro: previewContentRo },
    hasFullContentAccess: isAuthorized,
  }
}

// Получить все протоколы массажа
export const getAllMassageProtocols = async (req: Request, res: Response) => {
  try {
    const protocols = await MassageProtocol.find().sort({ order: 1 })
    res.json(protocols)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch massage protocols' } })
  }
}

// Получить протокол по ID или slug
export const getMassageProtocolById = async (req: Request, res: Response) => {
  try {
    const slugOrId = req.params.id

    const query = mongoose.Types.ObjectId.isValid(slugOrId)
      ? { _id: slugOrId }
      : { slug: slugOrId }

    const protocol = await MassageProtocol.findOne(query)

    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    const isAuthorized = isAuthorizedForFullContent(req as CustomRequest)
    const safeProtocol = createSafeProtocol(protocol, isAuthorized)

    res.json(safeProtocol)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch massage protocol' } })
  }
}

// Создать протокол массажа (ADMIN)
export const createMassageProtocol = async (req: Request, res: Response) => {
  try {
    const protocol = new MassageProtocol(req.body)
    await protocol.save()
    res.status(201).json(protocol)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to create massage protocol' } })
  }
}

// Обновить протокол массажа (ADMIN)
export const updateMassageProtocol = async (req: Request, res: Response) => {
  try {
    const protocol = await MassageProtocol.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }
    res.json(protocol)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to update massage protocol' } })
  }
}

// Удалить протокол массажа (ADMIN)
export const deleteMassageProtocol = async (req: Request, res: Response) => {
  try {
    const protocol = await MassageProtocol.findByIdAndDelete(req.params.id)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }
    res.json({ message: 'Massage protocol deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete massage protocol' } })
  }
}

// Управление изображениями
export const addImageToProtocol = async (req: Request, res: Response) => {
  try {
    const { protocolId } = req.params
    const { url, filename, caption } = req.body

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    protocol.images.push({
      url,
      filename,
      caption: caption || { ru: '', ro: '' },
      type: 'image'
    } as any)

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error adding image to protocol:', error)
    res.status(500).json({ error: { message: 'Failed to add image to protocol' } })
  }
}

export const removeImageFromProtocol = async (req: Request, res: Response) => {
  try {
    const { protocolId, imageId } = req.params

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    protocol.images = protocol.images.filter((img: any) => img._id.toString() !== imageId)

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error removing image from protocol:', error)
    res.status(500).json({ error: { message: 'Failed to remove image from protocol' } })
  }
}

export const updateImageCaption = async (req: Request, res: Response) => {
  try {
    const { protocolId, imageId } = req.params
    const { caption } = req.body

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    const image = protocol.images.find((img: any) => img._id.toString() === imageId)
    if (!image) {
      return res.status(404).json({ error: { message: 'Image not found' } })
    }

    image.caption = caption

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error updating image caption:', error)
    res.status(500).json({ error: { message: 'Failed to update image caption' } })
  }
}

// Управление видео
export const addVideoToProtocol = async (req: Request, res: Response) => {
  try {
    const { protocolId } = req.params
    const { url, filename, caption } = req.body

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    protocol.videos.push({
      url,
      filename,
      caption: caption || { ru: '', ro: '' },
      type: 'video'
    } as any)

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error adding video to protocol:', error)
    res.status(500).json({ error: { message: 'Failed to add video to protocol' } })
  }
}

export const removeVideoFromProtocol = async (req: Request, res: Response) => {
  try {
    const { protocolId, videoId } = req.params

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    protocol.videos = protocol.videos.filter((vid: any) => vid._id.toString() !== videoId)

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error removing video from protocol:', error)
    res.status(500).json({ error: { message: 'Failed to remove video from protocol' } })
  }
}

export const updateVideoCaption = async (req: Request, res: Response) => {
  try {
    const { protocolId, videoId } = req.params
    const { caption } = req.body

    const protocol = await MassageProtocol.findById(protocolId)
    if (!protocol) {
      return res.status(404).json({ error: { message: 'Massage protocol not found' } })
    }

    const video = protocol.videos.find((vid: any) => vid._id.toString() === videoId)
    if (!video) {
      return res.status(404).json({ error: { message: 'Video not found' } })
    }

    video.caption = caption

    await protocol.save()
    res.json(protocol)
  } catch (error) {
    console.error('Error updating video caption:', error)
    res.status(500).json({ error: { message: 'Failed to update video caption' } })
  }
}
