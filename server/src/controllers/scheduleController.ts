import { Request, Response } from 'express'
import Schedule from '../models/Schedule'
import Group from '../models/Group'

/**
 * Получить расписание группы
 */
export const getGroupSchedule = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    // Проверяем доступ к группе
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    // Проверяем права доступа
    const isTeacher = group.teacher.toString() === userId
    const isStudent = group.students.some((s: any) => s.toString() === userId)

    if (userRole !== 'admin' && !isTeacher && !isStudent) {
      return res
        .status(403)
        .json({ error: { message: 'Нет доступа к расписанию этой группы' } })
    }

    const schedule = await Schedule.find({ group: groupId })
      .populate('topic', 'name description')
      .sort({ lessonNumber: 1 })

    res.json(schedule)
  } catch (error) {
    console.error('Error fetching group schedule:', error)
    res
      .status(500)
      .json({ error: { message: 'Ошибка при получении расписания' } })
  }
}

/**
 * Получить конкретное занятие
 */
export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    const schedule = await Schedule.findById(id)
      .populate('group')
      .populate('topic', 'name description content')

    if (!schedule) {
      return res.status(404).json({ error: { message: 'Занятие не найдено' } })
    }

    const group = schedule.group as any

    // Проверяем права доступа
    const isTeacher = group.teacher.toString() === userId
    const isStudent = group.students.some((s: any) => s.toString() === userId)

    if (userRole !== 'admin' && !isTeacher && !isStudent) {
      return res.status(403).json({ error: { message: 'Нет доступа к этому занятию' } })
    }

    res.json(schedule)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении занятия' } })
  }
}

/**
 * Создать занятие (teacher, admin)
 */
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const {
      group,
      lessonNumber,
      date,
      duration,
      title,
      description,
      topic,
      location,
      homework,
      materials,
    } = req.body
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    // Проверяем группу
    const groupDoc = await Group.findById(group)
    if (!groupDoc) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    // Только учитель группы или админ
    if (userRole !== 'admin' && groupDoc.teacher.toString() !== userId) {
      return res
        .status(403)
        .json({ error: { message: 'Нет прав для создания занятий в этой группе' } })
    }

    // Проверяем, нет ли уже занятия с таким номером
    const existingLesson = await Schedule.findOne({ group, lessonNumber })
    if (existingLesson) {
      return res.status(400).json({
        error: {
          message: `Занятие с номером ${lessonNumber} уже существует для этой группы`,
        },
      })
    }

    const schedule = new Schedule({
      group,
      lessonNumber,
      date,
      duration: duration || 90,
      title,
      description,
      topic,
      location: location || 'Online',
      homework,
      materials: materials || [],
      status: 'scheduled',
    })

    await schedule.save()

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('group', 'name')
      .populate('topic', 'name description')

    // Send Telegram notification (non-blocking)
    const { TelegramNotificationService } = await import('../services/telegram/notificationService')
    TelegramNotificationService.notifyNewSchedule(schedule._id.toString())
      .catch(err => console.error('Failed to send Telegram schedule notification:', err))

    res.status(201).json(populatedSchedule)
  } catch (error) {
    console.error('Error creating schedule:', error)
    res.status(400).json({ error: { message: 'Ошибка при создании занятия' } })
  }
}

/**
 * Обновить занятие (teacher, admin)
 */
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    const schedule = await Schedule.findById(id).populate('group')
    if (!schedule) {
      return res.status(404).json({ error: { message: 'Занятие не найдено' } })
    }

    const group = schedule.group as any

    // Только учитель группы или админ
    if (userRole !== 'admin' && group.teacher.toString() !== userId) {
      return res
        .status(403)
        .json({ error: { message: 'Нет прав для редактирования этого занятия' } })
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('group', 'name')
      .populate('topic', 'name description')

    res.json(updatedSchedule)
  } catch (error) {
    console.error('Error updating schedule:', error)
    res.status(400).json({ error: { message: 'Ошибка при обновлении занятия' } })
  }
}

/**
 * Удалить занятие (teacher, admin)
 */
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    const schedule = await Schedule.findById(id).populate('group')
    if (!schedule) {
      return res.status(404).json({ error: { message: 'Занятие не найдено' } })
    }

    const group = schedule.group as any

    // Только учитель группы или админ
    if (userRole !== 'admin' && group.teacher.toString() !== userId) {
      return res
        .status(403)
        .json({ error: { message: 'Нет прав для удаления этого занятия' } })
    }

    await Schedule.findByIdAndDelete(id)

    res.json({ success: true, message: 'Занятие удалено' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    res.status(500).json({ error: { message: 'Ошибка при удалении занятия' } })
  }
}

/**
 * Создать расписание для всего курса (teacher, admin)
 * Автоматически создает занятия на основе параметров курса
 */
export const generateCourseSchedule = async (req: Request, res: Response) => {
  try {
    const {
      groupId,
      startDate,
      lessonsCount,
      lessonDuration = 90,
      weekdays = [1, 3, 5], // пн, ср, пт
      startTime = '10:00',
    } = req.body
    const userId = (req as any).userId
    const userRole = (req as any).userRole

    // Проверяем группу
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    // Только учитель группы или админ
    if (userRole !== 'admin' && group.teacher.toString() !== userId) {
      return res
        .status(403)
        .json({ error: { message: 'Нет прав для создания расписания этой группы' } })
    }

    // Удаляем существующее расписание
    await Schedule.deleteMany({ group: groupId })

    const lessons = []
    let currentDate = new Date(startDate)
    const [hours, minutes] = startTime.split(':').map(Number)

    for (let i = 1; i <= lessonsCount; i++) {
      // Ищем следующий подходящий день недели
      while (!weekdays.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Устанавливаем время
      const lessonDate = new Date(currentDate)
      lessonDate.setHours(hours, minutes, 0, 0)

      const lesson = await Schedule.create({
        group: groupId,
        lessonNumber: i,
        date: lessonDate,
        duration: lessonDuration,
        title: {
          ru: `Занятие ${i}`,
          ro: `Lecția ${i}`,
        },
        location: 'Online',
        status: 'scheduled',
      })

      lessons.push(lesson)

      // Переходим к следующему дню для следующего занятия
      currentDate.setDate(currentDate.getDate() + 1)
      while (!weekdays.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    res.json({
      success: true,
      message: `Создано ${lessons.length} занятий`,
      lessons,
    })
  } catch (error: any) {
    console.error('Error generating schedule:', error)
    res.status(500).json({
      error: { message: error.message || 'Ошибка при генерации расписания' },
    })
  }
}
