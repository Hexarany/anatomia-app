import { Request, Response } from 'express'
import InstructorProfile from '../models/InstructorProfile'

// GET /api/instructor-profile - Get active instructor profile (public)
export const getInstructorProfile = async (req: Request, res: Response) => {
  try {
    const profile = await InstructorProfile.findOne({ isActive: true })

    if (!profile) {
      return res.status(404).json({ message: 'Профиль преподавателя не найден' })
    }

    res.json(profile)
  } catch (error: any) {
    console.error('Error fetching instructor profile:', error)
    res.status(500).json({ message: 'Ошибка при загрузке профиля преподавателя' })
  }
}

// GET /api/instructor-profile/admin - Get instructor profile for editing (admin only)
export const getInstructorProfileForAdmin = async (req: Request, res: Response) => {
  try {
    // Get the first (and should be only) profile
    let profile = await InstructorProfile.findOne()

    // If no profile exists, return default structure
    if (!profile) {
      return res.json({
        _id: null,
        name: { ru: 'Денис Матиевич', ro: 'Denis Matievici' },
        title: {
          ru: 'Сертифицированный массажист • Преподаватель',
          ro: 'Maseur certificat • Profesor',
        },
        badges: [
          { ru: '10+ лет опыта', ro: '10+ ani experiență' },
          { ru: 'Сертифицированный специалист', ro: 'Specialist certificat' },
          { ru: 'Автор курса', ro: 'Autor curs' },
        ],
        bio: {
          ru: 'Добро пожаловать! Меня зовут Денис Матиевич...',
          ro: 'Bine ați venit! Numele meu este Denis Matievici...',
        },
        education: [],
        experience: [],
        philosophy: { ru: '', ro: '' },
        stats: { students: 500, yearsOfExperience: 10, protocols: 15 },
        whyPlatform: { ru: '', ro: '' },
        promise: { ru: '', ro: '' },
        isActive: true,
      })
    }

    res.json(profile)
  } catch (error: any) {
    console.error('Error fetching instructor profile for admin:', error)
    res.status(500).json({ message: 'Ошибка при загрузке профиля преподавателя' })
  }
}

// POST /api/instructor-profile - Create or update instructor profile (admin only)
export const createOrUpdateInstructorProfile = async (req: Request, res: Response) => {
  try {
    const profileData = req.body

    // Check if profile already exists
    let profile = await InstructorProfile.findOne()

    if (profile) {
      // Update existing profile
      Object.assign(profile, profileData)
      await profile.save()
    } else {
      // Create new profile
      profile = new InstructorProfile(profileData)
      await profile.save()
    }

    res.json({
      message: 'Профиль преподавателя успешно сохранен',
      profile,
    })
  } catch (error: any) {
    console.error('Error saving instructor profile:', error)
    res.status(500).json({
      message: 'Ошибка при сохранении профиля преподавателя',
      error: error.message,
    })
  }
}

// DELETE /api/instructor-profile - Delete instructor profile (admin only)
export const deleteInstructorProfile = async (req: Request, res: Response) => {
  try {
    await InstructorProfile.deleteMany({})
    res.json({ message: 'Профиль преподавателя удален' })
  } catch (error: any) {
    console.error('Error deleting instructor profile:', error)
    res.status(500).json({ message: 'Ошибка при удалении профиля преподавателя' })
  }
}
