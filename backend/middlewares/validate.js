/**
 * Validation Middleware
 * Implements Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 * Validates request payloads against schemas and returns field-specific errors
 */

const { ValidationError } = require('../utils/errors');

/**
 * Validation schemas for different request types
 */

// Register schema - validates user registration
const registerSchema = {
  email: {
    required: true,
    type: 'string',
    format: 'email',
    message: 'Valid email is required'
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6,
    message: 'Password must be at least 6 characters long'
  }
};

// Login schema - validates user login
const loginSchema = {
  email: {
    required: true,
    type: 'string',
    format: 'email',
    message: 'Valid email is required'
  },
  password: {
    required: true,
    type: 'string',
    message: 'Password is required'
  }
};

// Event schema - validates event creation/update
const eventSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    message: 'Title is required'
  },
  description: {
    required: true,
    type: 'string',
    minLength: 1,
    message: 'Description is required'
  },
  date: {
    required: true,
    type: 'date',
    message: 'Valid date is required'
  },
  location: {
    required: true,
    type: 'string',
    minLength: 1,
    message: 'Location is required'
  },
  capacity: {
    required: true,
    type: 'number',
    min: 1,
    message: 'Capacity must be a positive integer'
  },
  registrationDeadline: {
    required: true,
    type: 'date',
    message: 'Valid registration deadline is required'
  },
  mode: {
    required: true,
    type: 'string',
    enum: ['online', 'offline'],
    message: 'Mode must be either "online" or "offline"'
  }
};

// Team schema - validates team creation
const teamSchema = {
  name: {
    required: true,
    type: 'string',
    minLength: 1,
    message: 'Team name is required'
  },
  eventId: {
    required: true,
    type: 'string',
    message: 'Event ID is required'
  },
  capacity: {
    required: true,
    type: 'number',
    min: 1,
    message: 'Capacity must be a positive integer'
  }
};

// Announcement schema - validates announcement creation
const announcementSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    message: 'Title is required'
  },
  content: {
    required: true,
    type: 'string',
    minLength: 1,
    message: 'Content is required'
  },
  eventId: {
    required: true,
    type: 'string',
    message: 'Event ID is required'
  }
};

/**
 * Validate a value against a field schema
 * @param {*} value - The value to validate
 * @param {Object} fieldSchema - The schema definition for the field
 * @param {string} fieldName - The name of the field being validated
 * @returns {string|null} - Error message if validation fails, null otherwise
 */
const validateField = (value, fieldSchema, fieldName) => {
  // Check if field is required
  if (fieldSchema.required && (value === undefined || value === null || value === '')) {
    return `${fieldName} is required`;
  }

  // If value is not provided and not required, skip further validation
  if (value === undefined || value === null) {
    return null;
  }

  // Type validation
  if (fieldSchema.type) {
    switch (fieldSchema.type) {
      case 'string':
        if (typeof value !== 'string') {
          return `${fieldName} must be a string`;
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `${fieldName} must be a number`;
        }
        break;
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return `${fieldName} must be a valid date`;
        }
        break;
    }
  }

  // Email format validation
  if (fieldSchema.format === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
  }

  // Minimum length validation
  if (fieldSchema.minLength !== undefined && typeof value === 'string') {
    if (value.length < fieldSchema.minLength) {
      return `${fieldName} must be at least ${fieldSchema.minLength} characters long`;
    }
  }

  // Minimum value validation
  if (fieldSchema.min !== undefined && typeof value === 'number') {
    if (value < fieldSchema.min) {
      return `${fieldName} must be at least ${fieldSchema.min}`;
    }
  }

  // Enum validation
  if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
    return `${fieldName} must be one of: ${fieldSchema.enum.join(', ')}`;
  }

  return null;
};

/**
 * Validate middleware factory
 * Returns a middleware function that validates req.body against the provided schema
 * 
 * @param {Object} schema - The validation schema to use
 * @returns {Function} - Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each field in the schema
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = req.body[fieldName];
      const error = validateField(value, fieldSchema, fieldName);
      
      if (error) {
        errors.push({
          field: fieldName,
          message: error
        });
      }
    }

    // If there are validation errors, return 400 with field-specific errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
      });
    }

    // Validation passed, proceed to next middleware
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  eventSchema,
  teamSchema,
  announcementSchema
};
