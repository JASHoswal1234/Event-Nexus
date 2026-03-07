/**
 * Server Integration Tests
 * Tests basic server functionality and health check
 */

const request = require('supertest');
const app = require('../../server');

describe('Server Integration Tests', () => {
  describe('Health Check', () => {
    it('should return 200 and success message on /health endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'EventNexus API is running');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body.message).toContain('Route GET /api/nonexistent not found');
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      // Check for CORS headers
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('JSON Middleware', () => {
    it('should accept JSON content type', async () => {
      // Just verify the middleware accepts JSON
      // Actual parsing is tested in route-specific tests
      const response = await request(app)
        .get('/health')
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
