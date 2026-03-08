/**
 * JWT Configuration
 * Implements Requirement 1.6: JWT token expiration configuration
 */

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE || '7d'
};

module.exports = jwtConfig;
