
import { createCategory, listCategories } from '../models/category.model.js';

export async function addCategory(req, res) {
  const { name, basePrice, taxRate } = req.body;

  if (!name || basePrice == null || taxRate == null) {
    return res.status(400).json({ error: 'name, basePrice, and taxRate are required' });
  }

  const category = await createCategory({ name, basePrice, taxRate });
  res.status(201).json({ category });
}

export async function getCategories(req, res) {
  const categories = await listCategories();
  res.json({ categories });
}