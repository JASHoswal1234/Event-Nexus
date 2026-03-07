/**
 * Logger utility for structured logging
 * Supports different log levels: info, warn, error
 * Validates: Requirements 12.2
 */

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level (INFO, WARN, ERROR)
 * @param {string|object} message - Log message or object
 * @param {object} context - Additional context information
 * @returns {string} Formatted log message
 */
const formatLog = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message: typeof message === 'string' ? message : JSON.stringify(message),
    ...context
  };
  return JSON.stringify(logEntry);
};

/**
 * Log info level message
 * @param {string|object} message - Log message
 * @param {object} context - Additional context
 */
const info = (message, context = {}) => {
  console.log(formatLog(LOG_LEVELS.INFO, message, context));
};

/**
 * Log warning level message
 * @param {string|object} message - Log message
 * @param {object} context - Additional context
 */
const warn = (message, context = {}) => {
  console.warn(formatLog(LOG_LEVELS.WARN, message, context));
};

/**
 * Log error level message
 * @param {string|object} message - Log message or error object
 * @param {object} context - Additional context (stack, method, path, user, etc.)
 */
const error = (message, context = {}) => {
  const errorContext = { ...context };
  
  // If message is an Error object, extract stack trace
  if (message instanceof Error) {
    errorContext.stack = message.stack;
    message = message.message;
  }
  
  console.error(formatLog(LOG_LEVELS.ERROR, message, errorContext));
};

module.exports = {
  info,
  warn,
  error,
  LOG_LEVELS
};
