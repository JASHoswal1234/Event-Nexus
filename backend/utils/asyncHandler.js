/**
 * Async Handler Wrapper for EventNexus Backend
 * Automatically catches errors from async route handlers and forwards them to error middleware
 * 
 * This eliminates the need for try-catch blocks in every controller function
 * and ensures consistent error handling across all async operations.
 * 
 * @param {Function} fn - Async route handler function (req, res, next)
 * @returns {Function} - Wrapped function that catches errors
 * 
 * @example
 * const asyncHandler = require('../utils/asyncHandler');
 * 
 * exports.createEvent = asyncHandler(async (req, res, next) => {
 *   const event = await Event.create(req.body);
 *   res.status(201).json({ success: true, event });
 * });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
