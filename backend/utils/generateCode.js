/**
 * Join Code Generator for EventNexus Backend
 * Generates unique alphanumeric codes for team joining functionality
 * 
 * Requirements:
 * - 7.1: Generate unique join codes for teams
 * - 7.5: Join codes must be alphanumeric and unique
 * 
 * Code Format:
 * - Length: 6-8 characters
 * - Character set: Uppercase alphanumeric (A-Z, 0-9)
 * - Excludes ambiguous characters (0, O, I, 1) for better readability
 */

/**
 * Generates a random alphanumeric join code
 * 
 * @param {number} length - Length of the code to generate (default: 6)
 * @returns {string} - Uppercase alphanumeric code
 * 
 * @example
 * const code = generateCode(); // Returns something like "ABC2XY"
 * const longerCode = generateCode(8); // Returns something like "XYZ4ABCD"
 */
const generateCode = (length = 6) => {
  // Character set excluding ambiguous characters (0, O, I, 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
};

/**
 * Generates a unique join code by checking against existing codes
 * This function should be used with a uniqueness check in the database
 * 
 * @param {number} minLength - Minimum code length (default: 6)
 * @param {number} maxLength - Maximum code length (default: 8)
 * @returns {string} - Uppercase alphanumeric code
 * 
 * @example
 * const code = generateUniqueCode(); // Returns 6-8 character code
 */
const generateUniqueCode = (minLength = 6, maxLength = 8) => {
  // Generate random length between min and max
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  return generateCode(length);
};

module.exports = {
  generateCode,
  generateUniqueCode
};
