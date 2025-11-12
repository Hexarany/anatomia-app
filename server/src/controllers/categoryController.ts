import { Request, Response } from 'express'
import Category from '../models/Category'

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch categories' } })
  }
}

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } })
    }
    res.json(category)
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch category' } })
  }
}

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = new Category(req.body)
    await category.save()
    res.status(201).json(category)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to create category' } })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } })
    }
    res.json(category)
  } catch (error) {
    res.status(400).json({ error: { message: 'Failed to update category' } })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } })
    }
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete category' } })
  }
}
