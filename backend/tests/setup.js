/**
 * Test Setup Configuration
 * Sets up environment variables and global test configuration
 */

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRE = '1h';
process.env.NODE_ENV = 'test';
