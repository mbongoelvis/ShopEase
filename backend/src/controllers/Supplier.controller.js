
import { createSupplier, listSuppliers } from '../models/supplier.model.js';

export async function addSupplier(req, res) {
  const { name, contact } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  const supplier = await createSupplier({ name, contact });
  res.status(201).json({ supplier });
}

export async function getSuppliers(req, res) {
  const suppliers = await listSuppliers();
  res.json({ suppliers });
}