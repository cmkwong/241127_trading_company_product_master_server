import * as dbConn from '../../../utils/dbConn.js';
import * as dbModel from '../../../models/dbModel.js';
import AppError from '../../../utils/appError.js';

/**
 * Creates the label_master table if it doesn't exist
 * @returns {Promise} Promise that resolves when the table is created
 */
export const createLabelMasterTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    // SQL to create the label_master table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS label_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        main_type VARCHAR(50) NOT NULL,
        sub_type VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        INDEX idx_main_type (main_type),
        INDEX idx_sub_type (sub_type),
        UNIQUE KEY unique_label (main_type, sub_type, name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Execute the SQL statement
    const result = await dbModel.executeQuery(pool, createTableSQL);
    return result;
  } catch (error) {
    throw new AppError(
      `Failed to create label_master table: ${error.message}`,
      500
    );
  }
};

/**
 * Drops the label_master table if it exists
 * @returns {Promise} Promise that resolves when the table is dropped
 */
export const dropLabelMasterTable = async () => {
  try {
    const pool = dbConn.tb_pool;

    // SQL to drop the table if it exists
    const dropTableSQL = `DROP TABLE IF EXISTS label_master;`;

    // Execute the SQL statement
    const result = await dbModel.executeQuery(pool, dropTableSQL);
    return result;
  } catch (error) {
    throw new AppError(
      `Failed to drop label_master table: ${error.message}`,
      500
    );
  }
};

/**
 * Gets all labels from the label_master table
 * @returns {Promise} Promise that resolves with all labels
 */
export const getAllLabels = async () => {
  try {
    const pool = dbConn.tb_pool;

    // SQL to select all labels
    const selectSQL = `SELECT * FROM label_master ORDER BY main_type, sub_type, name;`;

    // Execute the SQL statement
    const labels = await dbModel.executeQuery(pool, selectSQL);
    return labels;
  } catch (error) {
    throw new AppError(`Failed to retrieve labels: ${error.message}`, 500);
  }
};

/**
 * Gets labels filtered by main_type and optionally sub_type
 * @param {string} main_type - The main type to filter by
 * @param {string} [sub_type] - Optional sub type to filter by
 * @returns {Promise} Promise that resolves with filtered labels
 */
export const getFilteredLabels = async (main_type, sub_type) => {
  try {
    const pool = dbConn.tb_pool;

    if (!main_type) {
      throw new AppError('main_type parameter is required', 400);
    }

    let selectSQL = `SELECT * FROM label_master WHERE main_type = ?`;
    const params = [main_type];

    if (sub_type) {
      selectSQL += ` AND sub_type = ?`;
      params.push(sub_type);
    }

    selectSQL += ` ORDER BY name;`;

    // Execute the SQL statement
    const labels = await dbModel.executeQuery(pool, selectSQL, params);
    return labels;
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError(
          `Failed to retrieve filtered labels: ${error.message}`,
          500
        );
  }
};

/**
 * Inserts label data into the label_master table
 * @param {Array} labelData - Array of label objects with main_type, sub_type, and name
 * @returns {Promise} Promise that resolves with the insert result
 */
export const addLabel = async (labelData) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate that data is provided and is an array
    if (!labelData || !Array.isArray(labelData) || labelData.length === 0) {
      throw new AppError('Label data must be a non-empty array', 400);
    }

    // Validate each object in the array has the required fields
    const invalidItems = labelData.filter(
      (item) => !item.main_type || !item.sub_type || !item.name
    );

    if (invalidItems.length > 0) {
      throw new AppError(
        'Each label object must contain main_type, sub_type, and name fields',
        400
      );
    }

    // Prepare the SQL statement with placeholders
    let insertSQL = `INSERT INTO label_master (main_type, sub_type, name) VALUES `;
    const values = [];
    const placeholders = [];

    // Create placeholders and values array for each item
    labelData.forEach((item) => {
      placeholders.push(`(?, ?, ?)`);
      values.push(item.main_type, item.sub_type, item.name);
    });

    // Complete the SQL statement
    insertSQL += placeholders.join(', ');
    insertSQL += ` ON DUPLICATE KEY UPDATE 
                  main_type = VALUES(main_type),
                  sub_type = VALUES(sub_type),
                  name = VALUES(name);`;

    // Execute the SQL statement with the values
    const result = await dbModel.executeQuery(pool, insertSQL, values);
    return { count: labelData.length, result };
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError(`Failed to insert label data: ${error.message}`, 500);
  }
};

/**
 * Updates an existing label in the label_master table
 * @param {string} id - The ID of the label to update
 * @param {Object} updateData - Object containing fields to update (main_type, sub_type, name)
 * @returns {Promise} Promise that resolves with the update result
 */
export const updateLabel = async (id, updateData) => {
  try {
    const pool = dbConn.tb_pool;
    const { main_type, sub_type, name } = updateData;

    // Validate required fields
    if (!id) {
      throw new AppError('Label ID is required', 400);
    }

    if (!main_type && !sub_type && !name) {
      throw new AppError('At least one field to update is required', 400);
    }

    // Build the update SQL dynamically based on provided fields
    let updateSQL = `UPDATE label_master SET `;
    const params = [];

    if (main_type) {
      updateSQL += `main_type = ?, `;
      params.push(main_type);
    }

    if (sub_type) {
      updateSQL += `sub_type = ?, `;
      params.push(sub_type);
    }

    if (name) {
      updateSQL += `name = ?, `;
      params.push(name);
    }

    // Remove trailing comma and space
    updateSQL = updateSQL.slice(0, -2);

    // Add the WHERE clause
    updateSQL += ` WHERE id = ?;`;
    params.push(id);

    // Execute the SQL statement
    const result = await dbModel.executeQuery(pool, updateSQL, params);

    if (result.affectedRows === 0) {
      throw new AppError(`No label found with ID: ${id}`, 404);
    }

    return result;
  } catch (error) {
    // Check for duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('This label combination already exists', 409);
    }
    throw error instanceof AppError
      ? error
      : new AppError(`Failed to update label: ${error.message}`, 500);
  }
};

/**
 * Deletes a label from the label_master table
 * @param {string} id - The ID of the label to delete
 * @returns {Promise} Promise that resolves with the delete result
 */
export const deleteLabel = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    // Validate required fields
    if (!id) {
      throw new AppError('Label ID is required', 400);
    }

    // SQL to delete a label
    const deleteSQL = `DELETE FROM label_master WHERE id = ?;`;

    // Execute the SQL statement
    const result = await dbModel.executeQuery(pool, deleteSQL, [id]);

    if (result.affectedRows === 0) {
      throw new AppError(`No label found with ID: ${id}`, 404);
    }

    return result;
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError(`Failed to delete label: ${error.message}`, 500);
  }
};

/**
 * Gets a label by ID
 * @param {string} id - The ID of the label to retrieve
 * @returns {Promise} Promise that resolves with the label
 */
export const getLabelById = async (id) => {
  try {
    const pool = dbConn.tb_pool;

    if (!id) {
      throw new AppError('Label ID is required', 400);
    }

    const selectSQL = `SELECT * FROM label_master WHERE id = ?;`;
    const label = await dbModel.executeQuery(pool, selectSQL, [id]);

    if (label.length === 0) {
      throw new AppError(`No label found with ID: ${id}`, 404);
    }

    return label[0];
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError(`Failed to retrieve label: ${error.message}`, 500);
  }
};

/**
 * Gets distinct main_types from the label_master table
 * @returns {Promise} Promise that resolves with distinct main_types
 */
export const getDistinctMainTypes = async () => {
  try {
    const pool = dbConn.tb_pool;
    const selectSQL = `SELECT DISTINCT main_type FROM label_master ORDER BY main_type;`;
    const types = await dbModel.executeQuery(pool, selectSQL);
    return types.map((type) => type.main_type);
  } catch (error) {
    throw new AppError(`Failed to retrieve main types: ${error.message}`, 500);
  }
};

/**
 * Gets distinct sub_types for a given main_type
 * @param {string} main_type - The main type to filter by
 * @returns {Promise} Promise that resolves with distinct sub_types
 */
export const getDistinctSubTypes = async (main_type) => {
  try {
    const pool = dbConn.tb_pool;

    if (!main_type) {
      throw new AppError('main_type parameter is required', 400);
    }

    const selectSQL = `SELECT DISTINCT sub_type FROM label_master WHERE main_type = ? ORDER BY sub_type;`;
    const types = await dbModel.executeQuery(pool, selectSQL, [main_type]);
    return types.map((type) => type.sub_type);
  } catch (error) {
    throw error instanceof AppError
      ? error
      : new AppError(`Failed to retrieve sub types: ${error.message}`, 500);
  }
};
