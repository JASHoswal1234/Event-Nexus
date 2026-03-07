/**
 * Unit Tests for Authentication Controller
 * Tests register and login functionality
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authController = require('../../../controllers/authController');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('register', () => {
    it('should create a new user with participant role', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully'
      });

      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.role).toBe('participant');
      expect(user.password).not.toBe('password123'); // Should be hashed
    });

    it('should reject registration with existing email (409)', async () => {
      // Create existing user
      await User.create({ email: 'existing@example.com', password: 'password123' });

      req.body = { email: 'existing@example.com', password: 'newpassword' };

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Email already in use');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('login', () => {
    it('should validate credentials and return JWT token with user info', async () => {
      // Create a user first
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123'
      });

      req.body = { email: 'test@example.com', password: 'password123' };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.token).toBeTruthy();
      expect(response.user.email).toBe('test@example.com');
      expect(response.user.role).toBe('participant');

      // Verify JWT token contains correct payload
      const decoded = jwt.verify(response.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(user._id.toString());
      expect(decoded.role).toBe('participant');
    });

    it('should handle invalid credentials - user not found (401)', async () => {
      req.body = { email: 'nonexistent@example.com', password: 'password123' };

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });

    it('should handle invalid credentials - wrong password (401)', async () => {
      // Create a user
      await User.create({
        email: 'test@example.com',
        password: 'password123'
      });

      req.body = { email: 'test@example.com', password: 'wrongpassword' };

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });

    it('should handle missing email or password', async () => {
      req.body = { email: 'test@example.com' }; // Missing password

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Please provide email and password');
      expect(error.statusCode).toBe(401);
    });
  });
});
