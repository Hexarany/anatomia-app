import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded' } })
    }

    const fileUrl = `/uploads/${req.file.filename}`
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to upload file' } })
  }
}

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(__dirname, '../../uploads', filename)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({ message: 'File deleted successfully' })
    } else {
      res.status(404).json({ error: { message: 'File not found' } })
    }
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete file' } })
  }
}
