import { createBranch, listBranches, updateBranch, deleteBranch } from '../models/branch.model.js';

// POST /branches — Create new branch
export async function addBranch(req, res) {
  const { name, address, isSettingUp } = req.body;
  const storeId = req.user.storeId;

  if (!name) {
    return res.status(400).json({ error: 'Branch name is required' });
  }

  try {
    const branch = await createBranch(storeId, name, address || '', isSettingUp || false);
    res.status(201).json(branch);
  } catch (err) {
    console.error('Error creating branch:', err);
    res.status(500).json({ error: 'Failed to create branch' });
  }
}

// GET /branches — List all branches for store owner
export async function getBranches(req, res) {
  const storeId = req.user.storeId;

  try {
    const branches = await listBranches(storeId);
    res.json(branches);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
}

// PATCH /branches/:branchId — Update branch info
export async function editBranch(req, res) {
  const { branchId } = req.params;
  const { name, address, isSettingUp } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Branch name is required' });
  }

  try {
    const branch = await updateBranch(branchId, name, address || '', isSettingUp);
    res.json(branch);
  } catch (err) {
    console.error('Error updating branch:', err);
    res.status(500).json({ error: 'Failed to update branch' });
  }
}

// DELETE /branches/:branchId — Delete branch
export async function removeBranch(req, res) {
  const { branchId } = req.params;

  try {
    const deleted = await deleteBranch(branchId);
    if (!deleted) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json({ message: 'Branch deleted successfully' });
  } catch (err) {
    console.error('Error deleting branch:', err);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
}
