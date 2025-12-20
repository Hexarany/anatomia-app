import { Request, Response } from 'express'
import Group from '../models/Group'
import User from '../models/User'
import Conversation from '../models/Conversation'

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).userRole
    const userId = (req as any).userId

    // Если пользователь teacher, показываем только его группы
    const filter = userRole === 'teacher' ? { teacher: userId } : {}

    const groups = await Group.find(filter)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email')
      .sort({ createdAt: -1 })

    res.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении списка групп' } })
  }
}

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email')

    if (!group) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    // Проверка прав доступа для teacher (может видеть только свои группы)
    const userRole = (req as any).userRole
    const userId = (req as any).userId

    if (userRole === 'teacher' && group.teacher._id.toString() !== userId) {
      return res.status(403).json({ error: { message: 'Нет доступа к этой группе' } })
    }

    res.json(group)
  } catch (error) {
    console.error('Error fetching group:', error)
    res.status(500).json({ error: { message: 'Ошибка при получении группы' } })
  }
}

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, teacher, students, startDate, endDate, isActive } = req.body

    // Валидация обязательных полей
    if (!name || !name.ru || !name.ro) {
      return res.status(400).json({ error: { message: 'Название группы обязательно на обоих языках' } })
    }

    if (!teacher) {
      return res.status(400).json({ error: { message: 'Преподаватель обязателен' } })
    }

    if (!startDate) {
      return res.status(400).json({ error: { message: 'Дата начала обязательна' } })
    }

    // Проверка что teacher имеет роль teacher
    const teacherUser = await User.findById(teacher)
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(400).json({ error: { message: 'Указанный пользователь не является преподавателем' } })
    }

    // Проверка что все студенты имеют роль student
    if (students && students.length > 0) {
      const studentUsers = await User.find({ _id: { $in: students } })
      const invalidStudents = studentUsers.filter(u => u.role !== 'student')
      if (invalidStudents.length > 0) {
        return res.status(400).json({ error: { message: 'Некоторые из указанных пользователей не являются студентами' } })
      }
    }

    // Проверка дат
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: { message: 'Дата окончания должна быть после даты начала' } })
    }

    const group = new Group({
      name,
      description,
      teacher,
      students: students || [],
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true
    })

    await group.save()

    // Автоматически создаем групповой чат для группы обучения
    try {
      // Собираем всех участников: учитель + студенты
      const participants = [teacher, ...(students || [])]

      // Создаем unreadCount Map для всех участников
      const unreadCountMap = new Map()
      participants.forEach((id: string) => unreadCountMap.set(id, 0))

      // Создаем групповой чат с названием группы
      const groupChatName = `${name.ru} / ${name.ro}`
      await Conversation.create({
        type: 'group',
        participants,
        name: groupChatName,
        createdBy: teacher,
        unreadCount: unreadCountMap,
      })

      console.log(`✅ Групповой чат создан для группы "${groupChatName}"`)
    } catch (chatError) {
      console.error('Ошибка при создании группового чата:', chatError)
      // Не прерываем создание группы, если не удалось создать чат
    }

    // Populate для возврата с полной информацией
    const populatedGroup = await Group.findById(group._id)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email')

    res.status(201).json(populatedGroup)
  } catch (error) {
    console.error('Error creating group:', error)
    res.status(400).json({ error: { message: 'Ошибка при создании группы' } })
  }
}

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id
    const userRole = (req as any).userRole
    const userId = (req as any).userId

    // Получаем группу
    const existingGroup = await Group.findById(groupId)
    if (!existingGroup) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    // Проверка прав доступа (admin или teacher-владелец)
    if (userRole === 'teacher' && existingGroup.teacher.toString() !== userId) {
      return res.status(403).json({ error: { message: 'Нет прав для редактирования этой группы' } })
    }

    const { name, description, teacher, students, startDate, endDate, isActive } = req.body

    // Валидация если изменяется teacher
    if (teacher && teacher !== existingGroup.teacher.toString()) {
      const teacherUser = await User.findById(teacher)
      if (!teacherUser || teacherUser.role !== 'teacher') {
        return res.status(400).json({ error: { message: 'Указанный пользователь не является преподавателем' } })
      }
    }

    // Валидация если изменяются студенты
    if (students && students.length > 0) {
      const studentUsers = await User.find({ _id: { $in: students } })
      const invalidStudents = studentUsers.filter(u => u.role !== 'student')
      if (invalidStudents.length > 0) {
        return res.status(400).json({ error: { message: 'Некоторые из указанных пользователей не являются студентами' } })
      }
    }

    // Проверка дат
    const finalStartDate = startDate || existingGroup.startDate
    const finalEndDate = endDate || existingGroup.endDate
    if (finalEndDate && new Date(finalEndDate) < new Date(finalStartDate)) {
      return res.status(400).json({ error: { message: 'Дата окончания должна быть после даты начала' } })
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email')

    res.json(group)
  } catch (error) {
    console.error('Error updating group:', error)
    res.status(400).json({ error: { message: 'Ошибка при обновлении группы' } })
  }
}

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id)
    if (!group) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }
    res.json({ message: 'Группа успешно удалена' })
  } catch (error) {
    console.error('Error deleting group:', error)
    res.status(500).json({ error: { message: 'Ошибка при удалении группы' } })
  }
}

export const addStudentToGroup = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id
    const { studentId } = req.body
    const userRole = (req as any).userRole
    const userId = (req as any).userId

    if (!studentId) {
      return res.status(400).json({ error: { message: 'ID студента обязателен' } })
    }

    // Получаем группу
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    // Проверка прав доступа (admin или teacher-владелец)
    if (userRole === 'teacher' && group.teacher.toString() !== userId) {
      return res.status(403).json({ error: { message: 'Нет прав для управления студентами этой группы' } })
    }

    // Проверка что пользователь является студентом
    const student = await User.findById(studentId)
    if (!student || student.role !== 'student') {
      return res.status(400).json({ error: { message: 'Указанный пользователь не является студентом' } })
    }

    // Проверка что студент еще не добавлен
    if (group.students.includes(studentId as any)) {
      return res.status(400).json({ error: { message: 'Студент уже добавлен в эту группу' } })
    }

    // Добавляем студента
    group.students.push(studentId as any)
    await group.save()

    // Возвращаем обновленную группу с populate
    const updatedGroup = await Group.findById(groupId)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email')

    res.json(updatedGroup)
  } catch (error) {
    console.error('Error adding student to group:', error)
    res.status(500).json({ error: { message: 'Ошибка при добавлении студента в группу' } })
  }
}

export const removeStudentFromGroup = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.id
    const studentId = req.params.studentId
    const userRole = (req as any).userRole
    const userId = (req as any).userId

    // Получаем группу
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ error: { message: 'Группа не найдена' } })
    }

    // Проверка прав доступа (admin или teacher-владелец)
    if (userRole === 'teacher' && group.teacher.toString() !== userId) {
      return res.status(403).json({ error: { message: 'Нет прав для управления студентами этой группы' } })
    }

    // Проверка что студент в группе
    if (!group.students.includes(studentId as any)) {
      return res.status(400).json({ error: { message: 'Студент не найден в этой группе' } })
    }

    // Удаляем студента
    group.students = group.students.filter(s => s.toString() !== studentId)
    await group.save()

    // Возвращаем обновленную группу с populate
    const updatedGroup = await Group.findById(groupId)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email')

    res.json(updatedGroup)
  } catch (error) {
    console.error('Error removing student from group:', error)
    res.status(500).json({ error: { message: 'Ошибка при удалении студента из группы' } })
  }
}
