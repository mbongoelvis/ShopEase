
// Parses an uploaded CSV and creates one product per row, reusing the
// exact same createProductWithVariants logic from a single product
// creation — bulk upload isn't a different feature, it's the same
// feature called many times in a loop, which is why it lives in the
// same product.service.js pattern rather than duplicating logic.

import { parse } from 'csv-parse/sync';
import { createProductWithVariants } from './product.service.js';
import { createInventoryRecord } from '../models/inventory.model.js';

// Expected CSV columns: categoryId,barcode,name,sizes,colors
// sizes/colors are semicolon-separated within a single cell, e.g. "S;M;L"
export async function processBulkUpload(csvBuffer, storeId) {
  const records = parse(csvBuffer, {
    columns: true,        // use the first row as field names
    skip_empty_lines: true,
    trim: true,
  });

  const results = {
    successCount: 0,
    failedRows: [], // { row, error } — we don't abort the whole file for one bad row
  };

  for (const [index, row] of records.entries()) {
    try {
      const sizes = row.sizes ? row.sizes.split(';').map(s => s.trim()) : [];
      const colors = row.colors ? row.colors.split(';').map(c => c.trim()) : [];

      const result = await createProductWithVariants({
        categoryId: row.categoryId,
        barcode: row.barcode,
        name: row.name,
        sizes,
        colors,
      });

      const allProducts = result.variants.length > 0 ? result.variants : [result.parent];
      for (const product of allProducts) {
        await createInventoryRecord({
          productId: product.product_id,
          storeId,
          quantity: 0,
        });
      }

      results.successCount += 1;
    } catch (err) {
      // A bad row (e.g. missing category, duplicate barcode) shouldn't
      // fail the ENTIRE 200-row file — we record it and keep going,
      // matching the "214 rows / Remove" bulk upload UI we sketched earlier.
      results.failedRows.push({ row: index + 2, error: err.message }); // +2: header row + 1-indexed
    }
  }

  return results;
}