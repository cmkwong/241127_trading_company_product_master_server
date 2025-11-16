import catchAsync from '../../../utils/catchAsync.js';
import * as labelsModel from '../../../models/trade_business/products/labelsModel.js';
import AppError from '../../../utils/appError.js';

/**
 * Creates the label_master table if it doesn't exist
 */
export const createLabelMasterTable = catchAsync(async (req, res, next) => {
  await labelsModel.createLabelMasterTable();

  res.prints = {
    message: 'label_master table created successfully',
  };

  next();
});

/**
 * Drops the label_master table if it exists
 */
export const dropLabelMasterTable = catchAsync(async (req, res, next) => {
  await labelsModel.dropLabelMasterTable();

  res.prints = {
    message: 'label_master table dropped successfully',
  };

  next();
});

/**
 * Comprehensive handler for all label operations:
 * - GET: Retrieves labels (all, filtered, by ID, main types, or sub types)
 * - POST: Adds a new label
 * - PUT/PATCH: Updates an existing label
 * - DELETE: Deletes a label
 */
export const handleLabelOperation = catchAsync(async (req, res, next) => {
  const method = req.method;
  const { id } = req.params;
  const { main_type, sub_type, type } = req.query;

  let result;

  switch (method) {
    case 'GET':
      // Handle all GET operations based on parameters
      if (id) {
        // Get a specific label by ID
        const label = await labelsModel.getLabelById(id);
        res.prints = { label };
      } else if (type === 'main_types') {
        // Get distinct main types
        const types = await labelsModel.getDistinctMainTypes();
        res.prints = {
          count: types.length,
          types,
        };
      } else if (type === 'sub_types' && main_type) {
        // Get distinct sub types for a given main type
        const types = await labelsModel.getDistinctSubTypes(main_type);
        res.prints = {
          count: types.length,
          types,
        };
      } else if (main_type) {
        // Get labels filtered by main_type and optionally sub_type
        const labels = await labelsModel.getFilteredLabels(main_type, sub_type);
        res.prints = {
          count: labels.length,
          labels,
        };
      } else {
        // Get all labels
        const labels = await labelsModel.getAllLabels();
        res.prints = {
          count: labels.length,
          labels,
        };
      }
      break;

    case 'POST':
      // Add a new label
      result = await labelsModel.addLabel(req.body);
      res.prints = {
        message: 'Label added successfully',
        labelId: result.labelId,
      };
      break;

    case 'PUT':
    case 'PATCH':
      // Update an existing label
      if (!id) {
        return next(new AppError('Label ID is required for update', 400));
      }
      await labelsModel.updateLabel(id, req.body);
      res.prints = {
        message: 'Label updated successfully',
      };
      break;

    case 'DELETE':
      // Delete a label
      if (!id) {
        return next(new AppError('Label ID is required for deletion', 400));
      }
      await labelsModel.deleteLabel(id);
      res.prints = {
        message: 'Label deleted successfully',
      };
      break;

    default:
      return next(new AppError(`Method ${method} not supported`, 405));
  }

  next();
});
