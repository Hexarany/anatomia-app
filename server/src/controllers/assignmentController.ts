import { Request, Response } from 'express'
import Assignment from '../models/Assignment'
import Submission from '../models/Submission'
import Schedule from '../models/Schedule'
import Group from '../models/Group'
import mongoose from 'mongoose'

// ============================================
// ASSIGNMENTS (Домашние задания)
// ============================================

/**
 * Создать домашнее задание
 */
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const {
      schedule,
      group,
      title,
      description,
      deadline,
      maxScore,
      allowLateSubmission,
      lateSubmissionDeadline,
      attachments,
      instructions,
      requiresFile,
    } = req.body

    // Проверка существования расписания и группы
    const scheduleExists = await Schedule.findById(schedule)
    if (!scheduleExists) {
      return res.status(404).json({ message: 'Schedule not found' })
    }

    const groupExists = await Group.findById(group)
    if (!groupExists) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Проверка прав (преподаватель должен быть владельцем группы)
    if (
      req.user.role === 'teacher' &&
      groupExists.teacher.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: 'You can only create assignments for your groups' })
    }

    const assignment = new Assignment({
      schedule,
      group,
      title,
      description,
      deadline,
      maxScore,
      allowLateSubmission,
      lateSubmissionDeadline,
      attachments: attachments || [],
      instructions,
      requiresFile,
      createdBy: req.user.id,
    })

    await assignment.save()

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    })
  } catch (error: any) {
    console.error('Error creating assignment:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Получить конкретное задание
 */
export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const assignment = await Assignment.findById(id)
      .populate('schedule')
      .populate('group')
      .populate('createdBy', 'name email')

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    // Проверка доступа: студент должен быть в группе
    if (req.user.role === 'student') {
      const group = await Group.findById(assignment.group)
      const isInGroup = group?.students.some(
        (studentId) => studentId.toString() === req.user.id
      )

      if (!isInGroup) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    res.json(assignment)
  } catch (error: any) {
    console.error('Error fetching assignment:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Обновить задание
 */
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const assignment = await Assignment.findById(id).populate('group')
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    // Проверка прав
    const group = assignment.group as any
    if (
      req.user.role === 'teacher' &&
      group.teacher.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: 'You can only update your own assignments' })
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    )

    res.json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment,
    })
  } catch (error: any) {
    console.error('Error updating assignment:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Удалить задание
 */
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const assignment = await Assignment.findById(id).populate('group')
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    // Проверка прав
    const group = assignment.group as any
    if (
      req.user.role === 'teacher' &&
      group.teacher.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own assignments' })
    }

    // Удаляем все связанные сдачи
    await Submission.deleteMany({ assignment: id })

    await Assignment.findByIdAndDelete(id)

    res.json({ message: 'Assignment and related submissions deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting assignment:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Получить все задания группы
 */
export const getGroupAssignments = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Проверка доступа
    if (req.user.role === 'student') {
      const isInGroup = group.students.some(
        (studentId) => studentId.toString() === req.user.id
      )
      if (!isInGroup) {
        return res.status(403).json({ message: 'Access denied' })
      }
    } else if (req.user.role === 'teacher') {
      if (group.teacher.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    const assignments = await Assignment.find({ group: groupId })
      .populate('schedule')
      .populate('createdBy', 'name email')
      .sort({ deadline: 1 })

    // Для студента: добавляем информацию о его сдачах
    if (req.user.role === 'student') {
      const assignmentsWithSubmissions = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await Submission.findOne({
            assignment: assignment._id,
            student: req.user.id,
          })

          return {
            ...assignment.toObject(),
            mySubmission: submission || null,
          }
        })
      )

      return res.json(assignmentsWithSubmissions)
    }

    res.json(assignments)
  } catch (error: any) {
    console.error('Error fetching group assignments:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Получить задание для конкретного занятия
 */
export const getScheduleAssignment = async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params

    const assignment = await Assignment.findOne({ schedule: scheduleId })
      .populate('group')
      .populate('createdBy', 'name email')

    if (!assignment) {
      return res.status(404).json({ message: 'No assignment for this schedule' })
    }

    // Проверка доступа
    const group = assignment.group as any
    if (req.user.role === 'student') {
      const isInGroup = group.students.some(
        (studentId: mongoose.Types.ObjectId) => studentId.toString() === req.user.id
      )
      if (!isInGroup) {
        return res.status(403).json({ message: 'Access denied' })
      }

      // Добавляем информацию о сдаче студента
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user.id,
      })

      return res.json({
        ...assignment.toObject(),
        mySubmission: submission || null,
      })
    }

    res.json(assignment)
  } catch (error: any) {
    console.error('Error fetching schedule assignment:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Получить все сдачи задания (для преподавателя)
 */
export const getAssignmentSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const assignment = await Assignment.findById(id).populate('group')
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    // Проверка прав
    const group = assignment.group as any
    if (
      req.user.role === 'teacher' &&
      group.teacher.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const submissions = await Submission.find({ assignment: id })
      .populate('student', 'name email')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 })

    res.json(submissions)
  } catch (error: any) {
    console.error('Error fetching assignment submissions:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ============================================
// SUBMISSIONS (Сдача работ)
// ============================================

/**
 * Сдать домашнее задание
 */
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params // assignment ID
    const { textAnswer, files } = req.body

    const assignment = await Assignment.findById(id)
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    // Проверка: студент в группе?
    const group = await Group.findById(assignment.group)
    const isInGroup = group?.students.some(
      (studentId) => studentId.toString() === req.user.id
    )
    if (!isInGroup) {
      return res.status(403).json({ message: 'You are not in this group' })
    }

    // Проверка: уже сдавал?
    const existingSubmission = await Submission.findOne({
      assignment: id,
      student: req.user.id,
    })

    if (existingSubmission) {
      return res.status(400).json({
        message: 'You have already submitted this assignment. Use update endpoint to resubmit.',
      })
    }

    // Проверка дедлайна
    const now = new Date()
    const isLate = now > assignment.deadline

    // Если опоздал и не разрешена поздняя сдача
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ message: 'Deadline has passed' })
    }

    // Если опоздал, но есть крайний срок поздней сдачи
    if (
      isLate &&
      assignment.lateSubmissionDeadline &&
      now > assignment.lateSubmissionDeadline
    ) {
      return res.status(400).json({ message: 'Late submission deadline has also passed' })
    }

    const submission = new Submission({
      assignment: id,
      student: req.user.id,
      textAnswer,
      files: files || [],
      status: isLate ? 'late' : 'submitted',
      isLate,
    })

    await submission.save()

    res.status(201).json({
      message: isLate
        ? 'Assignment submitted late successfully'
        : 'Assignment submitted successfully',
      submission,
    })
  } catch (error: any) {
    console.error('Error submitting assignment:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Получить все мои сданные работы (для студента)
 */
export const getMySubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate({
        path: 'assignment',
        populate: [
          { path: 'schedule' },
          { path: 'group' },
          { path: 'createdBy', select: 'name email' },
        ],
      })
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 })

    res.json(submissions)
  } catch (error: any) {
    console.error('Error fetching my submissions:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Обновить/пересдать работу
 */
export const updateSubmission = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params
    const { textAnswer, files, comment } = req.body

    const submission = await Submission.findById(submissionId).populate('assignment')
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Проверка: это моя работа?
    if (submission.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Проверка: можно ли ещё пересдать?
    const assignment = submission.assignment as any
    const now = new Date()

    if (now > assignment.deadline && !assignment.allowLateSubmission) {
      return res.status(400).json({ message: 'Deadline has passed, resubmission not allowed' })
    }

    if (
      assignment.lateSubmissionDeadline &&
      now > assignment.lateSubmissionDeadline
    ) {
      return res.status(400).json({ message: 'Late submission deadline has passed' })
    }

    // Используем метод модели для пересдачи
    await submission.resubmit(textAnswer, files, comment)

    res.json({
      message: 'Assignment resubmitted successfully',
      submission,
    })
  } catch (error: any) {
    console.error('Error updating submission:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Выставить оценку
 */
export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params
    const { grade, feedback } = req.body

    const submission = await Submission.findById(submissionId).populate({
      path: 'assignment',
      populate: 'group',
    })

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    const assignment = submission.assignment as any
    const group = assignment.group as any

    // Проверка прав
    if (
      req.user.role === 'teacher' &&
      group.teacher.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Валидация оценки
    if (grade < 0 || grade > assignment.maxScore) {
      return res.status(400).json({
        message: `Grade must be between 0 and ${assignment.maxScore}`,
      })
    }

    // Используем метод модели для выставления оценки
    await submission.setGrade(grade, feedback, req.user.id)

    res.json({
      message: 'Submission graded successfully',
      submission,
    })
  } catch (error: any) {
    console.error('Error grading submission:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

/**
 * Удалить сдачу
 */
export const deleteSubmission = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params

    const submission = await Submission.findById(submissionId).populate({
      path: 'assignment',
      populate: 'group',
    })

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Проверка прав: либо сам студент, либо преподаватель группы, либо админ
    const isOwnSubmission = submission.student.toString() === req.user.id
    const assignment = submission.assignment as any
    const group = assignment.group as any
    const isTeacher = req.user.role === 'teacher' && group.teacher.toString() === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwnSubmission && !isTeacher && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' })
    }

    await Submission.findByIdAndDelete(submissionId)

    res.json({ message: 'Submission deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting submission:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
