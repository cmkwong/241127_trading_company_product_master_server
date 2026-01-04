import DataModelUtils from '../../../utils/dataModelUtils.js';
import { PRODUCT_TABLE_MASTER } from '../../tables.js';
import { tradeBusinessDbc } from '../../dbModel.js';

// Create DataModelUtils instance for product name types
export const productImagesTypeModel = new DataModelUtils({
  dbc: tradeBusinessDbc,
  tableName: PRODUCT_TABLE_MASTER['MASTER_PRODUCT_IMAGE_TYPES'].name,
  tableFields: PRODUCT_TABLE_MASTER['MASTER_PRODUCT_IMAGE_TYPES'].fields,
  entityName: 'product image type',
  requiredFields: ['name'],
  validations: {
    name: { required: true },
  },
});

/**
 * Inserts default categories
 * @returns {Promise<Object>} Promise that resolves with insertion results
 */
export const insertDefaultProductImagesType = async () => {
  try {
    // Import categories from data file
    const { product_master_data } = await import('../../../datas/products.js');
    const results = await batchCreateCategories(
      product_master_data.master_product_images_type
    );

    return {
      message: 'Default product image type inserted successfully',
      results,
    };
  } catch (error) {
    throw new AppError(
      `Failed to insert default categories: ${error.message}`,
      500
    );
  }
};
