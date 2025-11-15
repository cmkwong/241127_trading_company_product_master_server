import endController from '../controller/endController.js';

// Wrap a route handler to automatically apply endController
export const withEndController = (handler) => {
  return [handler, endController];
};