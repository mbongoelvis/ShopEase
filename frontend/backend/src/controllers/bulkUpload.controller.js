

import { processBulkUpload } from '../services/bulkUpload.service.js';

// POST /products/bulk-upload — Owner-only, expects a multipart file
// upload with the field name "file" (multer puts it on req.file).
export async function bulkUploadProducts(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = await processBulkUpload(req.file.buffer, req.user.storeId);

  res.status(207).json(results); // 207 Multi-Status: some rows may have succeeded, some failed
}