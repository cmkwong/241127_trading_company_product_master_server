import { TABLE_MASTER } from '../../tables.js';
import DataModelUtils from '../../../utils/dataModelUtils.js';
import AppError from '../../../utils/appError.js';
import * as dbConn from '../../../utils/dbConn.js';
import CrudOperations from '../../../utils/crud.js';

// Create a data model utility for product packings
const packingModel = new DataModelUtils({
  tableName: TABLE_MASTER['PRODUCT_PACKINGS'].name,
  entityName: 'product packing',
  entityIdField: 'product_id',
  requiredFields: [
    'product_id',
    'packing_type_id',
    'length',
    'width',
    'height',
    'weight',
  ],
  validations: {
    length: { min: 0, required: true },
    width: { min: 0, required: true },
    height: { min: 0, required: true },
    weight: { min: 0, required: true },
    packing_type_id: { required: true },
  },
  defaults: {
    quantity: 1,
  },
  joinConfig: [
    {
      joinTable: 'master_packing_types',
      joinField: 'packing_type_id',
      selectFields:
        'master_packing_types.name as packing_type_name, master_packing_types.description as packing_type_description',
      orderBy: 'packing_type_id',
    },
  ],
});

// Export the standard CRUD operations using the model
export const createProductPacking = (data) => packingModel.create(data);
export const getProductPackingById = (id) => packingModel.getById(id);
export const getProductPackingsByProductId = (productId) =>
  packingModel.getAllByParentId(productId);
export const updateProductPacking = (id, data) => packingModel.update(id, data);
export const deleteProductPacking = (id) => packingModel.delete(id);
export const deleteProductPackingsByProductId = (productId) =>
  packingModel.deleteAllByParentId(productId);
export const upsertProductPackings = (productId, packings) =>
  packingModel.upsertAll(productId, packings);

/**
 * Calculates cubic meter volume for a packing
 * @param {Object} packing - The packing data with dimensions
 * @returns {number} The volume in cubic meters
 */
export const calculatePackingVolume = (packing) => {
  // Convert cm to m and calculate volume
  const lengthInM = packing.length / 100;
  const widthInM = packing.width / 100;
  const heightInM = packing.height / 100;

  return lengthInM * widthInM * heightInM;
};

/**
 * Gets all packing types from master table
 * @returns {Promise<Array>} Promise that resolves with the packing types
 */
export const getPackingTypes = async () => {
  try {
    const pool = dbConn.tb_pool;

    const sql = `SELECT * FROM master_packing_types ORDER BY id`;
    const result = await pool.query(sql);

    return result[0];
  } catch (error) {
    throw new AppError(
      `Failed to get packing types: ${error.message}`,
      error.statusCode || 500
    );
  }
};

/**
 * Creates a new packing type
 * @param {Object} data - The packing type data
 * @param {string} data.name - The name of the packing type
 * @param {string} [data.description] - Optional description
 * @returns {Promise<Object>} Promise that resolves with the created packing type
 */
export const createPackingType = async (data) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!data.name) {
      throw new AppError('Packing type name is required', 400);
    }

    // Create the packing type using CRUD utility
    const result = await CrudOperations.performCrud({
      operation: 'create',
      tableName: 'master_packing_types',
      data: data,
      connection: pool,
    });

    return {
      message: 'Packing type created successfully',
      packingType: result.record,
    };
  } catch (error) {
    throw new AppError(
      `Failed to create packing type: ${error.message}`,
      error.statusCode || 500
    );
  }
};
