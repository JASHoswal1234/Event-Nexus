const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  describe('Schema Validation', () => {
    test('should create user with valid email, password, and default role', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
      expect(user.password).not.toBe('password123'); // Should be hashed
      expect(user.role).toBe('participant'); // Default role
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    test('should create user with admin role when specified', async () => {
      const userData = {
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const user = await User.create(userData);

      expect(user.role).toBe('admin');
    });

    test('should require email field', async () => {
      const userData = {
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should require password field', async () => {
      const userData = {
        email: 'test@example.com'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should enforce minimum password length of 6 characters', async () => {
      const userData = {
        email: 'test@example.com',
        password: '12345' // Only 5 characters
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should enforce unique email constraint', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should convert email to lowercase', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
    });

    test('should trim email whitespace', async () => {
      const userData = {
        email: '  test@example.com  ',
        password: 'password123'
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
    });

    test('should only accept admin or participant roles', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const userData = {
        email: 'test@example.com',
        password: plainPassword
      };

      const user = await User.create(userData);

      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(plainPassword.length);
    });

    test('should not rehash password if not modified', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const originalHash = user.password;

      user.email = 'newemail@example.com';
      await user.save();

      expect(user.password).toBe(originalHash);
    });

    test('should rehash password when modified', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const originalHash = user.password;

      user.password = 'newpassword123';
      await user.save();

      expect(user.password).not.toBe(originalHash);
      expect(user.password).not.toBe('newpassword123');
    });
  });

  describe('comparePassword Method', () => {
    test('should return true for correct password', async () => {
      const plainPassword = 'password123';
      const userData = {
        email: 'test@example.com',
        password: plainPassword
      };

      const user = await User.create(userData);
      const isMatch = await user.comparePassword(plainPassword);

      expect(isMatch).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const isMatch = await user.comparePassword('wrongpassword');

      expect(isMatch).toBe(false);
    });
  });

  describe('Email Index', () => {
    test('should have index on email field', async () => {
      const indexes = User.schema.indexes();
      const emailIndex = indexes.find(index => index[0].email === 1);

      expect(emailIndex).toBeDefined();
    });
  });
});
