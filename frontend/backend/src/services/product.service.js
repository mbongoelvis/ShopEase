

// This file decides how many product rows that turns into and what each one inherits, category-level inheritance & variant generator logic lives here
 
import { createProduct } from '../models/product.model.js';
import { findCategoryById } from '../models/category.model.js';
 
// Generates a barcode-safe SKU suffix so each variant has a unique code.
// barcode is temporal for now.
function buildVariantBarcode(baseBarcode, sizeLabel, colorLabel) {
  const suffix = [sizeLabel, colorLabel].filter(Boolean).join('-').toUpperCase();
  return `${`ShopEase`}-${baseBarcode}-${suffix}`;
}
 
// Creates a parent product, then one child product per size/color
export async function createProductWithVariants({
  categoryId,
  barcode,
  name,
  sizes = [],   // e.g. ['S', 'M', 'L']
  colors = [],  // e.g. ['Red', 'Blue']
  priceOverride = null,
}) {
  const category = await findCategoryById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
 
  // Inherit the category's base price unless the product explicitly overrides it.
  // Category - Level inheritance...
  const inheritedPrice = priceOverride ?? category.base_price;
 
  const parentProduct = await createProduct({
    categoryId,
    barcode,
    name,
    price: inheritedPrice,
  });
 
  // No variants requested — just return the single product as-is.
  if (sizes.length === 0 && colors.length === 0) {
    return { parent: parentProduct, variants: [] };
  }
 
  // Build every size × color combination. If only sizes OR only colors
  // were given, treat the missing dimension as a single "no filter" pass.
  const sizeList = sizes.length > 0 ? sizes : [null];
  const colorList = colors.length > 0 ? colors : [null];
 
  const variants = [];
  for (const size of sizeList) {
    for (const color of colorList) {
      const variant = await createProduct({
        categoryId,
        parentId: parentProduct.product_id,
        barcode: buildVariantBarcode(barcode, size, color),
        name,
        variantAttrs: { size, color },
        price: inheritedPrice,
      });
      variants.push(variant);
    }
  }
 
  return { parent: parentProduct, variants };
}