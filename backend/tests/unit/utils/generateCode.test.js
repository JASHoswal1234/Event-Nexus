/**
 * Unit tests for generateCode utility
 * Validates join code generation for team functionality
 * 
 * Requirements:
 * - 7.1: Generate unique join codes for teams
 * - 7.5: Join codes must be alphanumeric and unique
 */

const { generateCode, generateUniqueCode } = require('../../../utils/generateCode');

describe('generateCode', () => {
  describe('generateCode', () => {
    it('should generate a code with default length of 6', () => {
      const code = generateCode();
      expect(code).toHaveLength(6);
    });

    it('should generate a code with specified length', () => {
      const code = generateCode(8);
      expect(code).toHaveLength(8);
    });

    it('should generate uppercase alphanumeric codes', () => {
      const code = generateCode(10);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('should only contain non-ambiguous characters', () => {
      // Generate multiple codes to test character set
      for (let i = 0; i < 100; i++) {
        const code = generateCode(8);
        // Should not contain 0, O, I, or 1
        expect(code).not.toMatch(/[01IO]/);
      }
    });

    it('should generate different codes on multiple calls', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateCode(6));
      }
      // With high probability, 100 random 6-character codes should be unique
      expect(codes.size).toBeGreaterThan(90);
    });

    it('should handle various length parameters', () => {
      expect(generateCode(1)).toHaveLength(1);
      expect(generateCode(6)).toHaveLength(6);
      expect(generateCode(8)).toHaveLength(8);
      expect(generateCode(10)).toHaveLength(10);
    });
  });

  describe('generateUniqueCode', () => {
    it('should generate a code between 6-8 characters by default', () => {
      const code = generateUniqueCode();
      expect(code.length).toBeGreaterThanOrEqual(6);
      expect(code.length).toBeLessThanOrEqual(8);
    });

    it('should generate uppercase alphanumeric codes', () => {
      const code = generateUniqueCode();
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('should respect custom min and max length', () => {
      const code = generateUniqueCode(4, 6);
      expect(code.length).toBeGreaterThanOrEqual(4);
      expect(code.length).toBeLessThanOrEqual(6);
    });

    it('should generate codes within the specified range', () => {
      // Test multiple times to ensure range is respected
      for (let i = 0; i < 50; i++) {
        const code = generateUniqueCode(6, 8);
        expect(code.length).toBeGreaterThanOrEqual(6);
        expect(code.length).toBeLessThanOrEqual(8);
      }
    });

    it('should generate different codes on multiple calls', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateUniqueCode());
      }
      // With high probability, 100 random codes should be mostly unique
      expect(codes.size).toBeGreaterThan(90);
    });

    it('should handle equal min and max length', () => {
      const code = generateUniqueCode(7, 7);
      expect(code).toHaveLength(7);
    });
  });
});
