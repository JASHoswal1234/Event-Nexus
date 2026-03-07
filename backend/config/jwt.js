/**
 * JWT Configuration
 * Implements Requirement 1.6: JWT token expiration configuration
 */

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE
};

module.exports = jwtConfig;
